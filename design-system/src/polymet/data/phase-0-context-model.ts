/**
 * Phase 0: Context Model & Use-Case Lock
 *
 * Purpose of Phase 0:
 * Define the only valid mental model for the system before any page structure,
 * components, or design work. This phase explicitly rejects inferred user intent
 * and instead anchors all behavior on provable system state.
 *
 * Phase 0 is about what the system knows, not who the visitor "might be."
 */

/**
 * Core Principle
 *
 * Design for explicit system context, not visitor psychology.
 * - No assumptions
 * - No intent inference
 * - No heuristics
 */

/**
 * Locked Context Model (Binary)
 *
 * There are exactly two context states.
 */

export type ContextState = "authenticated" | "unauthenticated";
export type DataSource = "real" | "sample";
export type CTAMode = "next_step" | "learn_more";
export type RenderContext = "web"; // future: 'email' | 'pdf'

/**
 * Context State A: Authenticated / Assessment-Backed
 *
 * Trigger:
 * - Valid JWT present in URL
 * - JWT resolves to a concrete lead_id and (optionally) run_id
 *
 * What the system knows:
 * - The business is known
 * - A completed assessment exists
 * - All displayed data must be real
 *
 * Rules:
 * - Real assessment data only
 * - No sample or placeholder data
 * - No intent inference
 * - No return-visitor logic
 * - No UTMs or channel logic
 *
 * Failure mode:
 * - If JWT is invalid, expired, or cannot be resolved → redirect to Context State B
 *
 * Role of the page:
 * - Product surface, not marketing
 * - Validate the personalized claim made in the email
 * - Drive a clear next action
 */
export interface AuthenticatedContext {
  auth_state: "authenticated";
  data_source: "real";
  cta_mode: "next_step";
  render_context: RenderContext;
  jwt: string;
  lead_id: string;
  run_id?: string;
}

/**
 * Context State B: Unauthenticated / Public
 *
 * Trigger:
 * - No JWT present
 * - Invalid or expired JWT
 * - Direct navigation
 *
 * What the system knows:
 * - Nothing about the visitor
 * - Cannot distinguish warm vs cold
 * - Cannot distinguish source or intent
 *
 * Rules:
 * - Generic sample data is allowed
 * - Sample data must be clearly labeled
 * - No personalization
 * - No inferred state or segmentation
 *
 * Role of the page:
 * - Explainer + legitimacy
 * - Show what the product is
 * - Capture interest or intent
 */
export interface UnauthenticatedContext {
  auth_state: "unauthenticated";
  data_source: "sample";
  cta_mode: "learn_more";
  render_context: RenderContext;
}

export type SystemContext = AuthenticatedContext | UnauthenticatedContext;

/**
 * Explicit Non-Goals (Hard Constraints)
 *
 * The system does not do the following in Phase 0–2:
 * - No "warm vs cold" visitor distinction
 * - No return-visitor behavior
 * - No cookies, UTMs, or channel inference
 * - No adaptive copy or logic based on behavior
 * - No personalization without authentication
 * - No sample data in authenticated contexts
 *
 * These are out of scope by design, not omissions.
 */
export const NON_GOALS = [
  "warm_vs_cold_distinction",
  "return_visitor_behavior",
  "cookie_tracking",
  "utm_inference",
  "channel_inference",
  "adaptive_copy_without_auth",
  "behavioral_logic",
  "personalization_without_auth",
  "sample_data_in_authenticated_context",
] as const;

/**
 * Canonical Page Archetypes
 *
 * Phase 0 defines exactly two page archetypes.
 */

/**
 * Archetype 1: Assessment Landing (Authenticated)
 *
 * - Triggered by Context State A
 * - Receives real assessment data
 * - Exists to confirm relevance and drive next action
 * - If authentication fails → redirect to Archetype 2
 */
export interface AssessmentLandingArchetype {
  type: "assessment_landing";
  context: AuthenticatedContext;
  purpose: "confirm_relevance_and_drive_action";
  data_requirements: "real_assessment_data_only";
  fallback: "redirect_to_public_explainer";
}

/**
 * Archetype 2: Public Explainer / Homepage (Unauthenticated)
 *
 * - Triggered by Context State B
 * - Uses generic sample data
 * - Explains what the product is and why it matters
 * - Acts as fallback for all unauthenticated traffic
 */
export interface PublicExplainerArchetype {
  type: "public_explainer";
  context: UnauthenticatedContext;
  purpose: "explain_product_and_capture_interest";
  data_requirements: "generic_sample_data_clearly_labeled";
  role: "fallback_for_unauthenticated_traffic";
}

export type PageArchetype =
  | AssessmentLandingArchetype
  | PublicExplainerArchetype;

/**
 * Parameterization Allowed (Locked)
 *
 * All future phases may parameterize only on:
 * - auth_state: authenticated | unauthenticated
 * - data_source: real | sample
 * - cta_mode: next_step | learn_more
 * - render_context: web (future: email, pdf)
 *
 * No other parameters may be introduced without revisiting Phase 0.
 */
export interface AllowedParameters {
  auth_state: ContextState;
  data_source: DataSource;
  cta_mode: CTAMode;
  render_context: RenderContext;
}

/**
 * Phase 0 Exit Criteria
 *
 * Phase 0 is complete when:
 * - The binary context model is accepted
 * - Exactly two archetypes are acknowledged
 * - All non-goals are respected
 * - No design, layout, or component work has begun
 *
 * Status: ✅ Phase 0 is locked and complete
 *
 * Next phase: Phase 1 — Page Structure & Section Hierarchy
 */
export const PHASE_0_STATUS = "locked_and_complete" as const;
export const NEXT_PHASE =
  "phase_1_page_structure_and_section_hierarchy" as const;
