import { m as motion } from 'framer-motion';
import { useRef, useState, useCallback, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MenuItem, InputAdornment, Box } from '@mui/material';


import Iconify from 'src/components/iconify';
import { RHFUpload } from 'src/components/hook-form/rhf-upload';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import UploadFileToBlockChain from 'src/utils/uploadToArweave';
import Label from 'src/components/label';

const OPTIONS = [
  { value: 'basic', label: 'Token Program' },
  { value: 'token2022', label: 'Tax Payer (Token 2022)' },
];

const socialLinksConfig = [
  { name: 'websiteLink', label: 'Website', icon: 'solar:global-linear' },
  { name: 'twitter', label: 'Twitter', icon: 'bi:twitter-x' },
  { name: 'discord', label: 'Discord', icon: 'ic:baseline-discord' },
  { name: 'telegram', label: 'Telegram', icon: 'ic:baseline-telegram' },
];

const variants = {
  open: { opacity: 1, height: 'auto' },
  collapsed: { opacity: 0, height: 0 }
};



const transactionPriorities = [
  { label: 'Standard', value: 'standard' },
  { label: 'High', value: 'high' },
  { label: 'Extreme', value: 'extreme' }
];


// ----------------------------------------------------------------------

export default function MarketingContactForm({ setValue, onFileSelect }: { setValue: any, onFileSelect: any }) {

  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [file, setFile] = useState(null);

  const socialLinksRef = useRef<HTMLDivElement | null>(null);

  const toggleSocialLinks = () => {
    setShowSocialLinks(!showSocialLinks);
    if (!showSocialLinks) {
      setTimeout(() => {
        socialLinksRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300); // Wait for the transition to complete before scrolling
    }
  };

  // File Uploads

  const handleDrop = useCallback((acceptedFiles: any[]) => {
    const file = acceptedFiles[0];
    setFile(file); 
    const fileUrl = URL.createObjectURL(file);
    setValue('coverUrl', fileUrl, { shouldValidate: true });
  }, [setValue]);

  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', null);
    setFile(null);
  }, [setValue]);

  useEffect(() => {
    onFileSelect(file);
  }, [file, onFileSelect]);

  return (
    <Stack>
      <Stack spacing={2.5} alignItems="center">
        <Typography variant='h3' color="text.primary">
          Create Your Solana Token
        </Typography>
        <Typography variant='body1' color="text.primary">
          Create your custom token in just a few steps.
        </Typography>
        <Stack
          spacing={{ xs: 2.5, md: 2 }}
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1 }}
        >
          <RHFSelect name="singleSelect" label="Token Program Version">
            {OPTIONS.map((option) => {
              if (option.value === 'token2022') {
                return (
                  <MenuItem key={option.value} value={option.label} disabled>
                    {option.label}
                    <InputAdornment position='end'>
                      <Label color='secondary' startIcon={<Iconify icon="mdi:hourglass" />}>
                        SOON
                      </Label>
                    </InputAdornment>
                  </MenuItem>
                );
              }
              return (
                <MenuItem key={option.value} value={option.label}>
                  {option.label}
                </MenuItem>
              );
            })}
          </RHFSelect>
        </Stack>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1 }}
          spacing={{ xs: 2.5, md: 2 }}
        >
          <RHFTextField name="tokenName" label="Token Name" placeholder='e.g, wavelyz Token' />
          <RHFTextField name="tokenSymbol" label="Token Symbol" placeholder='e.g, PCHT' />
        </Stack>
        <RHFTextField
          name="description"
          label="Description (Optional)"
          multiline
          rows={4}
          helperText={
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Iconify sx={{ alignSelf: 'center' }} icon="bi:info-circle" width={16} height={16} />
              <Typography variant='caption' color="text.secondary">
                A brief overview of what your token is used for. This will help potential buyers understand the value and purpose of your token.
              </Typography>
            </Stack>
          }
        />
        <RHFUpload
          name="coverUrl"
          maxSize={5000 * 1024}
          onDrop={handleDrop}
          onDelete={handleRemoveFile}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 1, ml: 1, }}>
          <Iconify sx={{ alignSelf: 'center' }} icon="bi:info-circle" width={18} height={18} />
          <Typography variant='caption' color="text.secondary">
            Upload your token&apos;s logo. A square image of at least 128x128 pixels is recommended for optimal display across platforms. Supported Formats: &quot;JPG, PNG, GIF&quot;
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ mt: 3, ml: 1, mb: 2, }}>
        <Typography
          variant='body2'
          sx={{ cursor: 'pointer', color: (theme) => theme.palette.info.dark, fontWeight: 'bold', textDecoration: 'underline' }}
          onClick={toggleSocialLinks}
        >
          Add Social Links (Optional)
        </Typography>
      </Stack>




      <Stack spacing={2}
        ref={socialLinksRef}>
        <motion.div
          initial="collapsed"
          animate={showSocialLinks ? "open" : "collapsed"}
          variants={variants}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing={2} sx={{ overflow: 'hidden' }} >
            {socialLinksConfig.map(({ name, label, icon }) => (
              <RHFTextField
                sx={{
                  marginTop: 0.5,
                }}
                key={name}
                name={name}
                label={label}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" >
                      <Iconify icon={icon} width={16} height={16} />
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          </Stack>
        </motion.div>

      </Stack>
    </Stack >
  );
}
