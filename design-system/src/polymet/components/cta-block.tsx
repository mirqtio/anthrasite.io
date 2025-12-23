import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

export type CTABlockProps = {
  ctaText: string; // Required
  ctaUrl: string; // Required
  headline?: string; // Optional
  supportingText?: string; // Optional
  cta_mode: "next_step" | "learn_more";
  "data-pol-id"?: string;
};

export function CTABlock({
  ctaText,
  ctaUrl,
  headline,
  supportingText,
  cta_mode,
  "data-pol-id": dataPolId,
}: CTABlockProps) {
  if (process.env.NODE_ENV === "development") {
    if (!ctaText || !ctaUrl || !cta_mode) {
      console.error("CTABlock: Missing required props");
    }
  }

  return (
    <div className="flex flex-col items-center gap-[var(--spacing-gap-lg)] p-[var(--spacing-component-xl)] bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] text-center">
      {/* Headline */}
      {headline && (
        <h3 className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)] max-w-2xl">
          {headline}
        </h3>
      )}

      {/* Supporting Text */}
      {supportingText && (
        <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)] max-w-xl">
          {supportingText}
        </p>
      )}

      {/* CTA Button */}
      <Link
        to={ctaUrl}
        className="inline-flex items-center gap-[var(--spacing-gap-sm)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] active:bg-[var(--color-interactive-cta-active)] disabled:bg-[var(--color-interactive-cta-disabled)] text-[var(--color-interactive-cta-text)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] rounded-[var(--radius-md)] shadow-[var(--shadow-cta)] hover:shadow-[var(--shadow-cta-hover)] transition-all duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-focus-ring-offset)]"
      >
        {ctaText}
        <ArrowRightIcon className="w-[18px] h-[18px]" />
      </Link>

      {/* Mode Indicator (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-regular)]">
          Mode: {cta_mode}
        </div>
      )}
    </div>
  );
}
