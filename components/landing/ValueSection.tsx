'use client'

interface ValueSectionProps {
  company: string
  issueCount: number
}

interface ValueItem {
  title: string
  description: string
}

export function ValueSection({ company, issueCount }: ValueSectionProps) {
  // Value items with dynamic issue count
  const valueItems: ValueItem[] = [
    {
      title: `${issueCount} issues identified`,
      description:
        "Each one explained in plain language—what's wrong and why it matters.",
    },
    {
      title: 'Prioritized by business impact',
      description:
        "Not just a list of problems. We've ordered them by which ones are costing you the most.",
    },
    {
      title: 'Difficulty ratings',
      description:
        'Each issue marked Easy, Moderate, or Hard so you know what you can tackle yourself.',
    },
    {
      title: 'The underlying measurements',
      description:
        'The specific metrics behind each issue, so you can verify our findings.',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-8">
        <h2
          id="value-heading"
          className="text-white text-[28px] min-[800px]:text-[32px] font-semibold leading-tight tracking-[0.02em]"
        >
          What&apos;s in your report
        </h2>
        <p className="text-white/60 text-[18px] min-[800px]:text-[20px] max-w-xl mx-auto leading-[1.6] tracking-[0.02em]">
          A detailed analysis of {company}, organized by what matters most to
          your bottom line.
        </p>
      </div>

      {/* Value List */}
      <div className="space-y-8">
        {valueItems.map((item, index) => (
          <div key={index} className="flex gap-4">
            {/* Bullet */}
            <div
              className="w-2 h-2 rounded-full bg-[#0066FF] flex-shrink-0 mt-2.5"
              aria-hidden="true"
            />
            {/* Content */}
            <div>
              <span className="text-white text-[18px] min-[800px]:text-[20px] font-semibold tracking-[0.02em]">
                {item.title}
              </span>
              <span className="text-white/60 text-[18px] min-[800px]:text-[20px] tracking-[0.02em]">
                {' '}
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Format Line */}
      <p className="text-center text-white/60 text-[18px] min-[800px]:text-[20px] font-medium tracking-[0.02em]">
        PDF, delivered to your inbox in minutes.
      </p>

      {/* Divider */}
      <hr className="border-0 h-px bg-white/10 w-2/3 mx-auto" />

      {/* Differentiator */}
      <p className="text-center text-white text-[20px] min-[800px]:text-[24px] font-medium max-w-lg mx-auto leading-[1.5] tracking-[0.02em]">
        Most audits give you scores. This report tells you what those scores
        mean for your business—and which problems to tackle first.
      </p>
    </div>
  )
}
