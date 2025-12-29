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
 * Colors: Success #22C55E, Warning #F59E0B, Error #DC2626
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
    <div className="space-y-10">
      {/* Visually hidden heading for accessibility */}
      <h2 id="hook-heading" className="sr-only">
        Key Finding
      </h2>

      {/* Issue Brief Card */}
      <div className="p-6 md:p-8 bg-[#141414] border border-white/10 rounded-xl">
        <div className="flex flex-col gap-3">
          {/* Title + Effort Badge Row */}
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-white text-[22px] md:text-[24px] font-semibold leading-tight flex-1 min-w-0 tracking-[0.02em]">
              {hookOpportunity.title}
            </h3>
            <span
              className={`px-2 py-1 text-[12px] font-semibold rounded-sm uppercase tracking-wider whitespace-nowrap ${getEffortClasses(hookOpportunity.effort)}`}
            >
              {hookOpportunity.effort}
            </span>
          </div>

          {/* Description */}
          <p className="text-white/60 text-[18px] md:text-[20px] leading-[1.6] tracking-[0.02em]">
            {hookOpportunity.description}
          </p>
        </div>
      </div>

      {/* Metric Box */}
      <div className="flex justify-center">
        <div className="px-8 py-6 md:py-8 bg-[#141414] border border-white/10 rounded-xl shadow-sm">
          <div className="flex flex-col items-center gap-2">
            {/* Metric Label */}
            <span className="text-white/40 text-[14px] tracking-[0.02em]">
              {hookOpportunity.anchorMetric.label}
            </span>

            {/* Value → Target */}
            <div className="flex items-center gap-3">
              <span className="text-white text-[28px] md:text-[32px] font-bold">
                {hookOpportunity.anchorMetric.value}
              </span>
              <ArrowRight
                className="w-6 h-6 text-white/40"
                aria-hidden="true"
              />
              <span className="text-[#22C55E] text-[28px] md:text-[32px] font-bold">
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
          className="text-white/60 text-[20px] md:text-[24px] tracking-[0.02em]"
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
