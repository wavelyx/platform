'use client';

import { m } from 'framer-motion';
// @mui
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fToNow } from 'src/utils/format-time';
// _mock
import { _contacts } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Button, ButtonGroup, Divider, Select, Stack, TextField } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEffect, useState } from 'react';
import { useResponsive } from 'src/hooks/use-responsive';
import { PriorityLevel } from 'src/lib/transactionPriority';


const transactionPriorities = [
  { label: 'Fast', value: 'standard' },
  { label: 'Turbo', value: 'high' },
  { label: 'Ultra', value: 'extreme' }
];

interface Priority {
  label: string;
  value: string;
}

// ----------------------------------------------------------------------

export default function ContactsPopover() {
  const popover = usePopover();

  const smDown = useResponsive('down', 'sm')

  const [selectedPriority, setSelectedPriority] = useState<string | null>('high');

  const handlePrioritySelection = (value: string) => {
    setSelectedPriority(value);
    const feeValues: { [key: string]: string } = { 'standard': '50000', 'high': '100000', 'extreme': '150000' };
    localStorage.setItem('priorityFee', feeValues[value]);
  };

  // useEffect to update the selected priority from localStorage and replacing the number with the string value
  useEffect(() => {
    const priorityFee = localStorage.getItem('priorityFee');
    const feeValues: { [key: string]: string } = { '50000': 'standard', '100000': 'high', '150000': 'extreme' };
    setSelectedPriority(feeValues[priorityFee as string]);
  }, []);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={popover.open ? 'inherit' : 'default'}
        onClick={popover.onOpen}
        sx={{ bgcolor: (theme) => popover.open ? theme.palette.action.selected : undefined }}
      >
        <Iconify icon="mingcute:flash-fill" width={24} />
      </IconButton>

      <CustomPopover  arrow={smDown ? "top-center" : undefined} open={popover.open} onClose={popover.onClose} sx={{ width: 380 }}>
        <Typography variant="h6" sx={{ p: 1.5 }}>
          Global Priority Fee
        </Typography>
        <Stack direction="row">
          <Typography variant="caption" sx={{ px: 1.5, pb: 1, color: 'text.secondary' }}>
          These fees apply across wavelyz's entire product suite, such as Token Creator, Token Manager, and others.
          </Typography>
        </Stack>


        <Scrollbar sx={{ height: 190, }}>
          <Typography variant="subtitle1" sx={{ px: 1.5 }}>
            Priority Level
          </Typography>
          <Stack sx={{ px: 1 }} direction="row" spacing={0.5}>
            {transactionPriorities.map((option: any) => (
              <ButtonGroup sx={{ mt: 2 }} size='large' fullWidth variant='soft' color='inherit' key={option.value}>
                <Button
                  onClick={() => handlePrioritySelection(option.value)}
                  color={selectedPriority === option.value ? 'primary' : 'inherit'}
                >
                  {option.label}
                </Button>
              </ButtonGroup>
            ))}
          </Stack>
          <Divider sx={{ my: 1.5, mx: 1.75 }} />
          <Stack direction="row" sx={{ m: 1 }}>
            <Button onClick={popover.onClose} fullWidth size='large' variant='outlined' color='secondary'>
              Save Changes
            </Button>
          </Stack>
        </Scrollbar>
      </CustomPopover>
    </>
  );
}