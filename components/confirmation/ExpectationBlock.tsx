'use client'

interface ExpectationBlockProps {
  company: string | null
}

/**
 * Shows what happens next.
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
        for <span className="text-white">{companyName}</span>
      </p>

      {/* Simple text-based status */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-green-500 font-semibold">✓</span>
          <span className="text-[16px] min-[800px]:text-[18px] tracking-[0.02em]">
            Payment complete
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#0066FF] font-semibold">→</span>
          <span className="text-[16px] min-[800px]:text-[18px] tracking-[0.02em]">
            Generating report{' '}
            <span className="text-white/60">(2-5 minutes)</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 font-semibold">○</span>
          <span className="text-[16px] min-[800px]:text-[18px] tracking-[0.02em] text-white/60">
            Email delivery
          </span>
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
