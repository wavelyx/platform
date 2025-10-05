"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Rocket, 
  Zap, 
  Camera, 
  Store, 
  Lock, 
  Gem, 
  Users, 
  Shield,
  TrendingUp,
  Settings,
  BarChart3,
  Globe
} from "lucide-react"

const features = [
  {
    icon: Rocket,
    title: "Token Creation",
    description: "Create SPL tokens with custom metadata in minutes",
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Multisender",
    description: "Bulk distribute tokens to thousands of wallets",
    color: "from-yellow-500 to-orange-500",
    gradient: "bg-gradient-to-br from-yellow-500 to-orange-500",
  },
  {
    icon: Camera,
    title: "Snapshot Tool",
    description: "Take snapshots of token holders for airdrops",
    color: "from-green-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
  },
  {
    icon: Store,
    title: "OpenBook Markets",
    description: "Create and manage DEX markets seamlessly",
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    icon: Lock,
    title: "Token Management",
    description: "Mint, burn, freeze, and manage authorities",
    color: "from-red-500 to-rose-500",
    gradient: "bg-gradient-to-br from-red-500 to-rose-500",
  },
  {
    icon: Gem,
    title: "Raydium Integration",
    description: "Advanced DeFi features and liquidity pools",
    color: "from-indigo-500 to-purple-500",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Community Tools",
    description: "Build and manage your token community",
    color: "from-teal-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Enterprise-grade security and monitoring",
    color: "from-gray-500 to-slate-500",
    gradient: "bg-gradient-to-br from-gray-500 to-slate-500",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track performance and user engagement",
    color: "from-amber-500 to-yellow-500",
    gradient: "bg-gradient-to-br from-amber-500 to-yellow-500",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
}

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
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
            🚀 Revolutionary Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Build & Scale</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            wavelyz is designed to be the most comprehensive and user-friendly platform for Solana token creation. 
            We've built the tools we wished existed when we started building on Solana.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <Badge variant="outline" className="w-fit mx-auto mb-4 px-4 py-2">
                🎯 Live Demo - Token Creation
              </Badge>
              <CardTitle className="text-2xl font-bold gradient-text">
                See It In Action
              </CardTitle>
              <CardDescription className="text-lg">
                Watch how easy it is to create and manage your Solana tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold">Create Token</div>
                    <div className="text-sm text-muted-foreground">In seconds</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold">Configure</div>
                    <div className="text-sm text-muted-foreground">Custom settings</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-semibold">Launch</div>
                    <div className="text-sm text-muted-foreground">Go live instantly</div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-green-800 dark:text-green-200">
                      Success! Token created successfully
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Your token is now live on the Solana blockchain
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
