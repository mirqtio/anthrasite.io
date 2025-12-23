/**
 * Anthrasite Design Tokens
 * Phase 5A: Token Export Pack
 *
 * This file exports the complete Anthrasite token system as:
 * 1. CSS variables (dark default, optional light overlay)
 * 2. Tailwind config mapping
 *
 * Hard Rule: No hardcoded colors/spacing outside these tokens
 */

// ============================================================================
// CSS VARIABLES (Dark Default)
// ============================================================================

export const CSS_VARIABLES = `
/* Anthrasite Design Tokens - Dark Default */
:root {
  /* ========== COLOR TOKENS ========== */
  
  /* Background */
  --color-bg-canvas: #0A0A0A;
  --color-bg-surface: #141414;
  --color-bg-elevated: #1A1A1A;
  --color-bg-overlay: rgba(10, 10, 10, 0.85);
  --color-bg-scrim: rgba(0, 0, 0, 0.6);
  --color-bg-subtle: rgba(255, 255, 255, 0.03);
  --color-bg-hover: rgba(255, 255, 255, 0.05);
  
  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #9CA3AF;
  --color-text-muted: #6B7280;
  --color-text-disabled: #4B5563;
  --color-text-inverse: #0A0A0A;
  --color-text-link: #0066FF;
  --color-text-link-hover: #0052CC;
  
  /* Border */
  --color-border-default: rgba(255, 255, 255, 0.1);
  --color-border-subtle: rgba(255, 255, 255, 0.05);
  --color-border-strong: rgba(255, 255, 255, 0.2);
  --color-border-focus: #0066FF;
  
  /* Interactive - Primary CTA */
  --color-interactive-cta-default: #0066FF;
  --color-interactive-cta-hover: #0052CC;
  --color-interactive-cta-active: #0047B3;
  --color-interactive-cta-disabled: rgba(0, 102, 255, 0.3);
  --color-interactive-cta-text: #FFFFFF;
  
  /* Interactive - Secondary Button */
  --color-interactive-secondary-default: rgba(255, 255, 255, 0.1);
  --color-interactive-secondary-hover: rgba(255, 255, 255, 0.15);
  --color-interactive-secondary-active: rgba(255, 255, 255, 0.2);
  --color-interactive-secondary-disabled: rgba(255, 255, 255, 0.05);
  --color-interactive-secondary-text: #FFFFFF;
  
  /* Interactive - Tertiary/Ghost Button */
  --color-interactive-tertiary-default: transparent;
  --color-interactive-tertiary-hover: rgba(255, 255, 255, 0.05);
  --color-interactive-tertiary-active: rgba(255, 255, 255, 0.1);
  --color-interactive-tertiary-disabled: transparent;
  --color-interactive-tertiary-text: #9CA3AF;
  
  /* Interactive - Destructive */
  --color-interactive-destructive-default: #FF3B30;
  --color-interactive-destructive-hover: #E6352B;
  --color-interactive-destructive-active: #CC2F26;
  --color-interactive-destructive-disabled: rgba(255, 59, 48, 0.3);
  --color-interactive-destructive-text: #FFFFFF;
  
  /* Interactive - Input */
  --color-interactive-input-default: rgba(255, 255, 255, 0.05);
  --color-interactive-input-hover: rgba(255, 255, 255, 0.08);
  --color-interactive-input-focus: rgba(255, 255, 255, 0.1);
  --color-interactive-input-disabled: rgba(255, 255, 255, 0.03);
  --color-interactive-input-error: rgba(255, 59, 48, 0.1);
  
  /* Status - Success */
  --color-status-success-trim: #22C55E;
  --color-status-success-text: #22C55E;
  --color-status-success-bg: rgba(34, 197, 94, 0.1);
  --color-status-success-border: rgba(34, 197, 94, 0.3);
  
  /* Status - Warning */
  --color-status-warning-trim: #FFC107;
  --color-status-warning-text: #FFC107;
  --color-status-warning-bg: rgba(255, 193, 7, 0.1);
  --color-status-warning-border: rgba(255, 193, 7, 0.3);
  
  /* Status - Error */
  --color-status-error-trim: #FF3B30;
  --color-status-error-text: #FF3B30;
  --color-status-error-bg: rgba(255, 59, 48, 0.1);
  --color-status-error-border: rgba(255, 59, 48, 0.3);
  
  /* Status - Info */
  --color-status-info-trim: #0066FF;
  --color-status-info-text: #0066FF;
  --color-status-info-bg: rgba(0, 102, 255, 0.1);
  --color-status-info-border: rgba(0, 102, 255, 0.3);
  
  /* Focus Ring */
  --color-focus-ring: #0066FF;
  --color-focus-ring-offset: #0A0A0A;
  
  /* Skeleton/Loading */
  --color-skeleton-base: rgba(255, 255, 255, 0.05);
  --color-skeleton-shimmer: rgba(255, 255, 255, 0.1);
  
  /* ========== TYPOGRAPHY TOKENS ========== */
  
  /* Font Families */
  --font-family-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;     /* 18px */
  --font-size-xl: 1.25rem;      /* 20px */
  --font-size-2xl: 1.5rem;      /* 24px */
  --font-size-3xl: 1.75rem;     /* 28px */
  --font-size-4xl: 2rem;        /* 32px */
  --font-size-5xl: 2.5rem;      /* 40px */
  --font-size-6xl: 3rem;        /* 48px */
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.75;
  
  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  
  /* ========== SPACING TOKENS ========== */
  
  /* Base Scale (4px rhythm) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
  --spacing-32: 8rem;     /* 128px */
  
  /* Section Padding */
  --spacing-section-xs: 2rem;    /* 32px */
  --spacing-section-sm: 3rem;    /* 48px */
  --spacing-section-md: 4rem;    /* 64px */
  --spacing-section-lg: 6rem;    /* 96px */
  
  /* Component Padding */
  --spacing-component-xs: 0.5rem;   /* 8px */
  --spacing-component-sm: 0.75rem;  /* 12px */
  --spacing-component-md: 1rem;     /* 16px */
  --spacing-component-lg: 1.5rem;   /* 24px */
  --spacing-component-xl: 2rem;     /* 32px */
  
  /* Gaps */
  --spacing-gap-xs: 0.5rem;   /* 8px */
  --spacing-gap-sm: 0.75rem;  /* 12px */
  --spacing-gap-md: 1rem;     /* 16px */
  --spacing-gap-lg: 1.5rem;   /* 24px */
  --spacing-gap-xl: 2rem;     /* 32px */
  --spacing-gap-2xl: 3rem;    /* 48px */
  
  /* ========== RADIUS TOKENS ========== */
  
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
  
  /* ========== ELEVATION TOKENS ========== */
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
  --shadow-cta: 0 4px 16px rgba(0, 102, 255, 0.3);
  --shadow-cta-hover: 0 6px 24px rgba(0, 102, 255, 0.4);
  
  /* ========== MOTION TOKENS ========== */
  
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  /* Easing */
  --easing-linear: linear;
  --easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* ========== Z-INDEX TOKENS ========== */
  
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-popover: 1200;
  --z-modal: 1300;
  --z-toast: 1400;
}

/* ========== LIGHT MODE OVERLAY (Optional) ========== */
.light {
  /* Background */
  --color-bg-canvas: #FFFFFF;
  --color-bg-surface: #F9FAFB;
  --color-bg-elevated: #FFFFFF;
  --color-bg-overlay: rgba(255, 255, 255, 0.95);
  --color-bg-scrim: rgba(0, 0, 0, 0.3);
  --color-bg-subtle: rgba(0, 0, 0, 0.03);
  --color-bg-hover: rgba(0, 0, 0, 0.05);
  
  /* Text */
  --color-text-primary: #0A0A0A;
  --color-text-secondary: #4B5563;
  --color-text-muted: #6B7280;
  --color-text-disabled: #9CA3AF;
  --color-text-inverse: #FFFFFF;
  --color-text-link: #0066FF;
  --color-text-link-hover: #0052CC;
  
  /* Border */
  --color-border-default: rgba(0, 0, 0, 0.1);
  --color-border-subtle: rgba(0, 0, 0, 0.05);
  --color-border-strong: rgba(0, 0, 0, 0.2);
  --color-border-focus: #0066FF;
  
  /* Interactive - Secondary Button */
  --color-interactive-secondary-default: rgba(0, 0, 0, 0.05);
  --color-interactive-secondary-hover: rgba(0, 0, 0, 0.1);
  --color-interactive-secondary-active: rgba(0, 0, 0, 0.15);
  --color-interactive-secondary-disabled: rgba(0, 0, 0, 0.03);
  --color-interactive-secondary-text: #0A0A0A;
  
  /* Interactive - Tertiary/Ghost Button */
  --color-interactive-tertiary-hover: rgba(0, 0, 0, 0.05);
  --color-interactive-tertiary-active: rgba(0, 0, 0, 0.1);
  --color-interactive-tertiary-text: #4B5563;
  
  /* Interactive - Input */
  --color-interactive-input-default: rgba(0, 0, 0, 0.05);
  --color-interactive-input-hover: rgba(0, 0, 0, 0.08);
  --color-interactive-input-focus: rgba(0, 0, 0, 0.1);
  --color-interactive-input-disabled: rgba(0, 0, 0, 0.03);
  
  /* Focus Ring */
  --color-focus-ring-offset: #FFFFFF;
  
  /* Skeleton/Loading */
  --color-skeleton-base: rgba(0, 0, 0, 0.05);
  --color-skeleton-shimmer: rgba(0, 0, 0, 0.1);
  
  /* Elevation - Lighter shadows for light mode */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
`;

// ============================================================================
// TAILWIND CONFIG MAPPING
// ============================================================================

export const TAILWIND_CONFIG_EXTENSION = {
  theme: {
    extend: {
      colors: {
        // Background
        "bg-canvas": "var(--color-bg-canvas)",
        "bg-surface": "var(--color-bg-surface)",
        "bg-elevated": "var(--color-bg-elevated)",
        "bg-overlay": "var(--color-bg-overlay)",
        "bg-scrim": "var(--color-bg-scrim)",
        "bg-subtle": "var(--color-bg-subtle)",
        "bg-hover": "var(--color-bg-hover)",

        // Text
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        "text-inverse": "var(--color-text-inverse)",
        "text-link": "var(--color-text-link)",
        "text-link-hover": "var(--color-text-link-hover)",

        // Border
        "border-default": "var(--color-border-default)",
        "border-subtle": "var(--color-border-subtle)",
        "border-strong": "var(--color-border-strong)",
        "border-focus": "var(--color-border-focus)",

        // Interactive
        "interactive-cta": {
          DEFAULT: "var(--color-interactive-cta-default)",
          hover: "var(--color-interactive-cta-hover)",
          active: "var(--color-interactive-cta-active)",
          disabled: "var(--color-interactive-cta-disabled)",
          text: "var(--color-interactive-cta-text)",
        },
        "interactive-secondary": {
          DEFAULT: "var(--color-interactive-secondary-default)",
          hover: "var(--color-interactive-secondary-hover)",
          active: "var(--color-interactive-secondary-active)",
          disabled: "var(--color-interactive-secondary-disabled)",
          text: "var(--color-interactive-secondary-text)",
        },
        "interactive-tertiary": {
          DEFAULT: "var(--color-interactive-tertiary-default)",
          hover: "var(--color-interactive-tertiary-hover)",
          active: "var(--color-interactive-tertiary-active)",
          disabled: "var(--color-interactive-tertiary-disabled)",
          text: "var(--color-interactive-tertiary-text)",
        },
        "interactive-destructive": {
          DEFAULT: "var(--color-interactive-destructive-default)",
          hover: "var(--color-interactive-destructive-hover)",
          active: "var(--color-interactive-destructive-active)",
          disabled: "var(--color-interactive-destructive-disabled)",
          text: "var(--color-interactive-destructive-text)",
        },
        "interactive-input": {
          DEFAULT: "var(--color-interactive-input-default)",
          hover: "var(--color-interactive-input-hover)",
          focus: "var(--color-interactive-input-focus)",
          disabled: "var(--color-interactive-input-disabled)",
          error: "var(--color-interactive-input-error)",
        },

        // Status
        "status-success": {
          trim: "var(--color-status-success-trim)",
          text: "var(--color-status-success-text)",
          bg: "var(--color-status-success-bg)",
          border: "var(--color-status-success-border)",
        },
        "status-warning": {
          trim: "var(--color-status-warning-trim)",
          text: "var(--color-status-warning-text)",
          bg: "var(--color-status-warning-bg)",
          border: "var(--color-status-warning-border)",
        },
        "status-error": {
          trim: "var(--color-status-error-trim)",
          text: "var(--color-status-error-text)",
          bg: "var(--color-status-error-bg)",
          border: "var(--color-status-error-border)",
        },
        "status-info": {
          trim: "var(--color-status-info-trim)",
          text: "var(--color-status-info-text)",
          bg: "var(--color-status-info-bg)",
          border: "var(--color-status-info-border)",
        },

        // Focus
        "focus-ring": "var(--color-focus-ring)",
        "focus-ring-offset": "var(--color-focus-ring-offset)",

        // Skeleton
        "skeleton-base": "var(--color-skeleton-base)",
        "skeleton-shimmer": "var(--color-skeleton-shimmer)",
      },

      fontFamily: {
        primary: "var(--font-family-primary)",
        mono: "var(--font-family-mono)",
      },

      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
      },

      fontWeight: {
        light: "var(--font-weight-light)",
        regular: "var(--font-weight-regular)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
      },

      lineHeight: {
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
        loose: "var(--leading-loose)",
      },

      letterSpacing: {
        tight: "var(--tracking-tight)",
        normal: "var(--tracking-normal)",
        wide: "var(--tracking-wide)",
      },

      spacing: {
        0: "var(--spacing-0)",
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        10: "var(--spacing-10)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
        20: "var(--spacing-20)",
        24: "var(--spacing-24)",
        32: "var(--spacing-32)",
        "section-xs": "var(--spacing-section-xs)",
        "section-sm": "var(--spacing-section-sm)",
        "section-md": "var(--spacing-section-md)",
        "section-lg": "var(--spacing-section-lg)",
        "component-xs": "var(--spacing-component-xs)",
        "component-sm": "var(--spacing-component-sm)",
        "component-md": "var(--spacing-component-md)",
        "component-lg": "var(--spacing-component-lg)",
        "component-xl": "var(--spacing-component-xl)",
        "gap-xs": "var(--spacing-gap-xs)",
        "gap-sm": "var(--spacing-gap-sm)",
        "gap-md": "var(--spacing-gap-md)",
        "gap-lg": "var(--spacing-gap-lg)",
        "gap-xl": "var(--spacing-gap-xl)",
        "gap-2xl": "var(--spacing-gap-2xl)",
      },

      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        cta: "var(--shadow-cta)",
        "cta-hover": "var(--shadow-cta-hover)",
      },

      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },

      transitionTimingFunction: {
        linear: "var(--easing-linear)",
        "ease-in": "var(--easing-ease-in)",
        "ease-out": "var(--easing-ease-out)",
        "ease-in-out": "var(--easing-ease-in-out)",
        spring: "var(--easing-spring)",
      },

      zIndex: {
        base: "var(--z-base)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        popover: "var(--z-popover)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
    },
  },
};

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

export const USAGE_INSTRUCTIONS = `
# Anthrasite Token Usage Instructions

## CSS Variables
1. Add the CSS_VARIABLES string to your global CSS file
2. Dark mode is the default
3. Add .light class to root element for light mode

## Tailwind Config
1. Merge TAILWIND_CONFIG_EXTENSION into your tailwind.config.js
2. Use token-based classes: bg-bg-canvas, text-text-primary, etc.

## Hard Rules
- NO hardcoded colors (e.g., #0066FF, rgb(0,0,0))
- NO hardcoded spacing (e.g., 16px, 2rem) - use tokens
- ALL interactive states must use defined tokens
- ALL components must be token-based

## Examples

### Button (Primary CTA)
<button className="bg-interactive-cta hover:bg-interactive-cta-hover active:bg-interactive-cta-active disabled:bg-interactive-cta-disabled text-interactive-cta-text px-component-lg py-component-md rounded-lg shadow-cta hover:shadow-cta-hover transition-normal">
  Click Me
</button>

### Input
<input className="bg-interactive-input hover:bg-interactive-input-hover focus:bg-interactive-input-focus border border-border-default focus:border-border-focus rounded-md px-component-md py-component-sm text-text-primary" />

### Card
<div className="bg-bg-surface border border-border-default rounded-lg p-component-lg shadow-md">
  Content
</div>
`;
