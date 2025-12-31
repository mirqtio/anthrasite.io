'use client'

import { useState, useCallback } from 'react'
import type { LandingContext, FAQItem } from '@/lib/landing/types'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueSection } from '@/components/landing/ValueSection'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { MobileStickyCTA } from '@/components/landing/MobileStickyCTA'

interface LandingPageClientProps {
  context: LandingContext
  token: string
}

// Static FAQ content
const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Who is Anthrasite?',
    answer:
      "We analyze small business websites using a combination of industry-leading tools, established standards, and our own visual assessment. Then we translate the results into a prioritized list of what's actually affecting your business.",
  },
  {
    question: 'Is this legitimate?',
    answer:
      "Yes. We're a real company that helps small businesses understand their web presence. The screenshots and analysis in this report are generated from your actual website. If you have questions, you can reply directly to the email that brought you here.",
  },
  {
    question: 'How accurate is the revenue estimate?',
    answer:
      'Our revenue estimates are based on industry benchmarks and your specific traffic patterns. While individual results vary, we use conservative assumptions and clearly show the methodology in your report. The estimate represents potential monthly impact if issues are addressed.',
  },
  {
    question: 'What happens after I purchase?',
    answer:
      "You'll receive your full report via email within minutes. The report includes all identified issues, prioritized by business impact, with difficulty ratings and the underlying measurements. It's a PDF you can share with your team or developer.",
  },
]

export function LandingPageClient({ context, token }: LandingPageClientProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleCheckout = useCallback(async () => {
    if (isCheckoutLoading) return

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
          token,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setCheckoutError('Unable to start checkout. Please try again.')
      setIsCheckoutLoading(false)
    }
  }, [context.businessId, context.leadId, token, isCheckoutLoading])

  return (
    <div className="min-h-screen bg-[#232323]">
      {/* landing-container class prevents pinched layouts */}
      <div className="landing-container">
        {/* Single gap control - children must have NO external margins/padding */}
        <div className="flex flex-col gap-20 min-[800px]:gap-24">
          {/* Section 1: Hero */}
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
          />

          {/* Bento layout: Header full width, then Value (2/3) + Card (1/3), then Dollar full width */}
          <div className="flex flex-col gap-24">
            {/* Section Header - full width */}
            <section aria-labelledby="value-heading" className="text-center">
              <div className="flex flex-col gap-8">
                <h2
                  id="value-heading"
                  className="text-white text-[28px] min-[800px]:text-[32px] font-semibold leading-tight tracking-[0.02em]"
                >
                  What&apos;s in your report
                </h2>
                <p className="text-white/60 text-[18px] min-[800px]:text-[20px] max-w-xl mx-auto leading-[1.6] tracking-[0.02em]">
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

              {/* Issue Brief Card (1/3 right) - matches guarantee card style */}
              <div className="p-8 min-[800px]:p-10 bg-white/5 rounded-2xl">
                <h2
                  id="hook-heading"
                  className="text-white/60 text-[20px] font-semibold tracking-[0.02em] pb-4 mb-4 border-b border-white/10"
                >
                  Your site&apos;s biggest issue
                </h2>
                <p className="text-white/60 text-[20px] leading-[1.6] tracking-[0.02em]">
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

            {/* Dollar Range (full width) */}
            <p
              className="text-center text-white/60 text-[20px] min-[800px]:text-[24px] tracking-[0.02em]"
              aria-label={`Estimated monthly impact: ${context.impactLow} to ${context.impactHigh} dollars`}
            >
              We estimate you&apos;re leaving{' '}
              <span className="text-white font-semibold">
                {context.impactLow} – {context.impactHigh}
              </span>{' '}
              on the table every month.
            </p>

            {/* CTA Button - Hidden on mobile (sticky CTA handles it) */}
            <div className="hidden min-[800px]:flex justify-center">
              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#232323] disabled:cursor-not-allowed"
              >
                {isCheckoutLoading ? (
                  <>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Get Your Report – ${context.price}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CTA + Guarantee */}
          <section aria-labelledby="cta-heading">
            <CTASection
              company={context.company}
              issueCount={context.issueCount}
              impactLow={context.impactLow}
              impactHigh={context.impactHigh}
              price={context.price}
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

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        price={context.price}
        isLoading={isCheckoutLoading}
        onCheckout={handleCheckout}
      />
    </div>
  )
}
