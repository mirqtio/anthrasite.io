import React from "react";

export type ProblemHeaderProps = {
  headline: string; // Required
  subheadline: string; // Required
  "data-pol-id"?: string;
};

export function ProblemHeader({
  headline,
  subheadline,
  "data-pol-id": dataPolId,
}: ProblemHeaderProps) {
  if (process.env.NODE_ENV === "development") {
    if (!headline || !subheadline) {
      console.error("ProblemHeader: Missing required props");
    }
  }

  return (
    <header className="flex flex-col gap-[var(--spacing-gap-md)] text-center max-w-3xl mx-auto">
      <h1 className="text-[var(--color-text-primary)] text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)]">
        {headline}
      </h1>
      <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-lg)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
        {subheadline}
      </p>
    </header>
  );
}
