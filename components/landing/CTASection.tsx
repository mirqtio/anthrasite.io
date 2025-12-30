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
    <div className="space-y-12">
      {/* Visually hidden heading for accessibility */}
      <h2 id="cta-heading" className="sr-only">
        Get Your Report
      </h2>

      {/* CTA Card */}
      <div
        className="relative p-8 min-[800px]:p-10 bg-[#141414] rounded-2xl shadow-lg border border-white/10 overflow-hidden"
        style={{
          borderLeft: '4px solid #0066FF',
        }}
      >
        <div className="flex flex-col items-center gap-8">
          {/* Card Header */}
          <div className="text-center">
            <p className="text-white/60 text-[18px] min-[800px]:text-[20px] tracking-[0.02em]">
              Your report for
            </p>
            <p className="text-white text-[22px] min-[800px]:text-[24px] font-semibold tracking-[0.02em]">
              {company}
            </p>
          </div>

          {/* Price */}
          <p className="text-white text-[48px] min-[800px]:text-[56px] font-bold">
            ${price}
          </p>

          {/* Divider */}
          <hr className="border-0 h-px bg-white/10 w-full" />

          {/* Summary List */}
          <ul className="w-full space-y-6 text-[18px] min-[800px]:text-[20px] text-white/60 tracking-[0.02em]">
            <li className="flex items-start gap-3">
              <span className="text-white">•</span>
              <span>{issueCount} issues identified and prioritized</span>
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
              <span>Delivered in minutes</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#232323] disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span>Get Your Report</span>
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
            You&apos;ll check out with Stripe. No forms to fill out.
          </p>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="p-8 min-[800px]:p-10 bg-white/5 rounded-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Shield
              className="w-5 h-5 text-[#22C55E] flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-white text-[12px] font-semibold uppercase tracking-wider">
              The report pays for itself, or it&apos;s free
            </span>
          </div>
          <p className="text-white/60 text-[18px] min-[800px]:text-[20px] max-w-lg leading-[1.6] tracking-[0.02em]">
            If you address the issues we identify and don&apos;t see enough
            improvement to cover the cost of the report within 90 days,
            we&apos;ll refund you in full. Just reply to your delivery email.
          </p>
        </div>
      </div>
    </div>
  )
}
