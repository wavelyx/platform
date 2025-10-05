"use client";

import { Box, Grid, Stack, Typography } from "@mui/material";
import { m } from "framer-motion";
import { MotionContainer, varBounce } from "src/components/animate";

export default function SnapshotPreparingView() {
    return (
        <Grid
            container
            justifyContent="center"
            component={MotionContainer}
            sx={{
                textAlign: 'center',
                pt: { xs: 5, md: 10 },
                pb: { xs: 10, md: 20 },
            }}
        >
            <Grid item xs={11} md={6}>
                <m.div variants={varBounce().in}>
                    <Box sx={{ fontSize: 128 }}>
                        📷
                    </Box>

                </m.div>
                <Stack sx={{mt : 2}} spacing={2.5}>
                    <Typography variant="h3" color="text.primary" align="center">
                        Preparing your snapshot...
                    </Typography>
                    <Typography variant="body1" color="text.disabled" align="center">
                        This may take a few moments.
                    </Typography>
                </Stack>
            </Grid>

        </Grid >
    )
}