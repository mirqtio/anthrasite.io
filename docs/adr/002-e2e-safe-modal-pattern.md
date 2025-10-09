# ADR-002: E2E-Safe Modal Pattern

**Date**: 2025-10-08

**Status**: Accepted

## Context

E2E tests for our consent modal (`I1`) were consistently failing due to Playwright's visibility checks. The previous implementation used a combination of CSS transforms (`translate`, `scale`) and dynamic inline styles for `opacity` and `visibility`, which made it difficult for Playwright to reliably determine if the modal was visible and interactive.

## Decision

All modals in the application must be built using a standardized, E2E-safe pattern that prioritizes simplicity and predictability over complex animations during testing.

The approved pattern involves:

1.  **Flexbox for Centering**: Use a `flex` container for centering the modal on the screen, avoiding CSS `transform` for positioning.
2.  **Explicit Sizing**: Define an explicit `maxWidth` on the modal content to prevent it from collapsing.
3.  **Z-Index Management**: Ensure the modal and its backdrop have a sufficiently high `z-index` (e.g., `10000`) to render above all other page content.
4.  **Pointer Events Layering**: The modal content div must have `pointer-events: auto`, while the full-screen wrapper has `pointer-events: none` and the backdrop has `pointer-events: auto`. This ensures clicks are handled correctly.
5.  **Simple State-Driven CSS**: Use simple `opacity` and `visibility` properties for showing/hiding the modal, driven by a clear component state (e.g., `isVisible`).
6.  **Disable Animations in Tests**: All `transition` properties should be disabled when `process.env.NODE_ENV === 'test'`.

## Consequences

### Positive

- **Greatly Increased Test Stability**: This pattern is designed to be easily understood by Playwright's visibility engine, which will dramatically reduce flaky tests.
- **Standardization**: Provides a clear, reusable pattern for all future modal implementations, improving developer efficiency and code consistency.
- **Improved Accessibility**: The pattern encourages better focus management and keyboard interactions (e.g., closing with the Escape key).

### Negative

- **Slightly More Verbose**: The required wrapper elements for flexbox centering and pointer-event management can make the JSX slightly more verbose than a single-div implementation.
- **Animation Constraints**: Forces a simpler `opacity`-based animation, limiting more complex `transform`-based entrance/exit animations. This is a deliberate trade-off for reliability.
