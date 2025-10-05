// Example: How to protect your advanced token features with NFT Pass

import { PremiumGuard } from 'src/auth/guard';
// import YourExistingView from 'src/sections/your-view-component';

export default function AdvancedTokenPage() {
  return (
    <PremiumGuard
      customMessage="🚀 Advanced token management features require a wavelyz Platform Pass. Unlock priority processing, exclusive tools, and premium support."
      // Allow bypass in development
      allowBypass={process.env.NODE_ENV === 'development'}
      // Custom redirect URL (optional)
      redirectUrl="https://wavelyz.io/nft-pass"
    >
      <div>
        {/* Replace this with your existing component */}
        <h1>Protected Advanced Features</h1>
        <p>This content is only visible to NFT Pass holders!</p>
        <a href="https://wavelyz.io/nft-pass" target="_blank" rel="noopener noreferrer">
          Get wavelyz Platform Pass
        </a>
      </div>
    </PremiumGuard>
  );
}

/*
IMPLEMENTATION EXAMPLES:

1. Wrap entire pages:
   - Replace your existing page.tsx with this pattern
   - Users without NFT Pass will be redirected to purchase page

2. Protect specific features:
   Instead of protecting the whole page, you can protect individual features:

   function TokenManagement() {
     const { hasNFTPass } = useNFTPass();
     
     return (
       <div>
         <BasicTokenTools />
         
         {hasNFTPass ? (
           <AdvancedTokenTools />
         ) : (
           <UpgradePrompt 
             title="Unlock Advanced Features"
             description="Get priority processing and exclusive tools"
             href="https://wavelyz.io/nft-pass"
           />
         )}
       </div>
     );
   }

3. Routes to protect with NFT Pass:
   - /dashboard/token/advanced/* (all advanced features)
   - /dashboard/token/create-token (priority processing)
   - /dashboard/multisender (bulk operations)
   - /dashboard/openbook (market creation)
   - Any beta/experimental features

4. Implementation steps:
   a) Import the guard: import { PremiumGuard } from 'src/auth/guard';
   b) Wrap your component: <PremiumGuard><YourComponent /></PremiumGuard>
   c) Add custom messaging for each feature
   d) Test with and without NFT Pass

5. Navigation integration:
   Update your navigation to show premium badges/locks for protected features
*/ 