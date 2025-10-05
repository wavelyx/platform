'use client';

import { useGetTrasnsactionByID } from "src/actions/getTransaction";
import CompletedComponent from "src/app/components/completed/completed";
import NotFound from "src/app/not-found";
import { LoadingScreen } from "src/components/loading-screen";

export default function FreezeCompleted({ id }: { id: string }) {

    const { transaction, isLoading, isError } = useGetTrasnsactionByID(id);
    if (isLoading) {
        return <LoadingScreen />;
    }
    if (isError) {
        return <NotFound />;
    }


    return (
        <CompletedComponent
            title="Freeze Authority"
            subtitle="The authority has been frozen successfully."
            firstButtonLabel="Go to Dashboard"
            secondButtonLabel="View Transaction"
            // TODO
            externalUrl={`https://solscan.io/tx/${(transaction as any)?.signature}`}
        />
    )
}
