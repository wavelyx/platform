

import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
import { enqueueSnackbar } from 'notistack';



export async function checkWalletBalance(publicKey: PublicKey, connection: Connection, serviceFeeInLamports: number){
    try {
        const balance = await connection.getBalance(publicKey);
        if (balance < serviceFeeInLamports) {
            enqueueSnackbar(`Insufficient balance. You need at least ${serviceFeeInLamports / LAMPORTS_PER_SOL} SOL to perform this operation.`, { variant: 'error' });
            return false;
        }
        return true;
    } catch (error) {
        enqueueSnackbar('Failed to check wallet balance. Please try again.', { variant: 'error' });
        return false;
    }
}
