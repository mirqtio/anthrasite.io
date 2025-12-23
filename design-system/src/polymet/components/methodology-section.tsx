import React from "react";

export type MethodologySectionProps = {
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;
  "data-pol-id"?: string;
};

export function MethodologySection({
  steps,
  "data-pol-id": dataPolId,
}: MethodologySectionProps) {
  if (process.env.NODE_ENV === "development") {
    if (!steps || steps.length !== 3) {
      console.error(
        `MethodologySection: Expected exactly 3 steps, received ${steps?.length || 0}. This violates Phase 2 contract.`
      );
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-lg)]">
      <h2 className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)] text-center">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-gap-lg)]">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col gap-[var(--spacing-gap-md)] p-[var(--spacing-component-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] transition-all duration-[var(--duration-normal)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]"
          >
            {/* Step Number */}
            <div className="flex items-center justify-center w-[48px] h-[48px] bg-[var(--color-interactive-cta-default)] text-[var(--color-interactive-cta-text)] text-[length:var(--font-size-xl)] font-[var(--font-weight-bold)] rounded-[var(--radius-full)]">
              {step.stepNumber}
            </div>

            {/* Step Title */}
            <h3 className="text-[var(--color-text-primary)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] leading-[var(--leading-tight)]">
              {step.title}
            </h3>

            {/* Step Description */}
            <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
