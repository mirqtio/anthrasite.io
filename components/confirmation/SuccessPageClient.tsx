'use client'

import { useEffect } from 'react'
import { ConfirmationHero } from './ConfirmationHero'
import { PurchaseSummary } from './PurchaseSummary'
import { ExpectationBlock } from './ExpectationBlock'
import { DeliveryBlock } from './DeliveryBlock'
import { ConfirmationFAQ } from './ConfirmationFAQ'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { trackEvent } from '@/lib/analytics/analytics-client'
import type { ConfirmationContext } from '@/lib/confirmation/types'

interface SuccessPageClientProps {
  context: ConfirmationContext
}

/**
 * Main client component for the personalized success/confirmation page.
 * Displays purchase confirmation with personalized lead data.
 */
export function SuccessPageClient({ context }: SuccessPageClientProps) {
  // Track page view on mount
  useEffect(() => {
    trackEvent('purchase_success_page_viewed', {
      sessionId: context.sessionId,
      leadId: context.leadId,
      runId: context.runId || undefined,
      flow: 'checkout_session_personalized',
      hasCompany: !!context.company,
      hasDomain: !!context.domain,
      hasEmail: !!context.purchaseEmail,
    })
  }, [context])

  return (
    <main className="min-h-screen bg-[#232323] text-white font-sans">
      <div className="landing-container py-12 min-[800px]:py-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-8 min-[800px]:gap-10">
          {/* Hero: Success message + order ref */}
          <ConfirmationHero orderRef={context.orderRef} />

          {/* Purchase Summary: What you bought */}
          <PurchaseSummary
            company={context.company}
            domain={context.domain}
            price={context.price}
          />

          {/* Expectation Block: Timeline + what's happening */}
          <ExpectationBlock company={context.company} />

          {/* Delivery Block: How you'll get the report */}
          <DeliveryBlock purchaseEmail={context.purchaseEmail} />

          {/* FAQ */}
          <ConfirmationFAQ />

          {/* Support CTA */}
          <div className="text-center py-6 border-t border-white/10">
            <p className="text-white/60 text-[14px] min-[800px]:text-[16px] tracking-[0.02em] mb-4">
              Need help? Reply to your receipt email and we&apos;ll take care of
              it.
            </p>
            <a
              href="mailto:reports@anthrasite.io"
              className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-[14px] min-[800px]:text-[16px] font-medium tracking-[0.02em] hover:bg-white/10 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LandingFooter />
    </main>
  )
}
