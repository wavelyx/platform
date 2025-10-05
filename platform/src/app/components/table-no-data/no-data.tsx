'use client';

import { m } from 'framer-motion';
// @mui
import Typography from '@mui/material/Typography';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
// assets
import { Fab, Stack } from '@mui/material';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function NoDataTable() {
    const { setVisible: setModalVisible } = useWalletModal();


    return (
        <Stack
            sx={{
                py: 4,
                m: 'auto',
                maxWidth: 400,
                minHeight: '75vh',
                textAlign: 'center',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <MotionContainer>
                <m.div variants={varBounce().in}>
                    <Typography variant="h4" paragraph>
                        Please Connect Your Wallet
                    </Typography>
                </m.div>

                <m.div variants={varBounce().in}>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Connect your wallet to interact with wavelyz.
                    </Typography>
                </m.div>

                <m.div variants={varBounce().in}>
                <Fab sx={{width : 1, mt: 2, zIndex: 1}}
                 size="large" 
                 variant="softExtended"
                 onClick={() => {setModalVisible(true);}}
                 >
                    Connect Wallet
                </Fab>
                </m.div>

              
            </MotionContainer>
        </Stack>
    );

}

