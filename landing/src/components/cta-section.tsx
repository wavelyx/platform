"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, Zap, ArrowRight, Star } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-purple-600 to-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Ready to build the future of{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Web3?
                </span>
                <br />
                Start with wavelyz today!
              </h2>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join thousands of developers and entrepreneurs who are already building the next generation of Solana applications.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="xl"
                  variant="glass"
                  className="group text-lg px-8 py-4 h-auto font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300"
                >
                  <Rocket className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  🚀 Be an Early Adopter
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>

                <Button
                  size="xl"
                  variant="outline"
                  className="text-lg px-8 py-4 h-auto font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 group"
                >
                  <Zap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  ⚡ Explore Platform
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-2xl">10K+</div>
                  <div className="text-sm">Happy Users</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-2xl">50K+</div>
                  <div className="text-sm">Tokens Created</div>
                </div>
              </div>
            </motion.div>

            {/* Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8">
                <CardContent className="text-center">
                  {/* Floating Rocket */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Rocket className="h-16 w-16 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    Launch Your Token
                  </h3>
                  <p className="text-white/80 mb-6">
                    Create, configure, and deploy your Solana token in minutes
                  </p>

                  {/* Feature List */}
                  <div className="space-y-3 text-left">
                    {[
                      "✅ No coding required",
                      "✅ 0.20 SOL cost only",
                      "✅ Instant deployment",
                      "✅ Full management tools",
                      "✅ 24/7 support"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="text-white/90 font-medium"
                      >
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-60 float-animation" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 float-animation" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 float-animation" style={{ animationDelay: '4s' }} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
