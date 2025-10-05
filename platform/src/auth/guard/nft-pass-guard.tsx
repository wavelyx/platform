import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'src/routes/hook';
import { useNFTPass } from 'src/hooks/useNFTPass';
import { useWallet } from '@solana/wallet-adapter-react';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import { Alert, Box, Button, Stack, Typography, Card, CardContent } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type NFTPassGuardProps = {
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

export default function NFTPassGuard({ 
  children, 
  redirectUrl = 'https://wavelyz.io/nft-pass',
  customMessage,
  allowBypass = false,
  showDetailedUI = true
}: NFTPassGuardProps) {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { hasNFTPass, loading, error, refetch } = useNFTPass();
  
  const [checked, setChecked] = useState(false);
  const [showBypass, setShowBypass] = useState(false);

  const check = useCallback(() => {
    // If wallet is not connected, don't block access (let auth guard handle it)
    if (!connected || !publicKey) {
      setChecked(true);
      return;
    }

    // If we're still loading the NFT check, don't proceed
    if (loading) {
      return;
    }

    // If user has NFT pass, allow access
    if (hasNFTPass) {
      setChecked(true);
      return;
    }

    // If there's an error checking NFT pass, show options
    if (error) {
      setShowBypass(true);
      return;
    }

    // If user doesn't have NFT pass, redirect to purchase page
    if (!allowBypass) {
      window.location.href = redirectUrl;
    } else {
      setShowBypass(true);
    }
  }, [connected, publicKey, loading, hasNFTPass, error, allowBypass, redirectUrl]);

  useEffect(() => {
    check();
  }, [check]);

  // Show loading while checking NFT pass
  if ((connected && publicKey && loading) || (!checked && !showBypass)) {
    return (
      <LoadingScreen 
        sx={{ 
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Iconify 
            icon="mingcute:certificate-line" 
            width={80} 
            height={80} 
            sx={{ color: 'white', opacity: 0.9 }}
          />
          <Typography variant="h5" color="white" fontWeight="bold">
            Verifying Your wavelyz Platform Pass
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', opacity: 0.8, textAlign: 'center', maxWidth: 400 }}>
            Please wait while we verify your NFT Pass on the Solana blockchain
          </Typography>
        </Stack>
      </LoadingScreen>
    );
  }

  // Show bypass/error screen if needed
  if (showBypass) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 520,
            width: '100%',
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
              boxShadow: '0 8px 32px rgba(79, 70, 229, 0.3)',
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
                'This feature requires a wavelyz Platform Pass NFT. Get exclusive access to premium tools, priority support, and advanced features on the Solana blockchain.'
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
                  onClick={() => setChecked(true)}
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
      </Box>
    );
  }

  // If all checks pass, render children
  if (!checked) {
    return null;
  }

  return <>{children}</>;
} 