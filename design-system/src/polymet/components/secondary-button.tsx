import React from "react";
import { Link } from "react-router-dom";

export type SecondaryButtonProps = {
  ctaText: string; // Required
  ctaUrl: string; // Required
  "data-pol-id"?: string;
};

export function SecondaryButton({
  ctaText,
  ctaUrl,
  "data-pol-id": dataPolId,
}: SecondaryButtonProps) {
  if (process.env.NODE_ENV === "development") {
    if (!ctaText || !ctaUrl) {
      console.error("SecondaryButton: Missing required props");
    }
  }

  return (
    <Link
      to={ctaUrl}
      className="inline-flex items-center justify-center px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] bg-[var(--color-interactive-secondary-default)] hover:bg-[var(--color-interactive-secondary-hover)] active:bg-[var(--color-interactive-secondary-active)] disabled:bg-[var(--color-interactive-secondary-disabled)] text-[var(--color-interactive-secondary-text)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] transition-all duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-focus-ring-offset)]"
    >
      {ctaText}
    </Link>
  );
}
