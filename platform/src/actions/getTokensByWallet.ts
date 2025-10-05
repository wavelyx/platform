import { fetcher } from "src/utils/axios";
import useSWR, { mutate } from 'swr';

// Assuming you have a fetcher function that looks something like this

// Custom hook to fetch tokens by wallet
export function useTokensByWallet() {
    const URL = `${process.env.NEXT_PUBLIC_HOST_API_V2}/my-tokens`; // Ensure the endpoint expects walletAddress in the URL

    const { data, error } = useSWR(URL, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        tokens: data,
        isLoading: !error && !data,
        isError: error,
        refetch: () => mutate(URL),
        pageCount: data?.totalPages,

    };
}


// get token id by wallet address
export function useTokenIdByWallet(tokenAddress: string) {
    const URL = `${process.env.NEXT_PUBLIC_HOST_API_V2}/token/${tokenAddress}`;

    const { data, error } = useSWR(URL, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        token: data,
        isLoading: !error && !data,
        isError: error,
    };
}

export function useTokenIdOrder(tokenAddress: string) {
    const URL = `${process.env.NEXT_PUBLIC_HOST_API_V2}/tokenOrder/${tokenAddress}`;

    const { data, error } = useSWR(URL, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        token: data,
        isLoading: !error && !data,
        isError: error,
    };
}