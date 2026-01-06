'use client'

interface ValueSectionProps {
  company: string
  issueCount: number
  hideHeader?: boolean
}

interface ValueItem {
  title: string
  description: string
}

export function ValueSection({
  company,
  issueCount,
  hideHeader = false,
}: ValueSectionProps) {
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
    <div className="flex flex-col gap-12">
      {/* Section Header - can be hidden if rendered separately */}
      {!hideHeader && (
        <div className="flex flex-col gap-8 text-center">
          <h2
            id="value-heading"
            className="text-slate-900 text-[28px] min-[800px]:text-[32px] font-semibold leading-tight tracking-[0.02em]"
          >
            What&apos;s in your report
          </h2>
          <p className="text-slate-600 text-[18px] min-[800px]:text-[20px] max-w-xl mx-auto leading-[1.6] tracking-[0.02em]">
            A detailed analysis of {company}, organized by what matters most to
            your bottom line.
          </p>
        </div>
      )}

      {/* Value List */}
      <div className="flex flex-col gap-8">
        {valueItems.map((item, index) => (
          <div key={index} className="flex gap-4">
            {/* Bullet */}
            <div
              className="w-2 h-2 rounded-full bg-[#0066FF] flex-shrink-0 mt-2.5"
              aria-hidden="true"
            />
            {/* Content */}
            <div>
              <span className="text-slate-900 text-[18px] min-[800px]:text-[20px] font-semibold tracking-[0.02em]">
                {item.title}
              </span>
              <span className="text-slate-600 text-[18px] min-[800px]:text-[20px] tracking-[0.02em]">
                {' '}
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
