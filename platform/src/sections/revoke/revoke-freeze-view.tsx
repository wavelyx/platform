"use client";

import * as Yup from 'yup';
import { LoadingButton } from "@mui/lab";
import { Grid } from "@mui/material";
import TokenManager from "src/app/components/token-manager/token-manager";
import FormProvider from "src/components/hook-form/form-provider";
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useTokensByWallet } from 'src/actions/getTokensByWallet';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LoadingScreen } from 'src/components/loading-screen';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AuthorityType, TOKEN_PROGRAM_ID, createSetAuthorityInstruction } from '@solana/spl-token';
import { serviceFEE } from 'src/utils/fees';
import axiosInstance from 'src/utils/axios';
import { checkForFreezeAuthority } from 'src/actions/checkAuthorities';
import { checkWalletBalance } from 'src/actions/checkWalletBalance';
import { addComputeBudget } from 'src/actions/priorityFeesIx';
import FaqView from 'src/app/components/faq/faq-view';
import { faqData } from 'src/app/components/faq/exampledata';


// Schema for form validation
const schema = Yup.object().shape({
    tokenName: Yup.string().required('Token name is required'),
    tokenAddress: Yup.string(),
    freezeAddress: Yup.boolean()
});

type IFormInput = Yup.InferType<typeof schema>;

interface FrozenAccountOption {
    value: string;
    owner: string;
    tokenAccount: string;
}

const defaultValues = {
    tokenName: '',
    tokenAddress: '',
    freezeAddress: false
};


export default function RevokeFreezeView({ tokenName }: { tokenName: string }) {
    const methods = useForm<IFormInput>({
        resolver: yupResolver(schema),
        defaultValues,
    });
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { watch, setValue } = methods;
    const selectedTokenName = watch("tokenName");
    const { tokens, isLoading } = useTokensByWallet();
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();

    useEffect(() => {
        const selectedToken = tokens?.find((token: { tokenName: string; }) => token?.tokenName === selectedTokenName);
        if (selectedToken) {

            setValue("tokenAddress", selectedToken.tokenAddress);
            setValue("freezeAddress", selectedToken.mintAuthority);
        }
    }, [selectedTokenName, tokens, setValue]);


    useEffect(() => {
        setValue("tokenName", tokenName);
    }, [tokenName, setValue]);


    const [hasFreezeAuthority, setHasFreezeAuthority] = useState(true); // Default to true until checked
    const [isCheckingFreezeAuthority, setIsCheckingFreezeAuthority] = useState(false);
    const tokenAddress = watch("tokenAddress");

    // Fetch frozen owner accounts by mint
    useEffect(() => {
        if (tokenAddress) {
            setIsCheckingFreezeAuthority(true);
            const mintAddress = new PublicKey(tokenAddress);
            checkForFreezeAuthority(publicKey, mintAddress)
                .then(hasAuthority => {
                    setHasFreezeAuthority(hasAuthority);
                    setIsCheckingFreezeAuthority(false);
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

            const serviceFee = serviceFEE;
            const serviceFeeInLamports = serviceFee * LAMPORTS_PER_SOL;
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
                    AuthorityType.FreezeAccount,
                    null,
                    [],
                    TOKEN_PROGRAM_ID,
                ));
            createNewTokenTransaction = addComputeBudget(createNewTokenTransaction);

            createNewTokenTransaction.recentBlockhash = blockhash;
            createNewTokenTransaction.feePayer = publicKey!;
            if (signTransaction) {
                const signedTransaction = await signTransaction(createNewTokenTransaction);
                await connection.sendRawTransaction(signedTransaction.serialize())
                    .then(async (res) => {
                        methods.reset();

                        enqueueSnackbar('Form successfully submitted!', { variant: 'success' });
                        // push to solsacn signature page external link

                        await axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/transaction`, {
                            signature: res,
                            tokenAddress: data.tokenAddress,
                            amount: serviceFeeInLamports,
                            userAddress: publicKey?.toBase58(),
                            transactionType: 'revokeFreezeAuthority',
                        }).then(() => {
                            router.push(`/dashboard/token/freeze-authority/completed/${res}`);
                        });
                    }).then(() => {
                        axiosInstance.put(`${process.env.NEXT_PUBLIC_HOST_API_V2}/token/${data.tokenAddress}`, {
                            freezeAddress: false,
                        }).
                            catch((error) => {
                                console.error(error);
                                enqueueSnackbar('An error occurred while submitting the form!', { variant: 'error' });
                            });
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
                        title="Revoke Freeze Authority"
                        subtitle='Permanently disable the ability to freeze transfers of your token. This is a crucial first step for enabling secondary market trading on DEXs and create a Liquidity Pool of your token. Consider this step carefully before proceeding.'
                        selectName="tokenName" // === RHFSelect name 
                        selectLabel="Select Token"
                        options={
                            tokens?.map((token: any) => ({
                                value: token.tokenName,
                                label: token.tokenName,
                                tokenPictureUrl: token.tokenPictureUrl,
                                alt: token.tokenName
                            }))}
                    />
                    <LoadingButton disabled={!hasFreezeAuthority} sx={{ mt: 3 }} loading={isSubmitting || isCheckingFreezeAuthority} fullWidth size='large' variant='contained' onClick={handleSubmit(processForm)}>
                        Revoke Freeze Authority (0.025 SOL)
                    </LoadingButton>
                    {hasFreezeAuthority ? null : (
                        <div style={{ color: 'red', marginTop: 16 }}>
                            This token doesn't have a freeze authority enabled and cannot be revoked.
                        </div>
                    )}
                    <FaqView content={faqData} />
                </Grid>
            </Grid>
        </FormProvider>
    )
};