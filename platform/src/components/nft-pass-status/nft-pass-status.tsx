import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNFTPass } from 'src/hooks/useNFTPass';
// components
import { 
  Box, 
  Chip, 
  Tooltip, 
  Typography, 
  IconButton,
  Popover,
  Card,
  CardContent,
  Stack,
  Button
} from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type NFTPassStatusProps = {
  showDetails?: boolean;
  variant?: 'chip' | 'icon' | 'full';
};

export default function NFTPassStatus({ 
  showDetails = true, 
  variant = 'chip' 
}: NFTPassStatusProps) {
  const { connected, publicKey } = useWallet();
  const { hasNFTPass, nftPassInfo, loading } = useNFTPass();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (!connected || !publicKey) {
    return null;
  }

  if (loading) {
    return (
      <Chip
        icon={<Iconify icon="eva:loading-fill" />}
        label="Checking Pass..."
        size="small"
        variant="outlined"
        color="default"
      />
    );
  }

  if (hasNFTPass) {
    if (variant === 'icon') {
      return (
        <Tooltip title="wavelyz Platform Pass Active">
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{ 
              color: 'success.main',
              '&:hover': { bgcolor: 'success.lighter' }
            }}
          >
            <Iconify icon="mingcute:certificate-fill" />
          </IconButton>
        </Tooltip>
      );
    }

    if (variant === 'chip') {
      return (
        <Tooltip title="Click to view pass details">
          <Chip
            icon={<Iconify icon="mingcute:certificate-fill" />}
            label="Platform Pass Active"
            size="small"
            variant="filled"
            color="success"
            onClick={handleClick}
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      );
    }

    // Full variant
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<Iconify icon="mingcute:certificate-fill" />}
          label="Platform Pass Active"
          size="small"
          variant="filled"
          color="success"
        />
        {showDetails && (
          <Typography variant="caption" color="text.secondary">
            Premium Access
          </Typography>
        )}
      </Box>
    );
  }

  // No pass
  if (variant === 'icon') {
    return (
      <Tooltip title="No Platform Pass - Get one to access premium features">
        <IconButton
          size="small"
          href="https://wavelyz.io/nft-pass"
          sx={{ 
            color: 'warning.main',
            '&:hover': { bgcolor: 'warning.lighter' }
          }}
        >
          <Iconify icon="mingcute:certificate-line" />
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'chip') {
    return (
      <Chip
        icon={<Iconify icon="mingcute:certificate-line" />}
        label="No Platform Pass"
        size="small"
        variant="outlined"
        color="warning"
        component="a"
        href="https://wavelyz.io/nft-pass"
        sx={{ cursor: 'pointer' }}
      />
    );
  }

  // Full variant
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={<Iconify icon="mingcute:certificate-line" />}
        label="No Platform Pass"
        size="small"
        variant="outlined"
        color="warning"
      />
      {showDetails && (
        <Button
          size="small"
          variant="text"
          href="https://wavelyz.io/nft-pass"
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          Get Pass
        </Button>
      )}
    </Box>
  );
}

// Pass Details Popover Component
export function NFTPassDetails({ 
  open, 
  anchorEl, 
  onClose 
}: { 
  open: boolean; 
  anchorEl: HTMLElement | null; 
  onClose: () => void; 
}) {
  const { nftPassInfo } = useNFTPass();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 320, borderRadius: 2 }
      }}
    >
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify 
                icon="mingcute:certificate-fill" 
                width={24} 
                height={24} 
                sx={{ color: 'success.main' }}
              />
              <Typography variant="h6" fontWeight="bold">
                wavelyz Platform Pass
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Your NFT pass grants you access to premium features and tools on the wavelyz platform.
            </Typography>

            {nftPassInfo?.nftMint && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>NFT Mint:</strong>
                </Typography>
                <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                  {nftPassInfo.nftMint.slice(0, 8)}...{nftPassInfo.nftMint.slice(-8)}
                </Typography>
              </Box>
            )}

            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                <strong>Benefits:</strong>
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="caption" color="text.secondary">
                  Premium token creation tools
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  Advanced features & analytics
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  Priority support
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  Early access to new features
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              size="small"
              href="https://wavelyz.io/nft-pass"
              startIcon={<Iconify icon="mingcute:certificate-line" />}
              fullWidth
            >
              View Pass Details
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Popover>
  );
}
