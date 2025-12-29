'use client'

import { ArrowRight } from 'lucide-react'
import type { HookOpportunity, EffortLevel } from '@/lib/landing/types'

interface HookSectionProps {
  hookOpportunity: HookOpportunity
  impactLow: string
  impactHigh: string
}

/**
 * Get effort badge styling based on level
 */
function getEffortClasses(effort: EffortLevel): string {
  switch (effort) {
    case 'EASY':
      return 'bg-status-success-bg text-status-success-text'
    case 'MODERATE':
      return 'bg-status-warning-bg text-status-warning-text'
    case 'COMPLEX':
      return 'bg-status-error-bg text-status-error-text'
  }
}

export function HookSection({
  hookOpportunity,
  impactLow,
  impactHigh,
}: HookSectionProps) {
  return (
    <div className="space-y-gap-lg">
      {/* Visually hidden heading for accessibility */}
      <h2 id="hook-heading" className="sr-only">
        Key Finding
      </h2>

      {/* Issue Brief Card */}
      <div className="card-container p-component-lg bg-bg-surface border border-border-default rounded-lg">
        <div className="flex flex-col gap-gap-sm">
          {/* Title + Effort Badge Row */}
          <div className="flex flex-wrap items-start gap-gap-sm">
            <h3 className="text-text-primary text-lg font-semibold leading-tight flex-1 min-w-0">
              {hookOpportunity.title}
            </h3>
            <span
              className={`px-component-sm py-1 text-xs font-semibold rounded-sm uppercase tracking-wider whitespace-nowrap ${getEffortClasses(hookOpportunity.effort)}`}
            >
              {hookOpportunity.effort}
            </span>
          </div>

          {/* Description */}
          <p className="text-text-secondary text-base leading-relaxed">
            {hookOpportunity.description}
          </p>
        </div>
      </div>

      {/* Metric Box */}
      <div className="flex justify-center">
        <div className="px-component-xl py-component-lg bg-bg-elevated border border-border-default rounded-md shadow-sm">
          <div className="flex flex-col items-center gap-gap-xs">
            {/* Metric Label */}
            <span className="text-text-muted text-sm uppercase tracking-wider">
              {hookOpportunity.anchorMetric.label}
            </span>

            {/* Value → Target */}
            <div className="flex items-center gap-gap-sm">
              <span className="text-text-primary text-2xl font-bold">
                {hookOpportunity.anchorMetric.value}
              </span>
              <ArrowRight
                className="w-5 h-5 text-text-muted"
                aria-hidden="true"
              />
              <span className="text-status-success-text text-2xl font-bold">
                {hookOpportunity.anchorMetric.target}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-0 h-px bg-border-default w-2/3 mx-auto" />

      {/* Dollar Range */}
      <div className="text-center">
        <p
          className="text-text-secondary text-lg"
          aria-label={`Estimated monthly impact: ${impactLow} to ${impactHigh} dollars`}
        >
          We estimate you&apos;re leaving{' '}
          <span className="text-text-primary font-semibold">
            ~{impactLow} – {impactHigh}
          </span>{' '}
          on the table every month.
        </p>
      </div>
    </div>
  )
}
