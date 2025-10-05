# wavelyz NFT Pass Guard System

This document explains how to use the NFT Pass Guard system to protect routes and features that require a wavelyz Platform Pass NFT.

## Overview

The NFT Pass Guard system checks if a connected wallet owns a wavelyz Platform Pass NFT and either grants access or shows a purchase prompt. This system is designed to protect premium features and ensure only NFT pass holders can access certain parts of the application.

## Components

### 1. NFT Pass Verification Utility (`src/utils/nftPassVerification.ts`)

Core utility functions for checking NFT pass ownership:

- `checkNFTPass()` - Detailed check with metadata parsing
- `checkNFTPassSimple()` - Simple check for any NFT
- `checkNFTPassByCollection()` - Collection-specific check (most reliable)

### 2. NFT Pass Hook (`src/hooks/useNFTPass.ts`)

React hook that provides NFT pass status:

```typescript
const { hasNFTPass, nftPassInfo, loading, error, refetch } = useNFTPass();
```

### 3. NFT Pass Guard (`src/auth/guard/nft-pass-guard.tsx`)

Component guard for individual routes or features:

```typescript
import { NFTPassGuard } from 'src/auth/guard';

<NFTPassGuard
  redirectUrl="https://wavelyz.io/nft-pass"
  customMessage="Custom message for users without pass"
  allowBypass={false}
>
  <ProtectedComponent />
</NFTPassGuard>
```

### 4. Dashboard NFT Guard (`src/auth/guard/dashboard-nft-guard.tsx`)

Comprehensive guard for the entire dashboard area:

```typescript
import { DashboardNFTGuard } from 'src/auth/guard';

<DashboardNFTGuard
  redirectUrl="https://wavelyz.io/nft-pass"
  customMessage="Dashboard access requires NFT pass"
  allowBypass={process.env.NODE_ENV === 'development'}
>
  <DashboardLayout>{children}</DashboardLayout>
</DashboardNFTGuard>
```

### 5. NFT Pass Status Component (`src/components/nft-pass-status/nft-pass-status.tsx`)

UI component showing pass status:

```typescript
import { NFTPassStatus } from 'src/components/nft-pass-status';

// Different variants
<NFTPassStatus variant="chip" />      // Chip with label
<NFTPassStatus variant="icon" />      // Icon only
<NFTPassStatus variant="full" />      // Full display with details
```

## Usage Examples

### Protecting Individual Routes

```typescript
// In a page component
import { NFTPassGuard } from 'src/auth/guard';

export default function PremiumFeaturePage() {
  return (
    <NFTPassGuard>
      <div>
        <h1>Premium Feature</h1>
        <p>This content is only visible to NFT pass holders.</p>
      </div>
    </NFTPassGuard>
  );
}
```

### Protecting Dashboard Routes

The dashboard is already protected by the `DashboardNFTGuard` in `src/app/dashboard/layout.tsx`. This means all dashboard routes automatically require an NFT pass.

### Custom Messages and Redirects

```typescript
<NFTPassGuard
  redirectUrl="https://wavelyz.io/nft-pass"
  customMessage="Access to this premium feature requires a wavelyz Platform Pass NFT. Get exclusive access to advanced tools and priority support."
  allowBypass={process.env.NODE_ENV === 'development'}
>
  <PremiumFeature />
</NFTPassGuard>
```

### Development Bypass

During development, you can enable bypass mode:

```typescript
<NFTPassGuard allowBypass={true}>
  <ProtectedComponent />
</NFTPassGuard>
```

## NFT Pass Requirements

The system looks for NFTs with the following characteristics:

- **Name**: Contains "Sol Studio Platform Pass", "wavelyz Platform Pass", or "wavelyz Pass"
- **Symbol**: Contains "wavelyz Pass" or "wavelyz"
- **Collection**: "Sol Studio Platform Passes" or "Sol Studio Tools"
- **Supply**: 1 (NFT characteristics)
- **Decimals**: 0

## Configuration

### Environment Variables

```bash
# NFT Pass metadata URI (from your minting process)
NEXT_PUBLIC_NFT_METADATA_URI=https://arweave.net/your-metadata-uri

# NFT Pass price in USDC
NEXT_PUBLIC_NFT_PRICE=10

# RPC endpoint for Solana
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your-api-key

# Shop private key for minting
SHOP_PRIVATE_KEY=your-base58-encoded-private-key
```

### Shop Wallet Address

Update the `SHOP_WALLET` constant in `src/utils/nftPassVerification.ts` to match your actual shop wallet address.

## Integration Points

### 1. Dashboard Layout

The NFT pass guard is integrated into the dashboard layout at `src/app/dashboard/layout.tsx`, protecting all dashboard routes.

### 2. Header Status

The NFT pass status is displayed in the dashboard header, showing users their current pass status.

### 3. Individual Feature Protection

Use the `NFTPassGuard` component to protect specific features or routes that require the NFT pass.

## Error Handling

The system includes comprehensive error handling:

- Network connection issues
- Wallet connection problems
- Metadata parsing failures
- Fallback verification methods

## Styling and Theming

The guard components use the application's theme system and can be customized through:

- Custom messages
- Redirect URLs
- Development bypass options
- Theme-aware styling

## Testing

### Development Mode

Enable development bypass to test without an NFT pass:

```typescript
<DashboardNFTGuard allowBypass={process.env.NODE_ENV === 'development'}>
  {/* Dashboard content */}
</DashboardNFTGuard>
```

### Production Testing

1. Purchase an NFT pass through the minting process
2. Connect the wallet containing the pass
3. Verify access is granted
4. Test with wallets without passes to ensure blocking works

## Troubleshooting

### Common Issues

1. **Pass not detected**: Ensure the NFT metadata matches the expected format
2. **Verification errors**: Check RPC endpoint connectivity
3. **Loading stuck**: Verify wallet connection and network status

### Debug Mode

Enable console logging by checking the browser console for detailed verification steps.

## Security Considerations

- NFT pass verification happens on-chain
- Multiple verification methods provide redundancy
- Development bypass should be disabled in production
- Private keys should never be exposed in client-side code

## Future Enhancements

- Batch verification for multiple passes
- Pass expiration and renewal
- Tiered access levels
- Analytics and usage tracking 