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
      return 'bg-[#22C55E]/15 text-[#22C55E]'
    case 'MODERATE':
      return 'bg-[#F59E0B]/15 text-[#F59E0B]'
    case 'COMPLEX':
      return 'bg-[#DC2626]/15 text-[#DC2626]'
  }
}

export function HookSection({
  hookOpportunity,
  impactLow,
  impactHigh,
}: HookSectionProps) {
  return (
    <div className="space-y-6">
      {/* Visually hidden heading for accessibility */}
      <h2 id="hook-heading" className="sr-only">
        Key Finding
      </h2>

      {/* Issue Brief Card */}
      <div className="p-4 bg-[#141414] border border-white/10 rounded-lg">
        <div className="flex flex-col gap-2">
          {/* Title + Effort Badge Row */}
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-white text-lg font-semibold leading-tight flex-1 min-w-0">
              {hookOpportunity.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-sm uppercase tracking-wider whitespace-nowrap ${getEffortClasses(hookOpportunity.effort)}`}
            >
              {hookOpportunity.effort}
            </span>
          </div>

          {/* Description */}
          <p className="text-white/70 text-base leading-relaxed">
            {hookOpportunity.description}
          </p>
        </div>
      </div>

      {/* Metric Box */}
      <div className="flex justify-center">
        <div className="px-6 py-4 bg-[#1A1A1A] border border-white/10 rounded-md shadow-sm">
          <div className="flex flex-col items-center gap-1">
            {/* Metric Label */}
            <span className="text-white/50 text-sm uppercase tracking-wider">
              {hookOpportunity.anchorMetric.label}
            </span>

            {/* Value → Target */}
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold">
                {hookOpportunity.anchorMetric.value}
              </span>
              <ArrowRight
                className="w-5 h-5 text-white/50"
                aria-hidden="true"
              />
              <span className="text-[#22C55E] text-2xl font-bold">
                {hookOpportunity.anchorMetric.target}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-0 h-px bg-white/10 w-2/3 mx-auto" />

      {/* Dollar Range */}
      <div className="text-center">
        <p
          className="text-white/70 text-lg"
          aria-label={`Estimated monthly impact: ${impactLow} to ${impactHigh} dollars`}
        >
          We estimate you&apos;re leaving{' '}
          <span className="text-white font-semibold">
            ~{impactLow} – {impactHigh}
          </span>{' '}
          on the table every month.
        </p>
      </div>
    </div>
  )
}
