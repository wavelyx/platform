// @mui
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { TokenItem } from 'src/types/user';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Link, useTheme } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
//

// ----------------------------------------------------------------------

type Props = {
  row: TokenItem;
  onClickProfile: VoidFunction;
};

export default function UserTableRow({
  row,
  onClickProfile
}: Props) {

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value;
  };


  const formatNumber = (value: any) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }

  const {
    tokenName,
    tokenPictureUrl,
    tokenSupply,
    freezeAddress,
    mintAuthority,
    tokenAddress,
    mutable
  } = row;




  const confirm = useBoolean();
  const popover = usePopover();
  const theme = useTheme();

  return (
    <>
      <TableRow>
        <TableCell padding="checkbox" />

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={tokenName} src={tokenPictureUrl} sx={{ mr: 2 }} />
          <ListItemText
            primary={

              <Link
                noWrap
                onClick={onClickProfile}
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  cursor: 'pointer',
                }}

              >
                {tokenName}
              </Link>
            }
            secondary={
              <Link 
              target="_blank"
              rel="noreferrer"
              href={`https://solscan.io/token/${tokenAddress}`}
              sx={{
                color: "text.disabled",
                cursor: 'pointer',
              }}
              >
                {tokenAddress.slice(0, 5) + '...' + tokenAddress.slice(-5)}
              </Link>
            }
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fNumber(tokenSupply)}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatValue(freezeAddress)}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatValue(mintAuthority)}</TableCell>

        <TableCell>
          {formatValue(!mutable)}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        <MenuItem
          onClick={() => {
            onClickProfile();
            popover.onClose();
          }}
        >
          <Iconify icon="material-symbols:edit" />
          View Details
        </MenuItem>

        <MenuItem
          onClick={() => {
            window.open(`https://solscan.io/token/${tokenAddress}`, '_blank')
          }}
        >
          <Iconify icon="mdi:world" />
          View on Explorer
        </MenuItem>

      </CustomPopover>


    </>
  );
}
