/**
 * Phase 3: Design Tokens & Visual Primitives
 *
 * Purpose: Define design tokens and primitives that decorate already-locked structure
 * Status: LOCKED_AND_COMPLETE
 *
 * CRITICAL: Tokens describe appearance, not meaning.
 * Meaning already lives in components and structure.
 * Tokens must never become a second, shadow API.
 */

// ============================================================================
// PHASE 3 METADATA
// ============================================================================

export const PHASE_3_PURPOSE =
  "Define design tokens and primitives that decorate already-locked structure without introducing new semantics or behavior";

export const PHASE_3_STATUS = "LOCKED_AND_COMPLETE";

export const PHASE_3_PRINCIPLES = [
  "Tokens describe appearance, not meaning",
  "Meaning already lives in components and structure",
  "Tokens must never become a second, shadow API",
  "No component-specific tokens",
  "No variant-encoding in tokens",
  "No behavioral meaning in color",
  "Typography encodes hierarchy, not importance",
] as const;

export const PHASE_3_NON_GOALS = [
  "Reinterpret structure",
  "Encode semantics",
  "Introduce new hierarchy",
  "Smuggle behavior into styling",
  "Create implicit variants not defined in Phase 2",
  "Component-specific tokens",
  "Variant-encoding tokens",
  "Behavioral meaning in colors",
] as const;

// ============================================================================
// TOKEN TAXONOMY
// ============================================================================

export const TOKEN_CATEGORIES = [
  "color",
  "typography",
  "spacing",
  "elevation",
  "radius",
  "motion",
] as const;

export const TOKEN_NAMING_CONVENTION = {
  pattern: "category.subcategory.variant",
  examples: [
    "color.text.primary",
    "color.text.muted",
    "color.background.surface",
    "typography.heading.lg",
    "spacing.section.lg",
  ],

  disallowed_examples: [
    "color.success (implies logic)",
    "color.cta.primary (component-specific)",
    "color.background.authenticated (variant-encoding)",
    "typography.hero.emphasis (behavioral meaning)",
  ],
} as const;

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Color tokens define appearance only.
 * No behavioral meaning (trust, risk, urgency, success/failure).
 * No component-specific colors.
 * No variant-encoding.
 */

export const COLOR_TOKENS = {
  // Text Colors (hierarchy only)
  text: {
    primary: "hsl(var(--foreground))", // Primary text, highest contrast
    secondary: "hsl(var(--muted-foreground))", // Secondary text, reduced emphasis
    muted: "hsl(var(--muted-foreground))", // Tertiary text, lowest emphasis
    inverse: "hsl(var(--background))", // Text on dark backgrounds
  },

  // Background Colors (surface hierarchy only)
  background: {
    base: "hsl(var(--background))", // Page background
    surface: "hsl(var(--card))", // Elevated surface (cards, panels)
    subtle: "hsl(var(--muted))", // Subtle background for low-emphasis areas
    inverse: "hsl(var(--foreground))", // Inverse background for contrast
  },

  // Border Colors (visual separation only)
  border: {
    default: "hsl(var(--border))", // Standard borders
    subtle: "hsl(var(--border) / 0.5)", // Reduced emphasis borders
    emphasis: "hsl(var(--border) / 1)", // Emphasized borders
  },

  // Interactive Colors (state only, not meaning)
  interactive: {
    default: "hsl(var(--primary))", // Default interactive elements
    hover: "hsl(var(--primary) / 0.9)", // Hover state
    active: "hsl(var(--primary) / 0.8)", // Active/pressed state
    disabled: "hsl(var(--muted))", // Disabled state
  },

  // Accent Colors (emphasis only, not semantic)
  accent: {
    primary: "hsl(var(--accent))", // Primary accent
    secondary: "hsl(var(--secondary))", // Secondary accent
    muted: "hsl(var(--muted))", // Muted accent
  },
} as const;

export const COLOR_CONSTRAINTS = [
  "Colors must not imply trust, risk, urgency, success, or failure",
  "Colors must not reference component names",
  "Colors must not encode auth_state, data_source, or cta_mode",
  "If color appears to communicate meaning, that meaning must exist structurally in copy or hierarchy",
] as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * Typography tokens encode hierarchy, not importance or persuasion.
 * No "hero emphasis", "CTA urgency", or "trust copy style".
 */

export const TYPOGRAPHY_TOKENS = {
  // Font Families
  fontFamily: {
    sans: "var(--font-sans)", // Primary sans-serif
    mono: "var(--font-mono)", // Monospace (for data, code)
  },

  // Font Sizes (hierarchy only)
  fontSize: {
    xs: "0.75rem", // 12px - Smallest text (captions, labels)
    sm: "0.875rem", // 14px - Small text (secondary content)
    base: "1rem", // 16px - Body text
    lg: "1.125rem", // 18px - Large body text
    xl: "1.25rem", // 20px - Small headings
    "2xl": "1.5rem", // 24px - Medium headings
    "3xl": "1.875rem", // 30px - Large headings
    "4xl": "2.25rem", // 36px - Extra large headings
    "5xl": "3rem", // 48px - Display headings
  },

  // Line Heights (readability only)
  lineHeight: {
    tight: "1.25", // Tight leading for headings
    normal: "1.5", // Normal leading for body text
    relaxed: "1.75", // Relaxed leading for long-form content
  },

  // Font Weights (hierarchy only)
  fontWeight: {
    normal: "400", // Regular text
    medium: "500", // Medium emphasis
    semibold: "600", // Semibold emphasis
    bold: "700", // Bold emphasis
  },

  // Semantic Typography Scales (hierarchy only)
  heading: {
    xl: {
      fontSize: "3rem", // 48px
      lineHeight: "1.25",
      fontWeight: "700",
    },
    lg: {
      fontSize: "2.25rem", // 36px
      lineHeight: "1.25",
      fontWeight: "700",
    },
    md: {
      fontSize: "1.875rem", // 30px
      lineHeight: "1.25",
      fontWeight: "600",
    },
    sm: {
      fontSize: "1.5rem", // 24px
      lineHeight: "1.25",
      fontWeight: "600",
    },
    xs: {
      fontSize: "1.25rem", // 20px
      lineHeight: "1.25",
      fontWeight: "600",
    },
  },

  body: {
    lg: {
      fontSize: "1.125rem", // 18px
      lineHeight: "1.75",
      fontWeight: "400",
    },
    base: {
      fontSize: "1rem", // 16px
      lineHeight: "1.5",
      fontWeight: "400",
    },
    sm: {
      fontSize: "0.875rem", // 14px
      lineHeight: "1.5",
      fontWeight: "400",
    },
  },

  caption: {
    fontSize: "0.75rem", // 12px
    lineHeight: "1.5",
    fontWeight: "400",
  },
} as const;

export const TYPOGRAPHY_CONSTRAINTS = [
  "Typography encodes hierarchy, not persuasion",
  "No 'hero emphasis', 'CTA urgency', or 'trust copy style'",
  "No component-specific typography tokens",
  "Semantic scales (heading, body, caption) describe structure, not importance",
] as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Spacing tokens define padding, margins, and gaps.
 * Generic scale, not component-specific.
 */

export const SPACING_TOKENS = {
  // Base spacing scale (t-shirt sizes)
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
  "5xl": "8rem", // 128px

  // Semantic spacing (structural only)
  section: {
    sm: "2rem", // 32px - Small section spacing
    md: "3rem", // 48px - Medium section spacing
    lg: "4rem", // 64px - Large section spacing
    xl: "6rem", // 96px - Extra large section spacing
  },

  container: {
    sm: "1rem", // 16px - Small container padding
    md: "1.5rem", // 24px - Medium container padding
    lg: "2rem", // 32px - Large container padding
  },

  element: {
    xs: "0.25rem", // 4px - Minimal element spacing
    sm: "0.5rem", // 8px - Small element spacing
    md: "1rem", // 16px - Medium element spacing
    lg: "1.5rem", // 24px - Large element spacing
  },
} as const;

export const SPACING_CONSTRAINTS = [
  "Spacing tokens are generic, not component-specific",
  "No 'cta.padding' or 'hero.margin' tokens",
  "Semantic spacing (section, container, element) describes structure, not components",
] as const;

// ============================================================================
// ELEVATION TOKENS
// ============================================================================

/**
 * Elevation tokens define shadows and z-index tiers.
 * Hierarchy only, not importance or emphasis.
 */

export const ELEVATION_TOKENS = {
  // Shadow scale (visual hierarchy only)
  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Z-index tiers (stacking hierarchy only)
  zIndex: {
    base: "0",
    raised: "10",
    overlay: "20",
    modal: "30",
    popover: "40",
    tooltip: "50",
  },
} as const;

export const ELEVATION_CONSTRAINTS = [
  "Elevation defines visual hierarchy, not importance",
  "No component-specific elevation tokens",
  "Z-index tiers are structural, not semantic",
] as const;

// ============================================================================
// RADIUS TOKENS
// ============================================================================

/**
 * Radius tokens define corner radii.
 * Visual style only, not semantic.
 */

export const RADIUS_TOKENS = {
  none: "0",
  sm: "calc(var(--radius) - 4px)",
  base: "calc(var(--radius) - 2px)",
  md: "var(--radius)",
  lg: "calc(var(--radius) + 2px)",
  xl: "calc(var(--radius) + 4px)",
  "2xl": "calc(var(--radius) + 8px)",
  full: "9999px",
} as const;

export const RADIUS_CONSTRAINTS = [
  "Radius tokens are generic, not component-specific",
  "No semantic meaning attached to radius values",
] as const;

// ============================================================================
// MOTION TOKENS (OPTIONAL, MINIMAL)
// ============================================================================

/**
 * Motion tokens define duration and easing.
 * Minimal, generic only.
 */

export const MOTION_TOKENS = {
  duration: {
    fast: "150ms",
    base: "250ms",
    slow: "350ms",
  },

  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export const MOTION_CONSTRAINTS = [
  "Motion tokens are minimal and generic",
  "No component-specific or behavioral motion tokens",
] as const;

// ============================================================================
// THEME STRATEGY
// ============================================================================

/**
 * One token system, two surfaces (light/dark).
 * No separate token systems per archetype.
 * No "authenticated vs unauthenticated" palettes.
 */

export const THEME_STRATEGY = {
  approach:
    "Single base token system with optional theme overlays (light/dark)",

  constraints: [
    "No separate token systems per archetype",
    "No separate 'authenticated vs unauthenticated' palettes",
    "Visual differences achieved by token application, not token definition",
    "Theme overlays modify color values only, not structure",
  ],

  light_theme: {
    description: "Light theme overlay for base token system",
    applies_to: "All components in both archetypes",
    modifies: ["color.text.*", "color.background.*", "color.border.*"],
  },

  dark_theme: {
    description: "Dark theme overlay for base token system",
    applies_to: "All components in both archetypes",
    modifies: ["color.text.*", "color.background.*", "color.border.*"],
  },
} as const;

// ============================================================================
// TOKEN USAGE EXAMPLES (GENERIC)
// ============================================================================

/**
 * Examples of how tokens are applied.
 * Generic, not component-specific.
 */

export const TOKEN_USAGE_EXAMPLES = {
  text_hierarchy: {
    description: "Applying text hierarchy tokens",
    example: {
      primary_text: "color.text.primary + typography.body.base",
      secondary_text: "color.text.secondary + typography.body.sm",
      heading: "color.text.primary + typography.heading.lg",
    },
  },

  surface_hierarchy: {
    description: "Applying surface hierarchy tokens",
    example: {
      page_background: "color.background.base",
      card_surface:
        "color.background.surface + elevation.shadow.sm + radius.md",
      subtle_section: "color.background.subtle + spacing.section.md",
    },
  },

  spacing_application: {
    description: "Applying spacing tokens",
    example: {
      section_gap: "spacing.section.lg",
      element_padding: "spacing.element.md",
      container_padding: "spacing.container.lg",
    },
  },

  interactive_states: {
    description: "Applying interactive state tokens",
    example: {
      default_state: "color.interactive.default",
      hover_state: "color.interactive.hover",
      active_state: "color.interactive.active",
      disabled_state: "color.interactive.disabled",
    },
  },
} as const;

// ============================================================================
// WHAT PHASE 3 DOES NOT COVER
// ============================================================================

export const PHASE_3_DOES_NOT_COVER = [
  "Component-specific styling decisions",
  "Layout or positioning logic",
  "Copy or content changes",
  "Behavioral variants not defined in Phase 2",
  "Semantic meaning (trust, risk, urgency, success/failure)",
  "Component rewrites or restructuring",
  "New hierarchy or emphasis not in Phase 1",
  "Variant-encoding (auth_state, data_source, cta_mode)",
  "Mockups or visual designs",
] as const;

// ============================================================================
// FLAGGED ITEMS (IF ANY)
// ============================================================================

/**
 * Items that require clarification or new Phase 2 contracts.
 * Empty = Phase 3 is complete within constraints.
 */

export const FLAGGED_ITEMS: string[] = [
  // No items flagged - all tokens are appearance-only and do not require new logic
] as const;

// ============================================================================
// PHASE 3 EXIT CRITERIA
// ============================================================================

export const PHASE_3_EXIT_CRITERIA = {
  token_taxonomy_defined: true,
  token_values_specified: true,
  theme_strategy_documented: true,
  usage_examples_provided: true,
  non_coverage_explicit: true,
  no_semantic_smuggling: true,
  no_component_specific_tokens: true,
  no_variant_encoding: true,
  no_behavioral_meaning: true,
  status: "LOCKED_AND_COMPLETE",
} as const;

// ============================================================================
// NEXT PHASE
// ============================================================================

export const NEXT_PHASE = "PHASE_4_IMPLEMENTATION";
