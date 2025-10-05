'use client';
import { TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import axiosInstance from "src/utils/axios";




const checkForFreezeAuthority = async (publicKey: any, mintAddress: any) => {

    try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_HOST_API_V2}/token/${mintAddress}`);
        const mintData = response.data;
        if (mintData.freezeAccount === undefined) {
            throw new Error("Freeze authority property is missing in the token data");
        }
        return mintData.freezeAccount === publicKey!.toBase58();
    } catch (error) {
        console.error("Failed to fetch mint information:", error);
        return false; // Assume no freeze authority in case of an error
    }
};

const checkForMintAuthority = async (publicKey: any, mintAddress: any) => {

    try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_HOST_API_V2}/token/${mintAddress}`);
        const mintData = response.data;
        if (mintData.mintAccount === undefined) {
            throw new Error("Mint authority property is missing in the token data");
        }
        return mintData.mintAccount === publicKey!.toBase58();
    } catch (error) {
        console.error("Failed to check mint authority:", error);
        return false;
    }
};

const checkTokenMutable = async (tokenAddress: any) => {
    try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_HOST_API_V2}/token/${tokenAddress}`);

        const tokenData = response.data;
        if (tokenData.mutable === undefined) {
            throw new Error("Mutable property is missing in the token data");
        }
        return tokenData.mutable
    } catch (error) {
        console.error("Failed to fetch token data:", error);
        return `Error: ${error.message}`;
    }
};

export { checkForFreezeAuthority, checkForMintAuthority, checkTokenMutable };