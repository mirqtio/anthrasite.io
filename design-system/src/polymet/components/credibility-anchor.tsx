import React from "react";
import { ShieldCheckIcon } from "lucide-react";

export type CredibilityAnchorProps = {
  aboutText: string; // Required (1–2 sentences)
  trustSignal?: string; // Optional
  showLogo?: boolean; // Optional
  "data-pol-id"?: string;
};

export function CredibilityAnchor({
  aboutText,
  trustSignal,
  showLogo = true,
  "data-pol-id": dataPolId,
}: CredibilityAnchorProps) {
  if (process.env.NODE_ENV === "development") {
    if (!aboutText) {
      console.error("CredibilityAnchor: Missing required prop 'aboutText'");
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-md)] p-[var(--spacing-component-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)]">
      {/* Logo/Brand */}
      {showLogo && (
        <div className="flex items-center gap-[var(--spacing-gap-sm)]">
          <ShieldCheckIcon className="w-[24px] h-[24px] text-[var(--color-interactive-cta-default)]" />

          <span className="text-[var(--color-text-primary)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)]">
            Anthrasite
          </span>
        </div>
      )}

      {/* About Text */}
      <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
        {aboutText}
      </p>

      {/* Trust Signal */}
      {trustSignal && (
        <div className="flex items-center gap-[var(--spacing-gap-xs)] pt-[var(--spacing-component-xs)] border-t border-[var(--color-border-subtle)]">
          <span className="text-[var(--color-text-tertiary)] text-[length:var(--font-size-xs)] font-[var(--font-weight-medium)]">
            {trustSignal}
          </span>
        </div>
      )}
    </div>
  );
}
