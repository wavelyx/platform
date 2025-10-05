'use client';

import { useTokenIdOrder } from "src/actions/getTokensByWallet";
import { useGetTrasnsactionByID } from "src/actions/getTransaction";
import CompletedComponent from "src/app/components/completed/completed";
import NotFound from "src/app/not-found";
import { LoadingScreen } from "src/components/loading-screen";

export default function MintAuthorCompleted({ id }: { id: string }) {

    const { transaction, isLoading, isError } = useGetTrasnsactionByID(id);
    if (isLoading) {
        return <LoadingScreen />;
    }
    if (isError) {
        return <NotFound />;
    }

    return (
        <CompletedComponent
            title="Mint Authority Successfully!"
            subtitle="Your token supply is now permanently fixed. No new tokens can be created."
            firstButtonLabel="Go to Dashboard"
            secondButtonLabel="View Transaction"
            // TODO
            externalUrl={`https://solscan.io/tx/${(transaction as any)?.signature}`}
        />
    )
}