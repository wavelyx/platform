export type IRecipientFilterValue = string | string[];


export type RecipientType = {
  walletAddress: string;
  status: string;
  amount: number;
  transactionSignature?: string;
};

export type StatusType = {
  status: string;
  signatures: string[];
  recipients: RecipientType[];
  totalRecipients: number;
  senderWallet: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  newAccountsCount: number;
  existingAccountsCount: number;
  refundTransactionSignature: string;

  

};



export type IRecipientFilterType = {
  walletAddress: string;
  transactionSignature: string;
  status: string[];
};


