"use client"

import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay'
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Transaction } from '@solana/web3.js'
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Crown, 
  Check, 
  ExternalLink, 
  Loader2, 
  Sparkles,
  Zap,
  Shield,
  Star,
  Gift,
  Settings,
  X,
  ArrowRight,
  QrCode
} from "lucide-react"

// Types from the API
type PostResponse = {
  transaction: string
  message: string
}

type PostError = {
  error: string
}

type AddSignaturesResponse = {
  fullySignedTransaction: string
  message: string
}

export function NFTPassSectionV2() {
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const mintQrRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  // Handler to clear error
  const handleClearError = () => setError(null)

  // Memoized start icon based on loading state
  const startIcon = useMemo(() => {
    if (loading) return <Loader2 className="w-5 h-5 animate-spin" />
    return <Crown className="w-5 h-5" />
  }, [loading])

  // Memoized button text based on loading and success states
  const buttonText = useMemo(() => {
    if (loading) return 'Processing...'
    if (success) return 'NFT Pass Minted!'
    return 'Mint NFT Pass'
  }, [loading, success])

  // Memoized transaction URL
  const transactionUrl = useMemo(() => 
    transactionHash ? `https://solscan.io/tx/${transactionHash}` : '',
    [transactionHash]
  )

  // Generate the Solana Pay QR code
  useEffect(() => {
    const { location } = window
    const apiUrl = `${location.protocol}//${location.host}/api/nft-pass/checkout`

    const mintUrlFields: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    }
    const mintUrl = encodeURL(mintUrlFields)
    const mintQr = createQR(mintUrl, 300, 'transparent')

    // Set the generated QR code on the QR ref element
    if (mintQrRef.current) {
      mintQrRef.current.innerHTML = ''
      mintQr.append(mintQrRef.current)
    }
  }, [])

  const handleMint = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Step 1: Fetch the unsigned transactions from our checkout API
      console.log('Step 1: Fetching unsigned transactions...')
      const response = await fetch('/api/nft-pass/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: publicKey.toBase58() })
      })

      const responseBody = await response.json() as PostResponse | PostError

      if ('error' in responseBody) {
        const { error: apiError } = responseBody
        console.error(apiError)
        setError(`Error: ${apiError}`)
        setLoading(false)
        return
      }

      // Step 2: Deserialize the pre-signed transaction (already signed by shop and mint)
      console.log('Step 2: Deserializing pre-signed transaction...')
      const preSignedTransaction = Transaction.from(Buffer.from(responseBody.transaction, 'base64'))
      
      // Step 3: User wallet signs the pre-signed transaction
      console.log('Step 3: User wallet signing pre-signed transaction...')
      const userSignedTransaction = await signTransaction(preSignedTransaction)
      
      // Step 4: Send the user-signed transaction back for verification
      console.log('Step 4: Verifying fully signed transaction...')
      const userSignedBase64 = userSignedTransaction.serialize().toString('base64')
      
      const signatureResponse = await fetch('/api/nft-pass/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          account: publicKey.toBase58(),
          signedTransaction: userSignedBase64
        })
      })

      const signatureBody = await signatureResponse.json() as AddSignaturesResponse | PostError

      if ('error' in signatureBody) {
        const { error: signatureError } = signatureBody
        console.error(signatureError)
        setError(`Signature error: ${signatureError}`)
        setLoading(false)
        return
      }

      // Step 5: Deserialize the fully signed transaction
      console.log('Step 5: Deserializing fully signed transaction...')
      const fullySignedTransaction = Transaction.from(Buffer.from(signatureBody.fullySignedTransaction, 'base64'))
      
      // Step 6: Send the fully signed transaction
      console.log('Step 6: Sending fully signed transaction...')
      const signature = await connection.sendRawTransaction(fullySignedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      
      // Step 7: Wait for confirmation
      console.log('Step 7: Waiting for transaction confirmation...')
      const latestBlockhash = await connection.getLatestBlockhash()
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      })
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }
      
      setTransactionHash(signature)
      setSuccess(true)
      setLoading(false)
      
      console.log('NFT Pass minted successfully!')
      console.log('Transaction signature:', signature)
      
    } catch (txError: any) {
      console.error(txError)
      setError(`Transaction failed: ${txError?.message || 'Unknown error'}`)
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection])

  const benefits = [
    { icon: Zap, title: 'Unlimited Token Creation', desc: 'Create unlimited tokens with advanced features', color: 'text-yellow-500' },
    { icon: Shield, title: 'Priority Processing', desc: 'Faster transaction confirmation and processing', color: 'text-blue-500' },
    { icon: Star, title: 'Advanced Token Management', desc: 'Burn, freeze, thaw, and manage token authorities', color: 'text-purple-500' },
    { icon: Gift, title: 'Trading & Markets', desc: 'Create OpenBook markets and trading pairs', color: 'text-green-500' },
    { icon: Settings, title: 'Distribution Tools', desc: 'Multisender and snapshot management tools', color: 'text-orange-500' },
    { icon: Crown, title: 'VIP Support & Early Access', desc: 'Priority support and early feature access', color: 'text-pink-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-7xl"
      >
        <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary via-purple-600 to-secondary p-8 text-center">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-white/20 text-white border-white/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Premium Access
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Wavelyz{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Platform Pass
                </span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Unlock the complete Wavelyz platform: unlimited tokens, advanced management, trading markets, and distribution tools
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Benefits */}
            <div className="p-8 lg:p-12 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Platform Benefits</h2>
                </div>
                <p className="text-muted-foreground">Everything you get with your NFT Pass</p>
              </div>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0`}>
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Price Card */}
              <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">8 USDC + 0.016 SOL</div>
                  <div className="text-lg opacity-90 mb-1">One-time payment</div>
                  <div className="text-sm opacity-80">Lifetime access to all premium features</div>
                  <div className="text-xs opacity-70 mt-2">SOL covers blockchain rent costs</div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Minting Interface */}
            <div className="p-8 lg:p-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Mint Your Pass</h2>
                </div>
                <p className="text-muted-foreground">Choose your preferred payment method</p>
              </div>

              <div className="space-y-8">
                {/* Wallet Connect Option */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    Connect Wallet
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-gradient-to-r !from-primary !to-purple-600 !text-white hover:!from-primary/90 hover:!to-purple-600/90 !border-0 !rounded-xl !px-6 !py-3 !font-semibold !shadow-lg hover:!shadow-xl !transition-all !duration-300" />
                    </div>
                    
                    {publicKey && (
                      <Button
                        size="lg"
                        variant="gradient"
                        onClick={handleMint}
                        disabled={loading || success}
                        className="w-full group font-semibold text-lg py-6"
                      >
                        {startIcon}
                        <span className="ml-2">{buttonText}</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* QR Code Option */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    Solana Pay
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl border-2 border-dashed border-primary/30">
                      <div ref={mintQrRef} className="rounded-xl overflow-hidden shadow-lg" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Scan with any Solana Pay compatible wallet
                    </p>
                  </div>
                </div>

                {/* Status Messages */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearError}
                        className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {success && transactionHash && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                          🎉 NFT Pass minted successfully!
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <a href={transactionUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
