'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { ShareWidget } from '@/components/referral/ShareWidget'
import { trackEvent } from '@/lib/analytics/analytics-client'
import type { ConfirmationContext } from '@/lib/confirmation/types'

interface SuccessPageClientProps {
  context: ConfirmationContext
}

/**
 * Main client component for the personalized success/confirmation page.
 * Follows LP design system: bento layout, same breakpoints, spacing, typography.
 */
export function SuccessPageClient({ context }: SuccessPageClientProps) {
  const emailDisplay = context.purchaseEmail || 'your email'

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
    <div className="min-h-screen bg-[#232323] text-white font-sans">
      <div className="landing-container">
        {/* Header - Logo + Tagline - matches LP exactly */}
        <header className="pt-4 min-[800px]:pt-5 pb-24">
          <div className="logo-container w-fit">
            <Link href="/" className="flex flex-col">
              <Logo size="medium" darkMode className="logo-mobile" />
              <div className="tagline text-[10px] min-[800px]:text-[13px] font-light opacity-70 mt-1 flex justify-between">
                <span>V</span>
                <span>A</span>
                <span>L</span>
                <span>U</span>
                <span>E</span>
                <span>,</span>
                <span>&nbsp;</span>
                <span>C</span>
                <span>R</span>
                <span>Y</span>
                <span>S</span>
                <span>T</span>
                <span>A</span>
                <span>L</span>
                <span>L</span>
                <span>I</span>
                <span>Z</span>
                <span>E</span>
                <span>D</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Main content - matches LP gap pattern */}
        <div className="flex flex-col gap-20 min-[800px]:gap-24">
          {/* Section 1: Hero - Purchase Complete (full width) */}
          <section className="text-center">
            <h1 className="text-[48px] min-[800px]:text-[64px] font-thin leading-[1.1] mb-4">
              Purchase complete
            </h1>
            <p className="text-white/60 text-[18px] min-[800px]:text-[20px] tracking-[0.02em]">
              Thank you for your order
            </p>
            <p className="text-white/40 text-[16px] tracking-[0.02em] mt-2">
              Order #{context.orderRef}
            </p>
          </section>

          {/* Section 2: Bento - 3 equal columns on desktop, stacked on mobile */}
          <div className="flex flex-col gap-8 min-[800px]:grid min-[800px]:grid-cols-3 min-[800px]:gap-8">
            {/* Column 1: Now What */}
            <div className="p-8 bg-white/5 rounded-2xl">
              <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold tracking-[0.02em] mb-6">
                What happens next
              </h2>
              <div className="flex flex-col gap-4 text-[16px] min-[800px]:text-[18px] tracking-[0.02em] leading-[1.6]">
                <p className="text-white/80">
                  We&apos;re compiling your report now. In about 5 minutes,
                  we&apos;ll email a secure PDF link to:
                </p>
                <p className="text-white font-medium">{emailDisplay}</p>
                <p className="text-white/60 text-[14px] min-[800px]:text-[16px]">
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
            </div>

            {/* Column 2: Value */}
            <div className="p-8 bg-white/5 rounded-2xl">
              <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold tracking-[0.02em] mb-6">
                What you&apos;re getting
              </h2>
              <ul className="flex flex-col gap-4 text-[16px] min-[800px]:text-[18px] text-white/60 tracking-[0.02em] leading-[1.6]">
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>{context.issueCount} prioritized issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>
                    {context.impactLow} – {context.impactHigh}/mo estimated
                    impact
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>Difficulty rating for each issue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>Metrics with an explanation of why they matter</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Next Steps */}
            <div className="p-8 bg-white/5 rounded-2xl">
              <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold tracking-[0.02em] mb-6">
                What to do with it
              </h2>
              <ul className="flex flex-col gap-4 text-[16px] min-[800px]:text-[18px] text-white/60 tracking-[0.02em] leading-[1.6]">
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>Review your priority issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>Decide which to tackle yourself</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>Or share with whoever helps with your website</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>Contact us if you need help finding an agency</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Referral Share Widget (conditional) */}
          {context.referralCode && context.referralDiscountDisplay && (
            <ShareWidget
              code={context.referralCode}
              discountDisplay={context.referralDiscountDisplay}
            />
          )}

          {/* Section 4: Support - full width */}
          <section className="text-center pb-8">
            <p className="text-white/60 text-[18px] min-[800px]:text-[20px] tracking-[0.02em] leading-[1.6]">
              Still have questions?{' '}
              <a
                href="mailto:hello@anthrasite.io"
                className="text-white hover:text-white/80 underline underline-offset-4"
              >
                hello@anthrasite.io
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer - matches LP */}
      <LandingFooter />
    </div>
  )
}
