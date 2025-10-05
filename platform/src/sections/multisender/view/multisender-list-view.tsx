'use client';

import { Box, Grid, Stack, Typography, CircularProgress, Alert, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import axiosInstance from 'src/utils/axios';

const MultiSenderStatus = ({ id }: { id: any }) => {
  type RecipientType = {
    walletAddress: string;
    status: string;
    amount: number;
    transactionSignature?: string;
  };

  type StatusType = {
    status: string;
    signatures: string[];
    recipients: RecipientType[];
    totalRecipients: number;
  };

  const [status, setStatus] = useState<StatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStatus = async (currentPage: number, searchValue: string) => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_HOST_API_V2}/multisender/${id}/status`, {
        params: {
          page: currentPage,
          limit,
          search: searchValue,
        },
      });
      setStatus(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(page, searchQuery);
    const interval = setInterval(() => fetchStatus(page, searchQuery), 10000); // Refetch every 10 seconds
    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [id, page, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(search);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;
  if (!status) return <div>No status available</div>;

  const formatSignature = (signature: string) => {
    return `${signature.slice(0, 6)}...${signature.slice(-6)}`;
  };

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h4">MultiSender Status</Typography>
      <Typography variant="subtitle1">Status: {status.status}</Typography>
      <Typography variant="subtitle1">
        Signatures:{' '}
        {status.signatures.map((sig, index) => (
          <a key={index} href={`https://solscan.io/tx/${sig}`} target="_blank" rel="noopener noreferrer">
            {formatSignature(sig)}
            {index < status.signatures.length - 1 ? ', ' : ''}
          </a>
        ))}
      </Typography>
      <TextField
        label="Search by Wallet Address"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSearch}>
        Search
      </Button>
      <Grid container spacing={2}>
        {status.recipients.map((recipient, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <Stack direction="column" spacing={1}>
                <Typography variant="subtitle2">Address: {recipient.walletAddress}</Typography>
                <Typography variant="subtitle2">Amount: {recipient.amount}</Typography>
                <Typography variant="subtitle2">Status: {recipient.status}</Typography>
                {recipient.transactionSignature ? (
                  <Typography variant="subtitle2">
                    Signature:{' '}
                    <a
                      href={`https://solscan.io/tx/${recipient.transactionSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatSignature(recipient.transactionSignature)}
                    </a>
                  </Typography>
                ) : (
                  <Typography variant="subtitle2">Signature: N/A</Typography>
                )}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Typography>
          Page {page} of {Math.ceil(status.totalRecipients / limit)}
        </Typography>
        <Button variant="outlined" disabled={page * limit >= status.totalRecipients} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default MultiSenderStatus;
