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
    <div className="space-y-6">
      {/* Visually hidden heading for accessibility */}
      <h2 id="cta-heading" className="sr-only">
        Get Your Report
      </h2>

      {/* CTA Card */}
      <div
        className="relative p-6 bg-[#1A1A1A] rounded-lg shadow-lg border border-white/10 overflow-hidden"
        style={{
          borderLeft: '4px solid #0066FF',
        }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Card Header */}
          <div className="text-center">
            <p className="text-white/70 text-base">Your report for</p>
            <p className="text-white text-xl font-semibold">{company}</p>
          </div>

          {/* Price */}
          <p className="text-white text-4xl font-bold">${price}</p>

          {/* Divider */}
          <hr className="border-0 h-px bg-white/10 w-full" />

          {/* Summary List */}
          <ul className="w-full space-y-1 text-base text-white/70">
            <li className="flex items-start gap-1">
              <span className="text-white">•</span>
              <span>{issueCount} issues identified and prioritized</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-white">•</span>
              <span>
                {impactLow} – {impactHigh}/mo estimated impact
              </span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-white">•</span>
              <span>Difficulty rating for each issue</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-white">•</span>
              <span>Delivered in minutes</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-lg font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:cursor-not-allowed"
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
            <p className="text-[#DC2626] text-sm text-center">{error}</p>
          )}

          {/* Checkout Note */}
          <p className="text-white/50 text-sm text-center">
            You&apos;ll check out with Stripe. No forms to fill out.
          </p>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="p-4 bg-white/5 rounded-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1">
            <Shield
              className="w-5 h-5 text-[#22C55E] flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-white text-base font-semibold uppercase tracking-wider">
              The report pays for itself, or it&apos;s free
            </span>
          </div>
          <p className="text-white/70 text-base max-w-lg">
            If you address the issues we identify and don&apos;t see enough
            improvement to cover the cost of the report within 90 days,
            we&apos;ll refund you in full. Just reply to your delivery email.
          </p>
        </div>
      </div>
    </div>
  )
}
