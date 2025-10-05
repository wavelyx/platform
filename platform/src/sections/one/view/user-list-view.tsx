'use client';

import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// types
import { TokenItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import { useTokensByWallet } from 'src/actions/getTokensByWallet';
import UserTableRow from 'src/sections/one/user-table-row';
import UserTableToolbar from 'src/sections/one/user-table-toolbar';
import UserTableFiltersResult from 'src/sections/one/user-table-filters-result';
import { LoadingScreen, SplashScreen } from 'src/components/loading-screen';
import { NotFoundView } from 'src/sections/error';
import NoDataTable from 'src/app/components/table-no-data/no-data';

// ----------------------------------------------------------------------


const TABLE_HEAD = [
  { id: 'name', label: 'Token Name', align: 'left' },
  { id: 'phoneNumber', label: 'Total Supply', width: 180 },
  { id: 'company', label: 'Freeze Authority', width: 220 },
  { id: 'role', label: 'Mint Authority', width: 180 },
  { id: 'status', label: 'Immutable', width: 100 },
  { id: 'actions', width: 88 },
];

const defaultFilters = {
  tokenName: '',
  programName: [],
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();
  const { tokens, isLoading, isError } = useTokensByWallet();

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setTableData(tokens);
    }
  }, [tokens]);


  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (tokenName: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [tokenName]: value,
      }));
    },
    [table]
  );


  const handleClickProfile = useCallback(
    (id: string) => {
      router.push(`${paths.dashboard.token.id}/${id}`);
    },
    [router]
  );


  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  if (isLoading) {
    return <LoadingScreen />
  }
  if (isError) {
    return <NoDataTable />;
  }




  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={`My Tokens (${tableData.length})`}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Token', href: paths.dashboard.user.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.token.create}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Create New Token
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            tokens={tokens}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row._id}
                        row={row}
                        onClickProfile={() => handleClickProfile(row.tokenAddress ?? '')}

                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData title="No tokens found with your current authority." notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: TokenItem[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  const { tokenName, programName } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (tokenName) {
    inputData = inputData.filter(
      (user) => user.tokenName.toLowerCase().indexOf(tokenName.toLowerCase()) !== -1
    );
  }

  if (programName.length) {
    inputData = inputData.filter((user) => programName.includes(user.programName));
  }

  return inputData;
}
