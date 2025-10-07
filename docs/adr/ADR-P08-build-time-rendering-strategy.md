# ADR-P08: Build-Time Rendering Strategy

**Date**: 2025-10-07
**Status**: Proposed

## Context

During the G2 build-unsticking task, we identified a critical issue where the Next.js production build (`pnpm build`) would hang indefinitely. The root cause was a configuration conflict in `app/page.tsx` related to how client-side components with runtime hooks were being handled during the static site generation (SSG) phase.

Specifically, the homepage was configured as a client component (`'use client'`) that used the `useSiteMode()` hook, but it was also being dynamically imported with Server-Side Rendering enabled (`ssr: true`). Furthermore, the page was missing the `export const dynamic = 'force-dynamic'` directive, causing Next.js to default to static generation, which is incompatible with the component's runtime dependencies.

## Decision

To prevent build hangs and ensure a clear, predictable rendering path for all pages, we will enforce the following rules:

1.  **Client Components with Hooks Must Not Be Server-Side Rendered at Build Time.** When using `next/dynamic` to import a component that is marked with `'use client'` and contains runtime hooks (e.g., `useState`, `useSearchParams`), the import **must** be configured with `ssr: false`.

2.  **Runtime-Dependent Pages Must Be Explicitly Dynamic.** Any page that relies on runtime information (e.g., search parameters, user sessions, feature flags) and cannot be statically generated **must** export the `dynamic = 'force-dynamic'` constant. This directive forces the page into a dynamic rendering path, preventing the build process from attempting to statically generate it.

3.  **ESLint Guardrails Will Be Implemented.** To automatically detect and prevent these issues, we will add a custom ESLint rule to our configuration. This rule will flag any instance where `dynamic()` is called with `ssr: true` inside a file that also contains the `'use client'` directive.

## Consequences

**Positive:**
-   **Build Stability:** This strategy eliminates a major source of build hangs, making our CI/CD process more reliable.
-   **Clear Rendering Contracts:** It forces a clear distinction between statically generated pages and dynamically rendered pages, making the behavior of each component easier to reason about.
-   **Automated Prevention:** The ESLint rule will catch these errors before they are committed, preventing future regressions.

**Negative:**
-   Slightly more cognitive overhead for developers to remember to add `export const dynamic = 'force-dynamic'` and `ssr: false` where appropriate. The ESLint rule will mitigate this.
