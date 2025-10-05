# Swap Page

This page integrates with Jupiter's Swap API to provide token swapping functionality on Solana.

## Features

- **Jupiter Integration**: Uses Jupiter's routing engine to find the best swap routes across multiple DEXes
- **Dynamic Slippage**: Automatically adjusts slippage based on token volatility
- **Priority Fees**: Optimizes transaction landing with dynamic priority fee estimation
- **Compute Unit Optimization**: Automatically estimates optimal compute units for better transaction success
- **Transaction Size Monitoring**: Ensures transactions meet minimum size requirements (1100 bytes)
- **Wallet Integration**: Seamlessly integrates with Solana wallet adapters

## How It Works

1. **Get Quote**: Fetches the best swap route from Jupiter's API
2. **Build Transaction**: Jupiter builds an optimized swap transaction
3. **Size Validation**: Checks if transaction meets minimum 1100 bytes requirement
4. **Sign & Send**: User signs and sends the transaction to the network
5. **Confirmation**: Waits for transaction confirmation and provides feedback

## API Endpoints Used

- **Quote**: `https://lite-api.jup.ag/swap/v1/quote`
- **Swap**: `https://lite-api.jup.ag/swap/v1/swap`

## Supported Tokens

- SOL (Native Solana token)
- USDC (USD Coin)
- USDT (Tether)
- JUP (Jupiter token)

## Console Logging

The page includes comprehensive console logging for:
- Quote requests and responses
- Transaction building and signing
- Transaction size validation
- Network communication
- Error handling

## Transaction Optimization

- **Dynamic Compute Units**: Automatically estimates optimal compute unit limits
- **Priority Fees**: Uses "veryHigh" priority level with max 1 SOL cap
- **Slippage Management**: Implements dynamic slippage for better trade execution
- **Retry Logic**: Includes retry mechanisms for failed transactions

## Security Features

- Input validation and balance checking
- Slippage protection
- Transaction confirmation waiting
- Comprehensive error handling

## Usage

1. Connect your Solana wallet
2. Select input and output tokens
3. Enter the amount to swap
4. Choose slippage tolerance
5. Get a quote
6. Execute the swap

## Dependencies

- `@solana/web3.js` - Solana blockchain interaction
- `@solana/wallet-adapter-react` - Wallet integration
- `@mui/material` - UI components
- Jupiter Swap API - Token swapping infrastructure
