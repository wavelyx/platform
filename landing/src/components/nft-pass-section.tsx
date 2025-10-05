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
  Settings
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

export function NFTPassSection() {
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
    { icon: Zap, title: 'Priority Processing', desc: 'Faster transaction confirmation' },
    { icon: Shield, title: 'Enhanced Security', desc: 'Advanced security features' },
    { icon: Star, title: 'Exclusive Features', desc: 'Early access to new features' },
    { icon: Gift, title: 'Special Rewards', desc: 'Exclusive airdrops and rewards' },
    { icon: Settings, title: 'Advanced Tools', desc: 'Access to premium tools' },
    { icon: Crown, title: 'VIP Support', desc: 'Priority customer support' }
  ]

  return (
    <section id="nft-pass" className="py-20 bg-gradient-to-br from-primary via-purple-600 to-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="glass" className="mb-4 px-6 py-2 text-sm font-semibold">
            🎫 Premium Access
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            wavelyz{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Platform Pass
            </span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Unlock exclusive access to premium features, advanced tools, and priority support with our NFT pass.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                  Platform Benefits
                </CardTitle>
                <CardDescription className="text-white/80">
                  Everything you get with your NFT Pass
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{benefit.title}</h4>
                      <p className="text-sm text-white/80">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Price Card */}
            <Card className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/30">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">10 USDC</div>
                <div className="text-white/80 mb-4">One-time payment</div>
                <div className="text-sm text-white/70">Lifetime access to all premium features</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Minting Interface */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center">
                  <Crown className="w-6 h-6 mr-2 text-yellow-400" />
                  Mint Your Pass
                </CardTitle>
                <CardDescription className="text-white/80">
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Connect Option */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Option 1: Connect Wallet</h4>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-100" />
                    </div>
                    
                    {publicKey && (
                      <Button
                        size="lg"
                        variant="glass"
                        onClick={handleMint}
                        disabled={loading || success}
                        className="w-full group"
                      >
                        {startIcon}
                        <span className="ml-2">{buttonText}</span>
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/20" />

                {/* QR Code Option */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Option 2: Solana Pay</h4>
                  <div className="flex justify-center p-6 bg-white/5 rounded-lg border border-white/20">
                    <div ref={mintQrRef} />
                  </div>
                  <p className="text-sm text-white/70 text-center mt-2">
                    Scan with any Solana Pay compatible wallet
                  </p>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-red-200 text-sm">{error}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearError}
                        className="text-red-200 hover:text-red-100"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}

                {success && transactionHash && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-200 text-sm">
                        🎉 NFT Pass minted successfully!
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-green-200 hover:text-green-100"
                      >
                        <a href={transactionUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
