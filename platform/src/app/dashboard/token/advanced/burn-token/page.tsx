// sections
'use client';

import { PremiumGuard } from "src/auth/guard";
import BurnTokenForm from "src/sections/token/burn-token";


// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'wavelyz | Burn Token',
//   description:'Burn your token with wavelyz\'s Burn Token tool.'
// };

export default function Page() {
  return(
    <PremiumGuard
      customMessage="Advanced features require wavelyz Platform Pass"
      // allowBypass={process.env.NODE_ENV === 'development'}
    > 
      <BurnTokenForm tokenName="" />
    </PremiumGuard>
  );
}


