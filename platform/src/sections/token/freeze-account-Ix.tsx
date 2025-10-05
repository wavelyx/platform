'use client';

import * as yup from 'yup';
import {
    createBurnCheckedInstruction,
    createFreezeAccountInstruction,
    createMintToInstruction,
    getAssociatedTokenAddress,
    mintTo
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
import { Grid } from '@mui/material';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { serviceFEE } from 'src/utils/fees';
import { checkForFreezeAuthority } from 'src/actions/checkAuthorities';
import TokenManager from 'src/app/components/token-manager/token-manager';
import { checkWalletBalance } from 'src/actions/checkWalletBalance';
import { addComputeBudget } from 'src/actions/priorityFeesIx';
import FaqView from 'src/app/components/faq/faq-view';
import { faqData } from 'src/app/components/faq/exampledata';



const schema = yup.object({
    tokenAddress: yup.string().required('Token address is required'),
    tokenName: yup.string(),
    freezeAccount: yup.string().required('Freeze account is required')
});

type IFormInput = yup.InferType<typeof schema>;

const FreezeToken = ({ tokenName }: { tokenName: string }) => {

    const serviceFeeInLamports = 0.1 * LAMPORTS_PER_SOL;
    const methods = useForm<IFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            tokenAddress: '',
            tokenName: '',
            freezeAccount: ''
        },
    });
    const { connection } = useConnection();
    const { signTransaction, publicKey } = useWallet();
    const { tokens, isLoading } = useTokensByWallet();
    const { setValue, formState: { isSubmitting }, handleSubmit, watch } = methods;
    const selectedTokenName = watch("tokenName");

    const [hasFreezeAuthority, setHasFreezeAuthority] = useState(true); // Default to true until checked
    const [isCheckingFreezeAuthority, setIsCheckingFreezeAuthority] = useState(false);
    const tokenAddress = watch("tokenAddress");

    useEffect(() => {
        setValue("tokenName", tokenName);
    }, [tokenName, setValue]);

    useEffect(() => {
        const selectedToken = tokens?.find((token: { tokenName: string; }) => token?.tokenName === selectedTokenName);
        if (selectedToken) {
            setValue("tokenAddress", selectedToken.tokenAddress);

        }
    }, [selectedTokenName, tokens, setValue]);

    useEffect(() => {
        if (tokenAddress) {
            setIsCheckingFreezeAuthority(true);
            checkForFreezeAuthority(publicKey, tokenAddress)
                .then(hasAuthority => {
                    setHasFreezeAuthority(hasAuthority);
                    setIsCheckingFreezeAuthority(false);
                });
        }
    }, [connection, tokenAddress]);


    if (isLoading) return <LoadingScreen />



    const processForm: SubmitHandler<IFormInput> = async (data) => {
        if (!publicKey) {
            enqueueSnackbar('Wallet not connected', { variant: 'error' });
            return;
        }
        const hasSufficientBalance = await checkWalletBalance(publicKey, connection, serviceFeeInLamports);
        if (!hasSufficientBalance) {
            return;
        }

        const tokenAddress = new PublicKey(data.tokenAddress);
        const freezeAccount = new PublicKey(data.freezeAccount);
        const associatedTokenAccount = await getAssociatedTokenAddress(tokenAddress, freezeAccount);

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: new PublicKey('Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp'),
            lamports: serviceFeeInLamports,
        });

        // freeze instruction
        const freezeIx = createFreezeAccountInstruction(
            associatedTokenAccount,
            tokenAddress,
            publicKey,
        );

        const { blockhash } = await connection.getLatestBlockhash('finalized');
        let tx = new Transaction().add(
            // mintIx,
            freezeIx,
            transferInstruction,
        );
        tx = addComputeBudget(tx);
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey!;


        if (signTransaction) {
            try {
                const signedTransaction = await signTransaction(tx);
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());
                enqueueSnackbar('Transaction successful', { variant: 'success' });
            } catch (error) {
                console.error('Transaction failed', error);
                enqueueSnackbar('Transaction failed', { variant: 'error' });
            }
        }

    };



    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(processForm)}>
            <Grid container sx={{ justifyContent: 'center', alignItems: 'center', my: 5 }} spacing={3}>
                <Grid item xs={11} md={6}>
                    <TokenManager
                        title='Freeze Token Account'
                        subtitle='Lock your tokens to prevent any transfers (sending or receiving). This is useful if you suspect unauthorized activity. Only the same person who freezes the account can unfreeze it (thaw it). Use with caution, as you&apos;ll need to unfreeze it later to move your tokens again.'
                        selectName='tokenName'
                        selectLabel='Select Token'
                        options={tokens?.map((token: any) => ({
                            value: token.tokenName,
                            label: token.tokenName,
                            tokenPictureUrl: token.tokenPictureUrl,
                            alt: token.tokenName,
                        }))}
                    />
                    <Grid item xs={12} sx={{ mt: 2 }} >
                        {hasFreezeAuthority ? (
                            <RHFTextField name="freezeAccount" label="Wallet Address" />
                        ) : (
                            <div style={{ color: 'red', marginTop: 8 }}>
                                Freeze Account is not available for this token or you do not have the authority to freeze this token.
                            </div>
                        )}
                    </Grid>
                    {/* for testing */}
                    {/* <RHFTextField name="tokenAddress" label="token address" /> */}

                    <LoadingButton
                        sx={{ mt: 3 }}
                        loading={isSubmitting || isCheckingFreezeAuthority}
                        fullWidth
                        disabled={!hasFreezeAuthority}
                        size='large'
                        variant='contained'
                        onClick={handleSubmit(processForm)}
                    >
                        Freeze Token Account (0.1 SOL)
                    </LoadingButton>
                    <FaqView content={faqData} />
                </Grid>
            </Grid>
        </FormProvider>
    );
};


export default FreezeToken;