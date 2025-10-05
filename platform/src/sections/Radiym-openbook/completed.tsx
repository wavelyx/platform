"use client";

import React from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Grid, Button } from '@mui/material';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { varBounce, MotionContainer } from 'src/components/animate';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useGetOpenBookByID } from 'src/actions/getOpenBook';
import { LoadingScreen } from 'src/components/loading-screen';
import NotFound from 'src/app/not-found';
import { da } from 'date-fns/locale';

interface Params {
    id: string;
}

export default function CompletedComponent({ id }: { id: string }) {
    const router = useRouter();
    const handleBack = () => {
        router.push('/');
    };
    const { openBooks, isLoading, isError } = useGetOpenBookByID(id);

    if (isLoading) {
        return <LoadingScreen />;
    }
    if (isError) {
        return <NotFound />;
    }
    const marketId = id

    const specialLink = marketId;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(specialLink);
            enqueueSnackbar('Copied!');
        } catch (err) {
            enqueueSnackbar('Copied fault.', { variant: 'error' });
        }
    };

    return (
        <Grid container
            justifyContent="center"
            component={MotionContainer}
            sx={{
                textAlign: 'center',
                pt: { xs: 5, md: 10 },
                pb: { xs: 10, md: 20 },
            }}
        >
            <Grid item xs={11} md={6.5}>
                <m.div variants={varBounce().in}>
                    <Box sx={{ fontSize: 128 }}>🎉</Box>
                </m.div>
                <Stack direction="column" spacing={2.5}>
                    <Typography variant='h3' color="text.primary" align='center'>
                        Congratulations!
                    </Typography>
                    <Typography variant='body1' color="text.primary" align='center'>
                        Your OpenBook market has been successfully created.
                    </Typography>
                    <Stack direction="column" spacing={2.5} sx={{ py: 5, my: 5, border: "1px dashed", borderColor: 'divider', borderRadius: 1 }}>
                        <Typography sx={{ ml: 5 }} variant='h5' fontWeight="bold" align='left'>
                            Details
                        </Typography>
                        <Stack direction="row" sx={{ px: 5 }} justifyContent="space-between">
                            <Typography variant='body2' color="text.secondary">
                                <Iconify sx={{ mr: 1, mb: -1 }} icon="mdi:people" width={24} height={24} />
                                Your New Market ID: {openBooks?.marketId}
                            </Typography>
                            <Typography variant='subtitle2' color="text.primary">
                                {marketId.slice(0, 5) + '...' + marketId.slice(-5)}
                            </Typography>

                        </Stack>
                        <Button onClick={handleCopyLink} sx={{ mx: 5, }} variant='soft'>
                            COPY
                        </Button>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button
                            onClick={handleBack}
                            startIcon={<Iconify icon="ic:baseline-arrow-back-ios" />} color='primary' variant='contained' size='large' fullWidth>
                            Back to Homepage
                        </Button>
                        <Button onClick={() => window.open('https://wavelyz.io', '_blank')} variant='contained' size='large' fullWidth>
                            Create a Liquidity Pool
                        </Button>
                    </Stack>
                </Stack>
            </Grid>
        </Grid>
    )
};

