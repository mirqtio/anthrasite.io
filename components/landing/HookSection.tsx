"use client";

import { ArrowRight } from "lucide-react";
import type { HookOpportunity, EffortLevel } from "@/lib/landing/types";

interface HookSectionProps {
  hookOpportunity: HookOpportunity;
  impactLow: string;
  impactHigh: string;
}

/**
 * Get effort badge color based on level
 */
function getEffortColor(effort: EffortLevel): {
  bg: string;
  text: string;
} {
  switch (effort) {
    case "EASY":
      return {
        bg: "var(--color-status-success-subtle)",
        text: "var(--color-status-success)",
      };
    case "MODERATE":
      return {
        bg: "var(--color-status-warning-subtle)",
        text: "var(--color-status-warning)",
      };
    case "COMPLEX":
      return {
        bg: "var(--color-status-error-subtle)",
        text: "var(--color-status-error)",
      };
  }
}

export function HookSection({
  hookOpportunity,
  impactLow,
  impactHigh,
}: HookSectionProps) {
  const effortColors = getEffortColor(hookOpportunity.effort);

  return (
    <div className="space-y-[var(--spacing-gap-lg)]">
      {/* Visually hidden heading for accessibility */}
      <h2 id="hook-heading" className="sr-only">
        Key Finding
      </h2>

      {/* Issue Brief Card */}
      <div className="card-container p-[var(--spacing-component-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
        <div className="flex flex-col gap-[var(--spacing-gap-sm)]">
          {/* Title + Effort Badge Row */}
          <div className="flex flex-wrap items-start gap-[var(--spacing-gap-sm)]">
            <h3 className="text-[var(--color-text-primary)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] leading-[var(--leading-tight)] flex-1 min-w-0">
              {hookOpportunity.title}
            </h3>
            <span
              className="px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] text-[length:var(--font-size-xs)] font-[var(--font-weight-semibold)] rounded-[var(--radius-sm)] uppercase tracking-wider whitespace-nowrap"
              style={{
                backgroundColor: effortColors.bg,
                color: effortColors.text,
              }}
            >
              {hookOpportunity.effort}
            </span>
          </div>

          {/* Description */}
          <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] leading-[var(--leading-relaxed)]">
            {hookOpportunity.description}
          </p>
        </div>
      </div>

      {/* Metric Box */}
      <div className="flex justify-center">
        <div className="px-[var(--spacing-component-xl)] py-[var(--spacing-component-lg)] bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <div className="flex flex-col items-center gap-[var(--spacing-gap-xs)]">
            {/* Metric Label */}
            <span className="text-[var(--color-text-muted)] text-[length:var(--font-size-sm)] uppercase tracking-wider">
              {hookOpportunity.anchorMetric.label}
            </span>

            {/* Value → Target */}
            <div className="flex items-center gap-[var(--spacing-gap-sm)]">
              <span className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-bold)]">
                {hookOpportunity.anchorMetric.value}
              </span>
              <ArrowRight
                className="w-5 h-5 text-[var(--color-text-muted)]"
                aria-hidden="true"
              />
              <span className="text-[var(--color-status-success)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-bold)]">
                {hookOpportunity.anchorMetric.target}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-0 h-px bg-[var(--color-border-default)] w-2/3 mx-auto" />

      {/* Dollar Range */}
      <div className="text-center">
        <p
          className="text-[var(--color-text-secondary)] text-[length:var(--font-size-lg)]"
          aria-label={`Estimated monthly impact: ${impactLow} to ${impactHigh} dollars`}
        >
          We estimate you&apos;re leaving{" "}
          <span className="text-[var(--color-text-primary)] font-[var(--font-weight-semibold)]">
            ~{impactLow} – {impactHigh}
          </span>{" "}
          on the table every month.
        </p>
      </div>
    </div>
  );
}
