import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Skeleton } from '@/components/Skeleton'
import { PurchasePageClient } from '@/components/purchase/v2/PurchasePageClient'
import { StripeErrorBoundary } from '@/components/purchase/StripeErrorBoundary'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { validatePurchaseToken, lookupPurchaseContext } from '@/lib/purchase'
import type { PurchaseContext } from '@/lib/purchase'

export const dynamic = 'force-dynamic'

interface PurchasePageProps {
  searchParams: Promise<{
    sid?: string // JWT token (new pattern)
    utm?: string // Legacy UTM token (deprecated, for backward compat)
    preview?: string
  }>
}

/**
 * Error component for invalid/expired tokens
 */
function TokenError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#232323] text-white flex items-center justify-center font-sans">
      <div
        className="mx-auto p-8 text-center bg-[#232323]"
        style={{ width: '90vw', maxWidth: '28rem', minWidth: '300px' }}
      >
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
          contact support at hello@anthrasite.io
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#0066FF] text-white font-medium hover:bg-[#0052cc] transition-colors rounded"
        >
          Return Home
        </Link>
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

  // Feature flag for embedded checkput (default true)
  const useEmbeddedPayment = true

  return (
    <StripeErrorBoundary>
      <PurchasePageClient
        context={context}
        token={token}
        useEmbeddedPayment={useEmbeddedPayment}
      />
    </StripeErrorBoundary>
  )
}

function PurchasePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#232323] py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="h-12 w-3/4 mx-auto bg-white/10 animate-pulse rounded" />
        <div className="h-96 w-full rounded-2xl bg-white/10 animate-pulse" />
      </div>
    </div>
  )
}

export default async function PurchasePage(props: PurchasePageProps) {
  const searchParams = await props.searchParams
  const sid = searchParams.sid
  const utm = searchParams.utm

  const token = sid || utm

  if (!token) {
    redirect('/')
  }

  const payload = await validatePurchaseToken(token)

  if (!payload) {
    return <TokenError message="This link has expired or is invalid" />
  }

  const context = await lookupPurchaseContext(payload.leadId, payload.runId)

  if (!context) {
    return <TokenError message="Report not found for this link" />
  }

  return (
    <main className="bg-[#232323] text-white" data-testid="purchase-root">
      <Suspense fallback={<PurchasePageSkeleton />}>
        <PurchaseContent token={token} context={context} />
      </Suspense>
    </main>
  )
}
