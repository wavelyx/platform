import ImmutableCompleted from "src/sections/revoke/completed/immutable-completed";

export const metadata = {
  title: 'wavelyz - Make Immutable',
  description: `Ensure your token's supply remains fixed for enhanced trust and stability. Secure your Solana token's future with wavelyz.`,
};

interface Params {
    id: string;
}


export default function Page({ params }: { params: Params}) {
    const { id } = params;

    return (
       <ImmutableCompleted id={id} />
    )
}