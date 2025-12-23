import React from "react";
import { CheckCircle2Icon } from "lucide-react";

export type FindingsListProps = {
  findings: Array<{
    title: string;
    description: string;
    impact?: string; // Optional, display-ready
  }>;
  data_source: "real" | "sample";
  "data-pol-id"?: string;
};

export function FindingsList({
  findings,
  data_source,
  "data-pol-id": dataPolId,
}: FindingsListProps) {
  if (process.env.NODE_ENV === "development") {
    if (!findings || findings.length < 3 || findings.length > 5) {
      console.warn(
        `FindingsList: Expected 3-5 findings, received ${findings?.length || 0}. This violates Phase 2 contract.`
      );
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-md)]">
      {/* Data Source Badge */}
      {data_source === "sample" && (
        <div className="inline-flex self-start items-center gap-[var(--spacing-gap-xs)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)]">
          <span className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-medium)] uppercase tracking-wide">
            Sample Data
          </span>
        </div>
      )}

      {/* Findings List */}
      <ul className="flex flex-col gap-[var(--spacing-gap-md)]">
        {findings.map((finding, index) => (
          <li
            key={index}
            className="flex gap-[var(--spacing-gap-sm)] p-[var(--spacing-component-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] transition-all duration-[var(--duration-normal)] hover:border-[var(--color-border-strong)]"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2Icon className="w-[20px] h-[20px] text-[var(--color-interactive-cta-default)]" />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-[var(--spacing-gap-xs)]">
              <h4 className="text-[var(--color-text-primary)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] leading-[var(--leading-tight)]">
                {finding.title}
              </h4>
              <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
                {finding.description}
              </p>
              {finding.impact && (
                <p className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-medium)] leading-[var(--leading-normal)]">
                  Impact: {finding.impact}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
