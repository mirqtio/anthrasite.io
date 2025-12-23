/**
 * Public Explainer Page (Unauthenticated)
 * Phase 5C: Archetype implementation for unauthenticated visitors
 *
 * Section Structure (Phase 1):
 * 1. Problem Header (mandatory)
 * 2. Value Proposition (mandatory)
 * 3. Sample Assessment Preview (mandatory)
 * 4. Methodology Section (mandatory)
 * 5. Trust Section (mandatory)
 * 6. CTA Block (mandatory)
 * 7. Secondary CTA (optional)
 * 8. Footer (optional)
 */

import {
  ProblemHeader,
  ValueProposition,
  SampleAssessmentPreview,
  MethodologySection,
  TrustSection,
  CTABlock,
  SecondaryButton,
  Footer,
} from "@/polymet/components/index";

export type PublicExplainerPageProps = {
  // Problem statement
  headline: string;
  subheadline: string;

  // Value proposition
  valueHeadline: string;
  valueExplanation: string;
  valueBenefits?: string[];

  // Sample assessment data
  sampleBusinessName: string;
  sampleScore: number | string;
  sampleInterpretation: string;
  sampleFindings: Array<{
    title: string;
    description: string;
    impact?: string;
  }>;

  // Methodology (exactly 3 steps enforced by MethodologySection)
  methodologySteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;

  // Trust signals (max 3 enforced by TrustSection)
  trustSignals: Array<{
    type: "team" | "backers" | "testimonials" | "logos" | "methodology";
    content: Record<string, any>;
  }>;

  // Primary CTA
  primaryCtaText: string;
  primaryCtaUrl: string;
  primaryCtaHeadline?: string;
  primaryCtaSupportingText?: string;

  // Optional secondary CTA
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;

  // Optional footer
  footerLinks?: Array<{
    label: string;
    url: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  "data-pol-id"?: string;
};

export function PublicExplainerPage({
  headline,
  subheadline,
  valueHeadline,
  valueExplanation,
  valueBenefits,
  sampleBusinessName,
  sampleScore,
  sampleInterpretation,
  sampleFindings,
  methodologySteps,
  trustSignals,
  primaryCtaText,
  primaryCtaUrl,
  primaryCtaHeadline,
  primaryCtaSupportingText,
  secondaryCtaText,
  secondaryCtaUrl,
  footerLinks,
  socialLinks,
}: PublicExplainerPageProps) {
  // Development warnings: Enforce constraints
  if (process.env.NODE_ENV === "development") {
    if (sampleFindings.length < 3 || sampleFindings.length > 5) {
      console.warn(
        `[PublicExplainerPage] Sample findings count violation: ${sampleFindings.length} items (expected 3-5)`
      );
    }
    if (methodologySteps.length !== 3) {
      console.warn(
        `[PublicExplainerPage] Methodology steps violation: ${methodologySteps.length} steps (expected exactly 3)`
      );
    }
    if (trustSignals.length > 3) {
      console.warn(
        `[PublicExplainerPage] Trust signals violation: ${trustSignals.length} signals (max 3)`
      );
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-[var(--spacing-section-md)] py-[var(--spacing-section-lg)]">
        <div className="space-y-[var(--spacing-section-xl)]">
          {/* 1. Problem Header (mandatory) */}
          <section>
            <ProblemHeader headline={headline} subheadline={subheadline} />
          </section>

          {/* 2. Value Proposition (mandatory) */}
          <section>
            <ValueProposition
              headline={valueHeadline}
              explanation={valueExplanation}
              benefits={valueBenefits}
            />
          </section>

          {/* 3. Sample Assessment Preview (mandatory) */}
          <section>
            <SampleAssessmentPreview
              assessmentSummary={{
                businessName: sampleBusinessName,
                score: sampleScore,
                interpretation: sampleInterpretation,
                data_source: "sample",
              }}
              findings={{
                findings: sampleFindings,
                data_source: "sample",
              }}
            />
          </section>

          {/* 4. Methodology Section (mandatory) */}
          <section>
            <MethodologySection steps={methodologySteps} />
          </section>

          {/* 5. Trust Section (mandatory) */}
          <section>
            <TrustSection trustSignals={trustSignals} />
          </section>

          {/* 6. CTA Block (mandatory) */}
          <section>
            <CTABlock
              ctaText={primaryCtaText}
              ctaUrl={primaryCtaUrl}
              headline={primaryCtaHeadline}
              supportingText={primaryCtaSupportingText}
              cta_mode="learn_more"
            />
          </section>

          {/* 7. Secondary CTA (optional) */}
          {secondaryCtaText && secondaryCtaUrl && (
            <section className="flex justify-center">
              <SecondaryButton
                ctaText={secondaryCtaText}
                ctaUrl={secondaryCtaUrl}
              />
            </section>
          )}

          {/* 8. Footer (optional) */}
          {footerLinks && footerLinks.length > 0 && (
            <section>
              <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
