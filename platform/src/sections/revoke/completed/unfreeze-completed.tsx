'use client';

import { useGetTrasnsactionByID } from "src/actions/getTransaction";
import CompletedComponent from "src/app/components/completed/completed";
import NotFound from "src/app/not-found";
import { LoadingScreen } from "src/components/loading-screen";

export default function UnfreezeCompleted({ id }: { id: string }) {
    const { transaction, isLoading, isError } = useGetTrasnsactionByID(id);
    if (isLoading) {
        return <LoadingScreen />;
    }
    if (isError) {
        return <NotFound />;
    }
    return (
        <CompletedComponent
            title="Revoke Freeze Authority"
            subtitle="Freeze authority has been revoked successfully."
            firstButtonLabel="Go to Dashboard"
            secondButtonLabel="View Transaction"
            externalUrl={`https://solscan.io/tx/${(transaction as any)?.signature}`}
        />
    )
}