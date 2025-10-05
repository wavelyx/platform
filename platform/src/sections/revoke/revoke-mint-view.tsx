"use client";

import * as Yup from 'yup';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Grid } from '@mui/material';
import TokenManager from 'src/app/components/token-manager/token-manager';
import { yupResolver } from '@hookform/resolvers/yup';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import FormProvider from 'src/components/hook-form/form-provider';
import { useRouter } from 'next/navigation';
import { useTokensByWallet } from 'src/actions/getTokensByWallet';
import { LoadingScreen } from 'src/components/loading-screen';
import { useEffect, useState } from 'react';
import { AuthorityType, TOKEN_PROGRAM_ID, createSetAuthorityInstruction } from '@solana/spl-token';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { serviceFEE } from 'src/utils/fees';
import axiosInstance from 'src/utils/axios';
import { checkForMintAuthority } from 'src/actions/checkAuthorities';
import { checkWalletBalance } from 'src/actions/checkWalletBalance';
import { addComputeBudget } from 'src/actions/priorityFeesIx';
import FaqView from 'src/app/components/faq/faq-view';
import { faqData } from 'src/app/components/faq/exampledata';





// Schema for form validation
const schema = Yup.object().shape({
  tokenName: Yup.string().required('Token name is required'),
  tokenAddress: Yup.string(),
  mintAuthority: Yup.boolean()
});

type IFormInput = Yup.InferType<typeof schema>;
const defaultValues = {
  tokenName: '',
  tokenAddress: '',
  mintAuthority: false
};



export default function TwoView({ tokenName }: { tokenName: string }) {
  const methods = useForm<IFormInput>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { watch, setValue } = methods;
  const selectedTokenName = watch("tokenName");
  const { tokens, isLoading } = useTokensByWallet();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    const selectedToken = tokens?.find((token: { tokenName: string; }) => token?.tokenName === selectedTokenName);
    if (selectedToken) {

      setValue("tokenAddress", selectedToken.tokenAddress);
      setValue("mintAuthority", selectedToken.mintAuthority);
    }
  }, [selectedTokenName, tokens, setValue]);

  useEffect(() => {
    setValue("tokenName", tokenName);
  }, [tokenName, setValue]);

  const [hasMintAuthority, setHasMintAuthority] = useState(true);
  const [isCheckingMintAuthority, setIsCheckingMintAuthority] = useState(false);
  const tokenAddress = watch("tokenAddress");

  useEffect(() => {
    if (tokenAddress) {
      setIsCheckingMintAuthority(true);
      checkForMintAuthority(publicKey, tokenAddress)
        .then(hasAuthority => {
          setHasMintAuthority(hasAuthority);
          setIsCheckingMintAuthority(false);
        })
        .catch(() => {
          setHasMintAuthority(false); // Assume no mint authority on error
          setIsCheckingMintAuthority(false);
        });
    }
  }, [connection, tokenAddress]);

  if (isLoading) return <LoadingScreen />

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const processForm: SubmitHandler<IFormInput> = async (data) => {
    try {
      // service fees for the transaction
      const serviceFeeInLamports = serviceFEE * LAMPORTS_PER_SOL;

      if (!publicKey) {
        enqueueSnackbar('Wallet not connected', { variant: 'error' });
        return;
      }
      const hasSufficientBalance = await checkWalletBalance(publicKey, connection, serviceFeeInLamports);
      if (!hasSufficientBalance) {
        return;
      }

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey: new PublicKey('Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp'), // our wallet address
        lamports: serviceFeeInLamports,
      });
      const { blockhash } = await connection.getLatestBlockhash()
      let createNewTokenTransaction = new Transaction().add(
        transferInstruction,
        createSetAuthorityInstruction(
          new PublicKey(data.tokenAddress ?? ''),
          publicKey!,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID,
        ),
      );
      createNewTokenTransaction = addComputeBudget(createNewTokenTransaction);
      createNewTokenTransaction.recentBlockhash = blockhash;
      createNewTokenTransaction.feePayer = publicKey!;
      if (signTransaction) {
        const signedTransaction = await signTransaction(createNewTokenTransaction);
        await connection.sendRawTransaction(signedTransaction.serialize())
          .then(async (res) => {
            methods.reset();

            enqueueSnackbar('Mint revoked Successfully !', { variant: 'success' });
            // push to solsacn signature page external link
            await axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/api/transaction`, {
              signature: res,
              tokenAddress: data.tokenAddress,
              amount: serviceFeeInLamports,
              userAddress: publicKey?.toBase58(),
              transactionType: 'mintAuthority',
            }).then(() => {
              router.push(`/dashboard/token/mint-authority/completed/${res}`);
            });
          }).then(() => {
            axiosInstance.put(`/api/token/${data.tokenAddress}`, {
              mintAuthority: true,
            }).catch((error) => {
              console.error(error);
            })
          });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('An error occurred while submitting the form!', { variant: 'error' });
    }
  };




  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(processForm)} >
      <Grid container sx={{ justifyContent: 'center', alignItems: 'center', my: 5 }} spacing={3}>
        <Grid item xs={11} md={6}>
          <TokenManager
            title="Revoke Mint (Fixed Supply)"
            subtitle='Permanently prevent the creation of new tokens, locking in your token&apos;s total supply. This action is irreversible and is ideal for situations where a fixed supply is desired. Use with caution for tokens that might require additional issuance in the future.'
            selectName="tokenName" // ===  RHFSelect name
            selectLabel="Select Token"
            options={
              tokens?.map((token: any) => ({
                value: token.tokenName,
                label: token.tokenName,
                tokenPictureUrl: token.tokenPictureUrl,
                alt: token.tokenName

              }))}
          />
          <LoadingButton disabled={!hasMintAuthority} sx={{ mt: 3 }} loading={isSubmitting || isCheckingMintAuthority} fullWidth size='large' variant='contained' onClick={handleSubmit(processForm)}>
            Revoke Mint Authority (0.025 SOL)
          </LoadingButton>
          {hasMintAuthority ? null : (
            <div style={{ color: 'red', marginTop: 16 }}>
              This token doesn't have a mint authority enabled and cannot be revoked.
            </div>
          )}
          <FaqView content={faqData} />
        </Grid>
      </Grid>
    </FormProvider>
  );
}
