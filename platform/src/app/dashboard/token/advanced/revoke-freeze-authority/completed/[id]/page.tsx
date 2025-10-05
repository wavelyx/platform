import UnfreezeCompleted from "src/sections/revoke/completed/unfreeze-completed";


export const metadata = {
    title: 'Congrats! Your freeze authority has been revoked!',
    description: `Your freeze authority has been revoked!`,
};
interface Params {
    id: string;
}

export default function Page({ params }: { params: Params }) {
    const { id } = params;

    return (
        <UnfreezeCompleted id={id} />
    )
}