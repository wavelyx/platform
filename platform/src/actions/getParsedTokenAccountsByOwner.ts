import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { METADATA_PROGRAM_ID } from "@raydium-io/raydium-sdk";

export interface TokenInfo {
    address: string;
    mintAddress: string;
    owner: string;
    balance: number;
    balanceRaw: string;
    decimals: number;
    metadata?: any;
    metadataJson?: any;
};


function getMetadataPDA(mint: PublicKey): PublicKey {
    const [publicKey] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        METADATA_PROGRAM_ID
    );
    return publicKey;
}


async function getParsedTokenAccountsByOwner(ownerPublicKey: PublicKey, connection: Connection): Promise<TokenInfo[]> {
    try {
        const response = await connection.getParsedTokenAccountsByOwner(
            ownerPublicKey,
            { programId: TOKEN_PROGRAM_ID }
        );

        const tokenAccounts = await Promise.all(response.value.map(async accountInfo => {
            const { pubkey, account } = accountInfo;
            const { mint, owner, tokenAmount } = account.data.parsed.info;

            // Fetch metadata
            let metadata;
            let metadataJson;
            try {
                const metadataPDA = getMetadataPDA(new PublicKey(mint));
                metadata = await Metadata.fromAccountAddress(connection, metadataPDA);

                const metadataUri = metadata.data.uri;
                const response = await fetch(metadataUri);
                if (response.ok) {
                    metadataJson = await response.json();
                } else {
                    console.error('Failed to fetch metadata:', response.statusText);
                };
            } catch (error) {
                console.error('Failed to fetch metadata:', error);
            }

            return {
                address: pubkey.toString(),
                mintAddress: mint,
                owner: owner,
                balance: tokenAmount.uiAmount,
                balanceRaw: tokenAmount.amount,
                decimals: tokenAmount.decimals,
                metadata: metadata ? metadata.data : null,
                metadataJson: metadataJson || null,
            };

        }));
        return tokenAccounts;
    } catch (error) {
        console.error('Failed to fetch token accounts:', error);
        throw error;
    }
}

const useTokensByWallet = () => {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!publicKey || !connected) {
            setTokens([]);
            return;
        }

        const fetchTokens = async () => {
            setIsLoading(true);
            try {
                const tokenAccounts = await getParsedTokenAccountsByOwner(publicKey, connection);
                setTokens(tokenAccounts);
            } catch (error) {
                console.error("Failed to fetch tokens:", error);
                setTokens([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTokens();
    }, [publicKey, connection, connected]);

    return { tokens, isLoading };
};

export default useTokensByWallet;
