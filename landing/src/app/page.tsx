import { Navigation } from "@/components/navigation"
import { HeroSectionV2 } from "@/components/hero-section-v2"
import { FeaturesSectionV2 } from "@/components/features-section-v2"
import { PricingNFTSection } from "@/components/pricing-nft-section"
import { TestimonialsSectionV2 } from "@/components/testimonials-section-v2"
import { FAQSectionV2 } from "@/components/faq-section-v2"
import { CTASectionV2 } from "@/components/cta-section-v2"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section - Full viewport height with clear CTA */}
      <HeroSectionV2 />
      
      {/* Features - Show what the platform offers */}
      <FeaturesSectionV2 />
      
      {/* Pricing & NFT Pass - Combined into one section with modal */}
      <PricingNFTSection />
      
      {/* Social Proof - Testimonials */}
      <TestimonialsSectionV2 />
      
      {/* FAQ - Address common concerns */}
      <FAQSectionV2 />
      
      {/* Final CTA - Drive conversions */}
      <CTASectionV2 />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}
