import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint } from '@solana/spl-token';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';

export async function createMintWithWalletAdapter({
    connection,
    wallet,
    mintAuthority,
    freezeAuthority = null,
    decimals,
    programId = TOKEN_PROGRAM_ID
}:{
    connection: any,
    wallet: any,
    mintAuthority: any,
    freezeAuthority: any,
    decimals: any,
    programId: any

}) {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mint = Keypair.generate(); // Generate a new keypair for the mint

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: mint.publicKey,
            space: MINT_SIZE,
            lamports,
            programId,
        }),
        createInitializeMint2Instruction(mint.publicKey, decimals, mintAuthority, freezeAuthority, programId)
    );

    // Use the wallet adapter to send the transaction
    await wallet.sendTransaction(transaction, connection, { signers: [mint] });

    return mint.publicKey;
}
