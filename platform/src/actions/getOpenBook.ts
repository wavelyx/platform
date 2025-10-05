import { fetcher } from "src/utils/axios";
import useSWR from "swr";

export function useGetOpenBookByID(id: string) {
    const URL = `${process.env.NEXT_PUBLIC_HOST_API_V2}/openBook/${id.toString()}`;

    const { data, error } = useSWR(URL, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        openBooks: data,
        isLoading: !error && !data,
        isError: error,
    };
}