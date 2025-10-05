import { Stack, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import Iconify from 'src/components/iconify';





const fieldLabels = {
  tokenName: { label: 'Token Name', icon: 'mdi:coins' },
  tokenSymbol: { label: 'Token Symbol', icon: 'humbleicons:at-symbol' },
  totalSupply: { label: 'Total Supply', icon: 'mdi:numbers' },
  singleSelect: { label: 'Token Program', icon: 'mdi-chip' },
  immutable: { label: 'Make Token Immutable', icon: 'mdi:car-speed-limiter' },
  freezeAddress: { label: 'Freeze Authority', icon: 'fluent-emoji-high-contrast:ice' },
  mintAuthority: { label: 'Revoke Mint Authority', icon: 'mdi:key' },
};

// ----------------------------------------------------------------------


export default function ReviewConfirm() {


  const { getValues } = useFormContext();
  const formValues = getValues();

  const formatValue = (value: any, key: string) => {
    if (key === 'totalSupply') {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value;
  };

  return (
    <Stack spacing={2.5}>
      <Typography variant='h3' color="text.primary" align='center'>
        Review & Confirm
      </Typography>
      <Typography variant='body1' color="text.primary" align='center'>
        Ensure all details are correct. Changes cannot be made once your token is live.
      </Typography>
      <Stack direction="column"
        spacing={
          2.5
        }
        sx={{
          py: 5,
          mt: 5,
          border: "1px dashed",
          borderColor: 'divider',
          borderRadius: 1,
        }}>
        <Typography sx={{ ml: 5 }} variant='h5' fontWeight="bold" align='left' >
          Token Details
        </Typography>
        {Object.entries(fieldLabels).map(([key, { label, icon }]) => {
          const value = formValues[key];
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
    </Stack>
  );
}
