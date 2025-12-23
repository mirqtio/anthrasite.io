/**
 * Anthrasite Theme Provider
 * Injects CSS variables into the DOM for the Anthrasite design system
 */

import { useEffect } from "react";

const ANTHRASITE_CSS = `
/* Anthrasite Design Tokens - Dark Default */
:root {
  /* ========== COLOR TOKENS ========== */
  
  /* Background */
  --color-bg-canvas: #0A0A0A;
  --color-bg-surface: #141414;
  --color-bg-elevated: #1A1A1A;
  --color-bg-surface-elevated: #1F1F1F;
  --color-bg-overlay: rgba(10, 10, 10, 0.85);
  --color-bg-scrim: rgba(0, 0, 0, 0.6);
  --color-bg-subtle: rgba(255, 255, 255, 0.03);
  --color-bg-hover: rgba(255, 255, 255, 0.05);
  
  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #9CA3AF;
  --color-text-tertiary: #6B7280;
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
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;      /* 12px - Small labels, captions */
  --font-size-sm: 0.875rem;     /* 14px - Secondary text, metadata */
  --font-size-base: 1rem;       /* 16px - Body text (default) */
  --font-size-lg: 1.125rem;     /* 18px - Large body text */
  --font-size-xl: 1.25rem;      /* 20px - Small headings */
  --font-size-2xl: 1.5rem;      /* 24px - H5 */
  --font-size-3xl: 1.875rem;    /* 30px - H4 */
  --font-size-4xl: 2.25rem;     /* 36px - H3 */
  --font-size-5xl: 3rem;        /* 48px - H2 */
  --font-size-6xl: 3.75rem;     /* 60px - H1 */
  --font-size-7xl: 4.5rem;      /* 72px - Hero headings */
  --font-size-8xl: 6rem;        /* 96px - Marketing pages */
  --font-size-9xl: 8rem;        /* 128px - Landing page heroes */
  
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
  
  /* ========== SPACING TOKENS ========== */
  
  /* Component Padding */
  --spacing-component-xs: 0.5rem;
  --spacing-component-sm: 0.75rem;
  --spacing-component-md: 1rem;
  --spacing-component-lg: 1.5rem;
  --spacing-component-xl: 2rem;
  
  /* Section Padding */
  --spacing-section-xs: 2rem;
  --spacing-section-sm: 3rem;
  --spacing-section-md: 4rem;
  --spacing-section-lg: 6rem;
  
  /* Gaps */
  --spacing-gap-xs: 0.5rem;
  --spacing-gap-sm: 0.75rem;
  --spacing-gap-md: 1rem;
  --spacing-gap-lg: 1.5rem;
  --spacing-gap-xl: 2rem;
  --spacing-gap-2xl: 3rem;
  
  /* ========== RADIUS TOKENS ========== */
  
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* ========== ELEVATION TOKENS ========== */
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  --shadow-cta: 0 4px 16px rgba(0, 102, 255, 0.3);
  --shadow-cta-hover: 0 6px 24px rgba(0, 102, 255, 0.4);
  
  /* ========== MOTION TOKENS ========== */
  
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  
  /* ========== Z-INDEX TOKENS ========== */
  
  --z-modal: 1300;
  --z-toast: 1400;
}

/* Light mode overrides */
.light {
  --color-bg-canvas: #FFFFFF;
  --color-bg-surface: #F9FAFB;
  --color-bg-elevated: #FFFFFF;
  --color-bg-surface-elevated: #FFFFFF;
  --color-text-primary: #0A0A0A;
  --color-text-secondary: #4B5563;
  --color-text-tertiary: #6B7280;
  --color-text-muted: #6B7280;
  --color-text-disabled: #9CA3AF;
  --color-text-inverse: #FFFFFF;
  --color-border-default: rgba(0, 0, 0, 0.1);
  --color-border-subtle: rgba(0, 0, 0, 0.05);
  --color-border-strong: rgba(0, 0, 0, 0.2);
  --color-interactive-secondary-default: rgba(0, 0, 0, 0.05);
  --color-interactive-secondary-hover: rgba(0, 0, 0, 0.1);
  --color-interactive-secondary-active: rgba(0, 0, 0, 0.15);
  --color-interactive-secondary-text: #0A0A0A;
  --color-interactive-tertiary-hover: rgba(0, 0, 0, 0.05);
  --color-interactive-tertiary-active: rgba(0, 0, 0, 0.1);
  --color-interactive-tertiary-text: #4B5563;
  --color-interactive-input-default: rgba(0, 0, 0, 0.05);
  --color-interactive-input-hover: rgba(0, 0, 0, 0.08);
  --color-interactive-input-focus: rgba(0, 0, 0, 0.1);
  --color-focus-ring-offset: #FFFFFF;
  --color-skeleton-base: rgba(0, 0, 0, 0.05);
  --color-skeleton-shimmer: rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
`;

export function AnthrasiteThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  useEffect(() => {
    // Inject CSS variables into the document
    const styleId = "anthrasite-tokens";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = ANTHRASITE_CSS;

    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  return <div {...props}>{children}</div>;
}
