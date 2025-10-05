import AuthGuard from './auth-guard';
import NFTPassGuard from './nft-pass-guard';

// ----------------------------------------------------------------------

type PremiumGuardProps = {
  children: React.ReactNode;
  // NFT Guard options
  redirectUrl?: string;
  customMessage?: string;
  allowBypass?: boolean;
  // Optional: disable NFT check (only use auth)
  skipNFTCheck?: boolean;
};

/**
 * Combined guard that checks both authentication and NFT Pass ownership
 * Use this for premium features that require both login and NFT Pass
 */
export default function PremiumGuard({ 
  children,
  redirectUrl,
  customMessage,
  allowBypass = false,
  skipNFTCheck = false
}: PremiumGuardProps) {
  return (
    <AuthGuard>
      {skipNFTCheck ? (
        children
      ) : (
        <NFTPassGuard
          redirectUrl={redirectUrl}
          customMessage={customMessage}
          allowBypass={allowBypass}
        >
          {children}
        </NFTPassGuard>
      )}
    </AuthGuard>
  );
} 