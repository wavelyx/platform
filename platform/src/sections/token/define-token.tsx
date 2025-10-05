import { useRef, useState } from 'react';
import { m as motion } from 'framer-motion';

import { Chip } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { _tags } from 'src/_mock';
import Iconify from 'src/components/iconify';
import { RHFCheckbox, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';




// ----------------------------------------------------------------------

interface DefineTokenFormProps {
  showCreatorInfoFields?: boolean;
}
const variants = {
  open: { opacity: 1, height: 'auto' },
  collapsed: { opacity: 0, height: 0 }
};


export default function DefineTokenForm({ showCreatorInfoFields }: DefineTokenFormProps) {

  const [showSocialLinks, setShowSocialLinks] = useState(false);

  const socialLinksRef = useRef<HTMLDivElement | null>(null);


  const toggleSocialLinks = () => {
    setShowSocialLinks(!showSocialLinks);
    if (!showSocialLinks) {
      setTimeout(() => {
        socialLinksRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300); // Wait for the transition to complete before scrolling
    }
  };

  return (
    <>
      <Stack spacing={2.5} alignItems="center">
        <Typography variant='h3' color="text.primary">
          Define Token Specifications
        </Typography>
        <Typography variant='body1' color="text.primary" align='center'>
          Set the foundational parameters like Total Supply, Decimals, and Mint/Burn capabilities to tailor your token&apos;s functionality.
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1 }}
          spacing={{ xs: 2.5, md: 2 }}
        >
          <RHFTextField inputProps={{ min: 0 }} type='number' name="totalSupply" label="Total Supply" 
       
          />
          <RHFTextField inputProps={{ min: 0, max: 9 }} type='number' name="decimals" label="Decimals"


          />
        </Stack>
        <Stack direction="column" alignSelf="flex-start" sx={{ ml: 0.75 }} spacing={0.75}>
          <RHFCheckbox name="immutable"
            label={
              <Typography variant='body2' component="span">
                Make Token Immutable
                <Typography variant='body2' component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                  (Cost: +0.025 SOL)
                </Typography>
              </Typography>

            }

          />
          <RHFCheckbox name="freezeAddress" label={
            <Typography variant='body2' component="span">
               Revoke Freeze Authority
              <Typography variant='body2' component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              (Cost: +0.025 SOL)
              </Typography>
            </Typography>

          } />
          <RHFCheckbox name="mintAuthority" label={
            <Typography variant='body2' component="span">
              Revoke Mint Authority
              <Typography variant='body2' component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              (Cost: +0.025 SOL)
              </Typography>
            </Typography>

          } />
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ mt: 3, ml: 1, mb: 2, }}>
        <Typography
          variant='body2'
          sx={{ cursor: 'pointer', color: (theme) => theme.palette.info.dark, fontWeight: 'bold', textDecoration: 'underline' }}
          onClick={toggleSocialLinks}

        >
          Additional Token Information
        </Typography>
      </Stack>


      <Stack
        spacing={2}
        sx={{ ml: 1 }}
        ref={socialLinksRef}
      >
        <motion.div
          initial="collapsed"
          animate={showSocialLinks ? "open" : "collapsed"}
          variants={variants}
          transition={{ duration: 0.5 }}
        >
          <RHFCheckbox
            sx={{ my: 1, }}
            name="creatorInfo"
            label={
              <Stack direction="row" spacing={1}>
                <Typography variant='body2' color="text.primary" component="span">
                  Include Custom Creator Information
                </Typography>
                <Typography variant='body2' color="text.secondary" component="span">
                  (Cost: +0.025 SOL)
                </Typography>
              </Stack>
            } />
          <motion.div
            initial="collapsed"
            animate={showCreatorInfoFields ? "open" : "collapsed"}
            variants={variants}
            transition={{ duration: 0.5 }}
          >

            <Stack spacing={1}>
              <RHFTextField name="creatorName" label="Creator Name"
 />
              <RHFTextField name="creatorContact" label="Creator Website URL"
/>
            </Stack>

          </motion.div>

          <RHFAutocomplete
            sx={{ mt: 1.5 }}
            helperText={
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Iconify alignSelf='center' icon="bi:info-circle" width={16} height={16} color="text.secondary" />
                <Typography variant='caption' color="text.secondary">
                  Add up to 5 tags to help categorize your token, e.g., Meme, Airdrop, FanToken.
                </Typography>
              </Stack>
            }
            name="tags"
            placeholder="+ Tags"
            multiple
            freeSolo
            options={_tags.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />



        </motion.div>
      </Stack>
    </>
  );
}
