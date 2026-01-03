import { Suspense } from 'react'
import { lookupConfirmationContext } from '@/lib/confirmation/context'
import { SuccessPageClient } from '@/components/confirmation'
import { LegacySuccessPage } from '@/components/purchase/LegacySuccessPage'
import Link from 'next/link'

// Force dynamic rendering - this page needs fresh Stripe data
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    session_id?: string
    payment_intent?: string
    purchase?: string
  }>
}

/**
 * Error component for invalid/missing session
 */
function SessionError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#232323] text-white flex items-center justify-center font-sans">
      <div
        className="mx-auto p-8 text-center"
        style={{ width: '90vw', maxWidth: '28rem', minWidth: '300px' }}
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-light mb-4">{message}</h1>
        <p className="text-white/60 mb-8">
          If you believe this is an error, please contact support at{' '}
          <a
            href="mailto:hello@anthrasite.io"
            className="text-[#0066FF] hover:underline"
          >
            hello@anthrasite.io
          </a>
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  )
}

/**
 * Loading fallback for Suspense
 */
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#232323] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-white/60">Loading your confirmation...</p>
      </div>
    </div>
  )
}

/**
 * Server component that handles the confirmation content
 */
async function ConfirmationContent({
  sessionId,
  paymentIntentId,
  purchaseId,
}: {
  sessionId: string | null
  paymentIntentId: string | null
  purchaseId: string | null
}) {
  // NEW: session_id flow with personalization
  // Only use personalized flow if session_id is the only param present
  if (sessionId && !paymentIntentId && !purchaseId) {
    const context = await lookupConfirmationContext(sessionId)

    if (context) {
      return <SuccessPageClient context={context} />
    }

    // Context lookup failed - show error
    // This could be: invalid session, unpaid, missing token, etc.
    return <SessionError message="Unable to verify your purchase" />
  }

  // LEGACY: payment_intent or purchase flows (backward compatibility)
  // Or: no params at all (error case)
  return (
    <LegacySuccessPage
      sessionId={sessionId}
      paymentIntentId={paymentIntentId}
      purchaseId={purchaseId}
    />
  )
}

/**
 * Purchase Success Page
 *
 * Handles multiple flows:
 * - NEW: session_id from Stripe Checkout → personalized confirmation
 * - LEGACY: payment_intent from Payment Element → generic confirmation
 * - LEGACY: purchase ID → generic confirmation
 */
export default async function PurchaseSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sessionId = params.session_id ?? null
  const paymentIntentId = params.payment_intent ?? null
  const purchaseId = params.purchase ?? null

  return (
    <Suspense fallback={<LoadingState />}>
      <ConfirmationContent
        sessionId={sessionId}
        paymentIntentId={paymentIntentId}
        purchaseId={purchaseId}
      />
    </Suspense>
  )
}
