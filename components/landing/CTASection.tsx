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
    <div className="space-y-gap-lg">
      {/* Visually hidden heading for accessibility */}
      <h2 id="cta-heading" className="sr-only">
        Get Your Report
      </h2>

      {/* CTA Card */}
      <div
        className="card-container relative p-component-xl bg-bg-elevated rounded-lg shadow-lg border border-border-default overflow-hidden"
        style={{
          // Left border gradient accent
          borderLeft: '4px solid transparent',
          borderImage:
            'linear-gradient(to bottom, var(--color-interactive-cta-default), var(--color-interactive-secondary-default)) 1',
        }}
      >
        <div className="flex flex-col items-center gap-gap-lg">
          {/* Card Header */}
          <div className="text-center">
            <p className="text-text-secondary text-base">Your report for</p>
            <p className="text-text-primary text-xl font-semibold">{company}</p>
          </div>

          {/* Price */}
          <p className="text-text-primary text-4xl font-bold">${price}</p>

          {/* Divider */}
          <hr className="border-0 h-px bg-border-default w-full" />

          {/* Summary List */}
          <ul className="w-full space-y-gap-xs text-base text-text-secondary">
            <li className="flex items-start gap-gap-xs">
              <span className="text-text-primary">•</span>
              <span>{issueCount} issues identified and prioritized</span>
            </li>
            <li className="flex items-start gap-gap-xs">
              <span className="text-text-primary">•</span>
              <span>
                {impactLow} – {impactHigh}/mo estimated impact
              </span>
            </li>
            <li className="flex items-start gap-gap-xs">
              <span className="text-text-primary">•</span>
              <span>Difficulty rating for each issue</span>
            </li>
            <li className="flex items-start gap-gap-xs">
              <span className="text-text-primary">•</span>
              <span>Delivered in minutes</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-gap-sm px-component-xl py-component-lg bg-interactive-cta hover:bg-interactive-cta-hover active:bg-interactive-cta-active disabled:bg-interactive-cta-disabled text-interactive-cta-text text-lg font-semibold rounded-md shadow-cta hover:shadow-cta-hover transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-ring-offset disabled:cursor-not-allowed"
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
            <p className="text-status-error-text text-sm text-center">
              {error}
            </p>
          )}

          {/* Checkout Note */}
          <p className="text-text-muted text-sm text-center">
            You&apos;ll check out with Stripe. No forms to fill out.
          </p>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="card-container p-component-lg bg-bg-subtle rounded-lg">
        <div className="flex flex-col items-center gap-gap-sm text-center">
          <div className="flex items-center gap-gap-xs">
            <Shield
              className="w-5 h-5 text-status-success-text flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-text-primary text-base font-semibold uppercase tracking-wider">
              The report pays for itself, or it&apos;s free
            </span>
          </div>
          <p
            className="text-text-secondary text-base"
            style={{ width: '100%', maxWidth: '32rem' }}
          >
            If you address the issues we identify and don&apos;t see enough
            improvement to cover the cost of the report within 90 days,
            we&apos;ll refund you in full. Just reply to your delivery email.
          </p>
        </div>
      </div>
    </div>
  )
}
