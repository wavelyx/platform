'use client';

import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFCheckbox } from 'src/components/hook-form';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// ----------------------------------------------------------------------

type FormValuesProps = {
  terms?: boolean | undefined;
};

export default function ModernLoginView() {
  const { setVisible: setModalVisible } = useWalletModal();

  const LoginSchema = Yup.object().shape({
    terms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions.'),
  });

  const defaultValues = {
    terms: false,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const termsAccepted = watch('terms');

  const onSubmit = useCallback(async (data: FormValuesProps) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Typography variant="h4">Terms of Use</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFCheckbox name="terms"
        label={
          <Typography variant='body2' component="span">
            By clicking "Continue", I confirm that I have read and accept the wavelyz Platform <Link>Terms of Use</Link> and <Link>Privacy Policy.</Link>
          </Typography>
        }
      />
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        onClick={() => { setModalVisible(true); }}
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        sx={{ justifyContent: 'space-between', pl: 2, pr: 1.5 }}
        disabled={!termsAccepted}  // Button is disabled unless terms are accepted
      >
        Continue
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}