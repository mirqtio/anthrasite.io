'use client'

import { useState, useCallback } from 'react'
import type { LandingContext, FAQItem } from '@/lib/landing/types'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueSection } from '@/components/landing/ValueSection'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { MobileStickyCTA } from '@/components/landing/MobileStickyCTA'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { SecureCheckout } from '@/components/landing/SecureCheckout'

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
      "We estimate your baseline revenue using industry benchmarks. Then we calculate how much friction each issue typically costs businesses like yours. The range shows uncertainty. It helps you prioritize but doesn't predict exact outcomes.",
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
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] disabled:cursor-not-allowed"
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

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        price={context.price}
        isLoading={isCheckoutLoading}
        onCheckout={handleCheckout}
      />
    </div>
  )
}
