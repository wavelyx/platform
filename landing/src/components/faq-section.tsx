"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, MessageCircle, Twitter } from "lucide-react"

const faqs = [
  {
    question: "What is wavelyz?",
    answer: "wavelyz is a user-friendly platform that allows you to create Solana tokens quickly and easily. With wavelyz, you can create your token without any coding knowledge, making it perfect for anyone who wants to launch a token."
  },
  {
    question: "What are the benefits of using wavelyz?",
    answer: "wavelyz has a range of features that make it the perfect choice for token creation and management. It's fast, affordable, and user-friendly, making it the ideal platform for anyone who wants to create a token."
  },
  {
    question: "How much does it cost to create a Solana token on wavelyz?",
    answer: "Creating your token is super affordable, at only 0.20 SOL, which includes all you need for token issuance and utility features."
  },
  {
    question: "What kind of tokens can I create on wavelyz?",
    answer: "You can create a wide range of tokens on wavelyz, including meme tokens, utility tokens, security tokens, and more. Whatever your token idea, wavelyz can help you bring it to life."
  },
  {
    question: "Why should I use wavelyz for my token creation?",
    answer: "wavelyz simplifies the process with an intuitive interface, no coding required. It offers advanced management tools, prioritizes security, and stands out as the most cost-effective platform for creating and managing your Solana tokens."
  },
  {
    question: "Can I create a Solana token without coding knowledge?",
    answer: "All you need is a token idea and a Solana wallet. We handle the technical stuff, so you don't have to worry about coding or complex blockchain interactions."
  },
  {
    question: "Who can use wavelyz?",
    answer: "wavelyz is designed for anyone who wants to create a token on Solana, whether you're an individual, a business, or a developer. It's perfect for launching tokens quickly and easily, without the need for coding knowledge."
  }
]

export function FAQSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
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
            ❓ Need Help?
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about wavelyz and how to get started with your Solana project.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Still have questions?</CardTitle>
              <CardDescription className="text-lg">
                Our team is here to help! Chat with us on Telegram or follow us on Twitter for the latest updates, 
                tutorials, and community discussions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="group hover:bg-black hover:text-white transition-all duration-300"
              >
                <Twitter className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Follow on Twitter
              </Button>
              <Button
                variant="gradient"
                size="lg"
                className="group"
              >
                <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Join Telegram
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
