'use client'

import { CheckCircle, Clock, Mail } from 'lucide-react'

interface ExpectationBlockProps {
  company: string | null
}

/**
 * Shows what happens next with a visual timeline.
 * Static display (no polling) - just sets expectations.
 */
export function ExpectationBlock({ company }: ExpectationBlockProps) {
  const companyName = company || 'your website'

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 min-[800px]:p-8">
      {/* Primary Message */}
      <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold tracking-[0.02em] mb-2">
        We&apos;re generating your report
      </h2>
      <p className="text-white/60 text-[16px] min-[800px]:text-[18px] tracking-[0.02em] mb-8">
        for {companyName}
      </p>

      {/* Timeline */}
      <div className="flex items-start justify-between gap-2 min-[800px]:gap-4 mb-8">
        {/* Step 1: Payment (Complete) */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-[14px] min-[800px]:text-[16px] font-medium tracking-[0.02em]">
            Payment
          </p>
          <p className="text-[12px] min-[800px]:text-[14px] text-green-500 tracking-[0.02em]">
            Complete
          </p>
        </div>

        {/* Connector */}
        <div className="flex-shrink-0 w-8 min-[800px]:w-12 h-0.5 bg-white/20 mt-6" />

        {/* Step 2: Generating (In Progress) */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#0066FF]/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#0066FF] animate-pulse" />
          </div>
          <p className="text-[14px] min-[800px]:text-[16px] font-medium tracking-[0.02em]">
            Generating
          </p>
          <p className="text-[12px] min-[800px]:text-[14px] text-[#0066FF] tracking-[0.02em]">
            2-5 minutes
          </p>
        </div>

        {/* Connector */}
        <div className="flex-shrink-0 w-8 min-[800px]:w-12 h-0.5 bg-white/20 mt-6" />

        {/* Step 3: Email (Pending) */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white/40" />
          </div>
          <p className="text-[14px] min-[800px]:text-[16px] font-medium tracking-[0.02em] text-white/60">
            Email
          </p>
          <p className="text-[12px] min-[800px]:text-[14px] text-white/40 tracking-[0.02em]">
            Coming soon
          </p>
        </div>
      </div>

      {/* What We're Doing */}
      <div className="border-t border-white/10 pt-6">
        <p className="text-white/60 text-[14px] min-[800px]:text-[16px] tracking-[0.02em] leading-relaxed">
          We&apos;re analyzing your site using automated tests and AI-based
          visual review, prioritizing the highest-impact issues, and generating
          a PDF report tailored to your site.
        </p>
      </div>
    </div>
  )
}
