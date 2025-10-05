"use client";

import { Grid, Box, Stack, Typography, Button } from "@mui/material";
import { m } from 'framer-motion';
import { MotionContainer, varBounce } from "src/components/animate";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// const fieldLabels = {
//     snapshotTime: { label: 'Selected Token', icon: 'mdi:coins' },
//     totalHolders: { label: 'Total Wallets', icon: 'humbleicons:at-symbol' },
//     totalHoldersYuzde: { label: 'Total Tokens to Distribute', icon: 'mdi:numbers' },
//     totalNumberHolders: { label: 'Token Amount per Wallet', icon: 'mdi-chip' },
// };

// const formValues = {
//     snapshotTime: 1,
// }

export default function SnapshotCompletedView({ id }: { id: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [csvUrl, setCsvUrl] = useState<string | null>(null);
    const [jsonUrl, setJsonUrl] = useState<string | null>(null);

    useEffect(() => {
        const csvUrl = searchParams.get('csvUrl');
        const jsonUrl = `/api/snapshot/${id}/download-json`;
        if (csvUrl) {
            setCsvUrl(csvUrl);
        }
        if (jsonUrl) {
            setJsonUrl(jsonUrl);
        }
    }, [searchParams, id]);


    const handleAirdropClick = () => {
        router.push(`/dashboard/multisender/${id}`);
    };
    const handleDownloadCsvClick = () => {
        if (csvUrl) {
            window.location.href = `${process.env.NEXT_PUBLIC_HOST_API_PUBLIC}/snapshots${csvUrl}`;
        } else {
            alert('CSV URL not available');
        }
    };
    const handleDownloadJsonClick = () => {
        if (jsonUrl) {
            window.location.href = `${process.env.NEXT_PUBLIC_HOST_API_PUBLIC}${jsonUrl}`;
        } else {
            alert('JSON URL not available');
        }
    };

    return (
        <Grid container justifyContent="center" component={MotionContainer}
            sx={{
                textAlign: 'center',
                pt: { xs: 5, md: 10 },
                pb: { xs: 10, md: 20 },
            }}
        >
            <Grid item xs={11} md={6}>
                <m.div variants={varBounce().in}>
                    <Box sx={{ fontSize: 128 }}>📸</Box>
                </m.div>
                <Stack spacing={2.5}>
                    <Typography variant="h3" color="text.primary" align="center">
                        Snapshot successfully captured!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                        Explore comprehensive details of your snapshot below.
                    </Typography>
                    <Stack spacing={1} direction="row" justifyContent="center">
                        <Button variant="soft" color="primary" onClick={handleAirdropClick}>
                            AIRDROP THEM
                        </Button>
                        <Button color="inherit" variant="soft">
                            COPY
                        </Button>
                        <Button sx={{ bgcolor: (theme) => theme.palette.grey[700], color: (theme) => theme.palette.primary.contrastText }} variant="contained" onClick={handleDownloadCsvClick}>
                            DOWNLOAD .CSV
                        </Button>
                        <Button sx={{ bgcolor: (theme) => theme.palette.grey[700], color: (theme) => theme.palette.primary.contrastText }} variant="contained" onClick={handleDownloadJsonClick}>
                            DOWNLOAD .JSON
                        </Button>

                    </Stack>
                    {/* <Stack direction="column"
                        spacing={
                            2.5
                        }
                        sx={{
                            py: 5,
                            mt: 5,
                            border: "1px dashed",
                            borderColor: 'divider',
                            borderRadius: 1,
                        }}>
                        <Typography sx={{ ml: 5 }} variant='h5' fontWeight="bold" align='left' >
                            Token Details
                        </Typography>
                        {Object.entries(fieldLabels).map(([key, { label, icon }]) => {
                            // const value = formValues[key];

                            return (
                                <Stack key={key} direction="row" sx={{ mx: 5 }} justifyContent="space-between">
                                    <Typography variant='body2' color="text.secondary">
                                        <Iconify sx={{ mr: 1, mb: -0.45 }} icon={icon} color="success" width={18} height={18} />
                                        {label}:
                                    </Typography>
                                    <Typography variant='subtitle2' color="text.primary">{value}</Typography>
                                </Stack>
                            )
                        })}
                    </Stack> */}
                    {/* <Stack spacing={1} direction="row">
                        <Button color="primary" variant="contained" size="large" fullWidth>
                            Take Another Snapshot
                        </Button>
                        <Button variant="contained" size="large" fullWidth>
                            Share Your Snapshot
                        </Button>
                    </Stack> */}
                </Stack>
            </Grid>

        </Grid>
    )
}