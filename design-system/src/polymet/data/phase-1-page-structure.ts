/**
 * PHASE 1: PAGE STRUCTURE & SECTION HIERARCHY
 *
 * Purpose: Define what appears on each page and in what order
 *
 * Scope: Structure only - NO visual design, styling, tokens, copy polish, or implementation
 *
 * Status: LOCKED AND COMPLETE
 */

// ============================================================================
// PHASE 1 METADATA
// ============================================================================

export const PHASE_1_STATUS = "LOCKED_AND_COMPLETE" as const;

export const PHASE_1_PURPOSE =
  "Define section hierarchy for both page archetypes independent of visual design or implementation";

export const NEXT_PHASE =
  "PHASE_2_COMPONENT_DEFINITIONS_AND_CONTRACTS" as const;

// ============================================================================
// EXPLICIT NON-GOALS (HARD CONSTRAINTS)
// ============================================================================

export const PHASE_1_NON_GOALS = [
  "VISUAL_DESIGN",
  "COLORS_FONTS_SPACING",
  "TOKENS_OR_THEMING",
  "ANIMATIONS_OR_INTERACTIONS",
  "BEHAVIORAL_LOGIC",
  "DATA_FORMATTING_RULES",
] as const;

// ============================================================================
// PAGE ARCHETYPES
// ============================================================================

export const PAGE_ARCHETYPES = {
  AUTHENTICATED: "assessment_landing",
  UNAUTHENTICATED: "public_explainer",
} as const;

// ============================================================================
// SECTION STATUS TYPES
// ============================================================================

export type SectionStatus = "MANDATORY" | "OPTIONAL";

// ============================================================================
// SECTION DEFINITION TYPE
// ============================================================================

export interface SectionDefinition {
  id: string;
  name: string;
  status: SectionStatus;
  purpose: string;
  rules: string[];
  order: number;
}

// ============================================================================
// ARCHETYPE 1: ASSESSMENT LANDING (AUTHENTICATED)
// ============================================================================

export const AUTHENTICATED_PAGE_PURPOSE =
  "Confirm the personalized claim and drive a clear next step. Product-facing, not marketing-facing.";

export const AUTHENTICATED_SECTIONS: SectionDefinition[] = [
  {
    id: "context_header",
    name: "Context Header",
    status: "MANDATORY",
    purpose: "Confirms identity and relevance",
    order: 1,
    rules: [
      "Orientation only",
      "Confirms 'this is about you'",
      "Does not explain process or sourcing",
      "Non-interactive",
    ],
  },
  {
    id: "assessment_summary",
    name: "Assessment Summary",
    status: "MANDATORY",
    purpose: "Validates claim with headline data",
    order: 2,
    rules: [
      "Displays high-level score/grade",
      "Displays impact range or equivalent",
      "Uses real data only",
      "Non-interactive",
    ],
  },
  {
    id: "key_findings",
    name: "Key Findings",
    status: "MANDATORY",
    purpose: "Shows substance behind the score",
    order: 3,
    rules: [
      "Displays exactly 3–5 findings",
      "All findings shown (no truncation or expansion)",
      "Real data only",
      "No pagination or 'show more'",
    ],
  },
  {
    id: "primary_cta_block",
    name: "Primary CTA Block",
    status: "MANDATORY",
    purpose: "Drives next action",
    order: 4,
    rules: [
      "Single primary action",
      "No secondary buttons inside this block",
      "Action is explicit and forward-moving",
    ],
  },
  {
    id: "credibility_anchor",
    name: "Credibility Anchor",
    status: "MANDATORY",
    purpose: "Prevents 'who is this?' anxiety",
    order: 5,
    rules: [
      "Minimal credibility signal",
      "Non-interactive",
      "No links, no expansion",
      "Exists only to reassure legitimacy",
    ],
  },
  {
    id: "secondary_cta_footer",
    name: "Secondary CTA / Footer",
    status: "OPTIONAL",
    purpose: "Alternative action or legal/footer",
    order: 6,
    rules: [
      "Optional alternative action",
      "Legal / privacy / contact allowed here",
      "Must not compete with primary CTA",
    ],
  },
];

// ============================================================================
// ARCHETYPE 2: PUBLIC EXPLAINER / HOMEPAGE (UNAUTHENTICATED)
// ============================================================================

export const UNAUTHENTICATED_PAGE_PURPOSE =
  "Explain what the product is, establish legitimacy, and capture interest. Marketing-facing, but disciplined.";

export const UNAUTHENTICATED_SECTIONS: SectionDefinition[] = [
  {
    id: "problem_framing_header",
    name: "Problem Framing Header",
    status: "MANDATORY",
    purpose: "Establish problem space",
    order: 1,
    rules: [
      "Frames the problem, not the solution",
      "Non-interactive",
      "No personalization",
    ],
  },
  {
    id: "value_proposition",
    name: "Value Proposition",
    status: "MANDATORY",
    purpose: "Explain what this is",
    order: 2,
    rules: [
      "Explains what the product does and why it exists",
      "Concise, declarative",
      "No feature sprawl",
    ],
  },
  {
    id: "sample_assessment_preview",
    name: "Sample Assessment Preview",
    status: "MANDATORY",
    purpose: "Make value tangible",
    order: 3,
    rules: [
      "Uses generic sample data only",
      "Must be clearly labeled 'Sample'",
      "Reuses Assessment Summary + Findings structure",
      "Findings count remains 3–5",
    ],
  },
  {
    id: "methodology_how_it_works",
    name: "Methodology / How It Works",
    status: "MANDATORY",
    purpose: "Explain process",
    order: 4,
    rules: [
      "Explains the process at a high level",
      "Fixed number of steps (3–4)",
      "No drill-down or expansion",
    ],
  },
  {
    id: "trust_legitimacy_signals",
    name: "Trust / Legitimacy Signals",
    status: "MANDATORY",
    purpose: "Establish credibility",
    order: 5,
    rules: [
      "Displays no more than 3 trust signals",
      "Signals may vary in type (team, testimonials, methodology, etc.)",
      "Purpose is reassurance, not persuasion overload",
    ],
  },
  {
    id: "primary_cta_block",
    name: "Primary CTA Block",
    status: "MANDATORY",
    purpose: "Capture intent",
    order: 6,
    rules: [
      "Single primary action",
      "Clear next step (learn more, get assessment, etc.)",
    ],
  },
  {
    id: "secondary_cta_block",
    name: "Secondary CTA Block",
    status: "OPTIONAL",
    purpose: "Alternative conversion",
    order: 7,
    rules: [
      "Alternative path (waitlist, contact, etc.)",
      "Must not compete visually or structurally",
    ],
  },
  {
    id: "footer",
    name: "Footer",
    status: "MANDATORY",
    purpose: "Legal / contact",
    order: 8,
    rules: ["Legal, privacy, contact", "No special logic"],
  },
];

// ============================================================================
// SHARED SECTIONS
// ============================================================================

export interface SharedSectionConfig {
  section_name: string;
  shared: boolean;
  key_parameter: "data_source" | "cta_mode" | "auth_state";
  notes: string;
}

export const SHARED_SECTIONS: SharedSectionConfig[] = [
  {
    section_name: "Assessment Summary",
    shared: true,
    key_parameter: "data_source",
    notes: "Structure identical, data source varies by auth_state",
  },
  {
    section_name: "Key Findings",
    shared: true,
    key_parameter: "data_source",
    notes: "Structure identical, data source varies by auth_state",
  },
  {
    section_name: "CTA Block",
    shared: true,
    key_parameter: "cta_mode",
    notes: "Structure shared, action varies by context",
  },
  {
    section_name: "Credibility / Trust",
    shared: true,
    key_parameter: "auth_state",
    notes: "Minimal in authenticated, expanded in unauthenticated",
  },
];

// ============================================================================
// HARD STRUCTURAL CONSTRAINTS (LOCKED)
// ============================================================================

export const STRUCTURAL_CONSTRAINTS = {
  FINDINGS_COUNT_MIN: 3,
  FINDINGS_COUNT_MAX: 5,
  TRUST_SIGNALS_MAX: 3,
  METHODOLOGY_STEPS_MIN: 3,
  METHODOLOGY_STEPS_MAX: 4,
  AUTHENTICATED_CREDIBILITY_INTERACTIVE: false,
  NO_INTENT_INFERENCE: true,
  NO_ADAPTIVE_BRANCHING: true,
} as const;

export const CONSTRAINT_DESCRIPTIONS = [
  "Findings count: exactly 3–5",
  "Trust signals: max 3",
  "Authenticated credibility: non-interactive",
  "No intent inference",
  "No adaptive branching beyond Phase 0 parameters",
] as const;

// ============================================================================
// PHASE 1 EXIT CRITERIA
// ============================================================================

export const PHASE_1_EXIT_CRITERIA = {
  section_hierarchy_defined: true,
  mandatory_optional_explicit: true,
  shared_unique_identified: true,
  no_visual_logic_introduced: true,
  status: "SATISFIED",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get sections for a specific archetype
 */
export function getSectionsForArchetype(
  archetype: keyof typeof PAGE_ARCHETYPES
): SectionDefinition[] {
  return archetype === "AUTHENTICATED"
    ? AUTHENTICATED_SECTIONS
    : UNAUTHENTICATED_SECTIONS;
}

/**
 * Get mandatory sections for an archetype
 */
export function getMandatorySections(
  archetype: keyof typeof PAGE_ARCHETYPES
): SectionDefinition[] {
  return getSectionsForArchetype(archetype).filter(
    (section) => section.status === "MANDATORY"
  );
}

/**
 * Get optional sections for an archetype
 */
export function getOptionalSections(
  archetype: keyof typeof PAGE_ARCHETYPES
): SectionDefinition[] {
  return getSectionsForArchetype(archetype).filter(
    (section) => section.status === "OPTIONAL"
  );
}

/**
 * Validate findings count
 */
export function isValidFindingsCount(count: number): boolean {
  return (
    count >= STRUCTURAL_CONSTRAINTS.FINDINGS_COUNT_MIN &&
    count <= STRUCTURAL_CONSTRAINTS.FINDINGS_COUNT_MAX
  );
}

/**
 * Validate trust signals count
 */
export function isValidTrustSignalsCount(count: number): boolean {
  return count <= STRUCTURAL_CONSTRAINTS.TRUST_SIGNALS_MAX;
}

/**
 * Validate methodology steps count
 */
export function isValidMethodologyStepsCount(count: number): boolean {
  return (
    count >= STRUCTURAL_CONSTRAINTS.METHODOLOGY_STEPS_MIN &&
    count <= STRUCTURAL_CONSTRAINTS.METHODOLOGY_STEPS_MAX
  );
}
