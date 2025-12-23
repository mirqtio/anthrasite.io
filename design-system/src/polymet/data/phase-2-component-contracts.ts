/**
 * Phase 2: Component Definitions & Contracts
 *
 * Purpose: Translate Phase 1 page structure into formal, reusable component contracts
 * Status: LOCKED_AND_COMPLETE
 */

// ============================================================================
// PHASE 2 METADATA
// ============================================================================

export const PHASE_2_PURPOSE =
  "Translate Phase 1 page structure into formal, reusable component contracts";

export const PHASE_2_STATUS = "LOCKED_AND_COMPLETE";

export const PHASE_2_DEFINES = [
  "Component boundaries",
  "Required vs optional props",
  "Data shape expectations",
  "Variants driven only by Phase 0 parameters",
  "Hard constraints (cardinality, interactivity, scope)",
] as const;

export const PHASE_2_NON_GOALS = [
  "Visual design",
  "Tokens",
  "Styling",
  "Layout or spacing",
  "Copy polish",
  "New behavioral logic",
] as const;

// ============================================================================
// PHASE 2 GUARDRAILS (HARD)
// ============================================================================

export const PHASE_2_GUARDRAILS = [
  "No new parameters beyond Phase 0",
  "No inferred intent or behavioral state",
  "No fallback logic beyond what is explicitly allowed",
  "No formatting rules introduced unless unavoidable",
  "If a component cannot function without a new parameter → flag, do not invent",
] as const;

export const ALLOWED_PARAMETERS = {
  auth_state: ["authenticated", "unauthenticated"] as const,
  data_source: ["real", "sample"] as const,
  cta_mode: ["next_step", "learn_more"] as const,
  render_context: ["web"] as const, // future only
};

// ============================================================================
// SHARED PRIMITIVE COMPONENTS
// ============================================================================

export type AssessmentSummaryProps = {
  businessName: string; // Required
  score: number | string; // Required (e.g. 78 or "B+")
  impactRange?: string; // Optional, display-ready
  interpretation: string; // Required (brief)
  data_source: "real" | "sample"; // Required
};

export const ASSESSMENT_SUMMARY_CONSTRAINTS = [
  "When data_source = sample, must display a clear 'Sample Data' label",
  "Non-interactive",
  "No drill-down or expansion",
] as const;

export const ASSESSMENT_SUMMARY_SUBCOMPONENTS = [
  "ScoreDisplay",
  "ImpactSummary",
  "InterpretationText",
] as const;

// ----------------------------------------------------------------------------

export type FindingsListProps = {
  findings: Array<{
    title: string;
    description: string;
    impact?: string; // Optional, display-ready
  }>;
  data_source: "real" | "sample";
};

export const FINDINGS_LIST_CONSTRAINTS = [
  "Hard contract: findings length must be 3–5",
  "All provided findings are rendered",
  "No truncation, pagination, or expansion",
  "Non-interactive",
] as const;

export const FINDINGS_LIST_SUBCOMPONENTS = [
  "FindingCard",
  "FindingTitle",
  "FindingDescription",
  "ImpactIndicator (optional)",
] as const;

// ----------------------------------------------------------------------------

export type CTABlockProps = {
  ctaText: string; // Required
  ctaUrl: string; // Required
  headline?: string; // Optional
  supportingText?: string; // Optional
  cta_mode: "next_step" | "learn_more";
};

export const CTA_BLOCK_CONSTRAINTS = [
  "Single primary action only",
  "No secondary buttons inside this component",
  "No conditional rendering",
] as const;

export const CTA_BLOCK_SUBCOMPONENTS = [
  "CTAHeadline (optional)",
  "PrimaryButton",
  "SupportingText (optional)",
] as const;

// ============================================================================
// AUTHENTICATED-ONLY COMPONENTS
// ============================================================================

export type ContextHeaderProps = {
  businessName: string; // Required
  assessmentDate?: string; // Optional (display-ready)
};

export const CONTEXT_HEADER_CONSTRAINTS = [
  "Orienting only",
  "No explanatory copy",
  "Non-interactive",
  "No links or actions",
] as const;

export const CONTEXT_HEADER_SUBCOMPONENTS = [
  "PersonalizedGreeting",
  "ContextReminder",
] as const;

// ----------------------------------------------------------------------------

export type CredibilityAnchorAuthProps = {
  aboutText: string; // Required (1–2 sentences)
  trustSignal?: string; // Optional
  showLogo?: boolean; // Optional
};

export const CREDIBILITY_ANCHOR_AUTH_CONSTRAINTS = [
  "Non-interactive",
  "No links, carousels, or expansion",
  "Static text and optional static logo only",
] as const;

export const CREDIBILITY_ANCHOR_AUTH_SUBCOMPONENTS = [
  "AboutText",
  "TrustSignal (optional)",
  "Logo (optional, static)",
] as const;

// ----------------------------------------------------------------------------

export type SecondaryButtonProps = {
  ctaText: string; // Required
  ctaUrl: string; // Required
};

export const SECONDARY_BUTTON_CONSTRAINTS = [
  "Optional",
  "Must not compete with primary CTA",
  "Visually subordinate (styling handled in Phase 3)",
] as const;

// ============================================================================
// UNAUTHENTICATED-ONLY COMPONENTS
// ============================================================================

export type ProblemHeaderProps = {
  headline: string; // Required
  subheadline: string; // Required
};

export const PROBLEM_HEADER_CONSTRAINTS = [
  "Non-interactive",
  "No personalization",
] as const;

export const PROBLEM_HEADER_SUBCOMPONENTS = [
  "Headline",
  "Subheadline",
] as const;

// ----------------------------------------------------------------------------

export type ValuePropositionProps = {
  headline: string; // Required
  explanation: string; // Required (2–3 sentences)
  benefits?: string[]; // Optional (max 3–5)
};

export const VALUE_PROPOSITION_CONSTRAINTS = [
  "Benefits optional",
  "No feature sprawl",
  "Declarative, not persuasive",
] as const;

export const VALUE_PROPOSITION_SUBCOMPONENTS = [
  "ExplanationText",
  "BenefitsList (optional)",
] as const;

// ----------------------------------------------------------------------------

export type SampleAssessmentPreviewProps = {
  assessmentSummary: AssessmentSummaryProps;
  findings: FindingsListProps;
};

export const SAMPLE_ASSESSMENT_PREVIEW_CONSTRAINTS = [
  "data_source must be sample",
  "Must display 'Sample Data' label",
  "Reuses shared components",
  "Non-interactive",
] as const;

export const SAMPLE_ASSESSMENT_PREVIEW_SUBCOMPONENTS = [
  "SectionHeader",
  "SampleDataLabel",
  "AssessmentSummary",
  "FindingsList",
] as const;

// ----------------------------------------------------------------------------

export type MethodologySectionProps = {
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;
};

export const METHODOLOGY_SECTION_CONSTRAINTS = [
  "Hard contract: exactly 3 steps",
  "Non-interactive",
  "No drill-down",
] as const;

export const METHODOLOGY_SECTION_SUBCOMPONENTS = [
  "ProcessSteps",
  "ProcessStep",
] as const;

// ----------------------------------------------------------------------------

export type TrustSectionProps = {
  trustSignals: Array<{
    type: "team" | "backers" | "testimonials" | "logos" | "methodology";
    content: Record<string, any>;
  }>;
};

export const TRUST_SECTION_CONSTRAINTS = [
  "Hard contract: max 3 trust signals",
  "Upstream must prioritize",
  "Component may defensively slice",
  "No expansion or navigation",
] as const;

export const TRUST_SECTION_SUBCOMPONENTS = [
  "TrustSignalCard (variant by type)",
] as const;

// ----------------------------------------------------------------------------

export type FooterProps = {
  footerLinks: Array<{ label: string; url: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
};

export const FOOTER_CONSTRAINTS = [
  "Always rendered",
  "No conditional logic",
] as const;

// ============================================================================
// COMPONENT INVENTORY SUMMARY
// ============================================================================

export const SHARED_COMPONENTS = [
  "AssessmentSummary",
  "FindingsList",
  "CTABlock",
] as const;

export const AUTHENTICATED_ONLY_COMPONENTS = [
  "ContextHeader",
  "CredibilityAnchor (Authenticated Variant)",
  "SecondaryButton (Optional)",
] as const;

export const UNAUTHENTICATED_ONLY_COMPONENTS = [
  "ProblemHeader",
  "ValueProposition",
  "SampleAssessmentPreview",
  "MethodologySection",
  "TrustSection (Unauthenticated Variant)",
  "Footer",
] as const;

export const ALL_COMPONENTS = [
  ...SHARED_COMPONENTS,
  ...AUTHENTICATED_ONLY_COMPONENTS,
  ...UNAUTHENTICATED_ONLY_COMPONENTS,
] as const;

// ============================================================================
// PHASE 2 EXIT CRITERIA
// ============================================================================

export const PHASE_2_EXIT_CRITERIA = {
  all_components_have_formal_apis: true,
  cardinality_and_interactivity_explicit: true,
  variants_driven_by_phase_0_params_only: true,
  no_new_parameters_introduced: true,
  no_styling_or_design_decisions: true,
  status: "LOCKED_AND_COMPLETE",
} as const;

// ============================================================================
// NEXT PHASE
// ============================================================================

export const NEXT_PHASE = "PHASE_3_VISUAL_DESIGN_AND_TOKENS";
