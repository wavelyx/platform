'use client';

import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/routes/hook';
import { NavSectionVertical } from 'src/components/nav-section';
//
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton } from '../_common';
import { alpha, Avatar, Typography, useTheme } from '@mui/material';
import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useMockedUser();

  const theme = useTheme();

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  const { setVisible: setModalVisible } = useWalletModal();

  const { onDisconnect, publicKey, walletIcon } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });





  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  const walletStatus = (
    <>
      {publicKey ? (
        <Stack direction="row"
          spacing={1.5}
          sx={{
            bgcolor: alpha(theme.palette.text.disabled, 0.08),
            px: 4,
            py: 3,
            mx: 2,
            mt: 1,
            borderRadius: 2,
          }}>
          <Avatar src={walletIcon} sx={{

            width: 40,
            height: 40,
          }} />
          <Stack direction="column">
            <Typography variant='subtitle2'>
              {publicKey?.toBase58().slice(0, 4) + '..' + publicKey?.toBase58().slice(-4)}
            </Typography>
            <Typography onClick={onDisconnect} variant='body2' sx={{ textDecoration: 'underline', color: 'text.disabled', cursor: 'pointer' }} >
              Disconnect Wallet
            </Typography>
          </Stack>
        </Stack>

      ) : (

        <Stack
          spacing={1.5}
          direction="row"
          sx={{
            bgcolor: alpha(theme.palette.text.disabled, 0.08),
            px: 4,
            py: 3,
            mx: 2,
            mt: 1,
            borderRadius: 2,
          }} >

          <Avatar sx={{
            width: 40,
            height: 40,
          }} />
          <Stack direction="column">
            <Typography variant='subtitle2'>
              anon
            </Typography>
            <Typography onClick={() => setModalVisible(true)} variant='body2' sx={{ textDecoration: 'underline', color: 'text.disabled', cursor: 'pointer' }} >
              Connect Wallet
            </Typography>
          </Stack>



        </Stack>

      )}

    </>
  )


  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 1, mb: 1, mt: 3 }}>
        <Logo sx={{ ml: 0 }} />
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 600,
            color: 'inherit',
            display: { xs: 'none', sm: 'block' },
            ml: 0,
          }}
        >
          wavelyz
        </Typography>
      </Stack>

      {walletStatus}

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.role || 'admin',
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
