"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NFTPassSectionV2 } from "@/components/nft-pass-section-v2"
import { 
  Check, 
  Star, 
  Zap, 
  Crown,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react"

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    currency: "SOL",
    period: "forever",
    description: "Perfect for testing and learning",
    features: [
      "Create up to 3 tokens",
      "Basic token management",
      "Standard processing speed",
      "Community support",
      "Basic analytics"
    ],
    cta: "Start Free",
    variant: "outline" as const,
    popular: false
  },
  {
    name: "Creator",
    price: "0.15",
    currency: "SOL",
    period: "per token",
    description: "For serious token creators",
    features: [
      "Create unlimited tokens",
      "Advanced token management",
      "Priority processing",
      "Custom metadata",
      "Analytics dashboard",
      "Email support"
    ],
    cta: "Start Creating",
    variant: "default" as const,
    popular: true
  },
  {
    name: "Platform Pass",
    price: "8",
    currency: "USDC",
    period: "lifetime",
    description: "Ultimate access with exclusive NFT",
    features: [
      "All Creator features",
      "Exclusive NFT Pass",
      "Lowest fees forever (0.05 SOL/token)",
      "VIP support",
      "Early access to features",
      "Advanced integrations",
      "White-label options",
      "Custom branding"
    ],
    cta: "Get NFT Pass",
    variant: "gradient" as const,
    popular: false,
    nftPass: true
  }
]

export function PricingNFTSection() {
  const [showNFTMint, setShowNFTMint] = useState(false)

  return (
    <>
      <section id="pricing" className="relative py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="gradient" className="mb-6 px-6 py-2 text-sm font-semibold">
              🌊 wavelyz.io Pricing
            </Badge>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Start{' '}
              <span className="gradient-text">Free</span>, Scale{' '}
              <span className="gradient-text">Smart</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Try for free, pay only when you need more. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center z-10">
                    <Badge variant="gradient" className="px-4 py-1.5 text-sm font-semibold shadow-lg">
                      <Star className="w-4 h-4 mr-1.5" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <Card className={`relative h-full transition-all duration-500 hover:scale-[1.02] ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-2xl shadow-primary/20' 
                    : 'hover:shadow-xl'
                } ${plan.nftPass ? 'bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/30' : ''}`}>
                  
                  {plan.nftPass && (
                    <div className="absolute top-6 right-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold gradient-text">
                          {plan.price}
                        </span>
                        <span className="text-2xl text-muted-foreground ml-2">
                          {plan.currency}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {plan.period}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.variant}
                      size="lg"
                      className="w-full group font-semibold"
                      onClick={() => {
                        if (plan.nftPass) {
                          setShowNFTMint(true)
                        } else {
                          window.open('https://app.wavelyz.io', '_blank')
                        }
                      }}
                    >
                      {plan.nftPass && <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />}
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center justify-center space-x-8 flex-wrap gap-8">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Start free, scale up</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-muted-foreground">Fair pricing</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-muted-foreground">10K+ creators</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NFT Mint Modal/Overlay */}
      <AnimatePresence>
        {showNFTMint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowNFTMint(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-7xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => setShowNFTMint(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <NFTPassSectionV2 />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
