'use client'

import { Shield, ArrowRight, Loader2 } from 'lucide-react'

interface CTASectionProps {
  company: string
  issueCount: number
  impactLow: string
  impactHigh: string
  price: number
  isLoading: boolean
  onCheckout: () => void
  error?: string | null
}

export function CTASection({
  company,
  issueCount,
  impactLow,
  impactHigh,
  price,
  isLoading,
  onCheckout,
  error,
}: CTASectionProps) {
  return (
    <div className="flex flex-col gap-12">
      {/* Visually hidden heading for accessibility */}
      <h2 id="cta-heading" className="sr-only">
        Get Your Report
      </h2>

      {/* Main CTA Card */}
      <div
        className="relative p-8 min-[800px]:p-10 bg-[#141414] rounded-2xl shadow-lg border border-white/10 overflow-hidden"
        style={{
          borderLeft: '4px solid #0066FF',
        }}
      >
        <div className="flex flex-col gap-10">
          {/* Bento: Left (report details) + Right (differentiator + guarantee) */}
          <div className="flex flex-col gap-10 min-[800px]:grid min-[800px]:grid-cols-2 min-[800px]:gap-12">
            {/* Left Column: Report details */}
            <div className="flex flex-col gap-8">
              {/* Header */}
              <p className="text-[24px] tracking-[0.02em]">
                <span className="text-white/60">Your report for </span>
                <span className="text-white font-semibold">{company}</span>
              </p>

              {/* Bullets */}
              <ul className="flex flex-col gap-4 text-[18px] min-[800px]:text-[20px] text-white/60 tracking-[0.02em]">
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>{issueCount} prioritized issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white">•</span>
                  <span>
                    {impactLow} – {impactHigh}/mo estimated impact
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

            {/* Right Column: Differentiator */}
            <div className="flex flex-col gap-4">
              <p className="text-white text-[18px] min-[800px]:text-[20px] font-medium leading-[1.6] tracking-[0.02em]">
                Most audits give you meaningless metrics. This report tells you
                what those scores mean for your business. And which problems to
                tackle first.
              </p>
              <p className="text-white/60 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
                We&apos;ve analyzed thousands of websites to help small
                businesses. Our reports translate technical metrics into
                business impact.
              </p>
            </div>
          </div>

          {/* Guarantee - full width */}
          <div className="p-6 bg-white/5 rounded-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Shield
                  className="w-5 h-5 text-[#22C55E] flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-white text-[14px] font-semibold uppercase tracking-wider">
                  The report pays for itself or it&apos;s free
                </span>
              </div>
              <p className="text-white/60 text-[16px] leading-[1.6] tracking-[0.02em]">
                If you fix the issues we find and don&apos;t see enough
                improvement to cover the report&apos;s cost within 90 days,
                we&apos;ll give you a full refund. Just let us know.
              </p>
            </div>
          </div>

          {/* CTA Button - centered, spans full width */}
          <div className="flex flex-col items-center gap-4">
            <button
              id="main-cta-button"
              onClick={onCheckout}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[320px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Get Your Report – ${price}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <p className="text-[#DC2626] text-[14px] text-center">{error}</p>
            )}

            {/* Checkout Note */}
            <p className="text-white/40 text-[14px] text-center tracking-[0.02em]">
              Checkout with Stripe &nbsp;•&nbsp; Delivered in minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
