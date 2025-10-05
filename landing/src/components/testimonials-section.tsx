"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Alex Chen",
    role: "DeFi Developer",
    content: "I was amazed at how simple and affordable it is to launch a token with wavelyz. It's definitely the most budget-friendly option out there for token creators.",
    rating: 5,
    avatar: "AC",
  },
  {
    name: "Sarah Johnson",
    role: "Indie Developer",
    content: "Using wavelyz was a game changer for my small project. The platform's simplicity allowed me to launch my token without hiring a dev team.",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Mike Rodriguez",
    role: "Crypto Entrepreneur",
    content: "The simplicity of wavelyz is amazing. You come, make your token, and that's it. It's perfect for launching lots of tokens fast and without hassle.",
    rating: 5,
    avatar: "MR",
  },
  {
    name: "Emma Wilson",
    role: "Blockchain Consultant",
    content: "I keep using wavelyz because it's just so simple and cheaper than others. It's perfect for anyone who wants to launch tokens without knowing code.",
    rating: 5,
    avatar: "EW",
  },
  {
    name: "David Kim",
    role: "Web3 Founder",
    content: "What I love about wavelyz is that it's super user-friendly. Even if you're new to this, you can easily create your token and get going in no time.",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Lisa Zhang",
    role: "Token Creator",
    content: "Just popped my token out on wavelyz.io like it was nothing. Thought it'd be a brain buster but nah, smooth sailing.",
    rating: 5,
    avatar: "LZ",
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

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-purple-600 to-secondary relative overflow-hidden">
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
            💡 Platform Vision
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Why{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              wavelyz
            </span>{' '}
            is Different
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            We're building the platform we always wanted as Solana developers. 
            Join us in creating the future of token management.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-white/90 mb-6 leading-relaxed group-hover:text-white transition-colors duration-300">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-white/70">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">10K+</div>
            <div className="text-white/80 text-lg">Happy Users</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">50K+</div>
            <div className="text-white/80 text-lg">Tokens Created</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">99.9%</div>
            <div className="text-white/80 text-lg">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
