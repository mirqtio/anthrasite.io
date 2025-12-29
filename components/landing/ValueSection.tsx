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
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2
          id="value-heading"
          className="text-white text-2xl sm:text-3xl font-bold leading-tight"
        >
          What&apos;s in your report
        </h2>
        <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
          A detailed analysis of {company}, organized by what matters most to
          your bottom line.
        </p>
      </div>

      {/* Value List */}
      <div className="space-y-4">
        {valueItems.map((item, index) => (
          <div key={index} className="flex gap-2">
            {/* Bullet */}
            <div
              className="w-2 h-2 rounded-full bg-[#0066FF] flex-shrink-0 mt-2"
              aria-hidden="true"
            />
            {/* Content */}
            <div>
              <span className="text-white text-base font-semibold">
                {item.title}
              </span>
              <span className="text-white/70 text-base">
                {' '}
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Format Line */}
      <p className="text-center text-white/70 text-base font-medium">
        PDF, delivered to your inbox in minutes.
      </p>

      {/* Divider */}
      <hr className="border-0 h-px bg-white/10 w-2/3 mx-auto" />

      {/* Differentiator */}
      <p className="text-center text-white text-lg font-medium max-w-lg mx-auto">
        Most audits give you scores. This report tells you what those scores
        mean for your business—and which problems to tackle first.
      </p>
    </div>
  )
}
