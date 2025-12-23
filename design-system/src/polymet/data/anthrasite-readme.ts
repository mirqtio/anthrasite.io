/**
 * # Anthrasite Design System
 *
 * A comprehensive, dark-first design system with complete light mode support.
 * Built with CSS custom properties for maximum flexibility and maintainability.
 *
 * ## Overview
 *
 * Anthrasite provides a complete set of design tokens covering:
 * - Colors (backgrounds, text, borders, interactive states, status indicators)
 * - Typography (sizes, weights, line heights)
 * - Spacing (component and section-level scales)
 * - Shadows (elevation system)
 * - Radii (border radius scale)
 * - Transitions (timing and easing)
 * - Z-index (layering system)
 *
 * ## Quick Start
 *
 * ### 1. Wrap your app with the theme provider
 *
 * ```tsx
 * import { AnthrasiteThemeProvider } from "@/polymet/components/anthrasite-theme-provider";
 *
 * function App() {
 *   return (
 *     <AnthrasiteThemeProvider>
 *       <YourApp />
 *     </AnthrasiteThemeProvider>
 *   );
 * }
 * ```
 *
 * ### 2. Use tokens in your components
 *
 * ```tsx
 * function MyButton() {
 *   return (
 *     <button className="
 *       bg-[var(--color-interactive-cta-default)]
 *       hover:bg-[var(--color-interactive-cta-hover)]
 *       text-[var(--color-interactive-cta-text)]
 *       px-[var(--spacing-component-lg)]
 *       py-[var(--spacing-component-md)]
 *       rounded-[var(--radius-lg)]
 *       font-[var(--font-weight-medium)]
 *       transition-[var(--duration-normal)]
 *     ">
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 *
 * ## Token Categories
 *
 * ### Colors
 *
 * #### Background Colors
 * - `--color-bg-canvas` - Main page background
 * - `--color-bg-surface` - Card/panel background
 * - `--color-bg-elevated` - Modal/dropdown background
 * - `--color-bg-subtle` - Subtle background for badges/tags
 * - `--color-bg-hover` - Hover state background
 * - `--color-bg-scrim` - Modal backdrop overlay
 *
 * #### Text Colors
 * - `--color-text-primary` - Main text color
 * - `--color-text-secondary` - Secondary/supporting text
 * - `--color-text-muted` - De-emphasized text
 * - `--color-text-disabled` - Disabled state text
 * - `--color-text-link` - Link default color
 * - `--color-text-link-hover` - Link hover color
 *
 * #### Border Colors
 * - `--color-border-default` - Standard border
 * - `--color-border-subtle` - Subtle/light border
 * - `--color-border-strong` - Emphasized border
 * - `--color-border-focus` - Focus state border
 *
 * #### Interactive Colors (Buttons)
 *
 * **Primary CTA**
 * - `--color-interactive-cta-default`
 * - `--color-interactive-cta-hover`
 * - `--color-interactive-cta-active`
 * - `--color-interactive-cta-disabled`
 * - `--color-interactive-cta-text`
 *
 * **Secondary**
 * - `--color-interactive-secondary-default`
 * - `--color-interactive-secondary-hover`
 * - `--color-interactive-secondary-active`
 * - `--color-interactive-secondary-disabled`
 * - `--color-interactive-secondary-text`
 *
 * **Tertiary/Ghost**
 * - `--color-interactive-tertiary-default`
 * - `--color-interactive-tertiary-hover`
 * - `--color-interactive-tertiary-active`
 * - `--color-interactive-tertiary-disabled`
 * - `--color-interactive-tertiary-text`
 *
 * **Destructive**
 * - `--color-interactive-destructive-default`
 * - `--color-interactive-destructive-hover`
 * - `--color-interactive-destructive-active`
 * - `--color-interactive-destructive-disabled`
 * - `--color-interactive-destructive-text`
 *
 * #### Form Input Colors
 * - `--color-interactive-input-default`
 * - `--color-interactive-input-hover`
 * - `--color-interactive-input-focus`
 * - `--color-interactive-input-disabled`
 * - `--color-interactive-input-error`
 *
 * #### Status Colors
 *
 * Each status type (success, warning, error, info) has:
 * - `--color-status-{type}-bg` - Background color
 * - `--color-status-{type}-border` - Border color
 * - `--color-status-{type}-text` - Text/icon color
 * - `--color-status-{type}-trim` - Accent/trim color
 *
 * #### Focus & Skeleton
 * - `--color-focus-ring` - Focus ring color
 * - `--color-focus-ring-offset` - Focus ring offset color
 * - `--color-skeleton-base` - Skeleton loader color
 *
 * ### Typography
 *
 * #### Font Sizes
 * - `--font-size-xs` - 12px
 * - `--font-size-sm` - 14px
 * - `--font-size-base` - 16px
 * - `--font-size-lg` - 18px
 * - `--font-size-xl` - 20px
 * - `--font-size-2xl` - 24px
 * - `--font-size-3xl` - 30px
 * - `--font-size-4xl` - 36px
 *
 * #### Font Weights
 * - `--font-weight-regular` - 400
 * - `--font-weight-medium` - 500
 * - `--font-weight-semibold` - 600
 * - `--font-weight-bold` - 700
 *
 * #### Line Heights
 * - `--line-height-tight` - 1.25
 * - `--line-height-normal` - 1.5
 * - `--line-height-relaxed` - 1.75
 *
 * ### Spacing
 *
 * #### Component Spacing
 * - `--spacing-component-xs` - 4px
 * - `--spacing-component-sm` - 8px
 * - `--spacing-component-md` - 12px
 * - `--spacing-component-lg` - 16px
 * - `--spacing-component-xl` - 24px
 * - `--spacing-component-2xl` - 32px
 *
 * #### Section Spacing
 * - `--spacing-section-sm` - 32px
 * - `--spacing-section-md` - 48px
 * - `--spacing-section-lg` - 64px
 * - `--spacing-section-xl` - 96px
 *
 * #### Gap Spacing
 * - `--gap-xs` - 4px
 * - `--gap-sm` - 8px
 * - `--gap-md` - 16px
 * - `--gap-lg` - 24px
 * - `--gap-xl` - 32px
 *
 * ### Border Radius
 * - `--radius-sm` - 4px
 * - `--radius-md` - 6px
 * - `--radius-lg` - 8px
 * - `--radius-xl` - 12px
 * - `--radius-2xl` - 16px
 * - `--radius-full` - 9999px
 *
 * ### Shadows
 * - `--shadow-sm` - Subtle elevation
 * - `--shadow-md` - Card elevation
 * - `--shadow-lg` - Elevated card
 * - `--shadow-xl` - Dropdown/popover
 * - `--shadow-2xl` - Modal
 * - `--shadow-cta` - CTA button default
 * - `--shadow-cta-hover` - CTA button hover
 *
 * ### Transitions
 * - `--duration-fast` - 150ms
 * - `--duration-normal` - 200ms
 * - `--duration-slow` - 300ms
 * - `--easing-standard` - cubic-bezier(0.4, 0.0, 0.2, 1)
 * - `--easing-decelerate` - cubic-bezier(0.0, 0.0, 0.2, 1)
 * - `--easing-accelerate` - cubic-bezier(0.4, 0.0, 1, 1)
 *
 * ### Z-Index
 * - `--z-base` - 0
 * - `--z-dropdown` - 1000
 * - `--z-sticky` - 1100
 * - `--z-fixed` - 1200
 * - `--z-modal-backdrop` - 1300
 * - `--z-modal` - 1400
 * - `--z-popover` - 1500
 * - `--z-tooltip` - 1600
 *
 * ## Common Patterns
 *
 * ### Button Styles
 *
 * ```tsx
 * // Primary CTA Button
 * <button className="
 *   bg-[var(--color-interactive-cta-default)]
 *   hover:bg-[var(--color-interactive-cta-hover)]
 *   active:bg-[var(--color-interactive-cta-active)]
 *   text-[var(--color-interactive-cta-text)]
 *   px-[var(--spacing-component-lg)]
 *   py-[var(--spacing-component-md)]
 *   rounded-[var(--radius-lg)]
 *   shadow-[var(--shadow-cta)]
 *   hover:shadow-[var(--shadow-cta-hover)]
 *   transition-[var(--duration-normal)]
 *   font-[var(--font-weight-medium)]
 * ">
 *   Primary Action
 * </button>
 *
 * // Secondary Button
 * <button className="
 *   bg-[var(--color-interactive-secondary-default)]
 *   hover:bg-[var(--color-interactive-secondary-hover)]
 *   text-[var(--color-interactive-secondary-text)]
 *   px-[var(--spacing-component-lg)]
 *   py-[var(--spacing-component-md)]
 *   rounded-[var(--radius-lg)]
 *   border border-[var(--color-border-default)]
 *   transition-[var(--duration-normal)]
 *   font-[var(--font-weight-medium)]
 * ">
 *   Secondary Action
 * </button>
 * ```
 *
 * ### Form Input Styles
 *
 * ```tsx
 * <input
 *   type="text"
 *   className="
 *     w-full
 *     bg-[var(--color-interactive-input-default)]
 *     hover:bg-[var(--color-interactive-input-hover)]
 *     focus:bg-[var(--color-interactive-input-focus)]
 *     border border-[var(--color-border-default)]
 *     focus:border-[var(--color-border-focus)]
 *     rounded-[var(--radius-md)]
 *     px-[var(--spacing-component-md)]
 *     py-[var(--spacing-component-sm)]
 *     text-[var(--color-text-primary)]
 *     transition-[var(--duration-normal)]
 *     focus:outline-none
 *     focus:ring-2
 *     focus:ring-[var(--color-focus-ring)]
 *     focus:ring-offset-2
 *     focus:ring-offset-[var(--color-focus-ring-offset)]
 *   "
 * />
 * ```
 *
 * ### Card Styles
 *
 * ```tsx
 * <div className="
 *   bg-[var(--color-bg-surface)]
 *   border border-[var(--color-border-default)]
 *   rounded-[var(--radius-lg)]
 *   p-[var(--spacing-component-lg)]
 *   shadow-[var(--shadow-md)]
 * ">
 *   Card content
 * </div>
 * ```
 *
 * ### Alert/Badge Styles
 *
 * ```tsx
 * // Success Alert
 * <div className="
 *   flex gap-3
 *   p-[var(--spacing-component-md)]
 *   bg-[var(--color-status-success-bg)]
 *   border border-[var(--color-status-success-border)]
 *   rounded-[var(--radius-lg)]
 * ">
 *   <CheckIcon className="text-[var(--color-status-success-text)]" />
 *   <p className="text-[var(--color-text-primary)]">Success message</p>
 * </div>
 *
 * // Badge
 * <span className="
 *   inline-flex items-center
 *   px-[var(--spacing-component-sm)]
 *   py-[var(--spacing-component-xs)]
 *   rounded-[var(--radius-full)]
 *   bg-[var(--color-status-info-bg)]
 *   border border-[var(--color-status-info-border)]
 *   text-[var(--color-status-info-text)]
 *   text-[var(--font-size-sm)]
 *   font-[var(--font-weight-medium)]
 * ">
 *   Info
 * </span>
 * ```
 *
 * ## Design Principles
 *
 * ### 1. Dark-First Design
 * Anthrasite is designed with dark mode as the primary experience, with light mode
 * as a fully-supported alternative. All tokens work seamlessly in both modes.
 *
 * ### 2. Semantic Naming
 * Token names describe their purpose, not their appearance. This makes the system
 * more maintainable and allows for theme variations.
 *
 * ### 3. Complete State Coverage
 * Every interactive element has tokens for all states: default, hover, active,
 * focus, and disabled.
 *
 * ### 4. Accessibility First
 * - Sufficient color contrast ratios
 * - Clear focus indicators
 * - Proper disabled states
 * - Semantic color usage
 *
 * ### 5. Consistency
 * Spacing, typography, and color scales are consistent across all components,
 * creating a cohesive visual language.
 *
 * ## Browser Support
 *
 * Anthrasite uses CSS custom properties (CSS variables) which are supported in:
 * - Chrome/Edge 49+
 * - Firefox 31+
 * - Safari 9.1+
 * - iOS Safari 9.3+
 *
 * ## Style Guide
 *
 * View the complete style guide at `/styleguide` to see all tokens in action
 * with interactive examples in both light and dark modes.
 *
 * ## Extending the System
 *
 * To add new tokens or modify existing ones, edit the `AnthrasiteThemeProvider`
 * component. All changes will automatically propagate to all components using
 * those tokens.
 *
 * ## License
 *
 * This design system is provided as-is for use in your projects.
 */

export const ANTHRASITE_README = `
# Anthrasite Design System

A comprehensive, dark-first design system with complete light mode support.

## Quick Start

1. Wrap your app with AnthrasiteThemeProvider
2. Use CSS custom properties in your components
3. Reference the style guide for all available tokens

See the full documentation in this file's JSDoc comment.
`;

export default ANTHRASITE_README;
