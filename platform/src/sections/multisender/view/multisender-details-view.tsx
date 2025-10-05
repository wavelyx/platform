"use client";

import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  LinearProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { isEqual } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import Iconify from "src/components/iconify";
import Label from "src/components/label";
import Scrollbar from "src/components/scrollbar";
import { useSettingsContext } from "src/components/settings";
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from "src/components/table";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import UserTableFiltersResult from "src/sections/one/user-table-filters-result";
import UserTableToolbar from "src/sections/one/user-table-toolbar";
import {
  IUserTableFilters,
  IUserTableFilterValue,
  TokenItem,
} from "src/types/user";
import axiosInstance from "src/utils/axios";
import { fNumber } from "../../../utils/format-number";
import { RecipientType, StatusType } from "src/types/multisender";
import { GridSearchIcon } from "@mui/x-data-grid";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "walletAddress", label: "Wallet Address", align: "left" },
  { id: "amount", label: "Amount", align: "center" },
  { id: "status", label: "Status", align: "center" },
  {
    id: "transactionSignature",
    label: "Transaction Signature",
    align: "center",
  },
];

const defaultFilters = {
  tokenName: "",
  programName: [],
};
// ----------------------------------------------------------------------

const MultiSenderDetailView = ({ id }: { id: any }) => {
  const table = useTable();
  const [statusData, setStatusData] = useState<StatusType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(true);
  const denseHeight = table.dense ? 52 : 72;
  const [searchWalletAddress, setSearchWalletAddress] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchTransactionSignature, setSearchTransactionSignature] = useState<string>("");

  const [filters, setFilters] = useState(defaultFilters);


  const canReset = !isEqual(defaultFilters, filters);

  const dataFiltered = applyFilter({
    inputData: statusData?.recipients || [],
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });



  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const settings = useSettingsContext();

  const fetchStatus = async (currentPage: number, limit: number, walletAddress: string, status: string, transactionSignature: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_HOST_API_V2}/multisender/${id}/status`,
        {
          params: {
            page: currentPage,
            limit: limit,
            walletAddress: walletAddress,
            status: status,
            transactionSignature: transactionSignature,
          },
        }
      );
      const newStatusData = response.data;
      setStatusData(prevStatusData => ({
        ...newStatusData,
        recipients: currentPage === 1 ? newStatusData.recipients : [...(prevStatusData?.recipients || []), ...newStatusData.recipients]
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(table.page + 1, table.rowsPerPage, searchWalletAddress, searchStatus, searchTransactionSignature);
  }, [table.page, table.rowsPerPage]);

  useEffect(() => {
    if (!searchWalletAddress && !searchStatus && !searchTransactionSignature) {
      let fetchCount = 0;
      const intervalId = setInterval(() => {
        if (fetchCount < 10 && (statusData?.recipients.every(recipient => recipient.status === 'pending'))) {
          fetchStatus(table.page + 1, table.rowsPerPage, searchWalletAddress, searchStatus, searchTransactionSignature);
          fetchCount++;
        } else {
          clearInterval(intervalId);
        }
      }, 15000); // 15000ms = 15 seconds

      return () => clearInterval(intervalId);
    }
  }, [table.page, table.rowsPerPage, searchWalletAddress, searchStatus, searchTransactionSignature, statusData]);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchStatus(table.page + 1, table.rowsPerPage, searchWalletAddress, searchStatus, searchTransactionSignature);
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchWalletAddress, searchStatus, searchTransactionSignature]);

  if (loading) return <LinearProgress />
  if (error) return <div>Error: {error}</div>;

  const formatSignature = (signature: string) => {
    return `${signature.slice(0, 6)}...${signature.slice(-6)}`;
  };
  const handlePageChange = (event: unknown, newPage: number) => {
    table.setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.setRowsPerPage(parseInt(event.target.value, 10));
    table.setPage(0);
  };



  const handleSearchWalletAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchWalletAddress(event.target.value);
  };

  const handleSearchStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStatus(event.target.value);
  };

  const handleSearchTransactionSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTransactionSignature(event.target.value);
  };

  const handleSearch = () => {
    fetchStatus(table.page + 1, table.rowsPerPage, searchWalletAddress, searchStatus, searchTransactionSignature);
  };


  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        heading="Multisender List"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Multisender", href: paths.dashboard.multisender.list },
          { name: "Details" },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.multisender.root}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Create New Multisend
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        {/* <UserTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          tokens={tableData}
        /> */}

        {/* {canReset && (
          <UserTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )} */}
        <Box display="flex" flexDirection="column" alignItems="flex-start" p={3} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            MultiSender Details
          </Typography>
          <Typography variant="body1">
            <strong>Token Name:</strong> {statusData?.tokenName}
          </Typography>
          <Typography variant="body1">
            <strong>Token Symbol:</strong> {statusData?.tokenSymbol}
          </Typography>
          <Typography variant="body1">
            <strong>New Associated Token Accounts Created:</strong> {statusData?.newAccountsCount}
          </Typography>
          <Typography variant="body1">
            <strong>Existing Token Accounts Used:</strong> {statusData?.existingAccountsCount}
          </Typography>
          <Typography variant="body1">
            <strong>Refund Excess Amount Transaction Signature: </strong>
            <Link href={`https://solscan.io/tx/${statusData?.refundTransactionSignature}`} target="_blank" rel="noopener noreferrer">
              {statusData?.refundTransactionSignature ? formatSignature(statusData.refundTransactionSignature) : 'N/A'}
            </Link>
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" marginBottom="16px" mx="10px" my="10px">
          <TextField
            label="Search by Wallet"
            variant="outlined"
            value={searchWalletAddress}
            onChange={handleSearchWalletAddressChange}
            sx={{ marginRight: '8px' }}
          />
          <TextField
            label="Search by Status"
            variant="outlined"
            value={searchStatus}
            onChange={handleSearchStatusChange}
            sx={{ marginRight: '8px' }}
          />
          <TextField
            label="Search by Transaction Signature"
            variant="outlined"
            value={searchTransactionSignature}
            onChange={handleSearchTransactionSignatureChange}
            sx={{ marginRight: '8px' }}
          />
          <IconButton onClick={handleSearch}>
            <GridSearchIcon />
          </IconButton>
        </Box>
        <TableContainer sx={{ position: "relative", overflow: "unset" }}>
          <Scrollbar>
            <Table
              size={table.dense ? "small" : "medium"}
              sx={{ minWidth: 960 }}
            >
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
                  .map((row: any) => (
                    <TableRow key={row.walletAddress}>
                      <TableCell padding="checkbox" />
                      <TableCell align="left">{row.walletAddress}</TableCell>
                      <TableCell align="center">
                        {fNumber(row.amount)}
                      </TableCell>
                      <TableCell align="center">
                        <Label
                          color={
                            row.status === "completed" ? "success" : "error"
                          }
                        >
                          {row.status}
                        </Label>
                      </TableCell>
                      <TableCell align="center">
                        <Link
                          href={`https://solscan.io/tx/${row.transactionSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formatSignature(row.transactionSignature)}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(
                    table.page,
                    table.rowsPerPage,
                    statusData?.recipients.length || 0
                  )}
                />

                <TableNoData
                  title="No multisend found with your current authority."
                  notFound={notFound}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <TablePaginationCustom
          count={statusData?.totalRecipients || 0}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
};

export default MultiSenderDetailView;

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: RecipientType[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  return inputData;
}

