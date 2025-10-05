'use client';

// components
import DashboardLayout from 'src/layouts/dashboard';
import { SnackbarProvider } from 'src/app/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <SnackbarProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SnackbarProvider>
  );
}
