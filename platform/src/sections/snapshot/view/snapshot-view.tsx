"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Fade,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { sendPlatformFee } from "src/actions/sendPlatformFee";
import { RHFTextField } from "src/components/hook-form";
import FormProvider from "src/components/hook-form/form-provider";
import { ISnapshot, SnapshotDataSchema } from "src/lib/snapshotSchema";
import axiosInstance from "src/utils/axios";
import { checkWalletBalance } from "src/actions/checkWalletBalance";

import { useRouter } from "next/navigation";
import FaqView from "src/app/components/faq/faq-view";
import { faqData } from "src/app/components/faq/exampledata";


const defaultValues = {
  // type: '',
  tokenAddress: "",
};

export default function SnapshotView() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible: setModalVisible } = useWalletModal();
  const [checked, setChecked] = useState(false);
  const containerRef = React.useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = () => {
    setChecked((prev) => !prev);
  };

  const methods = useForm<ISnapshot>({
    resolver: yupResolver(SnapshotDataSchema),
    defaultValues,
  });

  const {
    handleSubmit,
  } = methods;

  const processForm: SubmitHandler<ISnapshot> = async (data) => {
    if (!connected) {
      setModalVisible(true);

      return;
    }
    setIsLoading(true);

    if (!publicKey) {
      enqueueSnackbar("No wallet found. Please connect your wallet.", {
        variant: "error",
      });
      setIsLoading(false);
      return;
    }

    const hasSufficientBalance = await checkWalletBalance(
      publicKey,
      connection,
      0.09 * LAMPORTS_PER_SOL
    );
    if (!hasSufficientBalance) {
      setIsLoading(false);
      return;
    }
    // dynanmic decimals
    const tokenDecimals = await connection.getTokenSupply(
      new PublicKey(data.tokenAddress)
    );
    const decimals = tokenDecimals.value.decimals;

    const signature = await sendPlatformFee(
      connection,
      signTransaction!,
      publicKey,
      0.09,
      "Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp"
    );
    if (!signature) {
      enqueueSnackbar("Failed to send platform fee. Please try again.", {
        variant: "error",
      });
      setIsLoading(false);
      return;
    }

    const snapshotData = {
      mintAddress: data.tokenAddress,
      minimumBalance: data.minBalance,
      holderSince: data.holderSince,
      decimals: decimals,
      signature: signature,
    };
    axiosInstance
      .post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/snapshot`, snapshotData)
      .then((response) => {
        enqueueSnackbar("Snapshot submitted successfully.", {
          variant: "success",
        });
        router.push(`/dashboard/snapshot/pending/${response.data.snapshotId}`);
      })
      .then(() => {
        axiosInstance.post(
          `${process.env.NEXT_PUBLIC_HOST_API_V2}/transaction`,
          {
            signature,
            tokenAddress: data.tokenAddress,
            amount: 0.09,
            userAddress: publicKey?.toBase58(),
            transactionType: "snapshot",
          }
        );
        // redirect user to the back end link/response.csvUrl to download the csv file
      })
      .catch((error) => {
        console.error("Failed to submit snapshot:", error);
        enqueueSnackbar("Failed to submit snapshot. Please try again.", {
          variant: "error",
        });
      })
      .finally(() => {
        // send the user to the
        setIsLoading(false);
      });

    // pay for snapshot

    // submit snapshot
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(processForm)}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={11} md={7}>
          <Stack spacing={2}>
            <Typography variant="h3" color="text.primary">
              Take Snapshots with Ease on Solana
            </Typography>
            <Typography variant="body1" color="text.primary">
              Enter the token address to capture a snapshot.
            </Typography>

            {/* <RHFTextField variant="filled" name="type" label="Asset Type" helperText="Select the type of asset you're interested in snapshotting." /> */}
            <RHFTextField
              variant="filled"
              name="tokenAddress"
              label="Token Address"
              helperText="Enter the token address to capture a snapshot."
            />
            <FormControlLabel
              control={<Switch checked={checked} onChange={handleChange} />}
              label={
                <Typography
                  sx={{ textDecoration: "underline" }}
                  color="primary"
                  variant="subtitle1"
                >
                  Advanced Options
                </Typography>
              }
            />
            <Fade mountOnEnter unmountOnExit in={checked}>
              <Box
                ref={containerRef}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <RHFTextField
                  variant="filled"
                  name="minBalance"
                  label="Minimum Balance"
                  helperText="Only show wallets with at least this many tokens. For example, enter '100' to see wallets with 100 or more tokens."
                />
                {/* <RHFTextField variant="filled" name="holderSince" label="Holder Since" helperText="Include wallets that have held the asset since a certain time. Use a block height number from a blockchain explorer." /> */}
              </Box>
            </Fade>
            <LoadingButton
              type="submit"
              loading={isLoading}
              variant="contained"
              size="large"
            >
              Take a Snapshot (0.09 SOL)
            </LoadingButton>
          </Stack>
          <FaqView content={faqData} />
        </Grid>
      </Grid>
    </FormProvider>
  );
}
