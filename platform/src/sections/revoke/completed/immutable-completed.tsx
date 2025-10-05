'use client';

import { useGetTrasnsactionByID } from "src/actions/getTransaction";
import CompletedComponent from "src/app/components/completed/completed";
import NotFound from "src/app/not-found";
import { LoadingScreen } from "src/components/loading-screen";


export default function ImmutableCompleted({ id }: { id: string }) {
    const { transaction, isLoading, isError } = useGetTrasnsactionByID(id);
    if (isLoading) return <LoadingScreen />
    if (isError) return <NotFound />

    return (
        <CompletedComponent
            title="Token Immutable Successfully!"
            subtitle="Your token is now immutable, ensuring its supply and contract settings are permanently fixed."
            firstButtonLabel="Go to Dashboard"
            secondButtonLabel="View Transaction"
            // TODO
            externalUrl={`https://solscan.io/tx/${(transaction as any)?.signature}`}
        />
    )
}