'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { LandingContext, FAQItem } from '@/lib/landing/types'
import { trackEvent } from '@/lib/analytics/analytics-client'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueSection } from '@/components/landing/ValueSection'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { MobileStickyCTA } from '@/components/landing/MobileStickyCTA'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { SecureCheckout } from '@/components/landing/SecureCheckout'
import { RecentPurchaseModal } from '@/components/landing/RecentPurchaseModal'
import { getReferralCode, clearReferralCode } from '@/lib/referral/storage'
import { ReferralDiscountIndicator } from '@/components/landing/ReferralDiscountIndicator'

/** Recent purchase info from soft-gate check */
interface RecentPurchase {
  saleId: number
  purchasedAt: string
  email: string
}

/** Referral discount info from localStorage */
interface ReferralDiscount {
  code: string
  discountDisplay: string
  discountedPrice: number
}

interface LandingPageClientProps {
  context: LandingContext
  token: string
}

// Static FAQ content
const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What does Anthrasite do?',
    answer:
      'Our goal is to help small businesses. We analyze your website using industry-standard tools and visual assessments. Then we convert the findings into a prioritized list of what affects your business.',
  },
  {
    question: 'Do you actually look at my website?',
    answer:
      'Yes! We analyzed your specific site before reaching out. The score and issues you see are real findings from your site. We only contact you after confirming that we can help.',
  },
  {
    question: 'How is this different from free tools?',
    answer:
      "Free scans list metrics without context or interpretation. And they don't do a visual review. We help you understand what is actually important to your business and what the metrics mean. We focus on customer experience—how to help more people find and engage with you.",
  },
  {
    question: 'Where does the "Monthly Revenue Impact" number come from?',
    answer:
      "We estimate your baseline revenue using industry benchmarks. Then we calculate how much friction each issue typically costs for businesses like yours. The range shows uncertainty. It helps you prioritize but doesn't predict exact outcomes.",
  },
  {
    question: 'What happens after I purchase?',
    answer:
      'We compile the data into your personalized report and send you a secure link to download it. You should get it in under five minutes.',
  },
  {
    question: "What if it doesn't pay off?",
    answer:
      "The report pays for itself or it's free. Give it a real shot. If you don't see the value after 90 days, email us for a full refund.",
  },
]

/**
 * Get or create purchase attempt ID for idempotent checkout sessions.
 * Stored in sessionStorage so same tab = same checkout session.
 */
function getPurchaseAttemptId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()

  let attemptId = sessionStorage.getItem('purchase_attempt_id')
  if (!attemptId) {
    attemptId = crypto.randomUUID()
    sessionStorage.setItem('purchase_attempt_id', attemptId)
  }
  return attemptId
}

/**
 * Clear purchase attempt ID to force new checkout session.
 * Used when user intentionally wants to buy again.
 */
function clearPurchaseAttemptId(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('purchase_attempt_id')
  }
}

export function LandingPageClient({ context, token }: LandingPageClientProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [recentPurchase, setRecentPurchase] = useState<RecentPurchase | null>(
    null
  )
  const [showRecentPurchaseModal, setShowRecentPurchaseModal] = useState(false)
  const [referralDiscount, setReferralDiscount] =
    useState<ReferralDiscount | null>(null)

  // Load referral code from localStorage on mount
  useEffect(() => {
    const stored = getReferralCode()
    if (stored) {
      // Calculate discounted price based on stored discount
      // Parse discount from discountDisplay (e.g., "$100 off" or "50% off")
      let discountedPrice = context.price
      const fixedMatch = stored.discountDisplay.match(/\$(\d+)\s*off/i)
      const percentMatch = stored.discountDisplay.match(/(\d+)%\s*off/i)

      if (fixedMatch) {
        discountedPrice = Math.max(
          0,
          context.price - parseInt(fixedMatch[1], 10)
        )
      } else if (percentMatch) {
        const percentOff = parseInt(percentMatch[1], 10)
        discountedPrice = Math.max(
          0,
          Math.round((context.price * (100 - percentOff)) / 100)
        )
      }

      setReferralDiscount({
        code: stored.code,
        discountDisplay: stored.discountDisplay,
        discountedPrice,
      })

      trackEvent('referral_discount_loaded', {
        code: stored.code,
        discount_display: stored.discountDisplay,
        original_price: context.price,
        discounted_price: discountedPrice,
      })
    }
  }, [context.price])

  // Handle removing referral discount
  const handleRemoveReferral = useCallback(() => {
    clearReferralCode()
    setReferralDiscount(null)
    trackEvent('referral_discount_removed', {
      code: referralDiscount?.code,
    })
  }, [referralDiscount?.code])

  // Track landing page view on mount
  const hasTrackedView = useRef(false)
  useEffect(() => {
    if (hasTrackedView.current) return
    hasTrackedView.current = true

    trackEvent('landing_view', {
      lead_id: context.leadId,
      business_name: context.company,
      domain: context.domainUrl,
      score: context.score,
      issue_count: context.issueCount,
      impact_low: context.impactLow,
      impact_high: context.impactHigh,
      referral_code: referralDiscount?.code,
    })
  }, [context, referralDiscount?.code])

  const handleCheckout = useCallback(
    async (eventOrOptions?: React.MouseEvent | { skipSoftGate?: boolean }) => {
      // Handle both onClick (MouseEvent) and programmatic calls (options object)
      const options =
        eventOrOptions && 'skipSoftGate' in eventOrOptions
          ? eventOrOptions
          : undefined

      if (isCheckoutLoading) return

      // Track checkout click
      trackEvent('landing_checkout_click', {
        lead_id: context.leadId,
        business_name: context.company,
        price: context.price,
      })

      setIsCheckoutLoading(true)
      setCheckoutError(null)

      try {
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId: context.businessId,
            leadId: context.leadId,
            contactId: context.contactId,
            purchaseAttemptId: getPurchaseAttemptId(),
            token,
            skipSoftGate: options?.skipSoftGate ?? false,
            // Include referral code if present
            referralCode: referralDiscount?.code,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create checkout session')
        }

        const data = await response.json()

        // Soft-gate: recent purchase detected
        if (data.recentPurchase) {
          setRecentPurchase(data.recentPurchase)
          setShowRecentPurchaseModal(true)
          setIsCheckoutLoading(false)
          return
        }

        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (error) {
        console.error('Checkout error:', error)
        setCheckoutError('Unable to start checkout. Please try again.')
        setIsCheckoutLoading(false)
      }
    },
    [
      context.businessId,
      context.leadId,
      context.contactId,
      token,
      isCheckoutLoading,
      referralDiscount?.code,
    ]
  )

  // Handle resend email from recent purchase modal
  const handleResendEmail = useCallback(async () => {
    if (!recentPurchase) return

    try {
      const response = await fetch('/api/resend-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: recentPurchase.saleId }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend email')
      }

      // Close modal and show success message
      setShowRecentPurchaseModal(false)
      setCheckoutError(null)
      // Could add a success toast here
    } catch (error) {
      console.error('Resend error:', error)
      setCheckoutError('Unable to resend email. Please try again.')
    }
  }, [recentPurchase])

  // Handle buy again from recent purchase modal
  const handleBuyAgain = useCallback(() => {
    // Clear attempt ID so a fresh checkout session is created
    clearPurchaseAttemptId()
    setShowRecentPurchaseModal(false)
    setRecentPurchase(null)
    // Trigger checkout flow again, skipping soft-gate since user explicitly chose to buy again
    handleCheckout({ skipSoftGate: true })
  }, [handleCheckout])

  return (
    <div className="min-h-screen">
      {/* Hero Section - Dark background */}
      <div className="bg-[#232323]">
        <div className="landing-container">
          <div className="flex flex-col gap-20 min-[800px]:gap-24 pb-20 min-[800px]:pb-24">
            <HeroSection
              company={context.company}
              score={context.score}
              issueCount={context.issueCount}
              impactHigh={context.impactHigh}
              hookOpportunity={context.hookOpportunity}
              desktopScreenshotUrl={context.desktopScreenshotUrl}
              price={context.price}
              isLoading={isCheckoutLoading}
              onCheckout={handleCheckout}
              referralDiscount={referralDiscount}
            />
          </div>
        </div>
      </div>

      {/* Rest of page - Light background */}
      <div className="bg-[#F8F9FA]">
        <div className="landing-container">
          <div className="flex flex-col gap-20 min-[800px]:gap-24 py-20 min-[800px]:py-24">
            {/* Bento layout: Header full width, then Value (2/3) + Card (1/3), then Dollar full width */}
            <div className="flex flex-col gap-24">
              {/* Section Header - full width */}
              <section aria-labelledby="value-heading" className="text-center">
                <div className="flex flex-col gap-8">
                  <h2
                    id="value-heading"
                    className="text-slate-900 text-[28px] min-[800px]:text-[32px] font-semibold leading-tight tracking-[0.02em]"
                  >
                    What&apos;s in your report
                  </h2>
                  <p className="text-slate-600 text-[18px] min-[800px]:text-[20px] max-w-xl mx-auto leading-[1.6] tracking-[0.02em]">
                    A detailed analysis of {context.company}, organized by what
                    matters most to your bottom line.
                  </p>
                </div>
              </section>

              {/* Row: Value list (2/3 left) + Card (1/3 right) on desktop */}
              <div className="flex flex-col gap-24 min-[800px]:grid min-[800px]:grid-cols-[2fr_1fr] min-[800px]:gap-12 min-[800px]:items-start">
                {/* Value bullet list (2/3 left) */}
                <ValueSection
                  company={context.company}
                  issueCount={context.issueCount}
                  hideHeader
                />

                {/* Issue Brief Card (1/3 right) */}
                <div className="p-8 min-[800px]:p-10 bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
                  <h2
                    id="hook-heading"
                    className="text-slate-900 text-[20px] font-semibold tracking-[0.02em] pb-4 mb-4 border-b border-slate-200"
                  >
                    Your site&apos;s biggest issue
                  </h2>
                  <p className="text-slate-600 text-[20px] leading-[1.6] tracking-[0.02em]">
                    {(() => {
                      const desc = context.hookOpportunity.description
                      const match = desc.match(/is that\s+(.*)$/i)
                      if (match && match[1]) {
                        // Capitalize first letter of extracted text
                        return (
                          match[1].charAt(0).toUpperCase() + match[1].slice(1)
                        )
                      }
                      return desc
                    })()}
                  </p>
                </div>
              </div>

              {/* Format Line - full width centered */}
              <p className="text-center text-slate-600 text-[18px] min-[800px]:text-[20px] font-medium tracking-[0.02em]">
                PDF, delivered to your inbox in minutes.
              </p>

              {/* Dollar Range (full width) */}
              <p
                className="text-center text-slate-600 text-[20px] min-[800px]:text-[24px] tracking-[0.02em]"
                aria-label={`Estimated monthly impact: ${context.impactLow} to ${context.impactHigh} dollars`}
              >
                We estimate you&apos;re leaving{' '}
                <span className="text-slate-900 font-semibold">
                  {context.impactLow} – {context.impactHigh}
                </span>{' '}
                on the table every month.
              </p>

              {/* CTA Button - Hidden on mobile (sticky CTA handles it) */}
              <div className="hidden min-[800px]:flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    trackEvent('cta_click', { location: 'value_section' })
                    handleCheckout()
                  }}
                  disabled={isCheckoutLoading}
                  className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] disabled:cursor-not-allowed"
                >
                  {isCheckoutLoading ? (
                    <span>Redirecting...</span>
                  ) : (
                    <span>
                      Get Your Report –{' '}
                      {referralDiscount?.discountedPrice !== undefined &&
                      referralDiscount.discountedPrice < context.price ? (
                        <>
                          <span className="line-through opacity-60">
                            ${context.price}
                          </span>{' '}
                          ${referralDiscount.discountedPrice}
                        </>
                      ) : (
                        `$${context.price}`
                      )}
                    </span>
                  )}
                </button>
                <SecureCheckout />
              </div>
            </div>

            {/* Testimonials - Social Proof */}
            <TestimonialsSection />

            {/* CTA + Guarantee */}
            <section aria-labelledby="cta-heading">
              <CTASection
                company={context.company}
                issueCount={context.issueCount}
                impactLow={context.impactLow}
                impactHigh={context.impactHigh}
                price={context.price}
                discountedPrice={referralDiscount?.discountedPrice}
                isLoading={isCheckoutLoading}
                onCheckout={handleCheckout}
                error={checkoutError}
              />
            </section>

            {/* Section 6: FAQ */}
            <section aria-labelledby="faq-heading">
              <FAQSection items={FAQ_ITEMS} />
            </section>
          </div>
        </div>

        {/* Footer */}
        <LandingFooter />
      </div>

      {/* Referral Discount Indicator - shows at bottom when discount active */}
      {referralDiscount && (
        <ReferralDiscountIndicator
          discountDisplay={referralDiscount.discountDisplay}
          onDismiss={handleRemoveReferral}
        />
      )}

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        price={context.price}
        isLoading={isCheckoutLoading}
        onCheckout={handleCheckout}
        discountedPrice={referralDiscount?.discountedPrice}
      />

      {/* Recent Purchase Modal (soft-gate) */}
      {showRecentPurchaseModal && recentPurchase && (
        <RecentPurchaseModal
          purchase={recentPurchase}
          onResendEmail={handleResendEmail}
          onBuyAgain={handleBuyAgain}
          onClose={() => setShowRecentPurchaseModal(false)}
        />
      )}
    </div>
  )
}
