import { Box, Stack, Typography } from "@mui/material";
import React from "react";

import MultisenderCrudGrid from "src/components/data-grid/datagrid";

export default function MultisenderStepTwo({
  totalFees,
}: {
  totalFees: number;
}) {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={2.5} alignItems="center">
        <Typography variant="h3" color="text.primary">
          Easily Airdrop Tokens with Solana Multisender
        </Typography>
        <Typography align="center" variant="body1" color="text.primary">
          Easily airdrop tokens to thousands of wallets with one click. Ideal
          for airdrops and community rewards at just 0.001 SOL per wallet.
        </Typography>
      </Stack>
      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Stack sx={{ mt: 5 }} spacing={3}>
            <MultisenderCrudGrid totalFees={totalFees} />
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
