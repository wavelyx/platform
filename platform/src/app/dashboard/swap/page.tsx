'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import SwapView from 'src/sections/swap/swap-view';

// ----------------------------------------------------------------------

export default function SwapPage() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <SwapView />
    </Container>
  );
}
