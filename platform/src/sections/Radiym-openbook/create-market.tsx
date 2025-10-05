"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  Avatar,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CacheLTA, MarketV2 } from "@raydium-io/raydium-sdk";
import { LoadingButton } from "@mui/lab";
import { useTokensByWallet } from "src/actions/getTokensByWallet";
import { LoadingScreen } from "src/components/loading-screen";
import { RHFSelect } from "src/components/hook-form";
import FormProvider from "src/components/hook-form/form-provider";
import axiosInstance from "src/utils/axios";
import { enqueueSnackbar } from "notistack";
import { TOKENS } from "src/constants/quoteMintTokenAddresses";
import { useRouter } from "next/navigation";
import { useBoolean } from "src/hooks/use-boolean";
import { ConfirmDialog } from "src/components/custom-dialog";
import { checkWalletBalance } from "src/actions/checkWalletBalance";
import Iconify from "src/components/iconify";
import { addComputeBudget } from "src/actions/priorityFeesIx";
import FaqView from "src/app/components/faq/faq-view";
import { faqData } from "src/app/components/faq/exampledata";

export enum TxVersion {
  "V0",
  "LEGACY",
}
export const lookupTableCache: CacheLTA = {};

export default function CreateMarketForm() {
  const methods = useForm();
  const router = useRouter();
  const dialog = useBoolean();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { register, handleSubmit, watch, setValue } = methods;
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { tokens, isLoading } = useTokensByWallet();

  const selectedbaseMint = watch("baseMint");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect(() => {
  //     setValue("baseMint", FreezeView);
  // }, [FreezeView, setValue]);

  useEffect(() => {
    const selectedToken = tokens?.find(
      (token: { tokenAddress: string }) =>
        token?.tokenAddress === selectedbaseMint
    );
    if (selectedToken) {
      setValue("baseDecimals", selectedToken.decimals);
    }
  }, [selectedbaseMint, tokens, setValue]);

  if (isLoading) return <LoadingScreen />;
  // if (isError) return <div>Error</div>

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    if (!publicKey) {
      console.error("Wallet is not connected");
      setIsSubmitting(false);
      return;
    }
    // const hasSufficientBalance = await checkWalletBalance(
    //   publicKey,
    //   connection,
    //   3 * LAMPORTS_PER_SOL
    // );
    // if (!hasSufficientBalance) {
    //   setIsSubmitting(false);
    //   return;
    // }
    const quoteToken = TOKENS[data.quoteMint];

    const priorityRate =
      data.transactionPriority === "high"
        ? 100_000
        : data.transactionPriority === "extreme"
        ? 150_000
        : 50_000;
    const computeUnitPriceInstruction =
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityRate });
    let orderId: null = null;
    let signatureForOrder = [];

    try {
      // Create and send the payment transaction
      let paymentTransaction = new Transaction().add(
        computeUnitPriceInstruction,
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(
            "Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp"
          ),
          lamports: LAMPORTS_PER_SOL * 0.2,
        })
      );
      paymentTransaction = addComputeBudget(paymentTransaction);

      paymentTransaction.feePayer = publicKey;
      paymentTransaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      if (signTransaction) {
        // const signedTransaction = await signTransaction(paymentTransaction);
        // const paymentSignature = await connection.sendRawTransaction(
        //   signedTransaction.serialize()
        // );

        // Create the openBookOrder with the payment transaction signature
        // const orderResponse = await axiosInstance.post(
        //   `${process.env.NEXT_PUBLIC_HOST_API_V2}/openBookOrder`,
        //   {
        //     walletAddress: publicKey.toBase58(),
        //     // signatureForPayment: paymentSignature,
        //     baseMint: data.baseMint,
        //     quoteMint: data.quoteMint,
        //     lotSize: data.lotSize,
        //     tickSize: data.tickSize,
        //     baseDecimals: data.baseDecimals,
        //     quoteDecimals: quoteToken.decimals,
        //     tokenAddress: data.baseMint,
        //   }
        // );
        // orderId = orderResponse.data._id;

        // Create the market and collect transaction signatures
        const { innerTransactions, address } =
          await MarketV2.makeCreateMarketInstructionSimple({
            makeTxVersion: TxVersion.V0,
            connection,
            dexProgramId: new PublicKey(
              "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
            ),
            baseInfo: {
              mint: new PublicKey(data.baseMint),
              decimals: parseInt(data.baseDecimals),
            },
            quoteInfo: {
              mint: new PublicKey(quoteToken.address),
              decimals: quoteToken.decimals,
            },
            lotSize: parseFloat(data.lotSize),
            tickSize: parseFloat(data.tickSize),
            wallet: publicKey,
          });

        for (const innerTransaction of innerTransactions) {
          let marketTransaction = new Transaction();
          marketTransaction = addComputeBudget(marketTransaction);

          marketTransaction.feePayer = publicKey;
          marketTransaction.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          innerTransaction.instructions.forEach((instruction) =>
            marketTransaction.add(instruction)
          );

          const signedTransaction = await signTransaction(marketTransaction);
          const signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
          );
          signatureForOrder.push(signature);
        }

          // // Update the order with market ID and order transaction signatures
          // await axiosInstance
          //   // .put(`${process.env.NEXT_PUBLIC_HOST_API_V2}/openBook/${orderId}`, {
          //   //   marketId: address.marketId.toBase58(),
          //   //   signatureForOrder: signatureForOrder,
          //   // })
          //   // .then((res) => {
          //   //   router.push(`/dashboard/openbook/completed/${res.data.marketId}`);
          //   //   axiosInstance
          //   //     .post(
          //   //       `${process.env.NEXT_PUBLIC_HOST_API_V2}/verifyOpenBookPayment`,
          //   //       {
          //   //         orderId: res.data._id,
          //   //         // signature: paymentSignature,
          //   //       }
          //   //     )
          //   //     .then(() => {
          //   //       enqueueSnackbar("Market Created Successfully", {
          //   //         variant: "success",
          //   //       });
          //   //     })
          //   //     .catch(() => {
          //   //       enqueueSnackbar("Error Creating Market", { variant: "error" });
          //   //     });
          //   // })
          //   .catch(() => {
          //     enqueueSnackbar("Error Creating Market", { variant: "error" });
          //   });
      }
    } catch (error) {
      console.error("Error creating market:", error);
    }
    setIsSubmitting(false);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    dialog.onFalse();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid
        container
        sx={{ justifyContent: "center", alignItems: "center", my: 5 }}
        spacing={{ xs: 1, md: 3 }}
      >
        <Grid xs={10} md={7}>
          <Stack
            sx={{ my: { xs: 5 } }}
            alignItems="center"
            direction="column"
            spacing={2}
          >
            <Typography align="center" variant="h3" color="text.primary">
              Create Your OpenBook Market on Solana
            </Typography>
            <Typography align="center" variant="body1" color="text.primary">
              Enable your token for trading on DEXs by defining a trading pair
              on Solana. Integrate with a DEX (like Raydium) for users to buy
              and sell.
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ my: 2 }} spacing={2}>
            {/* <Controller
                            control={control}
                            name="baseMint"
                            render={({ field }) => (
                                <RHFSelect label="Base Mint" sx={{
                                    mt: 2
                                }} {...field}
                                
                                
                                    onClick={() => {
                                        if (!connected) {
                                            setModalVisible(true);
                                        }
                                        else {
                                            return;
                                        }
                                    }
                                    }
                                    disabled={!connected}
                                >
                                    {tokens?.map((token: any) => (
                                        <MenuItem key={token.tokenAddress} value={token.tokenAddress}>
                                            {token.tokenName}
                                        </MenuItem>
                                    ))}

                                </RHFSelect>

                            )}
                        />
                        // for testing purposes 
                        {/* <TextField {...register("baseMint")} label="Base Mint" variant="outlined" fullWidth margin="normal" required /> */}

            <RHFSelect name="baseMint" label="Base Mint" required>
              {tokens?.map((token: any) => (
                <MenuItem key={token.tokenAddress} value={token.tokenAddress}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{ width: 30, height: 30 }}
                      src={token.tokenPictureUrl}
                      alt={token.tokenName}
                    />
                    <Typography>{token.tokenName}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="quoteMint" label="Quote Mint" required>
              {Object.entries(TOKENS).map(([label, { address }]) => (
                <MenuItem key={address} value={label}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      sx={{
                        bgcolor: (theme) => theme.palette.grey[900],
                        borderRadius: 5,
                      }}
                      width={24}
                      height={24}
                      icon="token-branded:solana"
                    />
                    <Typography>{label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
          <Stack
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <TextField
              {...register("lotSize")}
              label="Minimum Order Size"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              type="number"
              defaultValue={1}
            />
            <Tooltip title="The Minimum Order Quantity in the SOL/USDC Market (Lot Size)">
              <Iconify
                sx={{ cursor: "pointer" }}
                width={24}
                height={24}
                icon="mdi:information"
                color="info"
              />
            </Tooltip>
          </Stack>
          <Stack
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <TextField
              {...register("tickSize")}
              label="Minimum Price Tick Size"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              defaultValue={0.01}
            />
            <Tooltip
              title="The Minimum Price Movement in the SOL/USDC Market"
            >
              <Iconify
                sx={{ cursor: "pointer" }}
                width={24}
                height={24}
                icon="mdi:information"
                color="info"
              />
            </Tooltip>
          </Stack>
          {/* priority fees below */}
          {/* <TextField {...register("decimals")} label="decimals" variant="outlined" fullWidth margin="normal" required /> */}
          <TextField
            {...register("baseDecimals")}
            label="Base Decimals"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            required
            sx={{ display: "none" }}
          />

          {/* <TextField {...register("quoteDecimals")} label="Quote Decimals" variant="outlined" fullWidth margin="normal" type="number" required /> */}
          {!isConfirmed ? (
            <Button
              sx={{ mt: 2 }}
              fullWidth
              color="inherit"
              size="large"
              type="button"
              variant="contained"
              onClick={dialog.onTrue}
            >
              Create Market
            </Button>
          ) : (
            <LoadingButton
              sx={{ mt: 2 }}
              size="large"
              type="submit"
              variant="contained"
              color="inherit"
              fullWidth
              loading={isSubmitting} // Pass isSubmitting to control the loading spinner
            >
              Create Market
            </LoadingButton>
          )}
          <FaqView content={faqData} />
        </Grid>
      </Grid>
      <ConfirmDialog
        open={dialog.value}
        onClose={dialog.onFalse}
        title="Disclaimer for Creating OpenBook Market"
        content={
          <Stack spacing={1} direction="column">
            <Typography variant="body2">
              Before creating an OpenBook Market, please ensure your account
              holds a minimum balance of 3 SOL ($SOL). This process involves
              three separate transactions:
            </Typography>
            <Typography variant="body2">
              1.⁠ ⁠Platform Fee: The initial transaction covers the fee for
              using our platform.
            </Typography>
            <Typography variant="body2">
              2.⁠ ⁠Market Book ID Creation: The subsequent two transactions
              create the market book ID.
            </Typography>
            <Typography variant="body2">
              Please be aware that if your $SOL balance is insufficient at any
              stage, the transaction may fail, and you might still incur the
              platform fee. Our platform is not liable for any monetary losses
              incurred due to transaction failures or insufficient funds. Ensure
              you review your balances and transaction details thoroughly before
              proceeding.
            </Typography>
          </Stack>
        }
        action={
          <Button variant="contained" color="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        }
      />
    </FormProvider>
  );
}
