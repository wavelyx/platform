"use client";

import * as Yup from 'yup';


import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { SubmitHandler, useForm } from "react-hook-form";
import FormProvider from 'src/components/hook-form/form-provider';
import { Grid } from '@mui/material';
import TokenManager from 'src/app/components/token-manager/token-manager';
import { LoadingButton } from '@mui/lab';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useTokensByWallet } from 'src/actions/getTokensByWallet';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import { PROGRAM_ID, DataV2, createUpdateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { serviceFEE } from 'src/utils/fees';
import axiosInstance from 'src/utils/axios';
import { checkTokenMutable } from 'src/actions/checkAuthorities';
import { checkWalletBalance } from 'src/actions/checkWalletBalance';
import { addComputeBudget } from 'src/actions/priorityFeesIx';
import FaqView from 'src/app/components/faq/faq-view';
import { faqData } from 'src/app/components/faq/exampledata';



// Schema for form validation
const schema = Yup.object().shape({
    tokenName: Yup.string().required('Token name is required'),
    tokenAddress: Yup.string(),
    mutable: Yup.boolean(),
    tokenSymbol: Yup.string().required('Token symbol is required'),
    tokenUri: Yup.string().required('Token URI is required'),

});

type IFormInput = Yup.InferType<typeof schema>;

const defaultValues = {
    tokenName: '',
    tokenAddress: '',
    mutable: false,
    tokenSymbol: '',
    tokenUri: '',
};


export default function ImmutableView({ tokenName }: { tokenName: string }) {



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
            setValue("mutable", selectedToken.mintAuthority);
            setValue("tokenSymbol", selectedToken.tokenSymbol);
            setValue("tokenUri", selectedToken.metadata.uri);
        }
    }, [selectedTokenName, tokens, setValue]);

    const [hasMutable, setHasMutable] = useState(true); // Default to true until checked
    const [checkingMutable, setIsCheckingMutable] = useState(false);
    const tokenAddress = watch("tokenAddress");

    useEffect(() => {
        if (tokenAddress) {
            setIsCheckingMutable(true);
            const mintAddress = new PublicKey(tokenAddress);
            checkTokenMutable(mintAddress)
                .then(hasAuthority => {
                    setHasMutable(hasAuthority);
                    setIsCheckingMutable(false);
                });
        }
    }, [tokenAddress]);

    useEffect(() => {
        setValue("tokenName", tokenName);
    }, [tokenName, setValue]);


    if (isLoading) return <LoadingScreen />

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;


    const processForm: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!publicKey) {
                enqueueSnackbar('Wallet not connected', { variant: 'error' });
                return;
            }

            const hasSufficientBalance = await checkWalletBalance(publicKey, connection, serviceFEE * LAMPORTS_PER_SOL);
            if (!hasSufficientBalance) {
                return;
            }

            const metadataPDA = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("metadata"),
                    PROGRAM_ID.toBuffer(),
                    new PublicKey(data.tokenAddress ?? '').toBuffer(),
                ],
                PROGRAM_ID,
            )[0]

            const tokenMetadata = {
                name: data.tokenName,
                symbol: data.tokenSymbol,
                uri: data.tokenUri,
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null
            } as DataV2;

            const serviceFee = serviceFEE;

            const serviceFeeInLamports = serviceFee * LAMPORTS_PER_SOL;


            const transferInstruction = SystemProgram.transfer({
                fromPubkey: publicKey!,
                toPubkey: new PublicKey('Pcht7ptpQ79fbE7yuiDMFaW8JW7cxXniumqjSbVdZDp'), // our wallet address
                lamports: serviceFeeInLamports,
            });


            const { blockhash } = await connection.getLatestBlockhash()
            let createNewTokenTransaction = new Transaction().add(
                transferInstruction,
                createUpdateMetadataAccountV2Instruction(
                    {
                        metadata: metadataPDA,
                        updateAuthority: publicKey!,
                    },
                    {
                        updateMetadataAccountArgsV2: {
                            data: tokenMetadata,
                            updateAuthority: publicKey,
                            primarySaleHappened: true,
                            isMutable: false,
                        },
                    }
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

                        enqueueSnackbar('Metadata Sucessfully frozen', { variant: 'success' });
                        // push to solsacn signature page external link
                        await axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/api/transaction`, {
                            signature: res,
                            tokenAddress: data.tokenAddress,
                            amount: serviceFeeInLamports,
                            userAddress: publicKey?.toBase58(),
                            transactionType: 'freezeMetadata',
                        }).then(() => {
                            router.push(`/dashboard/token/make-immutable/completed/${res}`);
                        });
                    }).catch((error) => {
                        console.error(error);
                        enqueueSnackbar('An error occurred while submitting the form!', { variant: 'error' });
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
                        title="Make Your Token Immutable"
                        subtitle='Making your token immutable ensures no changes can be made to its metadata (like name, supply) after creation. This is irreversible and ideal for ensuring long-term trust and security.'
                        selectName="tokenName" // === RHFSelect name
                        selectLabel="Select Token"
                        helperText='Choose the token you wish to make immutable. Immutability guarantees that no one can alter your token&apos;s supply or other smart contract parameters after the fact.'
                        options={
                            tokens?.map((token: any) => ({
                                value: token.tokenName,
                                label: token.tokenName,
                                tokenPictureUrl: token.tokenPictureUrl,
                                alt: token.tokenName
                            }))}
                    />
                    <LoadingButton sx={{ mt: 3 }} loading={isSubmitting || checkingMutable} disabled={!hasMutable} fullWidth size='large' variant='contained' onClick={handleSubmit(processForm)}>
                        Make Token Immutable (0.025 SOL)
                    </LoadingButton>
                    {hasMutable ? false : (
                        <div style={{ color: 'red', marginTop: 16 }}>
                            This token cannot be made immutable as it is already immutable.
                        </div>
                    )}
                    <FaqView content={faqData} />
                </Grid>
            </Grid>
        </FormProvider>
    )
}