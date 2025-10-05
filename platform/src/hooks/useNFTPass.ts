import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { checkNFTPass, checkNFTPassSimple, checkNFTPassByCollection, type NFTPassInfo } from 'src/utils/nftPassVerification';

interface UseNFTPassReturn {
  hasNFTPass: boolean;
  nftPassInfo: NFTPassInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if the connected wallet has an NFT Pass
 */
export function useNFTPass(): UseNFTPassReturn {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [hasNFTPass, setHasNFTPass] = useState(false);
  const [nftPassInfo, setNFTPassInfo] = useState<NFTPassInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPassOwnership = useCallback(async () => {
    if (!publicKey || !connected || !connection) {
      setHasNFTPass(false);
      setNFTPassInfo(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting NFT pass check for wallet:', publicKey.toString());
      
      // Try the enhanced collection-based check first (most reliable)
      let passInfo = await checkNFTPassByCollection(connection, publicKey);
      
      if (!passInfo.hasPass) {
        // Fallback to detailed check
        console.log('Collection check failed, trying detailed check...');
        passInfo = await checkNFTPass(connection, publicKey);
      }
      
      if (!passInfo.hasPass) {
        // Final fallback to simple check
        console.log('Detailed check failed, trying simple check...');
        const hasAnyNFT = await checkNFTPassSimple(connection, publicKey);
        passInfo = hasAnyNFT ? { hasPass: true } : { hasPass: false };
      }
      
      if (passInfo.hasPass) {
        console.log('NFT Pass found:', passInfo);
        setHasNFTPass(true);
        setNFTPassInfo(passInfo);
      } else {
        console.log('No NFT Pass found');
        setHasNFTPass(false);
        setNFTPassInfo(null);
      }
    } catch (err) {
      console.error('Error checking NFT pass:', err);
      setError(err instanceof Error ? err.message : 'Failed to check NFT pass');
      setHasNFTPass(false);
      setNFTPassInfo(null);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection]);

  // Check NFT pass when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      checkPassOwnership();
    } else {
      setHasNFTPass(false);
      setNFTPassInfo(null);
      setLoading(false);
      setError(null);
    }
  }, [connected, publicKey, checkPassOwnership]);

  const refetch = useCallback(async () => {
    await checkPassOwnership();
  }, [checkPassOwnership]);

  return {
    hasNFTPass,
    nftPassInfo,
    loading,
    error,
    refetch,
  };
} 