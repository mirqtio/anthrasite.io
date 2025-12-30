# Assessment Landing System Plan

## User Request
Build a comprehensive assessment landing page system following a multi-phase specification that starts with a locked context model and progresses through page structure, components, and implementation.

## Related Files
- @/polymet/data/phase-0-context-model (to create) - Phase 0: Context Model & Use-Case Lock specification
- Future phases will be added as user provides them

## TODO List
- [x] Create plan document
- [x] Create Phase 0 documentation file
- [x] Receive and document Phase 1 specification
- [x] Receive and document Phase 2 specification
- [x] Create Phase 3 design tokens specification
- [x] Create Phase 4: Anthrasite Token System
- [x] Phase 5A: Token Export Pack (CSS variables + Tailwind config + style guide page)
- [x] Phase 5B: Implement Phase 2 components using tokens (no new props/variants)
- [x] Phase 5C: Assemble two archetype pages (authenticated + unauthenticated)
  - [x] Create authenticated assessment landing page
  - [x] Create unauthenticated public explainer page
  - [x] Create prototype with routing for both pages
  - [x] Verify all Phase 0-2 constraints are enforced

## Important Notes
- Phase 0 establishes binary context model: Authenticated vs Unauthenticated
- No design work begins until all phases are documented
- System explicitly rejects intent inference and heuristics
- Only two page archetypes: Assessment Landing (auth) and Public Explainer (unauth)
- Strict rules: real data only for authenticated, sample data for unauthenticated
- Phase 0 is marked as complete and locked by user
- Phase 1 defines section hierarchy for both archetypes (structure only, no design)
- Authenticated page: 6 sections (5 mandatory, 1 optional)
- Unauthenticated page: 8 sections (6 mandatory, 2 optional)
- Hard constraints: 3-5 findings, max 3 trust signals, 3-4 methodology steps
- Four shared sections with parameterized behavior: Assessment Summary, Key Findings, CTA Block, Credibility/Trust
- Phase 1 is marked as locked and complete by user
- Phase 2 defines component contracts: 12 total components (3 shared, 3 auth-only, 6 unauth-only)
- Phase 2 establishes formal APIs with props, constraints, and subcomponents
- Hard constraints: findings 3-5, trust signals max 3, methodology exactly 3 steps
- All variants driven only by Phase 0 parameters (auth_state, data_source, cta_mode, render_context)
- Phase 2 is marked as locked and complete by user
- Phase 3 defines design tokens: 6 categories (color, typography, spacing, elevation, radius, motion)
- Phase 3 tokens are appearance-only, no semantic meaning or behavioral logic
- Hard constraints: no component-specific tokens, no variant-encoding, no behavioral meaning in colors
- Single token system with light/dark theme overlays, no archetype-specific palettes
- Zero flagged items - all tokens comply with Phase 0-2 constraints
- Phase 3 is marked as locked and complete
- Phase 4: Complete Anthrasite token system created with 50+ tokens covering all UI states
- Dark-first design with electric blue accent (#0066FF)
- Full state coverage: buttons (4 types), inputs, selects, checkboxes, toggles, badges, alerts, toasts, cards, modals, skeletons
- 6 token categories: color (50+ variants), typography (25 tokens), spacing (28 tokens), radius (7), elevation (8), motion (10)
- All interactive states defined: default, hover, active, focus, disabled, loading
- 5 usage examples provided for authenticated/public pages and forms
- Phase 4 is marked as locked and complete
- Phase 5A: Token Export Pack created with CSS variables (dark default + light overlay), Tailwind config mapping, and comprehensive style guide page
- Style guide demonstrates all tokenized UI states: buttons (4 types), inputs, textareas, selects, checkboxes, toggles, links, badges, alerts, toasts, cards, modals, skeletons
- Hard rule enforced: NO hardcoded colors/spacing outside tokens
- All interactive states (default, hover, active, focus, disabled, loading, error) fully documented
- Phase 5B: All 12 Phase 2 components implemented with token-based styling exclusively
- Components created: ContextHeader, AssessmentSummary, FindingsList, CTABlock, CredibilityAnchor, SecondaryButton, ProblemHeader, ValueProposition, SampleAssessmentPreview, MethodologySection, TrustSection, Footer
- All components include TypeScript types, development warnings for contract violations, accessibility features (focus rings, ARIA attributes)
- Interactive state coverage: buttons (hover/active/focus/disabled/loading), inputs (hover/focus/disabled/error)
- Contract enforcement: FindingsList (3-5 items), MethodologySection (exactly 3 steps), TrustSection (max 3 signals)
- SampleAssessmentPreview composes AssessmentSummary + FindingsList with "Sample Data" label
- Barrel export created at @/polymet/components/index for all components
- Phase 2 Components section added to style guide page with live examples
- Phase 5A/5B Fix: Created AnthrasiteThemeProvider component to inject CSS variables into DOM
- Phase 5A/5B Fix: Updated styleguide page to wrap content with theme provider - tokens now render with proper Anthrasite colors and styles
- Phase 5C: Created two archetype pages following Phase 1 structure
  - @/polymet/pages/assessment-landing - Authenticated page with 6 sections (5 mandatory, 1 optional)
  - @/polymet/pages/public-explainer - Unauthenticated page with 8 sections (6 mandatory, 2 optional)
  - @/polymet/prototypes/assessment-system - Routing system connecting both pages
  - All Phase 0-2 constraints enforced: findings (3-5), methodology (exactly 3), trust signals (max 3)
  - Development warnings added for contract violations
  - Both pages use token-based styling exclusively via AnthrasiteThemeProvider
  
## Plan Information
*This plan is created when the project is at iteration 0, and date 2025-12-17T15:31:18.609Z*
