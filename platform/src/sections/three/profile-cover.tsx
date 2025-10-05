// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { useTheme, alpha } from '@mui/material/styles';
// types
import { ITokenProfileCover } from 'src/types/user';
// theme
import { bgGradient } from 'src/theme/css';
import { Link, Typography } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export default function ProfileCover({ tokenName, tokenPictureUrl, tokenAddress, tokenSymbol, coverUrl }: ITokenProfileCover) {
  const theme = useTheme();
  const smDown = useResponsive('down', 'sm')
  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.primary.main, 0.8),
          imgUrl: coverUrl,
        }),
        height: 1,
        color: 'common.white',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          left: { md: 24 },
          bottom: { md: 24 },
          zIndex: { md: 10 },
          pt: { xs: 6, md: 0 },
          position: { md: 'absolute' },
        }}
      >
        <Avatar
          src={tokenPictureUrl}
          alt={tokenName}
          sx={{
            mx: 'auto',
            width: { xs: 64, md: 128 },
            height: { xs: 64, md: 128 },
            border: `solid 2px ${theme.palette.common.white}`,
            mb: { md: 4, }
          }}
        />

        <Stack sx={{ mt: { md: 3 } }} direction="column">
          <Typography
            variant='h3'
            sx={{
              ml: { md: 2.5 },
              textAlign: { xs: 'center', md: 'unset' },
            }}
          >
            {tokenName}
          </Typography>
          <ListItemText
            sx={{
              ml: { md: 3 },
              textAlign: { xs: 'center', md: 'unset' },
            }}
            primary={tokenSymbol}
            secondary={<Link color="text.secondary" rel="noopener noreferrer" target="_blank" href={`https://solscan.io/token/${tokenAddress}`}>
              {smDown ? tokenAddress.slice(0, 4) + '...' + tokenAddress.slice(-4) : tokenAddress}
            </Link>}
            primaryTypographyProps={{
              typography: 'body2',
            }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'body2',
              color: 'text.secondary',
            }}
          />

        </Stack>

      </Stack>
    </Box>
  );
}
