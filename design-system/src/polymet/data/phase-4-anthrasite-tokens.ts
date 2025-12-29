// Phase 4: Full Token System for Anthrasite UI States (Brand-Constrained)
// Purpose: Complete, modern, dark-first token system covering all UI states
// Status: LOCKED_AND_COMPLETE

export const PHASE_4_PURPOSE =
  "Produce a complete, modern, dark-first token system that covers all reasonably conceivable UI states (interactive, form, status, loading, overlay, etc.), while staying aligned with Anthrasite's brand fundamentals."

export const PHASE_4_STATUS = 'LOCKED_AND_COMPLETE'

// ============================================================================
// HARD BRAND CONSTRAINTS (DO NOT REVISIT)
// ============================================================================

export const BRAND_CONSTRAINTS = {
  theme: 'Dark-first by default',
  backgrounds: 'Near-black backgrounds',
  text: 'White primary text',
  accent: 'Electric blue (#0066FF)',
  cta_color: 'Electric blue (primary CTA)',
  link_color: 'Electric blue (primary link)',
  status_colors: 'Simple trim colors (success/warning/error) - restrained',
  vibe: 'Minimal, high-contrast, modern',
}

// ============================================================================
// 1. TOKEN TAXONOMY (CSS-VARIABLE-FRIENDLY NAMING)
// ============================================================================

// COLOR TOKENS
export const COLOR_TOKENS = {
  background: {
    canvas: '#232323',
    surface: '#141414',
    elevated: '#1A1A1A',
    overlay: 'rgba(35,35,35,0.85)',
    scrim: 'rgba(0,0,0,0.6)',
    subtle: 'rgba(255,255,255,0.03)',
    muted: 'rgba(255,255,255,0.06)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    disabled: '#4B5563',
    inverse: '#232323',
    link: '#0066FF',
    link_hover: '#3385FF',
  },
  border: {
    default: 'rgba(255,255,255,0.1)',
    subtle: 'rgba(255,255,255,0.05)',
    strong: 'rgba(255,255,255,0.2)',
    focus: '#0066FF',
  },
  interactive: {
    cta_default: '#0066FF',
    cta_hover: '#0052CC',
    cta_active: '#0047B3',
    cta_disabled: 'rgba(0,102,255,0.3)',
    cta_text: '#FFFFFF',
    secondary_default: 'rgba(255,255,255,0.1)',
    secondary_hover: 'rgba(255,255,255,0.15)',
    secondary_active: 'rgba(255,255,255,0.2)',
    secondary_disabled: 'rgba(255,255,255,0.05)',
    secondary_text: '#FFFFFF',
    secondary_text_disabled: '#6B7280',
    tertiary_default: 'transparent',
    tertiary_hover: 'rgba(255,255,255,0.08)',
    tertiary_active: 'rgba(255,255,255,0.12)',
    tertiary_text: '#9CA3AF',
    tertiary_text_hover: '#FFFFFF',
    tertiary_text_disabled: '#4B5563',
    destructive_default: '#FF3B30',
    destructive_hover: '#E6342A',
    destructive_active: '#CC2E24',
    destructive_disabled: 'rgba(255,59,48,0.3)',
    destructive_text: '#FFFFFF',
  },
  status: {
    success_trim: '#22C55E',
    success_text: '#22C55E',
    success_bg: 'rgba(34,197,94,0.1)',
    success_border: 'rgba(34,197,94,0.3)',
    warning_trim: '#FFC107',
    warning_text: '#FFC107',
    warning_bg: 'rgba(255,193,7,0.1)',
    warning_border: 'rgba(255,193,7,0.3)',
    error_trim: '#FF3B30',
    error_text: '#FF3B30',
    error_bg: 'rgba(255,59,48,0.1)',
    error_border: 'rgba(255,59,48,0.3)',
    info_trim: '#0066FF',
    info_text: '#0066FF',
    info_bg: 'rgba(0,102,255,0.1)',
    info_border: 'rgba(0,102,255,0.3)',
  },
  focus: {
    ring: '#0066FF',
    ring_offset: '#232323',
    ring_width: '2px',
    ring_offset_width: '2px',
  },
  skeleton: {
    base: 'rgba(255,255,255,0.08)',
    shimmer: 'rgba(255,255,255,0.12)',
  },
}

// TYPOGRAPHY TOKENS
export const TYPOGRAPHY_TOKENS = {
  family: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'SF Mono', 'Consolas', monospace",
  },
  size: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '40px',
    '6xl': '48px',
  },
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  leading: {
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',
  },
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
}

// SPACING TOKENS
export const SPACING_TOKENS = {
  scale: {
    '0': '0',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
    '24': '96px',
    '32': '128px',
  },
  section: {
    sm: '48px',
    md: '64px',
    lg: '96px',
    xl: '128px',
  },
  component: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  gap: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
}

// RADIUS TOKENS
export const RADIUS_TOKENS = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
}

// ELEVATION TOKENS
export const ELEVATION_TOKENS = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.3)',
  md: '0 2px 8px rgba(0,0,0,0.4)',
  lg: '0 4px 16px rgba(0,0,0,0.5)',
  xl: '0 8px 32px rgba(0,0,0,0.6)',
  '2xl': '0 16px 48px rgba(0,0,0,0.7)',
  cta: '0 4px 16px rgba(0,102,255,0.3)',
  cta_hover: '0 6px 20px rgba(0,102,255,0.4)',
}

// MOTION TOKENS
export const MOTION_TOKENS = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    ease_in: 'cubic-bezier(0.4, 0, 1, 1)',
    ease_out: 'cubic-bezier(0, 0, 0.2, 1)',
    ease_in_out: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// Z-INDEX TOKENS
export const Z_INDEX_TOKENS = {
  base: '0',
  dropdown: '1000',
  sticky: '1100',
  popover: '1200',
  modal: '1300',
  toast: '1400',
  tooltip: '1500',
}

// ============================================================================
// 2. STATE COVERAGE CHECKLIST (EXPLICIT)
// ============================================================================

export const STATE_COVERAGE = {
  primary_button: {
    default: {
      bg: '#0066FF',
      text: '#FFFFFF',
      shadow: '0 4px 16px rgba(0,102,255,0.3)',
    },
    hover: {
      bg: '#0052CC',
      text: '#FFFFFF',
      shadow: '0 6px 20px rgba(0,102,255,0.4)',
    },
    active: { bg: '#0047B3', text: '#FFFFFF' },
    focus: { ring: '#0066FF', ring_width: '2px' },
    disabled: {
      bg: 'rgba(0,102,255,0.3)',
      text: '#4B5563',
      cursor: 'not-allowed',
    },
    loading: { bg: '#0066FF', text: 'transparent', spinner: '#FFFFFF' },
  },
  secondary_button: {
    default: {
      bg: 'rgba(255,255,255,0.1)',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.1)',
    },
    hover: { bg: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.2)' },
    active: { bg: 'rgba(255,255,255,0.2)' },
    focus: { ring: '#0066FF' },
    disabled: { bg: 'rgba(255,255,255,0.05)', text: '#6B7280' },
  },
  tertiary_button: {
    default: { bg: 'transparent', text: '#9CA3AF' },
    hover: { bg: 'rgba(255,255,255,0.08)', text: '#FFFFFF' },
    active: { bg: 'rgba(255,255,255,0.12)' },
    focus: { ring: '#0066FF' },
    disabled: { text: '#4B5563' },
  },
  destructive_button: {
    default: { bg: '#FF3B30', text: '#FFFFFF' },
    hover: { bg: '#E6342A' },
    active: { bg: '#CC2E24' },
    focus: { ring: '#FF3B30' },
    disabled: { bg: 'rgba(255,59,48,0.3)', text: '#4B5563' },
  },
  link: {
    default: { text: '#0066FF', underline: 'none' },
    hover: { text: '#3385FF', underline: 'underline' },
    active: { text: '#0047B3' },
    focus: { ring: '#0066FF', ring_offset: '2px' },
  },
  input: {
    default: {
      bg: '#141414',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.1)',
      placeholder: '#6B7280',
    },
    hover: { border: 'rgba(255,255,255,0.2)' },
    focus: { border: '#0066FF', ring: '#0066FF' },
    disabled: {
      bg: 'rgba(255,255,255,0.03)',
      text: '#4B5563',
      cursor: 'not-allowed',
    },
    error: { border: '#FF3B30', ring: '#FF3B30' },
  },
  select: {
    default: {
      bg: '#141414',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.1)',
    },
    hover: { border: 'rgba(255,255,255,0.2)' },
    focus: { border: '#0066FF', ring: '#0066FF' },
    disabled: { bg: 'rgba(255,255,255,0.03)', text: '#4B5563' },
    open: {
      dropdown_bg: '#1A1A1A',
      dropdown_shadow: '0 4px 16px rgba(0,0,0,0.5)',
    },
  },
  checkbox: {
    default: { bg: '#141414', border: 'rgba(255,255,255,0.1)' },
    hover: { border: 'rgba(255,255,255,0.2)' },
    checked: { bg: '#0066FF', border: '#0066FF', icon: '#FFFFFF' },
    focus: { ring: '#0066FF' },
    disabled: {
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.05)',
    },
    disabled_checked: { bg: 'rgba(0,102,255,0.3)' },
  },
  toggle: {
    default: { bg: 'rgba(255,255,255,0.06)', thumb: '#FFFFFF' },
    hover: { bg: 'rgba(255,255,255,0.1)' },
    checked: { bg: '#0066FF', thumb: '#FFFFFF' },
    focus: { ring: '#0066FF' },
    disabled: { bg: 'rgba(255,255,255,0.03)', thumb: '#4B5563' },
  },
  badge: {
    default: { bg: 'rgba(255,255,255,0.06)', text: '#9CA3AF' },
    success: {
      bg: 'rgba(34,197,94,0.1)',
      text: '#22C55E',
      border: 'rgba(34,197,94,0.3)',
    },
    warning: {
      bg: 'rgba(255,193,7,0.1)',
      text: '#FFC107',
      border: 'rgba(255,193,7,0.3)',
    },
    error: {
      bg: 'rgba(255,59,48,0.1)',
      text: '#FF3B30',
      border: 'rgba(255,59,48,0.3)',
    },
    info: {
      bg: 'rgba(0,102,255,0.1)',
      text: '#0066FF',
      border: 'rgba(0,102,255,0.3)',
    },
  },
  alert: {
    info: {
      bg: 'rgba(0,102,255,0.1)',
      border: 'rgba(0,102,255,0.3)',
      icon: '#0066FF',
    },
    success: {
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.3)',
      icon: '#22C55E',
    },
    warning: {
      bg: 'rgba(255,193,7,0.1)',
      border: 'rgba(255,193,7,0.3)',
      icon: '#FFC107',
    },
    error: {
      bg: 'rgba(255,59,48,0.1)',
      border: 'rgba(255,59,48,0.3)',
      icon: '#FF3B30',
    },
  },
  toast: {
    default: {
      bg: '#1A1A1A',
      border: 'rgba(255,255,255,0.1)',
      shadow: '0 8px 32px rgba(0,0,0,0.6)',
    },
    success: { border: 'rgba(34,197,94,0.3)', icon: '#22C55E' },
    error: { border: 'rgba(255,59,48,0.3)', icon: '#FF3B30' },
  },
  card: {
    default: {
      bg: '#141414',
      border: 'rgba(255,255,255,0.1)',
      shadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
    elevated: { bg: '#1A1A1A', shadow: '0 2px 8px rgba(0,0,0,0.4)' },
    interactive: {
      hover_bg: 'rgba(255,255,255,0.03)',
      hover_border: 'rgba(255,255,255,0.2)',
    },
  },
  modal: {
    backdrop: { bg: 'rgba(35,35,35,0.85)' },
    content: {
      bg: '#1A1A1A',
      border: 'rgba(255,255,255,0.1)',
      shadow: '0 16px 48px rgba(0,0,0,0.7)',
    },
  },
  skeleton: {
    default: {
      bg: 'rgba(255,255,255,0.08)',
      shimmer: 'rgba(255,255,255,0.12)',
    },
  },
}

// ============================================================================
// 3. LIGHT THEME STRATEGY (OPTIONAL)
// ============================================================================

export const LIGHT_THEME_STRATEGY = {
  approach: 'Optional theme overlay with same token names',
  status: 'DEFERRED - Dark is default and primary focus',
  notes: [
    'If light mode is needed, define as CSS variable overrides',
    'Use same token names (e.g., --color-bg-canvas)',
    'Invert contrast: light backgrounds, dark text',
    'Maintain electric blue accent (#0066FF)',
    'Adjust status colors for light background readability',
  ],
}

// ============================================================================
// 4. TOKEN USAGE EXAMPLES (NON-VISUAL)
// ============================================================================

export const TOKEN_USAGE_EXAMPLES = {
  authenticated_assessment_landing: {
    description: 'Product surface with real assessment data',
    page_background: COLOR_TOKENS.background.canvas,
    hero_card: {
      bg: COLOR_TOKENS.background.surface,
      border: COLOR_TOKENS.border.default,
      shadow: ELEVATION_TOKENS.md,
      title_color: COLOR_TOKENS.text.primary,
      title_size: TYPOGRAPHY_TOKENS.size['4xl'],
      score_color: COLOR_TOKENS.text.link,
      score_size: TYPOGRAPHY_TOKENS.size['5xl'],
    },
    cta_button: STATE_COVERAGE.primary_button,
    data_badge: STATE_COVERAGE.badge.info,
  },
  public_explainer_page: {
    description: 'Marketing surface with sample data',
    page_background: COLOR_TOKENS.background.canvas,
    hero_title_color: COLOR_TOKENS.text.primary,
    hero_title_size: TYPOGRAPHY_TOKENS.size['5xl'],
    subtitle_color: COLOR_TOKENS.text.secondary,
    sample_card: STATE_COVERAGE.card.elevated,
    sample_badge: STATE_COVERAGE.badge.warning,
    cta_button: STATE_COVERAGE.primary_button,
  },
  email_capture_form: {
    description: 'Form with input validation states',
    form_bg: COLOR_TOKENS.background.surface,
    form_padding: SPACING_TOKENS.component.lg,
    form_radius: RADIUS_TOKENS.lg,
    label_color: COLOR_TOKENS.text.primary,
    input_default: STATE_COVERAGE.input.default,
    input_focus: STATE_COVERAGE.input.focus,
    input_error: STATE_COVERAGE.input.error,
    error_text_color: COLOR_TOKENS.status.error_text,
    submit_button: STATE_COVERAGE.primary_button,
  },
  interactive_card_grid: {
    description: 'Hoverable cards with loading states',
    grid_gap: SPACING_TOKENS.gap.lg,
    card_default: STATE_COVERAGE.card.interactive,
    card_radius: RADIUS_TOKENS.xl,
    skeleton: STATE_COVERAGE.skeleton.default,
  },
  modal_with_form: {
    description: 'Overlay modal with form inputs',
    backdrop: STATE_COVERAGE.modal.backdrop,
    modal_content: STATE_COVERAGE.modal.content,
    modal_radius: RADIUS_TOKENS.xl,
    modal_padding: SPACING_TOKENS.component.xl,
    title_color: COLOR_TOKENS.text.primary,
    title_size: TYPOGRAPHY_TOKENS.size['2xl'],
    close_button: STATE_COVERAGE.tertiary_button,
  },
}

// ============================================================================
// OPEN QUESTIONS & ASSUMPTIONS
// ============================================================================

export const ASSUMPTIONS = [
  'Status badges are informational, not interactive (no hover states)',
  'Active state covers pressed/clicked (no separate pressed token)',
  'Skeleton shimmer uses motion.duration.slow + ease_in_out',
  'Responsive scaling handled at component level, not token level',
  'Links maintain consistent color regardless of visited state',
  'Scrim token covers image overlays; gradients are component-specific',
  'Icon sizes follow typography scale or are component-specific',
  'Primary buttons have explicit loading state; others show disabled during loading',
]

// ============================================================================
// PHASE 4 EXIT CRITERIA
// ============================================================================

export const PHASE_4_EXIT_CRITERIA = {
  token_taxonomy_complete: true,
  all_ui_states_covered: true,
  brand_constraints_respected: true,
  accessibility_considered: true,
  usage_examples_provided: true,
  light_theme_strategy_defined: true,
  no_component_specific_tokens: true,
  semantic_naming_used: true,
  status: 'LOCKED_AND_COMPLETE',
}

export const NEXT_PHASE = 'PHASE_5_IMPLEMENTATION_BEGINS'
