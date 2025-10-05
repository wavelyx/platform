'use client';

import { FC, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { WalletError, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider, ConnectionProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider as ReactUIWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    TorusWalletAdapter,
    SolletWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    // LedgerWalletAdapter,
    // SlopeWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import loginUser from 'src/actions/login';

import refreshTokens from 'src/actions/refreshTokens';
import { notify } from "../utils/notifications";
import { useAutoConnect, AutoConnectProvider } from './AutoConnectProvider';
import { clusterApiUrl } from '@solana/web3.js';
import { useTokensByWallet } from 'src/actions/getTokensByWallet';
import deleteAccessToken from 'src/actions/logout';
import { debounce } from 'lodash';
import validateToken from 'src/utils/validateToken';


// login handler: send api call every refresh
const WalletLoginHandler: FC<{ children: ReactNode }> = ({ children }) => {
    const { publicKey, connected, disconnecting, disconnect, signMessage } = useWallet();
    const { refetch } = useTokensByWallet();


    useEffect(() => {
        const handleLogin = debounce(async () => {
            const storedAccessToken = localStorage.getItem('accessToken');

            if (storedAccessToken) {
                const isValidToken = await validateToken(storedAccessToken);
                if (isValidToken) {
                    await refreshTokens(publicKey);
                    await refetch();
                    return;
                } else {
                    localStorage.removeItem('accessToken');
                }
            }

            if (connected && publicKey && signMessage) {
                try {

                    if (!localStorage.getItem('priorityFee')) {
                        localStorage.setItem('priorityFee', '100000');
                    }
                    const accessToken = await loginUser(publicKey.toBase58(), signMessage);
                    await refreshTokens(publicKey);
                    await refetch();
                } catch (error) {
                    console.error('Login or refetching token failed:', error);
                }
            } else {
                console.log('Not connected or missing publicKey/signMessage:', { connected, publicKey, signMessage });
            }
        }, 500); // Adjust debounce time as needed

        handleLogin();
    }, [connected, publicKey, signMessage]);

    useEffect(() => {
        if (disconnecting) {
            disconnect();
            deleteAccessToken();
            localStorage.removeItem('priorityFee'); // Clear priority fee setting
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }, [disconnecting]);

    return <>{children}</>;
};

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = process.env.HELIUS_URL || 'https://mainnet.helius-rpc.com/?api-key=8d01d735-f2f2-476c-9a48-d9624e14a1fd';
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // const endpoint = "https://solana-mainnet.g.alchemy.com/v2/btnWfpLQi-oGB2Rrhk6zF29DOD14ArAw"; // Replace this with your actual RPC URL
    // const endpoint = "http://rpc.wavelyz.io"; // Replace this with your actual RPC URL



    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
        new SolletWalletAdapter({ network }),
        new SolletExtensionWalletAdapter({ network }),
        new TorusWalletAdapter(),
    ], [network]);

    const onError = useCallback((error: WalletError) => {
        notify({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
        console.error(error);
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProvider>
                    <WalletLoginHandler>{children}</WalletLoginHandler>
                </ReactUIWalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => (
    <AutoConnectProvider>
        <WalletContextProvider>{children}</WalletContextProvider>
    </AutoConnectProvider>
);
