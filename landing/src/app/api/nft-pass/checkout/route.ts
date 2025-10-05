import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction, 
  getMint,
  getAccount,
  TokenAccountNotFoundError
} from '@solana/spl-token';
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';
import base58 from 'bs58';

// NFT Metadata - Update this with your NFT metadata URI
const METADATA_URI = process.env.NEXT_PUBLIC_NFT_METADATA_URI || "https://arweave.net/your-metadata-uri";

// Payment token address - Using mainnet USDC
const USDC_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Connection endpoint - Using your Helius RPC
const ENDPOINT = process.env.HELIUS_URL || 'https://mainnet.helius-rpc.com/?api-key=your-api-key';

// NFT details
const NFT_NAME = "wavelyz Platform Pass";
const NFT_SYMBOL = "SOLXPASS";

// The amount to charge in USDC
const PRICE_USDC = parseFloat(process.env.NEXT_PUBLIC_NFT_PRICE || "10");

type InputData = {
  account: string;
}

type GetResponse = {
  label: string;
  icon: string;
}

export type PostResponse = {
  transaction: string;
  message: string;
}

export type PostError = {
  error: string;
}

export type AddSignaturesRequest = {
  account: string;
  signedTransaction: string; // Base64 encoded transaction signed by user
}

export type AddSignaturesResponse = {
  fullySignedTransaction: string; // Base64 encoded transaction with all signatures
  message: string;
}

export async function GET() {
  const response: GetResponse = {
    label: "wavelyz Platform",
    icon: "https://app.wavelyz.io/logo/logo_single.png",
  };
  
  return NextResponse.json(response);
}

async function createNFTTransaction(account: PublicKey): Promise<PostResponse> {
  const connection = new Connection(ENDPOINT);

  console.log('=== Starting NFT Transaction Creation ===');
  console.log('Buyer account:', account.toString());
  console.log('RPC Endpoint:', ENDPOINT);
  console.log('NFT Price:', PRICE_USDC, 'USDC');
  console.log('NFT Metadata URI:', METADATA_URI);
  console.log('USDC Address:', USDC_ADDRESS.toString());

  // Get the shop keypair from the environment variable
  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY;
  if (!shopPrivateKey) {
    console.error('SHOP_PRIVATE_KEY environment variable not found');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('SHOP') || k.startsWith('NEXT_PUBLIC')));
    throw new Error('SHOP_PRIVATE_KEY not found. Please check your .env.local file');
  }
  
  let shopKeypair: Keypair;
  try {
    shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
    console.log('Shop wallet:', shopKeypair.publicKey.toString());
  } catch (error) {
    console.error('Failed to decode shop private key:', error);
    throw new Error('Invalid SHOP_PRIVATE_KEY format. Make sure it\'s a valid base58 encoded private key');
  }

  // Initialize Metaplex with shop keypair
  const metaplex = Metaplex
    .make(connection)
    .use(keypairIdentity(shopKeypair));

  const nfts = metaplex.nfts();

  // Create a deterministic mint keypair based on the user's account
  // This ensures the same mint address is generated for the same user
  const mintSeed = account.toBytes();
  const mintKeypair = Keypair.fromSeed(mintSeed.slice(0, 32));
  console.log('NFT Mint address (deterministic):', mintKeypair.publicKey.toString());

  // Get USDC mint info first
  const { decimals } = await getMint(connection, USDC_ADDRESS);

  // Get the associated token addresses
  const fromUsdcAddress = await getAssociatedTokenAddress(
    USDC_ADDRESS,
    account
  );

  const toUsdcAddress = await getAssociatedTokenAddress(
    USDC_ADDRESS,
    shopKeypair.publicKey
  );

  // Check if buyer's USDC account exists
  let buyerTokenAccount;
  try {
    buyerTokenAccount = await getAccount(connection, fromUsdcAddress);
    console.log('Buyer USDC account found:', fromUsdcAddress.toString());
    console.log('Buyer USDC balance:', Number(buyerTokenAccount.amount) / (10 ** decimals), 'USDC');
  } catch (error: any) {
    if (error instanceof TokenAccountNotFoundError) {
      console.error('Buyer has no USDC token account');
      // Account doesn't exist, buyer needs USDC first
      throw new Error('No USDC token account found. Please ensure you have USDC in your wallet.');
    } else {
      throw error;
    }
  }

  // Check if buyer has enough USDC
  const requiredAmount = PRICE_USDC * (10 ** decimals);
  if (buyerTokenAccount && buyerTokenAccount.amount < requiredAmount) {
    console.error('Insufficient USDC balance:', {
      required: PRICE_USDC,
      available: Number(buyerTokenAccount.amount) / (10 ** decimals)
    });
    throw new Error(`Insufficient USDC balance. Required: ${PRICE_USDC} USDC, Available: ${Number(buyerTokenAccount.amount) / (10 ** decimals)} USDC`);
  }

  // Check if shop's USDC account exists
  let shopTokenAccount;
  try {
    shopTokenAccount = await getAccount(connection, toUsdcAddress);
    console.log('Shop USDC account found:', toUsdcAddress.toString());
  } catch (error: any) {
    if (error instanceof TokenAccountNotFoundError) {
      console.log('Shop USDC account not found, will create it');
      // Account doesn't exist, we'll create it
      shopTokenAccount = null;
    } else {
      throw error;
    }
  }

  // ===== SINGLE TRANSACTION STRATEGY =====
  // Create one transaction that includes both USDC transfer and NFT creation
  
  const transaction = new Transaction();
  
  // If shop's token account doesn't exist, add instruction to create it FIRST
  if (!shopTokenAccount) {
    const createShopTokenAccountInstruction = createAssociatedTokenAccountInstruction(
      shopKeypair.publicKey, // payer
      toUsdcAddress, // associated token account
      shopKeypair.publicKey, // owner
      USDC_ADDRESS // mint
    );
    
    transaction.add(createShopTokenAccountInstruction);
  }

  // Create USDC transfer instruction
  const usdcTransferInstruction = createTransferCheckedInstruction(
    fromUsdcAddress, // from USDC address
    USDC_ADDRESS, // USDC mint address
    toUsdcAddress, // to USDC address
    account, // owner of the from USDC address (the buyer)
    PRICE_USDC * (10 ** decimals), // multiply by 10^decimals
    decimals
  );

  transaction.add(usdcTransferInstruction);
  
  // Create NFT with minimal metadata to reduce size
  const transactionBuilder = await nfts.builders().create({
    uri: METADATA_URI,
    name: NFT_NAME,
    symbol: NFT_SYMBOL,
    tokenOwner: account, // NFT is minted to the wallet submitting the transaction (buyer)
    updateAuthority: shopKeypair, // we retain update authority
    sellerFeeBasisPoints: 250, // 2.5% royalty
    useNewMint: mintKeypair, // we pass our mint in as the new mint to use
  });

  // Convert NFT builder to transaction
  const latestBlockhash = await connection.getLatestBlockhash();
  const nftBuilderTransaction = await transactionBuilder.toTransaction(latestBlockhash);
  
  // Add NFT instructions to the main transaction
  nftBuilderTransaction.instructions.forEach(instruction => {
    transaction.add(instruction);
  });
  
  // The mint keypair and shop keypair will be added as signers during the signing process
  // They are required signers based on the instructions in the transaction

  // Set fee payer and blockhash for the transaction
  transaction.feePayer = account;
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

  console.log('\n=== Transaction Details (Single) ===');
  console.log('Transaction:');
  console.log('- Instructions:', transaction.instructions.length);
  console.log('- Fee payer:', transaction.feePayer?.toString());
  console.log('- Recent blockhash:', transaction.recentBlockhash);
  console.log('- Last valid block height:', transaction.lastValidBlockHeight);
  
  // Log the transaction structure
  console.log('\n=== Transaction Structure ===');
  console.log('Transaction object keys:', Object.keys(transaction));
  console.log('Transaction signatures array length:', transaction.signatures?.length || 0);
  
  console.log('- Signing order:', [
    `${shopKeypair.publicKey.toString()} (shop) - will sign first`,
    `${mintKeypair.publicKey.toString()} (mint) - will sign second`,
    `${account.toString()} (buyer) - will sign last`
  ]);

  // Pre-sign the transaction with shop and mint keypairs
  console.log('\n=== Pre-signing Transaction ===');
  console.log('Adding shop signature...');
  transaction.partialSign(shopKeypair);
  
  console.log('Adding mint signature...');
  transaction.partialSign(mintKeypair);
  
  console.log('✅ Transaction pre-signed with shop and mint keypairs');
  
  // Log signature status after pre-signing
  console.log('\n=== Pre-signed Transaction Status ===');
  transaction.signatures.forEach((sig, index) => {
    if (sig.signature) {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (present)`);
    } else {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (missing)`);
    }
  });

  // Log each instruction with descriptive names for debugging
  console.log('\n=== Transaction Instructions ===');
  transaction.instructions.forEach((instruction, index) => {
    let instructionName = 'Unknown';
    
    if (instruction.programId.toString() === 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') {
      instructionName = 'Create Associated Token Account';
    } else if (instruction.programId.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
      instructionName = 'USDC Transfer';
    } else if (instruction.programId.toString() === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s') {
      instructionName = 'Metaplex NFT Creation';
    }
    
    console.log(`Instruction ${index + 1}: ${instructionName}`);
    console.log('Program ID:', instruction.programId.toString());
    console.log('Number of keys:', instruction.keys.length);
  });

  // Simulate the transaction to check for errors
  try {
    console.log('\n=== Simulating Transaction ===');
    const simulation = await connection.simulateTransaction(transaction);
    console.log('Simulation result:', {
      err: simulation.value.err,
      unitsConsumed: simulation.value.unitsConsumed,
    });
  } catch (simError) {
    console.error('Error during simulation:', simError);
    // Continue anyway, simulation might fail due to missing signatures
  }

  // Serialize the transaction
  console.log('\n=== Serializing Transaction ===');
  console.log('Serializing with requireAllSignatures: false');
  
  const serialized = transaction.serialize({
    requireAllSignatures: false
  });

  const base64 = serialized.toString('base64');

  console.log('\n=== Transaction Created Successfully ===');
  console.log('Transaction size:', serialized.length, 'bytes');
  console.log('Transaction is PRE-SIGNED by shop and mint - user needs to add their signature');
  console.log('Serialized transaction (first 100 chars):', `${base64.substring(0, 100)}...`);

  const message = `Purchase your wavelyz Platform Pass for ${PRICE_USDC} USDC`;

  // Return the single transaction
  return {
    transaction: base64,
    message,
  };
}

async function addUserSignature(preSignedTransactionBase64: string): Promise<AddSignaturesResponse> {
  console.log('=== Adding User Signature to Pre-signed Transaction ===');
  
  // Deserialize the pre-signed transaction (already signed by shop and mint)
  const preSignedTransaction = Transaction.from(Buffer.from(preSignedTransactionBase64, 'base64'));
  
  console.log('Pre-signed transaction details:');
  console.log('- Fee payer:', preSignedTransaction.feePayer?.toString());
  
  // Check which signatures are already present
  console.log('Existing signatures (should have shop and mint):');
  preSignedTransaction.signatures.forEach((sig, index) => {
    if (sig.signature) {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (present)`);
    } else {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (missing)`);
    }
  });
  
  // The transaction should already be signed by shop and mint
  // We just need to verify that the user's signature is missing and add it
  const userPublicKey = preSignedTransaction.feePayer;
  if (!userPublicKey) {
    throw new Error('Transaction fee payer not found');
  }
  
  // Find the user's signature slot
  const userSignatureIndex = preSignedTransaction.signatures.findIndex(
    sig => sig.publicKey.equals(userPublicKey)
  );
  
  if (userSignatureIndex === -1) {
    throw new Error('User signature slot not found in transaction');
  }
  
  if (preSignedTransaction.signatures[userSignatureIndex].signature) {
    console.log('✅ User signature already present');
  } else {
    console.log('❌ User signature missing - this should not happen in this flow');
    throw new Error('User signature is missing from pre-signed transaction');
  }
  
  console.log('✅ Transaction is fully signed and ready to send');
  
  // Serialize the fully signed transaction
  const fullySignedTransaction = preSignedTransaction.serialize();
  const base64 = fullySignedTransaction.toString('base64');
  
  return {
    fullySignedTransaction: base64,
    message: 'Transaction fully signed and ready to send'
  };
}


export async function POST(request: NextRequest) {
  try {
    console.log('\n=== NFT Pass Checkout API Called ===');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Check if this is a request to add signatures or create a new transaction
    if (body.signedTransaction) {
      // This is a request to add additional signatures
      console.log('Adding additional signatures to user-signed transaction');
      const { signedTransaction } = body as AddSignaturesRequest;
      
      if (!signedTransaction) {
        return NextResponse.json(
          { error: "No signed transaction provided" } as PostError, 
          { status: 400 }
        );
      }
      
      // Single transaction case
      console.log('Processing single transaction case');
      const signatureResult = await addUserSignature(signedTransaction);
      return NextResponse.json(signatureResult);
    }
    
    // This is a request to create a new transaction
    const { account } = body as InputData;
    
    if (!account) {
      console.error('No account provided in request');
      return NextResponse.json(
        { error: "No account provided" } as PostError, 
        { status: 400 }
      );
    }

    console.log('Creating transaction for account:', account);
    const mintOutputData = await createNFTTransaction(new PublicKey(account));
    console.log('Transaction created successfully');
    
    return NextResponse.json(mintOutputData);
  } catch (error: any) {
    console.error('\n❌ Error in checkout API:', error);
    console.error('Error stack:', error.stack);
    
    // Return more specific error messages
    let errorMessage = 'Error processing request';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage } as PostError, 
      { status: 500 }
    );
  }
}
