import { notFound } from 'next/navigation'
import {
  PurchaseHero,
  ReportPreview,
  TrustSignals,
  PricingCard,
} from '@/components/purchase'
import { StripeErrorBoundary } from '@/components/purchase/StripeErrorBoundary'
import { getReportPreview } from '@/lib/purchase/purchase-service'

// Development-only purchase page that bypasses middleware
export default function DevPurchasePage() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  // Mock business data for development
  const mockBusiness = {
    id: 'dev-business-123',
    name: 'Acme Corporation',
    domain: 'acme.example.com',
    email: 'contact@acme.example.com',
  }

  const mockReportPreview = {
    scores: {
      performance: 75,
      seo: 82,
      security: 90,
      accessibility: 88,
    },
    issues: [
      {
        category: 'Performance',
        impact: 'High',
        description: 'Large images are slowing down page load',
        estimatedRevenueLoss: 2500,
      },
      {
        category: 'SEO',
        impact: 'Medium',
        description: 'Missing meta descriptions on key pages',
        estimatedRevenueLoss: 1200,
      },
      {
        category: 'Security',
        impact: 'Low',
        description: 'Missing security headers',
        estimatedRevenueLoss: 500,
      },
    ],
    totalRevenueLoss: 4200,
  }

  // Mock checkout handler that creates a real Stripe session
  async function handleCheckout() {
    'use server'
    
    // In development, you can either:
    // 1. Create a real Stripe session with test keys
    // 2. Or just log for UI testing
    
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      // Real Stripe test checkout
      const { createCheckoutSession } = await import('@/lib/stripe/checkout')
      const session = await createCheckoutSession(
        mockBusiness.id,
        'dev-test-utm',
        {
          customerEmail: mockBusiness.email,
          metadata: {
            environment: 'development',
            businessName: mockBusiness.name,
            domain: mockBusiness.domain,
          },
        }
      )
      
      if (session?.url) {
        const { redirect } = await import('next/navigation')
        redirect(session.url)
      }
    } else {
      console.log('Dev checkout triggered - Stripe keys not configured')
      throw new Error('Stripe test keys not configured. Add sk_test_* keys to .env.local')
    }
  }

  return (
    <main className="min-h-screen bg-carbon text-white">
      <div className="fixed top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold z-50">
        DEV MODE
      </div>
      
      <StripeErrorBoundary>
        <div data-testid="purchase-hero">
          <PurchaseHero 
            businessName={mockBusiness.name} 
            domain={mockBusiness.domain} 
          />
        </div>

        <div data-testid="report-preview">
          <ReportPreview preview={mockReportPreview} />
        </div>

        <div data-testid="trust-signals">
          <TrustSignals />
        </div>

        <div data-testid="pricing-card">
          <PricingCard
            businessName={mockBusiness.name}
            utm="dev-utm-token"
            onCheckout={handleCheckout}
          />
        </div>
      </StripeErrorBoundary>

      {/* Development info panel */}
      <div className="fixed bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-sm">
        <h3 className="font-semibold mb-2">Development Info</h3>
        <div className="text-sm space-y-1 opacity-70">
          <p>Business: {mockBusiness.name}</p>
          <p>Domain: {mockBusiness.domain}</p>
          <p>Stripe: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20)}...</p>
        </div>
      </div>
    </main>
  )
}