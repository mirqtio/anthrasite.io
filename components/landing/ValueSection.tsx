"use client";

interface ValueSectionProps {
  company: string;
  issueCount: number;
}

interface ValueItem {
  title: string;
  description: string;
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
      title: "Prioritized by business impact",
      description:
        "Not just a list of problems. We've ordered them by which ones are costing you the most.",
    },
    {
      title: "Difficulty ratings",
      description:
        "Each issue marked Easy, Moderate, or Hard so you know what you can tackle yourself.",
    },
    {
      title: "The underlying measurements",
      description:
        "The specific metrics behind each issue, so you can verify our findings.",
    },
  ];

  return (
    <div className="space-y-[var(--spacing-gap-lg)]">
      {/* Section Header */}
      <div className="text-center space-y-[var(--spacing-gap-sm)]">
        <h2
          id="value-heading"
          className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] sm:text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)]"
        >
          What&apos;s in your report
        </h2>
        <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] sm:text-[length:var(--font-size-lg)] max-w-xl mx-auto">
          A detailed analysis of {company}, organized by what matters most to
          your bottom line.
        </p>
      </div>

      {/* Value List */}
      <div className="space-y-[var(--spacing-gap-md)]">
        {valueItems.map((item, index) => (
          <div key={index} className="flex gap-[var(--spacing-gap-sm)]">
            {/* Bullet */}
            <div
              className="w-2 h-2 rounded-full bg-[var(--color-interactive-cta-default)] flex-shrink-0 mt-2"
              aria-hidden="true"
            />
            {/* Content */}
            <div>
              <span className="text-[var(--color-text-primary)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)]">
                {item.title}
              </span>
              <span className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)]">
                {" "}
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Format Line */}
      <p className="text-center text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] font-[var(--font-weight-medium)]">
        PDF, delivered to your inbox in minutes.
      </p>

      {/* Divider */}
      <hr className="border-0 h-px bg-[var(--color-border-default)] w-2/3 mx-auto" />

      {/* Differentiator */}
      <p className="text-center text-[var(--color-text-primary)] text-[length:var(--font-size-lg)] font-[var(--font-weight-medium)] max-w-lg mx-auto">
        Most audits give you scores. This report tells you what those scores
        mean for your business—and which problems to tackle first.
      </p>
    </div>
  );
}
