"use client";

import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SubmitHandler, useForm, useFieldArray, useWatch } from "react-hook-form";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Grid } from "@mui/material";
import FormProvider from "src/components/hook-form/form-provider";
import { useTokensByWallet } from "src/actions/getTokensByWallet";
import { serviceFEE } from "src/utils/fees";
import { useEffect, useState } from "react";
import Iconify from "src/components/iconify";
import { LoadingButton } from "@mui/lab";
import { m as motion, AnimatePresence } from "framer-motion";
import MultisenderStepTwo from "../multisender-step2";
import axiosInstance from "src/utils/axios";
import { addComputeBudget } from "src/actions/priorityFeesIx";
import { useRouter } from "next/navigation";
import { ro } from "date-fns/locale";
import { useSnackbar } from "notistack";
import { checkWalletBalance } from "src/actions/checkWalletBalance";
import { signTransaction } from "@metaplex-foundation/umi";
import { getTipAccounts, sendBundle } from "src/utils/jitoUtils";
import base58 from "bs58";
import { token } from "stylis";
import FaqView from "src/app/components/faq/faq-view";
import { faqData } from "src/app/components/faq/exampledata";

// Effects - start

const slideVariants = {
  initial: {
    x: "100vw", // Sağdan başlayarak
    opacity: 0,
  },
  in: {
    x: 0, // Merkeze doğru kaydır
    opacity: 1,
  },
  out: {
    x: "-100vw", // Sola doğru kaydırarak çık
    opacity: 0,
  },
};

const transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.25,
};

// Effects - end

// Define your schema for the form validation
const schema = yup
  .object({
    tokenName: yup.string(),
    tokenSymbol: yup.string(),
    tokenMintAddress: yup.string().required("Token mint address is required"),
    decimals: yup.number().required("Token decimals are required"),
    recipients: yup
      .array()
      .of(
        yup.object().shape({
          walletAddress: yup.string().required("Recipient address is required"),
          amount: yup
            .number()
            .positive("Amount must be positive")
            .required("Amount is required"),
        })
      )
      .required(),
  })
  .required();

type MultiSendFormData = yup.InferType<typeof schema>;


export default function MultiSendForm({ id }: { id: string }) {
  const methods = useForm<MultiSendFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      recipients: [{ walletAddress: "", amount: 0 }],
      tokenMintAddress: "",
      decimals: 0,
      tokenName: "",
      tokenSymbol: "",
    },
  });

  const {
    trigger,
    formState: { isSubmitting },
    watch,
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "recipients",

  });
  const { handleSubmit } = methods;
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { tokens, isLoading } = useTokensByWallet();
  const [snapshotDetails, setSnapshotDetails] = useState<any>(null);
  const serviceFeeInLamports = serviceFEE * LAMPORTS_PER_SOL;
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [totalFees, setTotalFees] = useState(0);
  const [totalPlatformFees, setTotalPlatformFees] = useState(0);
  const [totalAssociatedAccountFees, setTotalAssociatedAccountFees] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const recipients = useWatch({ control, name: "recipients" });

  console.log('additionalFee', additionalFee, totalAssociatedAccountFees, totalPlatformFees, totalFees);
  useEffect(() => {
    if (id) {
      // Fetch snapshot details from backend
      axiosInstance
        .post(
          `${process.env.NEXT_PUBLIC_HOST_API_V2}/multisender/snapshot/${id}`
        )
        .then((response) => {
          setSnapshotDetails(response.data);
          // Update form values with fetched snapshot details
          methods.reset({
            recipients: response.data.map((item: any) => ({
              address: item.walletAddress,
              amount: item.amount,
            })),
            tokenMintAddress: "",
            decimals: 0,
            tokenName: "",
            tokenSymbol: "",
          });
        })
        .catch((error) => {
          console.error("Error fetching snapshot details:", error);
        });
    }
  }, [id]);

  const calculateTotalFees = async () => {
    if (recipients.length < 10) return;

    const associatedAccountCreationFee = await connection.getMinimumBalanceForRentExemption(165);
    const PLATFORM_FEE_PER_WALLET = 0.001 * LAMPORTS_PER_SOL;
    // Calculate total fees
    const totalAssociatedAccountFeesCalculated = recipients.length * associatedAccountCreationFee;
    const totalPlatformFeesCalculated = recipients.length * PLATFORM_FEE_PER_WALLET;
    const numberOfBundles = Math.ceil(recipients.length / 10);
    // 0.0001 SOL per bundle + 50000 lamports for refunding the senderWallet with the already created associated accounts ==> Biggie
    const additionalFeeCalculated = numberOfBundles * (0.0001 * LAMPORTS_PER_SOL) + 50000; 
    const totalFeesCalculated = totalAssociatedAccountFeesCalculated + totalPlatformFeesCalculated + additionalFeeCalculated;
    setTotalAssociatedAccountFees(totalAssociatedAccountFeesCalculated);
    setTotalPlatformFees(totalPlatformFeesCalculated);
    setAdditionalFee(additionalFeeCalculated);
    setTotalFees(totalFeesCalculated);
  };

  useEffect(() => {
    calculateTotalFees();
  }, [recipients, connection]);

  console.log("totalFees", totalFees);


  const MAX_PAYLOAD_SIZE_MB = 3;
  const processForm: SubmitHandler<MultiSendFormData> = async (data) => {
    if (!publicKey || !signTransaction) {
      console.error("Wallet not connected");
      return;
    }

    const payloadSizeInBytes = new Blob([JSON.stringify(data.recipients)]).size;
    const payloadSizeInMB = payloadSizeInBytes / (1024 * 1024);

    if (payloadSizeInMB > MAX_PAYLOAD_SIZE_MB) {
      enqueueSnackbar(`The size of the user's input can't be more than 3 MB. Please separate your distribution into more than one operation.`, { variant: "error" });
      return;
    }
    if (data.recipients.length < 10) {
      enqueueSnackbar("At least 10 recipients are required", { variant: "error" });
      return;
    }

    const totalTokenAmount = data.recipients.reduce((total, recipient) => total + recipient.amount, 0);

    try {
      // Check if the wallet has enough SOL to cover the total fees
      // const balance = await connection.getBalance(publicKey);
      // if (balance < totalFees) {
      //   throw new Error(`Insufficient funds: Available ${balance / LAMPORTS_PER_SOL} SOL, need ${(totalFees / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
      // }
      const hasSufficientBalance = await checkWalletBalance(publicKey, connection, totalFees);
      if (!hasSufficientBalance) {
        return;
      }
      let transaction = new Transaction();

      // Transfer dynamic fees to your wallet
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("PctJCpjmqVraHmdkXz1Eidsp1hPqgCwmqWWV9GT1wAa"),
          lamports: totalAssociatedAccountFees + additionalFee,
        })
      );

      // Transfer platform fees to the specified wallet
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp"),
          lamports: totalPlatformFees,
        })
      );

      // Transfer total token amount to the platform wallet
      const tokenMintAddress = new PublicKey(data.tokenMintAddress);
      const sourceTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, publicKey);
      const platformWallet = new PublicKey("PctJCpjmqVraHmdkXz1Eidsp1hPqgCwmqWWV9GT1wAa"); // Replace with your platform wallet address

      // Ensure the platform wallet's token account exists
      const platformTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        platformWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const accountInfo = await connection.getAccountInfo(platformTokenAccount);
      if (!accountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            platformTokenAccount,
            platformWallet,
            tokenMintAddress
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          sourceTokenAccount,
          platformTokenAccount,
          publicKey,
          totalTokenAmount * Math.pow(10, data.decimals),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction = addComputeBudget(transaction);

      // Simulate transaction
      // const simulation = await connection.simulateTransaction(transaction);
      // if (simulation.value.err) {
      //   console.error("Simulation error logs:", simulation.value.logs);
      //   throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
      // }  

      const tipAccounts = await getTipAccounts();
      const tipAmount = LAMPORTS_PER_SOL * 0.0001; 
      const randomTipAccount = tipAccounts[Math.floor(Math.random() * tipAccounts.length)];
      const tipInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(randomTipAccount),
        lamports: tipAmount,
      });

      transaction.add(tipInstruction);


      const signedTransaction = await signTransaction(transaction);
      const encodedTransaction = base58.encode(signedTransaction.serialize());


      const transactionsBundle = [encodedTransaction];


      await sendBundle(transactionsBundle);


      const encodedSignature = base58.encode(Buffer.from(signedTransaction.signature!));



      // Immediately redirect the user to the pending page
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/multisender/verifyAndSend`, {
        senderWallet: publicKey.toString(),
        recipients: data.recipients.map((recipient) => ({
          walletAddress: recipient.walletAddress,
          amount: recipient.amount,
        })),
        signature: encodedSignature,
        tokenMintAddress: data.tokenMintAddress,
        decimals: data.decimals,
        totalTokenAmount: totalTokenAmount,
        tokenName: data.tokenName,
        tokenSymbol: data.tokenSymbol,
      }).catch((error) => {
        enqueueSnackbar(`Transaction error: ${error.message}`, { variant: "error" });
        console.error("Transaction error:", error);
        throw error;
      });

      // Redirect to pending page with transactionRecordId
      router.push(`/dashboard/multisender/details/${response.data.transactionRecordId}`);

    } catch (error) {
      console.error("Transaction error:", error);
      alert(`Transaction error: ${error.message}`);
    }
  };






  // step functios

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(processForm)}>
      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "center",
        }}
      >
        <Grid item xs={11} md={10}>
          <AnimatePresence mode="wait">
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={transition}
            >
              <MultisenderStepTwo totalFees={totalFees} />
            </motion.div>
          </AnimatePresence>
          <LoadingButton
            loading={isSubmitting}
            onClick={handleSubmit(processForm)}
            sx={{ mt: 5 }}
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Iconify icon="mdi:send" width={24} />}
          >
            Multisend
          </LoadingButton>
          <FaqView content={faqData} />
        </Grid>
      </Grid>
    </FormProvider>
  );
}

{
  /* <TextField {...methods.register("tokenMintAddress")} label="Token Mint Address" fullWidth required />
                    <TextField {...methods.register("decimals")} label="Decimals" type="number" fullWidth required />
                    {fields.map((item, index) => (
                        <><TextField {...methods.register(`recipients.${index}.address`)} label="Recipient Address" fullWidth required /><TextField {...methods.register(`recipients.${index}.amount`)} label="Amount" type="number" fullWidth required /><Button onClick={() => remove(index)}>Remove</Button></>
                    ))} */
}

{
  /* <Button onClick={() => append({ address: '', amount: 0 })}>Add Recipient</Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                    Send Tokens
                </Button> */
}
