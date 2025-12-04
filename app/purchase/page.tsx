import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { PurchaseHero, TrustSignals, PricingCard } from '@/components/purchase'
import { Skeleton } from '@/components/Skeleton'
import { StripeErrorBoundary } from '@/components/purchase/StripeErrorBoundary'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { isPaymentElementEnabled } from '@/lib/feature-flags'
import { PaymentElementWrapper } from '@/components/purchase/PaymentElementWrapper'
import { validatePurchaseToken, lookupPurchaseContext } from '@/lib/purchase'
import type { PurchaseContext } from '@/lib/purchase'
import { IssuesPreview } from '@/components/purchase/IssuesPreview'

export const dynamic = 'force-dynamic'

interface PurchasePageProps {
  searchParams: Promise<{
    sid?: string // JWT token (new pattern)
    utm?: string // Legacy UTM token (deprecated, for backward compat)
    preview?: string
  }>
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Error component for invalid/expired tokens
 */
function TokenError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-carbon text-white flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-light mb-4">{message}</h1>
        <p className="text-white/60 mb-8">
          If you believe this is an error, please reply to the original email or
          contact support at reports@anthrasite.io
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-accent text-carbon rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  )
}

async function PurchaseContent({
  token,
  context,
}: {
  token: string
  context: PurchaseContext
}) {
  const useEmbeddedPayment = isPaymentElementEnabled()

  // Track page view
  await trackEvent('purchase_page.view', {
    lead_id: context.leadId,
    run_id: context.runId,
    business_name: context.businessName,
    domain: context.domainUrl,
    impact_monthly_low: context.impactMonthlyLow,
    impact_monthly_high: context.impactMonthlyHigh,
    issue_count: context.issues.length,
  })

  // Format the impact range for display
  const impactLow = formatCurrency(context.impactMonthlyLow)
  const impactHigh = formatCurrency(context.impactMonthlyHigh)

  return (
    <StripeErrorBoundary>
      {/* Hero with business name and impact summary */}
      <header className="py-8 md:py-10" data-testid="purchase-header">
        <div className="px-10 max-w-[1200px] mx-auto">
          {/* Logo */}
          <div className="mb-12 text-center">
            <div className="text-[28px] font-light tracking-wide">
              ANTHRASITE
            </div>
            <div className="text-[17px] font-light tracking-[0.3em] opacity-70 mt-[2px]">
              VALUE, CRYSTALLIZED
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-[48px] font-light mb-4">
              {context.businessName}, your audit is complete
            </h1>
            <p className="text-[24px] opacity-70 mb-2">
              We identified{' '}
              <span className="text-accent font-medium">
                {impactLow} – {impactHigh}
              </span>{' '}
              in monthly revenue at risk
            </p>
            <p className="text-[18px] opacity-50">on {context.domainUrl}</p>
          </div>

          <div className="mt-12 h-px bg-white/10" />
        </div>
      </header>

      {/* Issues Preview - Real Phase C Data */}
      <IssuesPreview
        issues={context.issues}
        impactLow={impactLow}
        impactHigh={impactHigh}
      />

      <TrustSignals />

      {/* Payment Section */}
      {useEmbeddedPayment ? (
        <section className="py-12 md:py-16" aria-label="Secure payment">
          <div className="container mx-auto px-4 max-w-2xl">
            <PaymentElementWrapper
              businessId={String(context.leadId)}
              businessName={context.businessName}
              utm={token}
              tier="basic"
              leadId={String(context.leadId)}
            />
          </div>
        </section>
      ) : (
        <PricingCard
          businessName={context.businessName}
          utm={token}
          onCheckout={async () => {
            'use server'
            // TODO: Implement checkout with JWT token
            throw new Error('Checkout not implemented for JWT flow yet')
          }}
        />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl bg-white/10" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>
    </>
  )
}

export default async function PurchasePage(props: PurchasePageProps) {
  const searchParams = await props.searchParams
  const sid = searchParams.sid
  const utm = searchParams.utm // Legacy support

  // Prefer sid (JWT), fall back to utm for backward compatibility
  const token = sid || utm

  if (!token) {
    redirect('/')
  }

  // Validate JWT token
  const payload = await validatePurchaseToken(token)

  if (!payload) {
    return <TokenError message="This link has expired or is invalid" />
  }

  // Look up purchase context from database
  const context = await lookupPurchaseContext(payload.leadId, payload.runId)

  if (!context) {
    return <TokenError message="Report not found for this link" />
  }

  return (
    <main
      className="min-h-screen bg-carbon text-white"
      data-testid="purchase-root"
    >
      <Suspense fallback={<PurchasePageSkeleton />}>
        <PurchaseContent token={token} context={context} />
      </Suspense>
    </main>
  )
}
