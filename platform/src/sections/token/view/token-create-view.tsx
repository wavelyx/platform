"use client";

import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { m as motion, AnimatePresence } from "framer-motion";

import { LoadingButton } from "@mui/lab";
import { Grid, Stack, Button } from "@mui/material";

import { Inputs, FormDataSchema } from "src/lib/schema";
import { useSnackbar } from "src/app/components/snackbar";
import CustomizedSteppers from "src/app/components/stepper/stepper";

import Iconify from "src/components/iconify";
import FormProvider from "src/components/hook-form/form-provider";

import DefineTokenForm from "src/sections/token/define-token";
import ReviewConfirm from "src/sections/token/review-confirm";
import MarketingContactForm from "src/sections/token/marketing-contact-form";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  BlockheightBasedTransactionConfirmationStrategy,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  pack,
  TokenMetadata,
  createInitializeInstruction,
} from "@solana/spl-token-metadata";
import {
  MINT_SIZE,
  TYPE_SIZE,
  getMintLen,
  LENGTH_SIZE,
  ExtensionType,
  TOKEN_PROGRAM_ID,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createSetAuthorityInstruction,
  AuthorityType,

  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useRouter } from "next/navigation";
import axiosInstance from "src/utils/axios";
import UploadFileToBlockChain from "src/utils/uploadToArweave";
import { serviceFEE } from "src/utils/fees";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { checkWalletBalance } from "src/actions/checkWalletBalance";
import { create } from "lodash";
import { addComputeBudget } from "src/actions/priorityFeesIx";
import FaqView from "src/app/components/faq/faq-view";
import { faqData } from "src/app/components/faq/exampledata";

function serializeError(value: { [x: string]: any }) {
  if (typeof value === "object") {
    const alt: { [x: string]: any } = {}; // Add index signature to allow indexing with a string
    for (let key in value) {
      if (Object.hasOwnProperty.call(value, key)) {
        alt[key] = value[key];
      }
    }
    return JSON.stringify(alt);
  }
  return JSON.stringify(value);
}

interface MetaDataJson {
  name: string;
  symbol: string;
  description: string | undefined;
  image: string | undefined;
  extensions: {
    website: string | undefined;
    twitter: string | undefined;
    discord: string | undefined;
    telegram: string | undefined;
  };
  tags: string[] | undefined;
  sellerFeeBasisPoints: number;
  creator?: {
    name: string | undefined;
    site: string | undefined;
  };
  additionalMetadata?: [string, string][];
}

const steps = [
  {
    id: "Step 1",
    name: "Launch Your Token on Solana",
    fields: [
      "tokenName",
      "tokenSymbol",
      "description",
      "singleSelect",
      "websiteLink",
      "twitter",
      "discord",
      "telegram",
    ],
    buttonLabel: "Define Token Properties",
  },
  {
    id: "Step 2",
    name: "Define Token Specifications",
    fields: [
      "totalSupply",
      "decimals",
      "freezeAddress",
      "mintAuthority",
      "tags",
      "creatorInfo",
      "creatorName",
      "creatorContact",
    ],
    buttonLabel: "Continue to Deployment",
  },
  { id: "Review & Confirm", name: "Complete" },
];

const defaultValues = {
  tokenName: "",
  tokenSymbol: "",
  description: "",
  singleSelect: "Token Program",
  websiteLink: "",
  twitter: "",
  discord: "",
  telegram: "",
  totalSupply: 0,
  decimals: 0,
  immutable: false,
  freezeAddress: false,
  mintAuthority: false,
  tags: [],
  creatorInfo: false,
  creatorName: "",
  creatorContact: "",
  coverUrl: "",
  additionalMetadata: [],
  transactionPriority: "standard",
};

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

export default function TokenCreateView() {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, signTransaction } =
    useWallet();
  const { setVisible: setModalVisible } = useWalletModal();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);

  const SOL_TO_LAMPORTS = 1_000_000_000; // 1 SOL = 1 billion lamports

  const methods = useForm<Inputs>({
    resolver: yupResolver(FormDataSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    trigger,
    setValue,
  } = methods;

  const showCreatorInfoFields = watch("creatorInfo");

  const processForm: SubmitHandler<Inputs> = async (data) => {
    if (!connected) {
      setModalVisible(true);
      return;
    }
    // const hasSufficientBalance = await checkWalletBalance(
    //   publicKey!,
    //   connection,
    //   LAMPORTS_PER_SOL * 0.125
    // );
    // if (!hasSufficientBalance) {
    //   return;
    // }
    if (selectedFile) {
      const arweaveUrl = await UploadFileToBlockChain(selectedFile);
      data.coverUrl = arweaveUrl;
    }

    let PRIORITY_RATE; // MICRO_LAMPORTS

    // Set PRIORITY_RATE based on user preference and dynamic priority fees
    switch (data.transactionPriority) {
      case "high":
        PRIORITY_RATE = 100_000;
        break;
      case "extreme":
        PRIORITY_RATE = 150_000;
        break;
      default:
        PRIORITY_RATE = 50_000;
    }

    try {
      // Initialize metaDataJson with basic fields
      const metaDataJson: MetaDataJson = {
        name: data.tokenName,
        symbol: data.tokenSymbol,
        description: data.description,
        image: data.coverUrl,
        extensions: {
          website: undefined,
          twitter: undefined,
          discord: undefined,
          telegram: undefined,
        },
        tags: data.tags?.filter((tag): tag is string => tag !== undefined),
        sellerFeeBasisPoints: 0,
      };

      // Conditionally add creator if creatorInfo is true and fields are provided
      if (data.creatorInfo && data.creatorName && data.creatorContact) {
        metaDataJson.creator = {
          name: data.creatorName,
          site: data.creatorContact,
        };
      }

      if (data.websiteLink) metaDataJson.extensions.website = data.websiteLink;
      if (data.twitter) metaDataJson.extensions.twitter = data.twitter;
      if (data.discord) metaDataJson.extensions.discord = data.discord;
      if (data.telegram) metaDataJson.extensions.telegram = data.telegram;

      // if the vales.singleSelect is basic then send the data to the backend if it's token2022 then send the data to the backend
      if (data.singleSelect === "Token Program") {
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const arweaveUrl = await UploadFileToBlockChain(
          new File([JSON.stringify(metaDataJson)], "metadata.json", {
            type: "application/json",
          })
        );
        // print lamports in sol value
        const serviceFee = LAMPORTS_PER_SOL * 0.001; // $$
        const mintKeypair = Keypair.generate();
        const tokenATA = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey!
        ); // Cost per feature in SOL
        const featuresSelected = [
          data.mintAuthority,
          data.freezeAddress,
          data.immutable,
          data.creatorInfo,
        ].filter((v) => v).length;
        const additionalServiceFeeLamports =
          featuresSelected * serviceFEE * LAMPORTS_PER_SOL;
        // Total service fee including additional features
        const totalServiceFeeLamports =
          serviceFee + additionalServiceFeeLamports;

        // const transferInstruction = SystemProgram.transfer({
        //   fromPubkey: publicKey!,
        //   toPubkey: new PublicKey(
        //     "Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp"
        //   ), // our wallet address
        //   lamports: totalServiceFeeLamports,
        // });
        const createMetadataInstruction =
          createCreateMetadataAccountV3Instruction(
            {
              metadata: PublicKey.findProgramAddressSync(
                [
                  Buffer.from("metadata"),
                  PROGRAM_ID.toBuffer(),
                  mintKeypair.publicKey.toBuffer(),
                ],
                PROGRAM_ID
              )[0],
              mint: mintKeypair.publicKey,
              mintAuthority: publicKey!,
              payer: publicKey!,
              updateAuthority: publicKey!,
            },
            {
              createMetadataAccountArgsV3: {
                data: {
                  name: data.tokenName,
                  symbol: data.tokenSymbol,
                  uri: arweaveUrl!,
                  creators: null,
                  sellerFeeBasisPoints: 0,
                  collection: null,
                  uses: null,
                },
                isMutable: !data.immutable,
                collectionDetails: null,
              },
            }
          );

        let createNewTokenTransaction = new Transaction().add(
          // transferInstruction,
          SystemProgram.createAccount({
            fromPubkey: publicKey!,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            data.decimals,
            publicKey!, // you will edit here
            data.freezeAddress ? null : publicKey!,
            TOKEN_PROGRAM_ID
          ),
          createAssociatedTokenAccountInstruction(
            publicKey!,
            tokenATA,
            publicKey!,
            mintKeypair.publicKey
          ),
          createMintToInstruction(
            mintKeypair.publicKey,
            tokenATA,
            publicKey!,
            data.totalSupply * 10 ** data.decimals
          ),
          createMetadataInstruction
        );
        // $$$$
        // if (data.freezeAddress) {
        //     const mintAuthorityAuthorityInstruction = createSetAuthorityInstruction(
        //         mintKeypair.publicKey,
        //         publicKey!,
        //         AuthorityType.FreezeAccount,
        //         null,
        //         [],
        //         TOKEN_PROGRAM_ID,
        //     );

        //     // Add the revoke instruction to your transaction
        //     createNewTokenTransaction.add(mintAuthorityAuthorityInstruction);
        // };
        if (data.mintAuthority) {
          const mintAuthorityAuthorityInstruction =
            createSetAuthorityInstruction(
              mintKeypair.publicKey,
              publicKey!,
              AuthorityType.MintTokens,
              null,
              [],
              TOKEN_PROGRAM_ID
            );

          // Add the revoke instruction to your transaction
          createNewTokenTransaction.add(mintAuthorityAuthorityInstruction);
        }
        const { blockhash } = await connection.getLatestBlockhash();
        createNewTokenTransaction.recentBlockhash = blockhash;
        createNewTokenTransaction.feePayer = publicKey!;

        createNewTokenTransaction = addComputeBudget(createNewTokenTransaction);

        // sign and send the transaction and sign it with the mintKeypair
        if (signTransaction) {
          // partial sign the transaction with the mint keypair
          createNewTokenTransaction.partialSign(mintKeypair);
          const signedTransaction = await signTransaction(
            createNewTokenTransaction
          );
          await connection
            .sendRawTransaction(signedTransaction.serialize())
            .then((signature: any) => {
              // Open the Solscan URL in a new tab
              return signature;
            })
            .then((signature: any) =>
              axiosInstance
                .post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/tokenOrder`, {
                  // Your request body
                  program: 1,
                  tokenName: data.tokenName,
                  tokenSymbol: data.tokenSymbol,
                  description: data.description,
                  websiteUrl: data.websiteLink,
                  twitterUrl: data.twitter,
                  discordUrl: data.discord,
                  telegram: data.telegram,
                  programName: data.singleSelect,
                  tokenSupply: data.totalSupply,
                  decimals: data.decimals,
                  orderValue: lamports,
                  tags: data.tags,
                  tokenPictureUrl: data.coverUrl,
                  tokenAddress: mintKeypair.publicKey.toBase58(),
                  metadata: {
                    name: data.tokenName,
                    symbol: data.tokenSymbol,
                    uri: arweaveUrl,
                  },
                  freezeAddress: data.freezeAddress,
                  mintAuthority: data.mintAuthority,
                  immutable: data.immutable,
                  signature,
                })
                .then((response: any) => ({ response, signature }))
            )
            .then(
              ({
                response,
                signature,
              }: {
                response: any;
                signature: string;
              }) => {
                // Notify user of successful order creation
                enqueueSnackbar("Token created successfully", {
                  variant: "success",
                });
                router.push(
                  `/dashboard/token/create-token/completed/${mintKeypair.publicKey}`
                );

                // Verify the payment/order with the signature
                return axiosInstance.post(
                  `${process.env.NEXT_PUBLIC_HOST_API_V2}/verifyPayment`,
                  {
                    signature,
                    orderId: response.data._id,
                    // to do : add the dynamic priority fee to send to the backend ==> Biggie
                  }
                );
              }
            )
            .then(() => {
              // Notify user of successful verification
              enqueueSnackbar("Order verified successfully", {
                variant: "success",
              });
              reset();
            })
            .catch((error) => {
              // Error handling
              console.error("An error occurred:", error);
              enqueueSnackbar("An error occured while creating the token.", {
                variant: "error",
              });
            });
        }
      } else if (data.singleSelect === "Tax Payer (Token 2022)") {
        const mint = Keypair.generate();
        const arweaveUrl = await UploadFileToBlockChain(
          new File([JSON.stringify(metaDataJson)], "metadata.json", {
            type: "application/json",
          })
        );
        const tokenATA = await getAssociatedTokenAddress(
          mint.publicKey,
          publicKey!,
          true,
          TOKEN_2022_PROGRAM_ID
        );

        let formattedAdditionalMetadata: [string, string][] = [];
        if (
          metaDataJson.additionalMetadata &&
          Array.isArray(metaDataJson.additionalMetadata)
        ) {
          formattedAdditionalMetadata = metaDataJson.additionalMetadata.filter(
            (pair: string | any[]) => Array.isArray(pair) && pair.length === 2
          );
        }
        const metadata: TokenMetadata = {
          mint: mint.publicKey,
          name: data.tokenName,
          symbol: data.tokenSymbol,
          uri: arweaveUrl!,
          additionalMetadata: [...formattedAdditionalMetadata],
        };

        const mintSpace = getMintLen([ExtensionType.MetadataPointer]);
        const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const lamports = await connection.getMinimumBalanceForRentExemption(
          mintSpace + metadataSpace
        );

        const createAccountIx = SystemProgram.createAccount({
          fromPubkey: publicKey!, // payer public key
          newAccountPubkey: mint.publicKey, // mint public key
          lamports, // lamports for mint
          space: mintSpace, // space for mint
          programId: TOKEN_2022_PROGRAM_ID, // program id for token 2022
        });
        const initializeMetaDataPointerIx =
          createInitializeMetadataPointerInstruction(
            mint.publicKey,
            publicKey!,
            mint.publicKey,
            TOKEN_2022_PROGRAM_ID
          );

        const initializeMintIx = createInitializeMintInstruction(
          mint.publicKey,
          data.decimals,
          publicKey!,
          publicKey!,
          TOKEN_2022_PROGRAM_ID
        );

        const initializeMetadataIx = createInitializeInstruction({
          mint: mint.publicKey,
          metadata: mint.publicKey,
          mintAuthority: publicKey!,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          programId: TOKEN_2022_PROGRAM_ID,
          updateAuthority: publicKey!,
        });

        const createAssociatedIx = createAssociatedTokenAccountInstruction(
          publicKey!,
          tokenATA,
          publicKey!,
          mint.publicKey,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const mintToIx = createMintToInstruction(
          mint.publicKey,
          tokenATA,
          publicKey!,
          10000000,
          [],
          TOKEN_2022_PROGRAM_ID
        );

        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction().add(
          createAccountIx,
          initializeMetaDataPointerIx,
          initializeMintIx,
          initializeMetadataIx,
          createAssociatedIx,
          mintToIx
        );
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey!;
        // if (data.mintAuthority) {
        //     const mintAuthorityAuthorityInstruction = createSetAuthorityInstruction(
        //         mint.publicKey,
        //         publicKey!,
        //         AuthorityType.MintTokens,
        //         null,
        //         [],
        //         TOKEN_2022_PROGRAM_ID,
        //     );

        //     // Add the revoke instruction to your transaction
        //     transaction.add(mintAuthorityAuthorityInstruction);
        // }
        // if (data.immutable) {
        //     const mintAuthorityAuthorityInstruction = createSetAuthorityInstruction(
        //         mint.publicKey,
        //         publicKey!,
        //         AuthorityType.MetadataPointer,
        //         null,
        //         [],
        //         TOKEN_2022_PROGRAM_ID,
        //     );

        //     // Add the revoke instruction to your transaction
        //     transaction.add(mintAuthorityAuthorityInstruction);
        // }
        // formattedAdditionalMetadata.forEach(([key, value]: [string, string]) => {
        //     console.log('formattedAdditionalMetadata', key, value)
        //     const updateMetadataIx = createUpdateFieldInstruction({
        //         metadata: mint.publicKey,
        //         programId: TOKEN_2022_PROGRAM_ID,
        //         updateAuthority: publicKey!,
        //         field: key,
        //         value,
        //     });
        //     transaction.add(updateMetadataIx); // Add update instructions dynamically
        // });

        // Assuming `transaction` is already defined in your context

        // first simulate the transaction and console log the result

        // first partial sign the transaction with the mint keypair

        // simulating transaction ==> Biggie
        // const simulationResult = await connection.simulateTransaction(transaction as unknown as VersionedTransaction);
        // console.log("Simulation result:", JSON.stringify(simulationResult, null, 2));

        // if (simulationResult.value.err) {
        //     const serializedError = serializeError(simulationResult.value.err as { [x: string]: any });
        //     console.error(`Simulation failed: ${serializedError}`);
        //     throw new Error(`Transaction simulation failed: ${serializedError}`);
        // }

        await sendTransaction(transaction, connection, { signers: [mint] })
          .then(async (signature: any) => {
            console.log("Signature:", signature);
            // Await confirmation using the new strategy
            // await axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/tokenOrder`, {
            //     program: 2,
            //     tokenName: data.tokenName,
            //     tokenSymbol: data.tokenSymbol,
            //     description: data.description,
            //     websiteUrl: data.websiteLink,
            //     twitterUrl: data.twitter,
            //     discordUrl: data.discord,
            //     telegram: data.telegram,
            //     programName: data.singleSelect,
            //     tokenSupply: data.totalSupply,
            //     decimals: data.decimals,

            //     // to do : calculate the total order price and send it to the backend ==> Biggie
            //     orderValue: 15,
            //     tags: data.tags,
            //     tokenPictureUrl: 'ddd',
            //     tokenAddress: 'ddd',
            //     metadata: {
            //         name: data.tokenName,
            //         symbol: data.tokenSymbol,
            //         uri: arweaveUrl,
            //     },
            //     creator: {
            //         name: data.creatorName,
            //         site: data.creatorContact
            //     }

            // });
            // router.push(`/dashboard/completed/${mint.publicKey}`);
            // return signature;
          })
          .then((signature: any) =>
            axiosInstance
              .post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/verifyPayment`, {
                signature,
                // to do : add the dynamic priority fee to send to the backend ==> Biggie
              })
              .then(() => {
                enqueueSnackbar("Token created successfully", {
                  variant: "success",
                });
                reset();
              })
          )
          .catch((error) => {
            console.error("An error occurred:", error);
            enqueueSnackbar("An error occured while creating the token.", {
              variant: "error",
            });
          });
      }
      // reset(); // Formu başarıyla gönderdikten sonra sıfırla
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error; // Rethrow or handle error appropriately
      enqueueSnackbar("An error occurred while creating the token!", {
        variant: "error",
      });
    }
  };

  type FieldName = keyof Inputs;

  const next = async () => {
    const isLastStep = currentStep === steps.length - 1;

    const output = await trigger(steps[currentStep].fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    if (!isLastStep) {
      setPreviousStep(currentStep);
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Son adımda formu işle
      handleSubmit(processForm)();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToFirstStep = () => {
    setCurrentStep(0);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(processForm)}>
      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "center",
          my: 5,
        }}
      >
        <Grid item xs={11} md={6}>
          <Stack
            direction="row"
            sx={{
              mb: 5,
              width: 1,
            }}
          >
            <CustomizedSteppers currentStep={currentStep} />
          </Stack>
          {currentStep > 0 && (
            <Button
              onClick={prev}
              startIcon={<Iconify icon="ic:baseline-arrow-back-ios" />}
              sx={{
                mb: 5,
              }}
            >
              {`Previous: ${steps[currentStep - 1].name}`}
            </Button>
          )}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={transition}
              >
                <MarketingContactForm
                  setValue={setValue}
                  onFileSelect={setSelectedFile}
                />
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={transition}
              >
                <DefineTokenForm
                  showCreatorInfoFields={showCreatorInfoFields}
                />
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={transition}
              >
                <ReviewConfirm />
              </motion.div>
            )}
          </AnimatePresence>
          {currentStep < steps.length - 1 ? (
            <Button
              endIcon={<Iconify icon="bi:arrow-right" width={24} height={24} />}
              size="large"
              fullWidth
              variant="contained"
              sx={{ my: 5 }}
              onClick={next}
            >
              {steps[currentStep].buttonLabel}
            </Button>
          ) : (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                startIcon={
                  <Iconify icon="iconoir:edit" width={24} height={24} />
                }
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                onClick={goToFirstStep}
              >
                Edit Details
              </Button>
              <LoadingButton
                loading={isSubmitting}
                fullWidth
                size="large"
                variant="contained"
                onClick={handleSubmit(processForm)}
              >
                Create Token
              </LoadingButton>
            </Stack>
          )}
          <FaqView content={faqData} />
        </Grid>
      </Grid>
    </FormProvider>
  );
}
