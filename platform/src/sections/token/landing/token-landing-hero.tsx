

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { Stack, Button, Typography } from '@mui/material';

import { bgGradient } from 'src/theme/css';
import Image from 'src/app/components/image/image';



// ----------------------------------------------------------------------

export default function TokenLandingHero() {


  return (
    <Box sx={{ minHeight: { md: '100vh' }, position: 'relative' }} >
      {CarouselItem()}
    </Box>
  );
}


function CarouselItem() {
  const theme = useTheme();

  const router = useRouter()

  const renderOverlay = (
    <Box
      sx={{
        ...bgGradient({
          startColor: `${alpha(theme.palette.common.black, 0)} 0%`,
          endColor: `${theme.palette.common.black} 99%`,
        }),
        backgroundColor: alpha(theme.palette.common.black, 0.07),
        top: 0,
        left: 0,
        zIndex: 8,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    />
  );

  return (
    <Box
      sx={{
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        position: 'relative',
        color: 'common.white',
        justifyContent: 'center',
      }}
    >
      <Stack
        alignItems="center"
        spacing={5}
        sx={{
          zIndex: 9,
          py: { xs: 20, md: 0 },
          position: { md: 'absolute' },
        }}
      >
        <Typography variant="h1" sx={{ maxWidth: 1 }} >
          Easily Launch Your Token on Solana
        </Typography>

        <Typography variant="body1" color={[alpha(theme.palette.common.white, 0.48)]}>
          Create, customize, and deploy your Solana token in minutes. No coding required.
        </Typography>

        <Stack
          alignItems="center"
          spacing={{ xs: 2.5, md: 5 }}
          direction={{ xs: 'column', md: 'row' }}
          sx={{ my: 5 }}
        >

          <Button onClick={() => router.push('/create-token')} variant="contained" size="large" color="primary">
            Create Your Token
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          width: 1,
          height: 1,
          position: {
            xs: 'absolute',
            md: 'relative',
          },
        }}
      >
        {renderOverlay}

        <Image
          alt="hero"
          src="/assets/images/token/asdf.svg"
          sx={{
            width: 1,
            height: { xs: "100vh", md: '100vh' },
          }}
        />
      </Box>
    </Box>
  );
}



