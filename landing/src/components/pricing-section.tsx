"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Gift,
  Crown,
  Sparkles
} from "lucide-react"

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    currency: "SOL",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Create up to 3 tokens",
      "Basic token management",
      "Community support",
      "Standard processing speed"
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "0.20",
    currency: "SOL",
    period: "per token",
    description: "Most popular for creators",
    features: [
      "Unlimited token creation",
      "Advanced token management",
      "Priority support",
      "Faster processing",
      "Analytics dashboard",
      "Custom metadata"
    ],
    cta: "Start Creating",
    variant: "gradient" as const,
    popular: true
  },
  {
    name: "Platform Pass",
    price: "10",
    currency: "USDC",
    period: "one-time",
    description: "Premium access with NFT pass",
    features: [
      "Everything in Pro",
      "Exclusive NFT Pass",
      "Premium features access",
      "Priority processing",
      "Advanced analytics",
      "Custom integrations",
      "White-label options",
      "Dedicated support"
    ],
    cta: "Get NFT Pass",
    variant: "gradient" as const,
    popular: false,
    nftPass: true
  }
]

const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create tokens in seconds, not hours"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security on Solana"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of successful creators"
  },
  {
    icon: Settings,
    title: "Easy to Use",
    description: "No coding required, intuitive interface"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance and engagement"
  },
  {
    icon: Gift,
    title: "Regular Updates",
    description: "New features added constantly"
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="gradient" className="mb-4 px-6 py-2 text-sm font-semibold">
            💎 Simple Pricing
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Choose Your{' '}
            <span className="gradient-text">Perfect Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge variant="gradient" className="px-4 py-1 text-sm font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-2 border-primary shadow-2xl' 
                  : 'hover:shadow-xl'
              } ${plan.nftPass ? 'bg-gradient-to-br from-primary/5 to-secondary/5' : ''}`}>
                {plan.nftPass && (
                  <>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-bl-full" />
                    <div className="absolute top-2 right-2">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                  </>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold gradient-text">
                      {plan.price}
                    </span>
                    <span className="text-2xl text-muted-foreground ml-2">
                      {plan.currency}
                    </span>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.period}
                    </div>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
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
                    className="w-full group"
                    onClick={() => {
                      if (plan.nftPass) {
                        document.getElementById('nft-pass')?.scrollIntoView({ behavior: 'smooth' })
                      } else {
                        window.open('https://app.wavelyz.io', '_blank')
                      }
                    }}
                  >
                    {plan.nftPass && <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />}
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="gradient-text">wavelyz</span>?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{benefit.title}</h4>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Check out our FAQ section or contact our support team for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View FAQ
                </Button>
                <Button 
                  variant="gradient" 
                  onClick={() => window.open('https://app.wavelyz.io', '_blank')}
                >
                  Start Building
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
