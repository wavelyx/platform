import { useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { SelectChangeEvent } from '@mui/material/Select';
// types
import { IUserTableFilters, IUserTableFilterValue, TokenItem } from 'src/types/user';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  //
  tokens: TokenItem[];
};

export default function UserTableToolbar({
  tokens,
  filters,
  onFilters,
}: Props) {



  // Deduplicate programName options
const programNames = useMemo(() => {
  const names = tokens?.map((option) => option.programName);
  return Array.from(new Set(names)); // Set will only allow unique values
}, [tokens]);

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('tokenName', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'programName',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >

      {/* // Filter by Token Program will be revised after new token programs added */}
      {/* <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Token Program</InputLabel>

        <Select
          multiple
          value={filters.programName}
          onChange={handleFilterRole}
          input={<OutlinedInput label="SPL Token" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 240 },
            },
          }}
        >
          {programNames.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox disableRipple size="small" checked={filters.programName.includes(name)} />
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl> */}

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.tokenName}
          onChange={handleFilterName}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>


  );
}
