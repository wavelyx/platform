'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Button,
  TextField,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, VersionedTransaction, TransactionInstruction, SystemProgram, PublicKey as SolanaPublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { notify } from 'src/utils/notifications';

// Common token mints
const COMMON_TOKENS = [
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', decimals: 9 },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', decimals: 6 },
  { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', decimals: 6 },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', decimals: 6 },
];

interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
  error?: string;
}

interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  error?: string;
}

export default function SwapView() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible: setModalVisible } = useWalletModal();
  
  const [inputMint, setInputMint] = useState(COMMON_TOKENS[0].mint);
  const [outputMint, setOutputMint] = useState(COMMON_TOKENS[1].mint);
  const [inputAmount, setInputAmount] = useState('');
  const [slippageBps, setSlippageBps] = useState(50);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputTokenBalance, setInputTokenBalance] = useState<number | null>(null);
  const [outputTokenBalance, setOutputTokenBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date | null>(null);

  // Get connection from environment or use default
  const connection = new Connection(
    process.env.HELIUS_URL || 'https://mainnet.helius-rpc.com/?api-key=8d01d735-f2f2-476c-9a48-d9624e14a1fd'
  );

  // Function to get token balances
  const getTokenBalances = useCallback(async () => {
    if (!publicKey || !connected) return;

    console.log('🔄 Fetching token balances...');
    setLoadingBalance(true);
    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setInputTokenBalance(solBalance / LAMPORTS_PER_SOL);
      setLastBalanceUpdate(new Date());

      // For other tokens, you would need to get the token account balance
      // This is a simplified version - in production you'd want to check actual token balances
      console.log('✅ SOL balance fetched:', solBalance / LAMPORTS_PER_SOL);
      
    } catch (err) {
      console.error('❌ Error getting balances:', err);
    } finally {
      setLoadingBalance(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    if (connected && publicKey) {
      getTokenBalances();
    }
  }, [connected, publicKey]);

  // Get quote

  const getQuote = useCallback(async () => {
    if (!inputAmount || !inputMint || !outputMint) return;

    setLoading(true);
    setError('');

    try {
      const inputToken = COMMON_TOKENS.find(t => t.mint === inputMint);
      if (!inputToken) throw new Error('Invalid input token');

      const rawAmount = Math.floor(parseFloat(inputAmount) * Math.pow(10, inputToken.decimals));

      if (inputTokenBalance !== null) {
        const requiredBalance = parseFloat(inputAmount);
        if (inputTokenBalance < requiredBalance) {
          throw new Error(`Insufficient balance. You have ${inputTokenBalance.toFixed(4)} ${inputToken.symbol}, but need ${requiredBalance}`);
        }
      }

      const quoteUrl = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount}&slippageBps=${slippageBps}&restrictIntermediateTokens=true&dynamicSlippage=true`;
      
      console.log('Getting quote from:', quoteUrl);
      
      const response = await fetch(quoteUrl);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 4000;
        console.log(`Rate limited. Retrying after ${delay}ms delay...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        const retryResponse = await fetch(quoteUrl);
        
        if (retryResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        const quoteData: QuoteResponse = await retryResponse.json();
        
        if (retryResponse.ok) {
          setQuote(quoteData);
        } else {
          throw new Error(quoteData.error || 'Failed to get quote after retry');
        }
      } else {
        const quoteData: QuoteResponse = await response.json();
        
        if (response.ok) {
          setQuote(quoteData);
        } else {
          throw new Error(quoteData.error || 'Failed to get quote');
        }
      }
    } catch (err: any) {
      console.error('Quote error:', err);
      setError(err.message || 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  }, [inputAmount, inputMint, outputMint, slippageBps, inputTokenBalance]);

  // Add padding to reach minimum transaction size
  const addTransactionPadding = useCallback((transaction: VersionedTransaction, targetSize: number = 1100) => {
    const currentSize = transaction.serialize().length;
    console.log(`Current transaction size: ${currentSize} bytes`);
    
    if (currentSize >= targetSize) {
      console.log(`Transaction already meets minimum size requirement (${currentSize} >= ${targetSize})`);
      return transaction;
    }

    const paddingNeeded = targetSize - currentSize;
    console.log(`Adding ${paddingNeeded} bytes of padding to reach ${targetSize} bytes`);

    // This function now serves as a logging and planning function
    // The actual padding will be handled in the transaction building phase
    
    if (paddingNeeded > 0) {
      console.log(`📝 Padding strategy for ${paddingNeeded} bytes:`);
      console.log(`   • Add additional account lookups (if possible)`);
      console.log(`   • Include more detailed instruction data`);
      console.log(`   • Add system program instructions if needed`);
      console.log(`   • Current transaction uses ${transaction.message.compiledInstructions.length} instructions`);
      console.log(`   • Current transaction uses ${transaction.message.addressTableLookups?.length || 0} address table lookups`);
    }
    
    return transaction;
  }, []);

  const createPaddedTransaction = useCallback(async (swapData: SwapResponse, targetSize: number = 1100) => {
    const transactionBase64 = swapData.swapTransaction;
    let transaction = VersionedTransaction.deserialize(Buffer.from(transactionBase64, 'base64'));
    
    const originalSize = transaction.serialize().length;
    
    if (originalSize >= targetSize) {
      return transaction;
    }

    const paddingNeeded = targetSize - originalSize;

    if (paddingNeeded > 200) {
      try {
        const aggressiveSwapResponse = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteResponse: quote, // We need access to the original quote
            userPublicKey: publicKey?.toBase58(), // We need access to the user's public key
            dynamicComputeUnitLimit: true,
            dynamicSlippage: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                maxLamports: 1000000,
                priorityLevel: "veryHigh"
              }
            },
            maxAccounts: 128,
            asLegacyTransaction: false,
            skipUserAccountsRpcCalls: false,
            useSharedAccounts: true,
            wrapAndUnwrapSol: true, 
            restrictIntermediateTokens: false,
            onlyDirectRoutes: false,
          })
        });

        if (aggressiveSwapResponse.ok) {
          const aggressiveSwapData = await aggressiveSwapResponse.json();
          const aggressiveTransaction = VersionedTransaction.deserialize(Buffer.from(aggressiveSwapData.swapTransaction, 'base64'));
          const aggressiveSize = aggressiveTransaction.serialize().length;
          
          if (aggressiveSize >= targetSize) {
            return aggressiveTransaction;
          } else if (aggressiveSize > originalSize) {
            transaction = aggressiveTransaction; // Use the improved version
          } else {
            try {
              const legacySwapResponse = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  quoteResponse: quote,
                  userPublicKey: publicKey?.toBase58(),
                  dynamicComputeUnitLimit: true,
                  dynamicSlippage: true,
                  prioritizationFeeLamports: {
                    priorityLevelWithMaxLamports: {
                      maxLamports: 1000000,
                      priorityLevel: "veryHigh"
                    }
                  },
                  asLegacyTransaction: true,
                  maxAccounts: 128,
                  skipUserAccountsRpcCalls: false,
                  useSharedAccounts: true,
                  wrapAndUnwrapSol: true,
                })
              });

              if (legacySwapResponse.ok) {
                const legacySwapData = await legacySwapResponse.json();
                const legacyTransaction = VersionedTransaction.deserialize(Buffer.from(legacySwapData.swapTransaction, 'base64'));
                const legacySize = legacyTransaction.serialize().length;
                
                if (legacySize > originalSize) {
                  transaction = legacyTransaction;
                }
              }
            } catch (legacyError) {
              // Continue silently
            }
          }
        }
      } catch (error) {
        // Continue with original transaction silently
      }
    }

    if (paddingNeeded > 100) {
      // Strategy 4b: Try to get a new quote with different parameters
      try {
        if (!quote) {
          return transaction;
        }
        
        const newQuoteUrl = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${quote.inputMint}&outputMint=${quote.outputMint}&amount=${quote.inAmount}&slippageBps=${Math.max(slippageBps * 2, 200)}&restrictIntermediateTokens=false&dynamicSlippage=true&maxAccounts=128&onlyDirectRoutes=false`;
        
        const newQuoteResponse = await fetch(newQuoteUrl);
        if (newQuoteResponse.ok) {
          const newQuoteData = await newQuoteResponse.json();
          
          const newSwapResponse = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quoteResponse: newQuoteData,
              userPublicKey: publicKey?.toBase58(),
              dynamicComputeUnitLimit: true,
              dynamicSlippage: true,
              prioritizationFeeLamports: {
                priorityLevelWithMaxLamports: {
                  maxLamports: 1000000,
                  priorityLevel: "veryHigh"
                }
              },
              maxAccounts: 128,
              asLegacyTransaction: false,
              skipUserAccountsRpcCalls: false,
              useSharedAccounts: true,
              wrapAndUnwrapSol: true,
              restrictIntermediateTokens: false,
              onlyDirectRoutes: false,
            })
          });

          if (newSwapResponse.ok) {
            const newSwapData = await newSwapResponse.json();
            const newTransaction = VersionedTransaction.deserialize(Buffer.from(newSwapData.swapTransaction, 'base64'));
            const newSize = newTransaction.serialize().length;
            
            if (newSize > originalSize) {
              transaction = newTransaction;
              
              const newPaddingNeeded = targetSize - newSize;
              if (newPaddingNeeded <= 0) {
                return transaction;
              }
            }
          }
        }
      } catch (newQuoteError) {
        // Continue silently if new quote fails
      }
    }

    return transaction;
  }, [quote, publicKey, slippageBps]); // Add dependencies for the aggressive rebuild

  const executeSwap = useCallback(async () => {
    if (!quote || !publicKey || !signTransaction) return;

    setSwapLoading(true);
    setError('');

    try {
      console.log('Building swap transaction...');
      console.log('Quote data:', quote);
      console.log('User public key:', publicKey.toBase58());
      
      const swapResponse = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 1000000,
              priorityLevel: "veryHigh"
            }
          },
          maxAccounts: 128, 
          asLegacyTransaction: false, 
          skipUserAccountsRpcCalls: false, 
          useSharedAccounts: true, 
          wrapAndUnwrapSol: true, 
          restrictIntermediateTokens: false, 
          onlyDirectRoutes: false, 
        })
      });

      if (swapResponse.status === 429) {
        const retryAfter = swapResponse.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 4000;
        console.log(`Swap API rate limited. Retrying after ${delay}ms delay...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const retrySwapResponse = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: publicKey.toBase58(),
            dynamicComputeUnitLimit: true,
            dynamicSlippage: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                maxLamports: 1000000,
                priorityLevel: "veryHigh"
              }
            },
            maxAccounts: 128,
            asLegacyTransaction: false,
            skipUserAccountsRpcCalls: false,
            useSharedAccounts: true,
            wrapAndUnwrapSol: true,
            restrictIntermediateTokens: false,
            onlyDirectRoutes: false,
          })
        });
        
        if (retrySwapResponse.status === 429) {
          throw new Error('Swap API rate limit exceeded. Please wait a moment and try again.');
        }
        
        const swapData: SwapResponse = await retrySwapResponse.json();
        
        if (!retrySwapResponse.ok) {
          throw new Error(swapData.error || 'Failed to build swap transaction after retry');
        }
        
        await processSwapTransaction(swapData);
      } else {
        const swapData: SwapResponse = await swapResponse.json();
        
        if (!swapResponse.ok) {
          throw new Error(swapData.error || 'Failed to build swap transaction');
        }
        
        await processSwapTransaction(swapData);
      }

    } catch (err: any) {
      console.error('❌ Swap error:', err);
      setError(err.message || 'Failed to execute swap');
      notify({ type: 'error', message: err.message || 'Swap failed' });
    } finally {
      setSwapLoading(false);
    }
  }, [quote, publicKey, signTransaction, connection, createPaddedTransaction]);

  const processSwapTransaction = useCallback(async (swapData: SwapResponse) => {
    if (!signTransaction) {
      throw new Error('Wallet signTransaction not available');
    }

    console.log('Swap API response:', swapData);
    
    let transaction = await createPaddedTransaction(swapData, 1100);
    
    console.log('Transaction:', transaction);
    console.log('Transaction message:', transaction.message);
    console.log('Transaction signatures:', transaction.signatures);
    
    const transactionSize = transaction.serialize().length;
    console.log('Transaction size (bytes):', transactionSize);
    
    console.log('Signing transaction...');
    
    let signedTransaction;
    let transactionType = 'versioned';
    
    try {
      signedTransaction = await signTransaction(transaction);
      console.log('Transaction signed successfully');
      
      if (transaction.message && 'accountKeys' in transaction.message) {
        transactionType = 'legacy';
      }
      
    } catch (signError) {
      if (transactionType === 'legacy' || (transaction.message && 'accountKeys' in transaction.message)) {
        try {
          const originalTransaction = VersionedTransaction.deserialize(Buffer.from(swapData.swapTransaction, 'base64'));
          
          signedTransaction = await signTransaction(originalTransaction);
          transactionType = 'versioned-fallback';
          
          transaction = originalTransaction;
          
        } catch (fallbackError) {
          throw new Error(`Transaction signing failed: ${fallbackError.message}`);
        }
      } else {
        throw signError;
      }
    }
    
    console.log('Transaction signed successfully');
    console.log('Signed transaction:', signedTransaction);
    
    // Send the transaction
    console.log('Sending transaction to network...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      maxRetries: 3,
      skipPreflight: false
    });

    console.log('Transaction sent successfully!');
    console.log('Transaction signature:', signature);
    console.log('Transaction URL:', `https://solscan.io/tx/${signature}/`);

    // Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: transaction.message.recentBlockhash!,
      lastValidBlockHeight: swapData.lastValidBlockHeight
    }, 'confirmed');

    console.log('Transaction confirmation result:', confirmation);

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    notify({ type: 'success', message: `Swap successful! Signature: ${signature}` });
    console.log(`Transaction successful!`);
    console.log(`View on Solscan: https://solscan.io/tx/${signature}/`);
    
    // Reset form
    setInputAmount('');
    setQuote(null);
  }, [signTransaction, connection, createPaddedTransaction]);

  const handleConnectWallet = () => {
    setModalVisible(true);
  };

  const handleSwapTokens = () => {
    setInputMint(outputMint);
    setOutputMint(inputMint);
    setQuote(null);
  };


  if (!connected) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Connect Your Wallet
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Connect your Solana wallet to start swapping tokens
        </Typography>
        <Button variant="contained" onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Swap Tokens
      </Typography>

      {/* Balance Display */}
      {connected && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Wallet Balances
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={getTokenBalances}
              disabled={loadingBalance}
              startIcon={loadingBalance ? <CircularProgress size={16} /> : null}
            >
              {loadingBalance ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
          {loadingBalance ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                {COMMON_TOKENS.map((token) => (
                  <Chip
                    key={token.mint}
                    label={`${token.symbol}: ${token.mint === COMMON_TOKENS[0].mint ? (inputTokenBalance?.toFixed(4) || '0') : 'Check wallet'}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
              {lastBalanceUpdate && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Last updated: {lastBalanceUpdate.toLocaleTimeString()}
                </Typography>
              )}
            </>
          )}
        </Box>
      )}

      <Stack spacing={3}>
        {/* Input Token */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            From
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              fullWidth
              value={inputMint}
              onChange={(e) => setInputMint(e.target.value)}
              label="Token"
            >
              {COMMON_TOKENS.map((token) => (
                <MenuItem key={token.mint} value={token.mint}>
                  {token.symbol}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              label="Amount"
              placeholder="0.0"
              helperText={inputTokenBalance !== null ? `Available: ${inputTokenBalance.toFixed(4)}` : ''}
            />
          </Stack>
          <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
            💡 Enter an amount and click "Get Quote" to see the best swap route
          </Typography>
        </Box>

        {/* Swap Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleSwapTokens}
            sx={{ minWidth: 50 }}
          >
            ↓
          </Button>
        </Box>

        {/* Output Token */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            To
          </Typography>
          <TextField
            select
            fullWidth
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
            label="Token"
          >
            {COMMON_TOKENS.map((token) => (
              <MenuItem key={token.mint} value={token.mint}>
                {token.symbol}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Slippage */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Slippage Tolerance
          </Typography>
          <TextField
            select
            fullWidth
            value={slippageBps}
            onChange={(e) => setSlippageBps(Number(e.target.value))}
            label="Slippage"
          >
            <MenuItem value={10}>0.1%</MenuItem>
            <MenuItem value={50}>0.5%</MenuItem>
            <MenuItem value={100}>1.0%</MenuItem>
            <MenuItem value={200}>2.0%</MenuItem>
          </TextField>
        </Box>

        {/* Quote Display */}
        {quote && (
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Quote
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Input Amount:</Typography>
                <Typography variant="body2">
                  {parseFloat(quote.inAmount) / Math.pow(10, COMMON_TOKENS.find(t => t.mint === quote.inputMint)?.decimals || 9)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Output Amount:</Typography>
                <Typography variant="body2">
                  {parseFloat(quote.outAmount) / Math.pow(10, COMMON_TOKENS.find(t => t.mint === quote.outputMint)?.decimals || 6)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Price Impact:</Typography>
                <Typography variant="body2">{quote.priceImpactPct}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Route:</Typography>
                <Typography variant="body2">
                  {quote.routePlan.map((route, index) => (
                    <Chip key={index} label={route.swapInfo.label} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Typography>
              </Box>
              
              {/* Transaction Size Info */}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  Transaction Information
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  • Using Jupiter's routing engine for best prices
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  • Check console for transaction details
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={getQuote}
            disabled={loading || !inputAmount}
          >
            {loading ? <CircularProgress size={20} /> : 'Get Quote'}
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            onClick={executeSwap}
            disabled={swapLoading || !quote || !connected}
          >
            {swapLoading ? <CircularProgress size={20} /> : 'Swap'}
          </Button>
        </Stack>

        {/* Transaction Info */}
        {quote && (
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Transaction Details
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              This swap will use Jupiter's routing engine to find the best price across multiple DEXes.
            </Typography>
            <Typography variant="body2">
              The transaction will be optimized with dynamic compute units and priority fees for better landing success.
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
