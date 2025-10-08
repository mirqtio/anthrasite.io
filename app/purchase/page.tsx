import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import {
  PurchaseHero,
  ReportPreview,
  TrustSignals,
  PricingCard,
} from '@/components/purchase'
import { PaymentElementWrapper } from '@/components/purchase/PaymentElementWrapper'
import {
  fetchBusinessByUTM,
  getReportPreview,
  createCheckoutSession,
} from '@/lib/purchase/purchase-service'
import { Skeleton } from '@/components/Skeleton'
import { StripeErrorBoundary } from '@/components/purchase/StripeErrorBoundary'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { trackEvent } from '@/lib/analytics/analytics-server'

export const dynamic = 'force-dynamic'

interface PurchasePageProps {
  searchParams: {
    utm?: string
    preview?: string // Optional param to show interstitial page
  }
}

async function PurchaseContent({
  utm,
  preview,
}: {
  utm: string
  preview?: string
}) {
  // Fetch business data
  const purchaseData = await fetchBusinessByUTM(utm)

  if (!purchaseData) {
    notFound()
  }

  const { business, isValid } = purchaseData

  // Check if Payment Element is enabled
  const usePaymentElement =
    process.env.NEXT_PUBLIC_USE_PAYMENT_ELEMENT === 'true'

  // Check if we should show interstitial page (preview param, invalid token, or Payment Element enabled)
  const showInterstitial = preview === 'true' || !isValid || usePaymentElement

  // If valid and no override and not using Payment Element, go directly to Stripe Checkout
  if (!showInterstitial) {
    try {
      // Track direct checkout attempt
      await trackEvent('direct_checkout_attempt', {
        business_id: business.id,
        domain: business.domain,
        utm_token: utm,
      })

      const session = await createCheckoutSession(business.id, utm)

      if (session) {
        // Track successful session creation
        await trackEvent('checkout_session_created', {
          session_id: session.id,
          business_id: business.id,
          amount_cents: session.amountCents,
          flow_type: 'direct',
        })

        // Redirect directly to Stripe Checkout
        redirect(session.url)
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      // Fall through to show the interstitial page on error
    }
  }

  // Show interstitial page for invalid tokens or if checkout failed
  const reportPreview = getReportPreview(business)

  // Server action for manual checkout (if they end up on the page)
  async function handleCheckout() {
    'use server'

    try {
      // Track manual checkout attempt
      await trackEvent('manual_checkout_attempt', {
        business_id: business.id,
        domain: business.domain,
        utm_token: utm,
      })

      const session = await createCheckoutSession(business.id, utm)

      if (session) {
        // Track successful session creation
        await trackEvent('checkout_session_created', {
          session_id: session.id,
          business_id: business.id,
          amount_cents: session.amountCents,
          flow_type: 'manual',
        })

        // Redirect to Stripe Checkout
        redirect(session.url)
      } else {
        // Track failure
        await trackEvent('checkout_session_failed', {
          business_id: business.id,
          utm_token: utm,
        })

        throw new Error('Failed to create checkout session. Please try again.')
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      if (error.message.includes('redirect')) {
        throw error // Let Next.js handle the redirect
      }

      throw new Error(
        error.message ||
          'Unable to process checkout. Please try again or contact support.'
      )
    }
  }

  return (
    <StripeErrorBoundary>
      <PurchaseHero businessName={business.name} domain={business.domain} />

      <ReportPreview preview={reportPreview} />

      <TrustSignals />

      {/* Conditional rendering: Payment Element (new) vs Redirect flow (legacy) */}
      {usePaymentElement && isValid ? (
        <section className="py-12 md:py-16">
          <div className="px-10 max-w-[600px] mx-auto">
            <PaymentElementWrapper
              businessId={business.id}
              businessName={business.name}
              utm={utm}
            />
          </div>
        </section>
      ) : (
        <PricingCard
          businessName={business.name}
          utm={utm}
          onCheckout={handleCheckout}
        />
      )}

      {/* Warning if UTM has been used */}
      {!isValid && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-accent/10 border border-accent/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
          <p className="text-sm text-accent">
            This purchase link has already been used. If you need assistance,
            please contact support.
          </p>
        </div>
      )}
    </StripeErrorBoundary>
  )
}

function PurchasePageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/10" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-5 w-1/2 mx-auto bg-white/10" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-white/10" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>
    </>
  )
}

export default async function PurchasePage({
  searchParams,
}: PurchasePageProps) {
  const utm = searchParams.utm
  const preview = searchParams.preview

  if (!utm) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-carbon text-white">
      <Suspense fallback={<PurchasePageSkeleton />}>
        <PurchaseContent utm={utm} preview={preview} />
      </Suspense>
    </main>
  )
}
