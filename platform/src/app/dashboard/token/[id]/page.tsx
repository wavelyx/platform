// sections

import TokenProfileView from "src/sections/three/view/user-profile-view";

import { Metadata } from "next";

const HOST_API = process.env.NEXT_PUBLIC_HOST_API_V2;

// ----------------------------------------------------------------------

interface Params {
  id: string;
}

type Props = {
  params: Params;
};



export async function generateStaticParams() {
  try {
    const headers: HeadersInit = {};
    if (process.env.SERVER_SIDE_SECRET_TOKEN) {
      headers['x-secret-token'] = process.env.SERVER_SIDE_SECRET_TOKEN;
    }

    const res = await fetch(`${HOST_API}/tokensList`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data?.tokens.map((token: { tokenAddress: any; }) => ({
      params: { id: token.tokenAddress },
    }));
  } catch (error) {
    console.error("Failed to fetch tokens list:", error);
    return [];
  }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const headers: HeadersInit = {};
    if (process.env.SERVER_SIDE_SECRET_TOKEN) {
      headers['x-secret-token'] = process.env.SERVER_SIDE_SECRET_TOKEN;
    }

    const res = await fetch(`${HOST_API}/token/${params.id}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const token = await res.json();
    return {
      title: `Token: ${token?.tokenName}`,
      description: `${token?.description} is a token on the Solana blockchain.`,
    };
  } catch (error) {
    console.error("Failed to fetch token data:", error);
    return {
      title: "Token not found",
      description: "The requested token could not be found.",
    };
  }
}






export default function Page({ params }: { params: Params }) {
  const { id } = params;

  return <TokenProfileView id={id} />;
}
