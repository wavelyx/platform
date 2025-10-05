"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Rocket, 
  Zap, 
  Camera, 
  Store, 
  Lock, 
  BarChart3,
  Shield,
  Users,
  Settings
} from "lucide-react"

const mainFeatures = [
  {
    icon: Rocket,
    title: "Token Creation",
    description: "Create SPL tokens with custom metadata in seconds. No coding required.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Instant Distribution",
    description: "Send tokens to thousands of wallets simultaneously with our multisender.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Lock,
    title: "Authority Management",
    description: "Full control over mint, freeze, and update authorities.",
    gradient: "from-purple-500 to-pink-500",
  },
]

const additionalFeatures = [
  {
    icon: Camera,
    title: "Snapshot Tool",
    description: "Capture token holder data for airdrops",
  },
  {
    icon: Store,
    title: "DEX Integration",
    description: "Create markets on OpenBook & Raydium",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Audited smart contracts & secure infrastructure",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track token performance and holder metrics",
  },
  {
    icon: Users,
    title: "Community Tools",
    description: "Built-in tools for community management",
  },
  {
    icon: Settings,
    title: "Custom Metadata",
    description: "Full control over token properties",
  },
]

export function FeaturesSectionV2() {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-6 px-6 py-2">
            PLATFORM FEATURES
          </Badge>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional tools that make token creation and management simple, secure, and scalable.
          </p>
        </motion.div>

        {/* Main features grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex items-start space-x-4 p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
