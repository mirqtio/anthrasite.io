import React from "react";

export type ContextHeaderProps = {
  businessName: string; // Required
  assessmentDate?: string; // Optional (display-ready)
  "data-pol-id"?: string;
};

export function ContextHeader({
  businessName,
  assessmentDate,
  "data-pol-id": dataPolId,
}: ContextHeaderProps) {
  return (
    <header className="flex flex-col gap-[var(--spacing-gap-xs)]">
      <h1 className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] leading-[var(--leading-tight)]">
        {businessName}
      </h1>
      {assessmentDate && (
        <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-regular)] leading-[var(--leading-normal)]">
          Assessment Date: {assessmentDate}
        </p>
      )}
    </header>
  );
}
