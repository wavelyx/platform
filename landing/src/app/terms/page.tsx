import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: 'Terms of Service | Wavelyz',
  description: 'Terms of Service for Wavelyz - Complete Solana DeFi Platform',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Badge variant="outline">Legal</Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing and using Wavelyz, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Wavelyz provides a comprehensive Solana DeFi platform including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Token creation and management tools</li>
                <li>Trading and market creation features</li>
                <li>Distribution and multisender capabilities</li>
                <li>Analytics and portfolio management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                As a user of Wavelyz, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the service for illegal or unauthorized purposes</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Platform Pass and Premium Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Premium features are available through our Platform Pass NFT:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Platform Pass provides lifetime access to premium features</li>
                <li>NFT ownership is verified on-chain</li>
                <li>Features may be updated or modified at our discretion</li>
                <li>Refunds are not available for Platform Pass purchases</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Wavelyz is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Uninterrupted or error-free service</li>
                <li>Security of transactions or data</li>
                <li>Compatibility with all devices or networks</li>
                <li>Results from using our services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Risk Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Using DeFi services involves significant risks:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Smart contract risks and potential bugs</li>
                <li>Market volatility and price fluctuations</li>
                <li>Regulatory changes and compliance requirements</li>
                <li>Technology risks and network congestion</li>
              </ul>
              <p className="text-muted-foreground font-medium">
                You should only invest what you can afford to lose.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may terminate or suspend your access to our service immediately, without prior notice, 
                for any reason, including breach of these Terms of Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes via email or platform notification. Continued use constitutes acceptance 
                of the modified terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@wavelyz.io" className="text-primary hover:underline">
                  legal@wavelyz.io
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
