'use client'

import type { HookOpportunity } from '@/lib/landing/types'

interface HookSectionProps {
  hookOpportunity: HookOpportunity
  impactLow: string
  impactHigh: string
}

export function HookSection({
  hookOpportunity,
  impactLow,
  impactHigh,
}: HookSectionProps) {
  return (
    <div className="space-y-12">
      {/* Visually hidden heading for accessibility */}
      <h2 id="hook-heading" className="sr-only">
        Key Finding
      </h2>

      {/* Issue Brief Card */}
      <div className="p-8 min-[800px]:p-10 bg-[#141414] border border-white/10 rounded-2xl">
        {/* Description */}
        <p className="text-white/60 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
          {hookOpportunity.description}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-0 h-px bg-white/10 w-2/3 mx-auto" />

      {/* Dollar Range */}
      <div className="text-center">
        <p
          className="text-white/60 text-[20px] min-[800px]:text-[24px] tracking-[0.02em]"
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
