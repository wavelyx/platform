import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: 'Cookie Policy | Wavelyz',
  description: 'Cookie Policy for Wavelyz - Complete Solana DeFi Platform',
}

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit our website. They help us provide you with a better experience by remembering your 
                preferences and enabling certain functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Essential functionality and security</li>
                <li>User authentication and session management</li>
                <li>Analytics and performance monitoring</li>
                <li>Personalization and user preferences</li>
                <li>Marketing and advertising (with consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Essential Cookies</h4>
                  <p className="text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable basic 
                    functions like page navigation, access to secure areas, and user authentication.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Analytics Cookies</h4>
                  <p className="text-muted-foreground">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Preference Cookies</h4>
                  <p className="text-muted-foreground">
                    These cookies remember your choices and preferences to provide a more personalized experience.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Marketing Cookies</h4>
                  <p className="text-muted-foreground">
                    These cookies are used to track visitors across websites to display relevant and 
                    engaging advertisements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Google Analytics for website analytics</li>
                <li>Social media platforms for sharing features</li>
                <li>Payment processors for transaction handling</li>
                <li>Customer support tools for live chat</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Managing Your Cookie Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use our cookie consent banner to choose your preferences</li>
                <li>Modify your browser settings to block or delete cookies</li>
                <li>Use browser extensions to manage cookie permissions</li>
                <li>Opt-out of specific third-party services</li>
              </ul>
              <p className="text-muted-foreground">
                Note: Disabling certain cookies may affect the functionality of our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Different cookies have different retention periods:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Session cookies: Deleted when you close your browser</li>
                <li>Persistent cookies: Remain until they expire or are deleted</li>
                <li>Authentication cookies: Typically expire after 30 days</li>
                <li>Analytics cookies: Usually expire after 2 years</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any 
                material changes by posting the updated policy on our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about our use of cookies, please contact us at{' '}
                <a href="mailto:privacy@wavelyz.io" className="text-primary hover:underline">
                  privacy@wavelyz.io
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
