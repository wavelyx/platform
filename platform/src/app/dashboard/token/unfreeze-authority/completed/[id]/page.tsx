import UnfreezeCompleted from "src/sections/revoke/completed/unfreeze-completed";


export const metadata = {
  title: 'wavelyz - Revoke Freeze Authority',
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