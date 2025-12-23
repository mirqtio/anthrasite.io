import React from "react";
import { CheckIcon } from "lucide-react";

export type ValuePropositionProps = {
  headline: string; // Required
  explanation: string; // Required (2–3 sentences)
  benefits?: string[]; // Optional (max 3–5)
  "data-pol-id"?: string;
};

export function ValueProposition({
  headline,
  explanation,
  benefits,
  "data-pol-id": dataPolId,
}: ValuePropositionProps) {
  if (process.env.NODE_ENV === "development") {
    if (!headline || !explanation) {
      console.error("ValueProposition: Missing required props");
    }
    if (benefits && (benefits.length < 3 || benefits.length > 5)) {
      console.warn(
        `ValueProposition: Benefits should contain 3-5 items, received ${benefits.length}`
      );
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-lg)] p-[var(--spacing-component-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
      {/* Headline */}
      <h2 className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)]">
        {headline}
      </h2>

      {/* Explanation */}
      <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
        {explanation}
      </p>

      {/* Benefits List */}
      {benefits && benefits.length > 0 && (
        <ul className="flex flex-col gap-[var(--spacing-gap-sm)]">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-start gap-[var(--spacing-gap-sm)]"
            >
              <div className="flex-shrink-0 mt-1">
                <CheckIcon className="w-[20px] h-[20px] text-[var(--color-interactive-cta-default)]" />
              </div>
              <span className="text-[var(--color-text-primary)] text-[length:var(--font-size-base)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
