import React from "react";
import {
  UsersIcon,
  AwardIcon,
  MessageSquareIcon,
  BuildingIcon,
  ClipboardCheckIcon,
} from "lucide-react";

export type TrustSectionProps = {
  trustSignals: Array<{
    type: "team" | "backers" | "testimonials" | "logos" | "methodology";
    content: Record<string, any>;
  }>;
  "data-pol-id"?: string;
};

const TRUST_SIGNAL_ICONS = {
  team: UsersIcon,
  backers: AwardIcon,
  testimonials: MessageSquareIcon,
  logos: BuildingIcon,
  methodology: ClipboardCheckIcon,
};

const TRUST_SIGNAL_LABELS = {
  team: "Our Team",
  backers: "Backed By",
  testimonials: "What Clients Say",
  logos: "Trusted By",
  methodology: "Our Approach",
};

export function TrustSection({
  trustSignals,
  "data-pol-id": dataPolId,
}: TrustSectionProps) {
  if (process.env.NODE_ENV === "development") {
    if (!trustSignals || trustSignals.length === 0) {
      console.error(
        "TrustSection: trustSignals array is required and cannot be empty"
      );
    }
    if (trustSignals && trustSignals.length > 3) {
      console.error(
        `TrustSection: Expected max 3 trust signals, received ${trustSignals.length}. This violates Phase 2 contract.`
      );
    }
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-gap-lg)] p-[var(--spacing-component-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
      <h2 className="text-[var(--color-text-primary)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-bold)] leading-[var(--leading-tight)] text-center">
        Why Trust Us
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-gap-lg)]">
        {trustSignals.slice(0, 3).map((signal, index) => {
          const Icon = TRUST_SIGNAL_ICONS[signal.type];
          const label = TRUST_SIGNAL_LABELS[signal.type];

          return (
            <div
              key={index}
              className="flex flex-col gap-[var(--spacing-gap-md)] p-[var(--spacing-component-lg)] bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)]"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--color-interactive-cta-default)]/10 rounded-[var(--radius-md)]">
                <Icon className="w-[24px] h-[24px] text-[var(--color-interactive-cta-default)]" />
              </div>

              {/* Label */}
              <h3 className="text-[var(--color-text-primary)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] leading-[var(--leading-tight)]">
                {label}
              </h3>

              {/* Content */}
              <div className="text-[var(--color-text-secondary)] text-[length:var(--font-size-sm)] font-[var(--font-weight-regular)] leading-[var(--leading-relaxed)]">
                {signal.content.text ||
                  signal.content.description ||
                  JSON.stringify(signal.content)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
