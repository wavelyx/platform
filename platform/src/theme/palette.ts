import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

// SETUP COLORS

const GREY = {
  0: '#FFFFFF',
  100: '#F7F7F7',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

// Wavelyz color palettes - matching landing page
const PRIMARY = {
  lighter: '#7DD3FC', // Light cyan
  light: '#38BDF8', // Cyan
  main: '#0EA5E9', // Blue-500
  dark: '#0284C7', // Blue-600
  darker: '#0369A1', // Blue-700
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#C084FC', // Light purple
  light: '#A855F7', // Purple
  main: '#8B5CF6', // Purple-500
  dark: '#7C3AED', // Purple-600
  darker: '#6D28D9', // Purple-700
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#67E8F9', // Light cyan
  light: '#22D3EE', // Cyan
  main: '#06B6D4', // Cyan-500
  dark: '#0891B2', // Cyan-600
  darker: '#0E7490', // Cyan-700
  contrastText: '#FFFFFF',
};
const SUCCESS = {
  lighter: '#76D7A4',
  light: '#5BC98C',
  main: '#42C77A',
  dark: '#379E68',
  darker: '#2E8555',
  contrastText: '#ffffff',
};

const WARNING = {
  lighter: '#FFE066',
  light: '#FFD700',
  main: '#FFCC00',
  dark: '#E6B800',
  darker: '#CCA300',
  contrastText: '#333333',
};

const ERROR = {
  lighter: '#FF9B9B',
  light: '#FF7C7C',
  main: '#FF5C5C',
  dark: '#E63232',
  darker: '#CC2929',
  contrastText: '#FFFFFF',
};

// Common colors
const COMMON = {
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  // Retaining other color definitions
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.2),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export function palette(mode: 'light' | 'dark') {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: '#212B36', // Main text color
      secondary: '#637381',
      disabled: '#919EAB',
    },
    background: {
      paper: '#FFFFFF',
      default: '#F7F7F7', // Background color
      neutral: '#F4F6F8',
    },
    action: {
      ...COMMON.action,
      active: GREY[600],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      disabled: GREY[600],
    },
    background: {
      paper: "#212B36",
      default: '#161C24', // Dark mode background, adjust as needed
      neutral: alpha(GREY[500], 0.12),
    },
    action: {
      ...COMMON.action,
      active: GREY[500],
    },
  };
  
  return mode === 'light' ? light : dark;
}
