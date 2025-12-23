import React from "react";
import {
  AssessmentSummary,
  AssessmentSummaryProps,
} from "@/polymet/components/assessment-summary";
import {
  FindingsList,
  FindingsListProps,
} from "@/polymet/components/findings-list";

export type SampleAssessmentPreviewProps = {
  assessmentSummary: AssessmentSummaryProps;
  findings: FindingsListProps;
  "data-pol-id"?: string;
};

export function SampleAssessmentPreview({
  assessmentSummary,
  findings,
  "data-pol-id": dataPolId,
}: SampleAssessmentPreviewProps) {
  if (process.env.NODE_ENV === "development") {
    if (!assessmentSummary || !findings) {
      console.error("SampleAssessmentPreview: Missing required props");
    }
    // Enforce sample data source
    if (
      assessmentSummary.data_source !== "sample" ||
      findings.data_source !== "sample"
    ) {
      console.warn(
        "SampleAssessmentPreview: Both assessmentSummary and findings should have data_source='sample'"
      );
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-lg)] p-[var(--spacing-component-xl)] bg-[var(--color-bg-surface-elevated)] border-2 border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
      {/* Sample Data Label */}
      <div className="flex items-center justify-center gap-[var(--spacing-gap-xs)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)]">
        <span className="text-[var(--color-text-primary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-semibold)] uppercase tracking-wide">
          📊 Sample Assessment Preview
        </span>
      </div>

      {/* Assessment Summary */}
      <AssessmentSummary {...assessmentSummary} />

      {/* Findings List */}
      <FindingsList {...findings} />

      {/* Footer Note */}
      <div className="pt-[var(--spacing-component-md)] border-t border-[var(--color-border-subtle)]">
        <p className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-regular)] leading-[var(--leading-normal)] text-center">
          This is a sample assessment to demonstrate our analysis format. Your
          actual assessment will be personalized to your business.
        </p>
      </div>
    </div>
  );
}
