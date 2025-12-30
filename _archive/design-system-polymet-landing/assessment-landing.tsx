/**
 * Assessment Landing Page (Authenticated)
 * Phase 5C: Archetype implementation for authenticated users
 *
 * Section Structure (Phase 1):
 * 1. Context Header (mandatory)
 * 2. Assessment Summary (mandatory)
 * 3. Key Findings (mandatory)
 * 4. CTA Block (mandatory)
 * 5. Credibility Anchor (mandatory)
 * 6. Secondary CTA (optional)
 */

import {
  ContextHeader,
  AssessmentSummary,
  FindingsList,
  CTABlock,
  CredibilityAnchor,
  SecondaryButton,
} from "@/polymet/components/index";

export type AssessmentLandingPageProps = {
  // Context data
  businessName: string;
  assessmentDate?: string;

  // Assessment data
  score: number | string;
  impactRange?: string;
  interpretation: string;

  // Findings data (3-5 items enforced by FindingsList)
  findings: Array<{
    title: string;
    description: string;
    impact?: string;
  }>;

  // CTA configuration
  primaryCtaText: string;
  primaryCtaUrl: string;
  primaryCtaHeadline?: string;
  primaryCtaSupportingText?: string;

  // Credibility configuration
  aboutText: string;
  trustSignal?: string;
  showLogo?: boolean;

  // Optional secondary CTA
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  "data-pol-id"?: string;
};

export function AssessmentLandingPage({
  businessName,
  assessmentDate,
  score,
  impactRange,
  interpretation,
  findings,
  primaryCtaText,
  primaryCtaUrl,
  primaryCtaHeadline,
  primaryCtaSupportingText,
  aboutText,
  trustSignal,
  showLogo = true,
  secondaryCtaText,
  secondaryCtaUrl,
}: AssessmentLandingPageProps) {
  // Development warning: Enforce findings count (3-5)
  if (process.env.NODE_ENV === "development") {
    if (findings.length < 3 || findings.length > 5) {
      console.warn(
        `[AssessmentLandingPage] Findings count violation: ${findings.length} items (expected 3-5)`
      );
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-[var(--spacing-section-md)] py-[var(--spacing-section-lg)]">
        <div className="space-y-[var(--spacing-section-lg)]">
          {/* 1. Context Header (mandatory) */}
          <section>
            <ContextHeader
              businessName={businessName}
              assessmentDate={assessmentDate}
            />
          </section>

          {/* 2. Assessment Summary (mandatory) */}
          <section>
            <AssessmentSummary
              businessName={businessName}
              score={score}
              impactRange={impactRange}
              interpretation={interpretation}
              data_source="real"
            />
          </section>

          {/* 3. Key Findings (mandatory) */}
          <section>
            <FindingsList findings={findings} data_source="real" />
          </section>

          {/* 4. CTA Block (mandatory) */}
          <section>
            <CTABlock
              ctaText={primaryCtaText}
              ctaUrl={primaryCtaUrl}
              headline={primaryCtaHeadline}
              supportingText={primaryCtaSupportingText}
              cta_mode="next_step"
            />
          </section>

          {/* 5. Credibility Anchor (mandatory) */}
          <section>
            <CredibilityAnchor
              aboutText={aboutText}
              trustSignal={trustSignal}
              showLogo={showLogo}
            />
          </section>

          {/* 6. Secondary CTA (optional) */}
          {secondaryCtaText && secondaryCtaUrl && (
            <section className="flex justify-center">
              <SecondaryButton
                ctaText={secondaryCtaText}
                ctaUrl={secondaryCtaUrl}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
