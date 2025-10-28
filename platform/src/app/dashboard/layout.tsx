'use client';

// components
import DashboardLayout from 'src/layouts/dashboard';
import { SnackbarProvider } from 'src/app/components/snackbar';
import { DashboardNFTGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <SnackbarProvider>
      {/* <DashboardNFTGuard
        redirectUrl="https://wavelyz.io/nft-pass"
        customMessage="Access to the wavelyz dashboard requires a Platform Pass NFT. This exclusive pass grants you access to premium token creation tools, advanced features, and priority support."
        allowBypass={process.env.NODE_ENV === 'development'}
      > */}
        <DashboardLayout>{children}</DashboardLayout>
      {/* </DashboardNFTGuard> */}
    </SnackbarProvider>
  );
}
