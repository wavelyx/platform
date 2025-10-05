"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How much does it cost to create a token?",
    answer: "Creating a token costs only 0.20 SOL, which includes all necessary fees for token issuance and basic features. For advanced features, you can upgrade to our Pro plan or get the Platform Pass for lifetime premium access."
  },
  {
    question: "Do I need coding knowledge?",
    answer: "No coding knowledge is required! wavelyz is designed to be completely user-friendly. Our intuitive interface guides you through every step of the token creation process."
  },
  {
    question: "How long does it take to create a token?",
    answer: "Most users can create and deploy their token in under 2 minutes. The process is streamlined and automated, requiring just a few clicks and basic information about your token."
  },
  {
    question: "What kind of tokens can I create?",
    answer: "You can create any type of SPL token on Solana, including utility tokens, governance tokens, meme tokens, and more. Full customization of metadata, supply, and properties is available."
  },
  {
    question: "Is it secure?",
    answer: "Yes! wavelyz uses audited smart contracts and follows best security practices. Your wallet remains in your control at all times, and we never have access to your private keys."
  },
]

export function FAQSectionV2() {
  return (
    <section id="faq" className="py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about wavelyz
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-6 bg-card/50 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Still have questions? We're here to help!
          </p>
          <Button 
            variant="outline" 
            size="lg"
            className="group"
            onClick={() => window.open('https://t.me/wavelyz', '_blank')}
          >
            <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            Chat with Support
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
