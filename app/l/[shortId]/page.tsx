/**
 * Short Landing Link Page - /l/[shortId]
 *
 * Handles short, case-insensitive landing URLs (e.g., /l/k4m7np2q).
 * These replace long JWT tokens to prevent URL corruption in plain-text emails.
 *
 * Flow:
 * 1. Extract shortId from URL
 * 2. Call LeadShop API to get leadId/runId
 * 3. Look up landing context from database
 * 4. Render landing page with context
 */

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { lookupShortToken, lookupLandingContext } from '@/lib/landing/context'
import type { LandingContext } from '@/lib/landing/types'
import { LandingPageClient } from '@/app/landing/[token]/LandingPageClient'
import { LandingPageSkeleton } from '@/app/landing/[token]/loading'
import { ReferralToast } from '@/components/referral/ReferralToast'

export const dynamic = 'force-dynamic'

interface ShortLinkPageProps {
  params: Promise<{
    shortId: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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

async function LandingContent({
  shortId,
  context,
}: {
  shortId: string
  context: LandingContext
}) {
  // Pass shortId as the token - the client doesn't need to know the difference
  return <LandingPageClient context={context} token={shortId} />
}

export default async function ShortLinkPage(props: ShortLinkPageProps) {
  const params = await props.params
  const shortId = params.shortId

  if (!shortId) {
    redirect('/')
  }

  // Extract promo code from URL (e.g., ?promo=OUTAGE20)
  const sp = await props.searchParams
  const promoParam = typeof sp?.promo === 'string' ? sp.promo : null

  // Look up the short token from LeadShop API
  const { data: tokenData, error: tokenError } = await lookupShortToken(shortId)

  if (tokenError || !tokenData) {
    return <TokenError message={tokenError || 'This link is invalid.'} />
  }

  // Look up landing context using leadId and runId from token
  // Note: runId may be null for self-serve tokens (uses latest run)
  const context = await lookupLandingContext(
    tokenData.leadId,
    tokenData.runId || undefined
  )

  if (!context) {
    return <TokenError message="Report not found for this link" />
  }

  return (
    <main className="bg-[#232323] text-white" data-testid="landing-root">
      <ReferralToast promoCode={promoParam} silent />
      <Suspense fallback={<LandingPageSkeleton />}>
        <LandingContent shortId={shortId} context={context} />
      </Suspense>
    </main>
  )
}
