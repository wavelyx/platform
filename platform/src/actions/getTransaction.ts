import { fetcher } from "src/utils/axios";
import useSWR from "swr";


export function useGetTrasnsactionByID(signature: string) {
    const URL = `${process.env.NEXT_PUBLIC_HOST_API_V2}/transaction/${signature}`;

    const { data, error } = useSWR(URL, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        transaction: data,
        isLoading: !error && !data,
        isError: error,
    };
}