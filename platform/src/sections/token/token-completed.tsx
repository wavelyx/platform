'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Grid, Button } from '@mui/material';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { varBounce, MotionContainer } from 'src/components/animate';
import { useTokenIdOrder } from 'src/actions/getTokensByWallet';
import { LoadingScreen } from 'src/components/loading-screen';
import { useRouter } from 'next/navigation';
import { paths } from 'src/routes/paths';
import NotFound from 'src/app/not-found';

// ----------------------------------------------------------------------

const fieldLabels = {
  tokenName: { label: 'Token Name', icon: 'mdi:coins' },
  tokenSymbol: { label: 'Token Symbol', icon: 'humbleicons:at-symbol' },
  tokenSupply: { label: 'Total Supply', icon: 'mdi:numbers' },
  decimals: { label: 'Decimals', icon: 'mdi:decimal' },
  programName: { label: 'Token Program', icon: 'mdi-chip' },
  mutable: { label: 'Make Token Immutable', icon: 'mdi:car-speed-limiter' },
  revokeFreeze: { label: 'Freeze Authority', icon: 'fluent-emoji-high-contrast:ice' },
  mintAuthority: { label: 'Revoke Mint Authority', icon: 'mdi:key' },
};


// ----------------------------------------------------------------------


export default function TokenCompletedView({ id }: { id: string }) {
  const router = useRouter();
  
  const { token, isLoading, isError } = useTokenIdOrder(id);

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (isError) {
    return <NotFound />;
  }


  const formatValue = (value: any, key: string) => {
    if (key === 'tokenSupply') {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value;
  };


  return (
    <Grid container justifyContent="center" component={MotionContainer}
      sx={{
        textAlign: 'center',
        pt: { xs: 5, md: 10 },
        pb: { xs: 10, md: 20 },
      }}>
      <Grid item xs={11} md={5}>
        <m.div variants={varBounce().in}>
          <Box sx={{ fontSize: 128 }}>🎉</Box>
        </m.div>
        <Stack spacing={2.5}>
          <Typography variant='h3' color="text.primary" align='center'>
            Congratulations, Your Token Is Live!
          </Typography>
          <Typography variant='body1' color="text.primary" align='center'>
            Your token is now part of the Solana ecosystem.
          </Typography>
          <Stack direction="column" spacing={2.5} sx={{ py: 5, mt: 5, border: "1px dashed", borderColor: 'divider', borderRadius: 1 }}>
            <Typography sx={{ ml: 5 }} variant='h5' fontWeight="bold" align='left'>
              Token Details
            </Typography>

            {Object.entries(fieldLabels).map(([key, { label, icon }]) => {
              const value = token[key];
              const formattedValue = formatValue(value, key);

              return formattedValue != null ? (
                <Stack key={key} direction="row" sx={{ mx: 5 }} justifyContent="space-between">
                  <Typography variant='body2' color="text.secondary">
                    <Iconify sx={{ mr: 1, mb: -0.45 }} icon={icon} color="success" width={18} height={18} />
                    {label}:
                  </Typography>
                  <Typography variant='subtitle2' color="text.primary">{String(formattedValue)}</Typography>
                </Stack>
              ) : null;
            })}

          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<Iconify icon="mdi:plus" />}
              color='primary'
              variant='contained'
              size='large'
              fullWidth
              onClick={() => router.push(paths.dashboard.openBook.create)}
            >
              Create Market
            </Button>
            <Button startIcon={<Iconify icon="eva:external-link-fill" />} variant='contained' size='large' onClick={() => window.open(`https://solscan.io/token/${token.tokenAddress}`, '_blank')} fullWidth>
              See on browser
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
