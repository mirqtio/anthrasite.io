import React from "react";

export type AssessmentSummaryProps = {
  businessName: string; // Required
  score: number | string; // Required (e.g. 78 or "B+")
  impactRange?: string; // Optional, display-ready
  interpretation: string; // Required (brief)
  data_source: "real" | "sample"; // Required
  "data-pol-id"?: string;
};

export function AssessmentSummary({
  businessName,
  score,
  impactRange,
  interpretation,
  data_source,
  "data-pol-id": dataPolId,
}: AssessmentSummaryProps) {
  if (process.env.NODE_ENV === "development") {
    if (!businessName || !score || !interpretation || !data_source) {
      console.error("AssessmentSummary: Missing required props");
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-md)] p-[var(--spacing-component-xl)] bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
      {/* Data Source Badge */}
      {data_source === "sample" && (
        <div className="inline-flex self-start items-center gap-[var(--spacing-gap-xs)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)]">
          <span className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-medium)] uppercase tracking-wide">
            Sample Data
          </span>
        </div>
      )}

      {/* Score Display */}
      <div className="flex items-baseline gap-[var(--spacing-gap-sm)]">
        <div className="text-[var(--color-text-primary)] text-[length:var(--font-size-4xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)]">
          {score}
        </div>
        {impactRange && (
          <div className="text-[var(--color-text-secondary)] text-[length:var(--font-size-lg)] font-[var(--font-weight-regular)] leading-[var(--leading-normal)]">
            {impactRange}
          </div>
        )}
      </div>

      {/* Business Name */}
      <h3 className="text-[var(--color-text-primary)] text-[length:var(--font-size-xl)] font-[var(--font-weight-semibold)] leading-[var(--leading-tight)]">
        {businessName}
      </h3>

      {/* Interpretation */}
      <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
        {interpretation}
      </p>
    </div>
  );
}
