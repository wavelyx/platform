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
import { SystemProgram } from '@solana/web3.js';
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
const NFT_SYMBOL = "wavely";

// The amount to charge in USDC
const PRICE_USDC = parseFloat(process.env.NEXT_PUBLIC_NFT_PRICE || "8");

type InputData = {
  account: string;
}

type GetResponse = {
  label: string;
  icon: string;
}

export type PostResponse = {
  transaction1: string; // USDC transfer + SOL rent
  transaction2: string; // NFT creation
  message: string;
}

export type PostError = {
  error: string;
}

export type AddSignaturesRequest = {
  account: string;
  signedTransaction1: string; // Base64 encoded transaction 1 signed by user
  signedTransaction2: string; // Base64 encoded transaction 2 signed by user
}

export type AddSignaturesResponse = {
  fullySignedTransaction1: string; // Base64 encoded transaction 1 with all signatures
  fullySignedTransaction2: string; // Base64 encoded transaction 2 with all signatures
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

  // Define rent amount needed for NFT creation
  // Based on the error: need 15115600 lamports = ~0.0151156 SOL
  // We need to transfer enough SOL to the shop to cover this cost
  const rentAmount = 0.02; // Transfer 0.02 SOL to shop to cover NFT creation costs
  const rentLamports = Math.floor(rentAmount * 1e9);
  
  // Check if buyer has enough SOL for NFT creation rent + transaction fees
  const buyerBalance = await connection.getBalance(account);
  const nftRentCost = 0.02; // NFT creation rent cost (increased to cover all accounts: mint, metadata, master edition, token account)
  const transactionFeeBuffer = 0.005; // 0.005 SOL buffer for transaction fees
  const totalRequiredSOL = nftRentCost + transactionFeeBuffer;
  const totalRequiredLamports = Math.floor(totalRequiredSOL * 1e9);
  
  if (buyerBalance < totalRequiredLamports) {
    console.error('Insufficient SOL balance:', {
      required: totalRequiredSOL,
      available: buyerBalance / 1e9,
      breakdown: {
        nftRent: nftRentCost,
        transactionFees: transactionFeeBuffer
      }
    });
    throw new Error(`Insufficient SOL balance. Required: ${totalRequiredSOL} SOL (${nftRentCost} for NFT rent + ${transactionFeeBuffer} for fees), Available: ${(buyerBalance / 1e9).toFixed(4)} SOL`);
  }
  
  console.log('Buyer SOL balance:', buyerBalance / 1e9, 'SOL');
  console.log('NFT rent cost:', nftRentCost, 'SOL');
  console.log('Transaction fee buffer:', transactionFeeBuffer, 'SOL');
  console.log('Total SOL required:', totalRequiredSOL, 'SOL');

  // Check shop wallet SOL balance (for reference)
  const shopBalance = await connection.getBalance(shopKeypair.publicKey);
  console.log('Shop SOL balance:', shopBalance / 1e9, 'SOL');
  console.log('Note: Buyer will transfer SOL to shop for NFT creation rent');
  
  // Log detailed account information for debugging
  console.log('\n=== Account Details for Debugging ===');
  console.log('Buyer account:', account.toString());
  console.log('Buyer USDC account:', fromUsdcAddress.toString());
  console.log('Shop account:', shopKeypair.publicKey.toString());
  console.log('Shop USDC account:', toUsdcAddress.toString());
  console.log('NFT Mint account:', mintKeypair.publicKey.toString());
  console.log('USDC Mint account:', USDC_ADDRESS.toString());

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

  // ===== TWO TRANSACTION STRATEGY =====
  // Split into two transactions to avoid size limits and follow Phantom signing order
  
  const latestBlockhash = await connection.getLatestBlockhash();
  
  // TRANSACTION 1: USDC Transfer Only (User signs first, then shop)
  const transaction1 = new Transaction();
  
  // If shop's token account doesn't exist, add instruction to create it FIRST
  if (!shopTokenAccount) {
    const createShopTokenAccountInstruction = createAssociatedTokenAccountInstruction(
      shopKeypair.publicKey, // payer
      toUsdcAddress, // associated token account
      shopKeypair.publicKey, // owner
      USDC_ADDRESS // mint
    );
    
    transaction1.add(createShopTokenAccountInstruction);
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

  transaction1.add(usdcTransferInstruction);
  
  // Set fee payer and blockhash for transaction 1
  transaction1.feePayer = account;
  transaction1.recentBlockhash = latestBlockhash.blockhash;
  transaction1.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

  // TRANSACTION 2: NFT Creation (User signs first, then shop and mint)
  const transaction2 = new Transaction();
  
  // First, transfer SOL from buyer to shop to cover NFT creation rent
  // The shop needs SOL to pay for the NFT account creation
  const nftRentTransferInstruction = SystemProgram.transfer({
    fromPubkey: account, // buyer pays the rent
    toPubkey: shopKeypair.publicKey, // shop receives SOL to pay for NFT creation
    lamports: Math.floor(nftRentCost * 1e9), // transfer the exact amount needed for rent
  });
  
  transaction2.add(nftRentTransferInstruction);
  
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
  const nftBuilderTransaction = await transactionBuilder.toTransaction(latestBlockhash);
  
  // Add NFT instructions to transaction 2
  nftBuilderTransaction.instructions.forEach(instruction => {
    transaction2.add(instruction);
  });
  
  // Set fee payer and blockhash for transaction 2
  transaction2.feePayer = account;
  transaction2.recentBlockhash = latestBlockhash.blockhash;
  transaction2.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

  console.log('\n=== Transaction Details (Two Transactions) ===');
  console.log('Transaction 1 (USDC Transfer):');
  console.log('- Instructions:', transaction1.instructions.length);
  console.log('- Fee payer:', transaction1.feePayer?.toString());
  console.log('- Recent blockhash:', transaction1.recentBlockhash);
  console.log('- Last valid block height:', transaction1.lastValidBlockHeight);
  
  console.log('Transaction 2 (NFT Creation - Buyer pays rent):');
  console.log('- Instructions:', transaction2.instructions.length);
  console.log('- Fee payer:', transaction2.feePayer?.toString());
  console.log('- Recent blockhash:', transaction2.recentBlockhash);
  console.log('- Last valid block height:', transaction2.lastValidBlockHeight);
  
  // Log the transaction structure
  console.log('\n=== Transaction Structure ===');
  console.log('Transaction 1 object keys:', Object.keys(transaction1));
  console.log('Transaction 1 signatures array length:', transaction1.signatures?.length || 0);
  console.log('Transaction 2 object keys:', Object.keys(transaction2));
  console.log('Transaction 2 signatures array length:', transaction2.signatures?.length || 0);
  
  console.log('- Signing order for both transactions:');
  console.log('  1. User signs first (Phantom requirement)');
  console.log('  2. Additional signers sign afterward');
  console.log('  Transaction 1: User -> Shop (USDC transfer)');
  console.log('  Transaction 2: User -> Shop + Mint (NFT creation)');

  // Log each instruction with descriptive names for debugging
  console.log('\n=== Transaction 1 Instructions (Detailed) ===');
  transaction1.instructions.forEach((instruction, index) => {
    let instructionName = 'Unknown';
    
    if (instruction.programId.toString() === 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') {
      instructionName = 'Create Associated Token Account';
    } else if (instruction.programId.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
      instructionName = 'USDC Transfer';
    }
    
    console.log(`Instruction ${index + 1}: ${instructionName}`);
    console.log('Program ID:', instruction.programId.toString());
    console.log('Number of keys:', instruction.keys.length);
    console.log('Keys:', instruction.keys.map((key, i) => `${i}: ${key.pubkey.toString()} (${key.isSigner ? 'signer' : 'not signer'}, ${key.isWritable ? 'writable' : 'read-only'})`));
    console.log('Data length:', instruction.data.length, 'bytes');
  });

  console.log('\n=== Transaction 2 Instructions (Detailed) ===');
  transaction2.instructions.forEach((instruction, index) => {
    let instructionName = 'Unknown';
    
    if (instruction.programId.toString() === '11111111111111111111111111111111') {
      instructionName = 'SOL Transfer (NFT Rent)';
    } else if (instruction.programId.toString() === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s') {
      instructionName = 'Metaplex NFT Creation';
    }
    
    console.log(`Instruction ${index + 1}: ${instructionName}`);
    console.log('Program ID:', instruction.programId.toString());
    console.log('Number of keys:', instruction.keys.length);
    console.log('Keys:', instruction.keys.map((key, i) => `${i}: ${key.pubkey.toString()} (${key.isSigner ? 'signer' : 'not signer'}, ${key.isWritable ? 'writable' : 'read-only'})`));
    console.log('Data length:', instruction.data.length, 'bytes');
  });

  // Simulate both transactions to check for errors
  console.log('\n=== Simulating Transaction 1 (USDC Transfer) ===');
  try {
    const simulation1 = await connection.simulateTransaction(transaction1);
    console.log('Transaction 1 Simulation result:', {
      err: simulation1.value.err,
      unitsConsumed: simulation1.value.unitsConsumed,
    });
    
    if (simulation1.value.err) {
      console.error('Transaction 1 Simulation error details:', JSON.stringify(simulation1.value.err, null, 2));
      if (simulation1.value.logs) {
        console.error('Transaction 1 Simulation logs:');
        simulation1.value.logs.forEach((log, index) => {
          console.error(`  ${index + 1}: ${log}`);
        });
      }
    } else {
      console.log('✅ Transaction 1 simulation successful');
    }
  } catch (simError1) {
    console.error('Error during transaction 1 simulation:', simError1);
  }

  console.log('\n=== Simulating Transaction 2 (NFT Creation) ===');
  try {
    const simulation2 = await connection.simulateTransaction(transaction2);
    console.log('Transaction 2 Simulation result:', {
      err: simulation2.value.err,
      unitsConsumed: simulation2.value.unitsConsumed,
    });
    
    if (simulation2.value.err) {
      console.error('Transaction 2 Simulation error details:', JSON.stringify(simulation2.value.err, null, 2));
      if (simulation2.value.logs) {
        console.error('Transaction 2 Simulation logs:');
        simulation2.value.logs.forEach((log, index) => {
          console.error(`  ${index + 1}: ${log}`);
        });
      }
    } else {
      console.log('✅ Transaction 2 simulation successful');
    }
  } catch (simError2) {
    console.error('Error during transaction 2 simulation:', simError2);
  }

  // Serialize both transactions
  console.log('\n=== Serializing Transactions ===');
  console.log('Serializing with requireAllSignatures: false');
  
  const serialized1 = transaction1.serialize({
    requireAllSignatures: false
  });
  const serialized2 = transaction2.serialize({
    requireAllSignatures: false
  });

  const base64_1 = serialized1.toString('base64');
  const base64_2 = serialized2.toString('base64');

  console.log('\n=== Transactions Created Successfully ===');
  console.log('Transaction 1 size:', serialized1.length, 'bytes');
  console.log('Transaction 2 size:', serialized2.length, 'bytes');
  console.log('Both transactions ready for user to sign first, then additional signers');
  console.log('Transaction 1 (first 100 chars):', `${base64_1.substring(0, 100)}...`);
  console.log('Transaction 2 (first 100 chars):', `${base64_2.substring(0, 100)}...`);

  // Summary for debugging
  console.log('\n=== DEBUGGING SUMMARY ===');
  console.log('Buyer:', account.toString());
  console.log('Buyer SOL balance:', buyerBalance / 1e9, 'SOL');
  console.log('Buyer USDC balance:', Number(buyerTokenAccount.amount) / (10 ** decimals), 'USDC');
  console.log('Shop:', shopKeypair.publicKey.toString());
  console.log('Shop SOL balance:', shopBalance / 1e9, 'SOL');
  console.log('NFT Mint:', mintKeypair.publicKey.toString());
  console.log('USDC Mint:', USDC_ADDRESS.toString());
  console.log('NFT Price:', PRICE_USDC, 'USDC');
  console.log('NFT Rent Cost:', nftRentCost, 'SOL');
  console.log('Transaction Fee Buffer:', transactionFeeBuffer, 'SOL');
  console.log('Total SOL Required:', totalRequiredSOL, 'SOL');
  console.log('Transaction 1 Instructions:', transaction1.instructions.length);
  console.log('Transaction 2 Instructions:', transaction2.instructions.length);
  console.log('Transaction 1 Size:', serialized1.length, 'bytes');
  console.log('Transaction 2 Size:', serialized2.length, 'bytes');
  console.log('=== END DEBUGGING SUMMARY ===');

  const message = `Purchase your wavelyz Platform Pass for ${PRICE_USDC} USDC + ${totalRequiredSOL} SOL (NFT rent + fees) - Two transactions required`;

  // Return both transactions
  return {
    transaction1: base64_1,
    transaction2: base64_2,
    message,
  };
}

async function addUserSignature(userSignedTransaction1Base64: string, userSignedTransaction2Base64: string): Promise<AddSignaturesResponse> {
  console.log('=== Adding Additional Signatures to User-Signed Transactions ===');
  
  // Get the shop keypair from the environment variable
  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY;
  if (!shopPrivateKey) {
    throw new Error('SHOP_PRIVATE_KEY not found. Please check your .env.local file');
  }
  
  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
  
  // Deserialize the user-signed transactions
  const userSignedTransaction1 = Transaction.from(Buffer.from(userSignedTransaction1Base64, 'base64'));
  const userSignedTransaction2 = Transaction.from(Buffer.from(userSignedTransaction2Base64, 'base64'));
  
  console.log('User-signed transaction 1 details:');
  console.log('- Fee payer:', userSignedTransaction1.feePayer?.toString());
  console.log('- Instructions:', userSignedTransaction1.instructions.length);
  
  console.log('User-signed transaction 2 details:');
  console.log('- Fee payer:', userSignedTransaction2.feePayer?.toString());
  console.log('- Instructions:', userSignedTransaction2.instructions.length);
  
  // Check which signatures are already present in transaction 1
  console.log('Transaction 1 existing signatures:');
  userSignedTransaction1.signatures.forEach((sig, index) => {
    if (sig.signature) {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (present)`);
    } else {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (missing)`);
    }
  });
  
  // Check which signatures are already present in transaction 2
  console.log('Transaction 2 existing signatures:');
  userSignedTransaction2.signatures.forEach((sig, index) => {
    if (sig.signature) {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (present)`);
    } else {
      console.log(`- Signature ${index}: ${sig.publicKey.toString()} (missing)`);
    }
  });
  
  // Add shop signature to transaction 1 (USDC + SOL transfer)
  console.log('Adding shop signature to transaction 1...');
  userSignedTransaction1.partialSign(shopKeypair);
  
  // For transaction 2, we need to add both shop and mint signatures
  // First, we need to recreate the mint keypair (deterministic)
  const userPublicKey = userSignedTransaction2.feePayer;
  if (!userPublicKey) {
    throw new Error('Transaction 2 fee payer not found');
  }
  
  const mintSeed = userPublicKey.toBytes();
  const mintKeypair = Keypair.fromSeed(mintSeed.slice(0, 32));
  
  console.log('Adding shop signature to transaction 2...');
  userSignedTransaction2.partialSign(shopKeypair);
  
  console.log('Adding mint signature to transaction 2...');
  userSignedTransaction2.partialSign(mintKeypair);
  
  console.log('✅ Both transactions fully signed and ready to send');
  
  // Serialize both fully signed transactions
  const fullySignedTransaction1 = userSignedTransaction1.serialize();
  const fullySignedTransaction2 = userSignedTransaction2.serialize();
  
  const base64_1 = fullySignedTransaction1.toString('base64');
  const base64_2 = fullySignedTransaction2.toString('base64');
  
  return {
    fullySignedTransaction1: base64_1,
    fullySignedTransaction2: base64_2,
    message: 'Both transactions fully signed and ready to send'
  };
}


export async function POST(request: NextRequest) {
  try {
    console.log('\n=== NFT Pass Checkout API Called ===');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Check if this is a request to add signatures or create a new transaction
    if (body.signedTransaction1 && body.signedTransaction2) {
      // This is a request to add additional signatures to both transactions
      console.log('Adding additional signatures to user-signed transactions');
      const { signedTransaction1, signedTransaction2 } = body as AddSignaturesRequest;
      
      if (!signedTransaction1 || !signedTransaction2) {
        return NextResponse.json(
          { error: "Both signed transactions must be provided" } as PostError, 
          { status: 400 }
        );
      }
      
      // Two transaction case
      console.log('Processing two transaction case');
      const signatureResult = await addUserSignature(signedTransaction1, signedTransaction2);
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
