"use client";

import { Shield, ArrowRight, Loader2 } from "lucide-react";

interface CTASectionProps {
  company: string;
  issueCount: number;
  impactLow: string;
  impactHigh: string;
  price: number;
  isLoading: boolean;
  onCheckout: () => void;
  error?: string | null;
}

export function CTASection({
  company,
  issueCount,
  impactLow,
  impactHigh,
  price,
  isLoading,
  onCheckout,
  error,
}: CTASectionProps) {
  return (
    <div className="space-y-[var(--spacing-gap-lg)]">
      {/* Visually hidden heading for accessibility */}
      <h2 id="cta-heading" className="sr-only">
        Get Your Report
      </h2>

      {/* CTA Card */}
      <div
        className="card-container relative p-[var(--spacing-component-xl)] bg-[var(--color-bg-surface-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border-default)] overflow-hidden"
        style={{
          // Left border gradient accent
          borderLeft: "4px solid transparent",
          borderImage:
            "linear-gradient(to bottom, var(--color-interactive-cta-default), var(--color-interactive-secondary-default)) 1",
        }}
      >
        <div className="flex flex-col items-center gap-[var(--spacing-gap-lg)]">
          {/* Card Header */}
          <div className="text-center">
            <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)]">
              Your report for
            </p>
            <p className="text-[var(--color-text-primary)] text-[length:var(--font-size-xl)] font-[var(--font-weight-semibold)]">
              {company}
            </p>
          </div>

          {/* Price */}
          <p className="text-[var(--color-text-primary)] text-[length:var(--font-size-4xl)] font-[var(--font-weight-bold)]">
            ${price}
          </p>

          {/* Divider */}
          <hr className="border-0 h-px bg-[var(--color-border-default)] w-full" />

          {/* Summary List */}
          <ul className="w-full space-y-[var(--spacing-gap-xs)] text-[length:var(--font-size-base)] text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-[var(--spacing-gap-xs)]">
              <span className="text-[var(--color-text-primary)]">•</span>
              <span>
                {issueCount} issues identified and prioritized
              </span>
            </li>
            <li className="flex items-start gap-[var(--spacing-gap-xs)]">
              <span className="text-[var(--color-text-primary)]">•</span>
              <span>
                {impactLow} – {impactHigh}/mo estimated impact
              </span>
            </li>
            <li className="flex items-start gap-[var(--spacing-gap-xs)]">
              <span className="text-[var(--color-text-primary)]">•</span>
              <span>Difficulty rating for each issue</span>
            </li>
            <li className="flex items-start gap-[var(--spacing-gap-xs)]">
              <span className="text-[var(--color-text-primary)]">•</span>
              <span>Delivered in minutes</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-[var(--spacing-gap-sm)] px-[var(--spacing-component-xl)] py-[var(--spacing-component-lg)] bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] active:bg-[var(--color-interactive-cta-active)] disabled:bg-[var(--color-interactive-cta-disabled)] text-[var(--color-interactive-cta-text)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] rounded-[var(--radius-md)] shadow-[var(--shadow-cta)] hover:shadow-[var(--shadow-cta-hover)] transition-all duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-focus-ring-offset)] disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span>Get Your Report</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-[var(--color-status-error)] text-[length:var(--font-size-sm)] text-center">
              {error}
            </p>
          )}

          {/* Checkout Note */}
          <p className="text-[var(--color-text-muted)] text-[length:var(--font-size-sm)] text-center">
            You&apos;ll check out with Stripe. No forms to fill out.
          </p>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="card-container p-[var(--spacing-component-lg)] bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)]">
        <div className="flex flex-col items-center gap-[var(--spacing-gap-sm)] text-center">
          <div className="flex items-center gap-[var(--spacing-gap-xs)]">
            <Shield
              className="w-5 h-5 text-[var(--color-status-success)] flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-[var(--color-text-primary)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] uppercase tracking-wider">
              The report pays for itself, or it&apos;s free
            </span>
          </div>
          <p
            className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)]"
            style={{ width: '100%', maxWidth: '32rem' }}
          >
            If you address the issues we identify and don&apos;t see enough
            improvement to cover the cost of the report within 90 days,
            we&apos;ll refund you in full. Just reply to your delivery email.
          </p>
        </div>
      </div>
    </div>
  );
}
