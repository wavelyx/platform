import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, AccountInfo, ParsedAccountData } from "@solana/web3.js";

interface FrozenAccount {
    owner: string;
    address: string;
}

async function fetchFrozenAccountsByMint(connection: Connection, mintAddress: PublicKey): Promise<FrozenAccount[]> {
    const tokenAccounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                { dataSize: 165 }, // Expected size of a token account data
                {
                    memcmp: {
                        offset: 0, // Mint address offset within token account data
                        bytes: mintAddress.toBase58(), // Mint address in base58 encoding
                    },
                },
            ],
        }
    );

    const frozenAccounts = tokenAccounts
        .filter(accountInfo => {
            const data = accountInfo.account.data as ParsedAccountData; 
            return data.parsed.info.state === "frozen"; 
        })
        .map(accountInfo => {
            const data = accountInfo.account.data as ParsedAccountData; 
            return {
                address: accountInfo.pubkey.toBase58(), 
                owner: data.parsed.info.owner, 
            };
        });

    return frozenAccounts;
}



export default fetchFrozenAccountsByMint;



