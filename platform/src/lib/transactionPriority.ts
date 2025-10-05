
export type PriorityLevel = 'FAST' | 'TURBO' | 'ULTRA';

export const TransactionPriorities: Record<PriorityLevel, number> = {
    FAST: 50000, // microLamports
    TURBO: 100000, // microLamports
    ULTRA: 150000 // microLamports
};

export const useTransactionPriority = (): number => {
    const priority = localStorage.getItem('transactionPriority') as PriorityLevel || 'TURBO';
    return TransactionPriorities[priority];
};
