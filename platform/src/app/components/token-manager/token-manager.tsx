import React from 'react';
import { Stack, Typography, MenuItem, Avatar } from '@mui/material';
import { RHFSelect } from 'src/components/hook-form';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface Option {
  value: string;
  label: string;
  tokenPictureUrl: string;
  alt: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  selectName: string;
  selectLabel: string;
  options: Option[];
  helperText?: string;
}

const TokenManager: React.FC<Props> = ({ title, subtitle, selectName, selectLabel, options, helperText }) => {

  const { connected } = useWallet();

  const { setVisible: setModalVisible } = useWalletModal();





  return (
    <Stack spacing={2.5} alignItems="center">
      <Typography align='center' variant='h3' color="text.primary">
        {title}
      </Typography>
      <Typography align='center' variant='body1' color="text.primary">
        {subtitle}
      </Typography>
      <RHFSelect
        helperText={helperText}
        fullWidth name={selectName}
        label={connected ? selectLabel : 'Connect Wallet to Proceed'}
        disabled={!connected}
        onClick={() => {
          if (!connected) {
            setModalVisible(true);
          }
          else {
            return;
          }
        }
        }
      >
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 30, height: 30 }} src={option.tokenPictureUrl} alt={option.alt} />
              <Typography>{option.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </RHFSelect>
    </Stack>
  )
};

export default TokenManager;
