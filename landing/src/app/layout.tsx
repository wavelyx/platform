import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WalletContextProvider } from '@/contexts/wallet-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'wavelyz.io | Build, Trade & Scale On Solana',
  description: 'Complete Solana DeFi platform. Create tokens, launch markets, manage distributions, and scale your project. Everything you need to succeed in DeFi.',
  keywords: 'Solana, DeFi, token creation, SPL tokens, trading, markets, distribution, blockchain, cryptocurrency, wavelyz',
  authors: [{ name: 'wavelyz Team' }],
  openGraph: {
    title: 'wavelyz.io | Complete Solana DeFi Platform',
    description: 'Build, trade and scale on Solana. Create tokens, launch markets, manage distributions - all in one platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'wavelyz.io | Complete Solana DeFi Platform',
    description: 'Build, trade and scale on Solana. Create tokens, launch markets, manage distributions - all in one platform.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
}
