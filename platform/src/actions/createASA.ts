import {
    Keypair,
    PublicKey,
    Transaction,
    SystemProgram,
    Connection,
    sendAndConfirmTransaction
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';

interface ICreateAssociatedTokenAccountParams {
    connection: Connection;
    payer: Keypair;
    authority: PublicKey;
    mintPublicKey: PublicKey;
}

async function createAssociatedTokenAccount({
    connection,
    payer,
    authority,
    mintPublicKey,
}: ICreateAssociatedTokenAccountParams): Promise<string> {
    const associatedTokenAccount = new Keypair();

    const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        authority
    );

    const lamports = await connection.getMinimumBalanceForRentExemption(
        165 // Assuming the account data size
    );

    const transaction = new Transaction();

    const createAccountIx = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: associatedTokenAddress,
        lamports,
        space: 165,
        programId: TOKEN_2022_PROGRAM_ID
    });

    const initTokenAccountIx = createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAddress,
        authority,
        mintPublicKey
    );

    transaction.add(createAccountIx, initTokenAccountIx);

    // Ensure the transaction is signed by the payer and the newly created associated token account
    transaction.sign(payer, associatedTokenAccount);  // The payer is the primary signer

    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, associatedTokenAccount]
    );


    return associatedTokenAddress.toBase58();
}

export { createAssociatedTokenAccount };
