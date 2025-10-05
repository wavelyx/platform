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


interface Props {
    title: string;
    subtitle?: string;
    firstButtonLabel: string;
    secondButtonLabel: string;
    externalUrl: any;
}


const CompletedComponent: React.FC<Props> = ({ title, subtitle, firstButtonLabel, secondButtonLabel,externalUrl }) => {
    const router = useRouter();
    const handleBack = () => {
        router.push('/');
    };
    const handleSecondButtonClick = () => {
        window.open(externalUrl, '_blank');
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
        <Grid item xs={11} md={5}>
            <m.div variants={varBounce().in}>
                <Box sx={{ fontSize: 128 }}>🎉</Box>
            </m.div>
            <Stack spacing={2.5}>
                <Typography variant='h3' color="text.primary" align='center'>
                    {title}
                </Typography>
                <Typography variant='body1' color="text.primary" align='center'>
                    {subtitle}
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        onClick={handleBack}
                        startIcon={<Iconify icon="ic:baseline-arrow-back-ios" />} color='primary' variant='contained' size='large' fullWidth>
                        {firstButtonLabel}
                    </Button>
                    <Button onClick={handleSecondButtonClick} startIcon={<Iconify icon="eva:external-link-fill" />} variant='contained' size='large' fullWidth>
                        {secondButtonLabel}
                    </Button>
                </Stack>
            </Stack>
        </Grid>
    </Grid>
)};

export default CompletedComponent;
