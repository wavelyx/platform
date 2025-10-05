import { forwardRef } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from '../settings';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}


const LogoIcon = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const theme = useTheme();

    const PRIMARY_LIGHT = theme.palette.primary.light;
    const { themeMode } = useSettingsContext(); // Assuming useSettingsContext() provides the current theme mode

    const PRIMARY_MAIN = theme.palette.primary.main;

    const PRIMARY_DARK = theme.palette.primary.dark;
    const logoSrc = themeMode === 'light'
      ? '/favicons/android-chrome-512x512.png' // Use dark logo in light mode
      : '/favicons/android-chrome-512x512.png'; // Use light logo in dark mode

    // OR using local (public folder)
    // -------------------------------------------------------
    const logo = (
      <Box
        component="img"
        src="/assets/icons/parachute/icon.svg"
        sx={{ width: 35, height: 35, cursor: 'pointer', ...sx }}
      />
    );
    

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default LogoIcon;
