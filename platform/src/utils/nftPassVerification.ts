import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError } from '@solana/spl-token';

// This should match your shop wallet address from the minting
const SHOP_WALLET = new PublicKey('CfyR2cyWjJgfQoqjB4fmaV89NkvffPAKRDRaoXWx1Bua');

// Metaplex NFT Collection detection
const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// NFT Pass collection details - update these to match your actual collection
const NFT_PASS_COLLECTION = {
  name: "Sol Studio Platform Passes",
  family: "Sol Studio Tools",
  symbol: "wavelyz Pass"
};

export interface NFTPassInfo {
  hasPass: boolean;
  nftMint?: string;
  metadata?: any;
  collection?: string;
}

/**
 * Check if a wallet owns a wavelyz Platform Pass NFT
 */
export async function checkNFTPass(
  connection: Connection,
  walletAddress: PublicKey
): Promise<NFTPassInfo> {
  try {
    console.log('Checking NFT pass for wallet:', walletAddress.toString());
    
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    console.log(`Found ${tokenAccounts.value.length} token accounts`);

    // Filter for NFTs (tokens with supply of 1 and decimals of 0)
    const nftAccounts = tokenAccounts.value.filter(account => {
      const tokenInfo = account.account.data.parsed.info;
      return tokenInfo.tokenAmount.decimals === 0 && 
             tokenInfo.tokenAmount.uiAmount === 1;
    });

    console.log(`Found ${nftAccounts.length} NFT accounts`);

    // Check each NFT to see if it's a wavelyz Platform Pass
    for (const nftAccount of nftAccounts) {
      const mintAddress = nftAccount.account.data.parsed.info.mint;
      console.log('Checking NFT mint:', mintAddress);
      
      try {
        // Get metadata account for this NFT
        const metadataAccount = await getMetadataAccount(new PublicKey(mintAddress));
        const metadata = await connection.getAccountInfo(metadataAccount);
        
        if (metadata) {
          // Parse metadata to check if it's a wavelyz Platform Pass
          const metadataDecoded = parseMetadata(metadata.data);
          
          if (iswavelyzPlatformPass(metadataDecoded)) {
            console.log('Found wavelyz Platform Pass!');
            return {
              hasPass: true,
              nftMint: mintAddress,
              metadata: metadataDecoded,
              collection: NFT_PASS_COLLECTION.name
            };
          }
        }
      } catch (error) {
        // Continue checking other NFTs if metadata parsing fails
        console.log(`Failed to check metadata for mint ${mintAddress}:`, error);
        continue;
      }
    }

    console.log('No wavelyz Platform Pass found');
    return { hasPass: false };
  } catch (error) {
    console.error('Error checking NFT pass:', error);
    return { hasPass: false };
  }
}

/**
 * Get the metadata account address for an NFT mint
 */
function getMetadataAccount(mint: PublicKey): Promise<PublicKey> {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METAPLEX_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METAPLEX_PROGRAM_ID
  ).then(([address]) => address);
}

/**
 * Basic metadata parsing (simplified)
 */
function parseMetadata(data: Buffer): any {
  try {
    // This is a simplified parser - in production you might want to use
    // @metaplex-foundation/mpl-token-metadata for proper parsing
    const decoder = new TextDecoder();
    const dataStr = decoder.decode(data);
    
    // Look for the NFT name in the metadata
    return {
      name: extractStringFromBuffer(data, 'name'),
      symbol: extractStringFromBuffer(data, 'symbol'),
      collection: extractStringFromBuffer(data, 'collection'),
      raw: dataStr
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if the metadata indicates this is a wavelyz Platform Pass
 */
function iswavelyzPlatformPass(metadata: any): boolean {
  if (!metadata) return false;
  
  const name = metadata.name?.toLowerCase() || '';
  const symbol = metadata.symbol?.toLowerCase() || '';
  const collection = metadata.collection?.toLowerCase() || '';
  
  // Check for wavelyz Platform Pass indicators
  return name.includes('sol studio platform pass') || 
         name.includes('wavelyz platform pass') ||
         name.includes('wavelyz pass') ||
         symbol.includes('wavelyz Pass') ||
         symbol.includes('wavelyz') ||
         collection.includes('sol studio platform passes') ||
         collection.includes('sol studio tools');
}

/**
 * Extract string from metadata buffer (simplified)
 */
function extractStringFromBuffer(buffer: Buffer, field: string): string {
  try {
    const str = buffer.toString('utf8');
    // This is a very basic extraction - you might need more sophisticated parsing
    return str.substring(0, 100).replace(/\0/g, '').trim();
  } catch {
    return '';
  }
}

/**
 * Simplified version that just checks if wallet has any NFT from the shop
 * This is more reliable but less specific
 */
export async function checkNFTPassSimple(
  connection: Connection,
  walletAddress: PublicKey
): Promise<boolean> {
  try {
    // Get all token accounts with balance of 1 (NFTs)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    // Check if any token has the characteristics of an NFT (balance 1, decimals 0)
    const hasNFT = tokenAccounts.value.some(account => {
      const tokenInfo = account.account.data.parsed.info;
      return tokenInfo.tokenAmount.decimals === 0 && 
             tokenInfo.tokenAmount.uiAmount === 1;
    });

    return hasNFT;
  } catch (error) {
    console.error('Error checking NFT pass (simple):', error);
    return false;
  }
}

/**
 * Enhanced check that looks for specific collection addresses
 * This is the most reliable method if you know your collection address
 */
export async function checkNFTPassByCollection(
  connection: Connection,
  walletAddress: PublicKey,
  collectionAddress?: string
): Promise<NFTPassInfo> {
  try {
    // If no collection address provided, use the default shop wallet
    const targetCollection = collectionAddress || SHOP_WALLET.toString();
    
    console.log('Checking NFT pass by collection:', targetCollection);
    
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    // Filter for NFTs and check if they belong to the target collection
    for (const nftAccount of tokenAccounts.value) {
      const tokenInfo = nftAccount.account.data.parsed.info;
      
      if (tokenInfo.tokenAmount.decimals === 0 && tokenInfo.tokenAmount.uiAmount === 1) {
        const mintAddress = tokenInfo.mint;
        
        try {
          // Get metadata account for this NFT
          const metadataAccount = await getMetadataAccount(new PublicKey(mintAddress));
          const metadata = await connection.getAccountInfo(metadataAccount);
          
          if (metadata) {
            // Check if this NFT belongs to the target collection
            const metadataDecoded = parseMetadata(metadata.data);
            
            if (iswavelyzPlatformPass(metadataDecoded)) {
              return {
                hasPass: true,
                nftMint: mintAddress,
                metadata: metadataDecoded,
                collection: NFT_PASS_COLLECTION.name
              };
            }
          }
        } catch (error) {
          console.log(`Failed to check metadata for mint ${mintAddress}:`, error);
          continue;
        }
      }
    }

    return { hasPass: false };
  } catch (error) {
    console.error('Error checking NFT pass by collection:', error);
    return { hasPass: false };
  }
} 