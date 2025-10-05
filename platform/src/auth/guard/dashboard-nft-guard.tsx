import { useEffect, useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNFTPass } from 'src/hooks/useNFTPass';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import { 
  Alert, 
  Box, 
  Button, 
  Stack, 
  Typography, 
  Card, 
  CardContent,
  Container,
  Grid,
  Chip
} from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type DashboardNFTGuardProps = {
  children: React.ReactNode;
  // Optional: redirect URL for users without NFT Pass
  redirectUrl?: string;
  // Optional: custom message for users without pass
  customMessage?: string;
  // Optional: allow bypass for development
  allowBypass?: boolean;
  // Optional: show a more detailed UI for the guard
  showDetailedUI?: boolean;
};

export default function DashboardNFTGuard({ 
  children, 
  redirectUrl = 'https://wavelyz.io/nft-pass',
  customMessage,
  allowBypass = false,
  showDetailedUI = true
}: DashboardNFTGuardProps) {
  const { connected, publicKey } = useWallet();
  const { hasNFTPass, nftPassInfo, loading, error, refetch } = useNFTPass();
  
  const [checked, setChecked] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const [bypassConfirmed, setBypassConfirmed] = useState(false);

  const check = useCallback(() => {
    console.log('DashboardNFTGuard check() called:', { 
      connected, 
      publicKey: publicKey?.toString(), 
      loading, 
      hasNFTPass, 
      error,
      checked,
      showBypass
    });

    // If wallet is not connected, don't block access (let auth guard handle it)
    if (!connected || !publicKey) {
      console.log('Wallet not connected, setting checked to true');
      setChecked(true);
      setShowBypass(false); // Reset bypass state
      return;
    }

    // If we're still loading the NFT check, don't proceed
    if (loading) {
      console.log('Still loading, waiting...');
      return;
    }

    // If user has NFT pass, allow access
    if (hasNFTPass) {
      console.log('NFT Pass found, allowing access');
      setChecked(true);
      setShowBypass(false); // Reset bypass state
      setBypassConfirmed(false); // Reset bypass confirmation
      return;
    }

    // If there's an error checking NFT pass, show options
    if (error) {
      console.log('Error checking NFT pass, showing bypass options');
      setShowBypass(true);
      return;
    }

    // If user doesn't have NFT pass, show the guard UI
    console.log('No NFT pass found, showing guard UI');
    setShowBypass(true);
  }, [connected, publicKey, loading, hasNFTPass, error, allowBypass]);

  // Reset states when NFT pass status changes
  useEffect(() => {
    if (hasNFTPass && showBypass) {
      console.log('NFT Pass found while showing bypass, resetting states');
      setShowBypass(false);
      setBypassConfirmed(false);
      setChecked(true);
    }
  }, [hasNFTPass, showBypass]);

  useEffect(() => {
    check();
  }, [check]);

  // Debug logging
  useEffect(() => {
    console.log('DashboardNFTGuard state:', { 
      checked, 
      showBypass, 
      bypassConfirmed, 
      hasNFTPass, 
      loading, 
      error 
    });
  }, [checked, showBypass, bypassConfirmed, hasNFTPass, loading, error]);

  // Show loading while checking NFT pass
  if ((connected && publicKey && loading) || (!checked && !showBypass && !bypassConfirmed)) {
    return (
      <LoadingScreen 
        sx={{ 
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Iconify 
            icon="mingcute:certificate-line" 
            width={80} 
            height={80} 
            sx={{ color: 'primary.main', opacity: 0.9 }}
          />
          <Typography variant="h5" color="text.primary" fontWeight="bold">
            Verifying Your wavelyz Platform Pass
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 400 }}>
            Please wait while we verify your NFT Pass on the Solana blockchain
          </Typography>
        </Stack>
      </LoadingScreen>
    );
  }

  // Show bypass/error screen if needed
  if (showBypass && !bypassConfirmed) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: 24,
                  overflow: 'visible',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <Iconify 
                    icon="mingcute:certificate-line" 
                    width={40} 
                    height={40} 
                    sx={{ color: 'white' }}
                  />
                </Box>
                
                <CardContent sx={{ pt: 6, pb: 4, px: 4 }}>
                  <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
                    wavelyz Platform Pass Required
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
                    {customMessage || 
                      'Access to the wavelyz dashboard requires a Platform Pass NFT. This exclusive pass grants you access to premium token creation tools, advanced features, and priority support.'
                    }
                  </Typography>

                  {error && (
                    <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                      <Typography variant="body2">
                        <strong>Verification Error:</strong> {error}
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        This might be due to network issues or wallet connection problems.
                      </Typography>
                    </Alert>
                  )}

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="mingcute:certificate-line" />}
                      href={redirectUrl}
                      sx={{ 
                        py: 1.5, 
                        px: 3,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                        }
                      }}
                    >
                      Get Your wavelyz Platform Pass
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={refetch}
                      startIcon={<Iconify icon="eva:refresh-outline" />}
                      sx={{ py: 1.5, px: 3 }}
                    >
                      Refresh Verification
                    </Button>

                    {allowBypass && (
                      <Button
                        variant="text"
                        color="inherit"
                        onClick={() => setBypassConfirmed(true)}
                        sx={{ mt: 1 }}
                      >
                        Continue without Pass (Development Mode)
                      </Button>
                    )}
                  </Stack>

                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      <strong>Already have a pass?</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Make sure your wallet is connected and contains the wavelyz Platform Pass NFT<br/>
                      • Try refreshing the verification above<br/>
                      • Ensure you're using the same wallet that purchased the pass
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  // If all checks pass or bypass is confirmed, render children
  if (checked || bypassConfirmed) {
    console.log('DashboardNFTGuard: Rendering children, access granted');
    return <>{children}</>;
  }

  return null;
}
