'use client';

import * as yup from 'yup';
import {
    createBurnCheckedInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token";
import {
    useConnection,
    useWallet
} from "@solana/wallet-adapter-react";
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTokensByWallet } from "src/actions/getTokensByWallet";
import FormProvider from "src/components/hook-form/form-provider";
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import { CircularProgress, Grid, MenuItem } from '@mui/material';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { serviceFEE } from 'src/utils/fees';
import { checkForMintAuthority } from 'src/actions/checkAuthorities';
import TokenManager from 'src/app/components/token-manager/token-manager';
import { checkWalletBalance } from 'src/actions/checkWalletBalance';
import { addComputeBudget } from 'src/actions/priorityFeesIx';
import FaqView from 'src/app/components/faq/faq-view';
import { faqData } from 'src/app/components/faq/exampledata';



const schema = yup.object({
    tokenAddress: yup.string().required('Token address is required'),
    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    decimals: yup.number().positive('Decimals must be positive').required('Decimals is required'),
    tokenName: yup.string(),
});

type IFormInput = yup.InferType<typeof schema>;

const BurnTokenForm = ({ tokenName }: { tokenName: string }) => {



    const serviceFeeInLamports = 0.1 * LAMPORTS_PER_SOL;
    const methods = useForm<IFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            tokenAddress: '',
            amount: 0,
            decimals: 0,
            tokenName: '',
        },
    });
    const { connection } = useConnection();
    const { signTransaction, publicKey, } = useWallet();
    const { tokens, isLoading } = useTokensByWallet();
    const { setValue, formState: { isSubmitting }, handleSubmit, watch } = methods;
    const selectedTokenName = watch("tokenName");


    useEffect(() => {
        setValue("tokenName", tokenName);
    }, [tokenName, setValue]);

    useEffect(() => {
        const selectedToken = tokens?.find((token: { tokenName: string; }) => token?.tokenName === selectedTokenName);
        if (selectedToken) {
            setValue("tokenAddress", selectedToken.tokenAddress);
            setValue("decimals", selectedToken.decimals);

        }
    }, [selectedTokenName, tokens, setValue]);

    if (isLoading) return <LoadingScreen />


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


    const processForm: SubmitHandler<IFormInput> = async (data) => {
        if (!publicKey) {
            enqueueSnackbar('Wallet not connected', { variant: 'error' });
            return;
        };

        const hasSufficientBalance = await checkWalletBalance(publicKey, connection, serviceFeeInLamports);
        if (!hasSufficientBalance) {
            return;
        }

        const fetchAssociatedTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(data.tokenAddress),
            publicKey!,
        );
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: new PublicKey('Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp'), // our wallet address
            lamports: serviceFeeInLamports,
        });

        // burn instruction
        const burnIx = createBurnCheckedInstruction(
            fetchAssociatedTokenAccount,
            new PublicKey(data.tokenAddress),
            publicKey,
            data.amount * (10 ** data.decimals),
            data.decimals,
        );

        const { blockhash } = await connection.getLatestBlockhash('finalized');
        let tx = new Transaction().add(
            burnIx,
            transferInstruction,
        );
        tx = addComputeBudget(tx);
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey!;


        if (signTransaction) {
            const signedTransaction = await signTransaction(tx);
            await connection.sendRawTransaction(signedTransaction.serialize());
            enqueueSnackbar('Token burned successfully', { variant: 'success' });
        };

    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(processForm)}>
            <Grid container sx={{ justifyContent: 'center', alignItems: 'center', my: 5 }} spacing={3}>
                <Grid item xs={11} md={6}>
                    <TokenManager
                        title='Burn Tokens (Reduce Supply)'
                        subtitle='Permanently remove a portion of your token supply from circulation. This can potentially increase the scarcity of your remaining tokens, but use with caution as it&apos;s irreversible.'
                        selectName='tokenName'
                        selectLabel='Select Token'
                        options={tokens?.map((token: any) => ({
                            value: token.tokenName,
                            label: token.tokenName,
                            tokenPictureUrl: token.tokenPictureUrl,
                            alt: token.tokenName,
                        }))}
                    />
                    {/* <RHFTextField name="tokenAddress" label="Token Address" /> */}
                    <RHFTextField sx={{ mt: 2 }} name="amount" label="Amount" type="number" />
                    {/* for testing */}
                    {/* <RHFTextField name="tokenAddress" label="Select Token" /> */}
                    {/* <RHFTextField name="decimals" label="Decimals" type="number" /> */}
                    {/* Conditionally render the burn button or a disclaimer */}


                    <LoadingButton sx={{ mt: 3 }} disabled={!hasMintAuthority} loading={isSubmitting || isCheckingMintAuthority} fullWidth size='large' variant='contained' onClick={handleSubmit(processForm)}>
                        Burn Your Token (0.1 SOL)
                    </LoadingButton>
                    {hasMintAuthority ? null : (
                        <div style={{ color: 'red', marginTop: 16 }}>
                            This token doesn't have a mint authority enabled and cannot be burned.
                        </div>
                    )}

                    {/* Rest of your component */}
                    <FaqView content={faqData} />
                </Grid>
            </Grid>
        </FormProvider>
    );
};


export default BurnTokenForm;