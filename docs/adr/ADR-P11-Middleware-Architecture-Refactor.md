# ADR-P11: Middleware Architecture Refactor

**Date**: 2025-10-14
**Status**: Accepted

## Context

The previous middleware implementation was spread across multiple files, making it difficult to trace the flow of request handling. It suffered from complex, nested conditional logic and improperly handled environment variables, leading to a critical bug where build-time environment variables were cached and used at runtime. This caused significant instability, test flakiness, and maintenance overhead.

## Decision

We decided to refactor the entire middleware system into a single, chainable architecture within a single file: `middleware.ts`.

This new architecture utilizes a pattern where each middleware function accepts a `request` and a `next` function. This creates a clear, linear execution flow, similar to frameworks like Express.js. A master `middleware` function composes this chain.

Additionally, a strict `config.matcher` was implemented to explicitly exclude static assets (`/_next/static/*`, `/_next/image/*`, `favicon.ico`, etc.) from the middleware's scope, preventing performance issues and unintended side effects.

## Consequences

### Positive

- **Simplicity & Readability**: All request handling logic is now co-located and follows a predictable, linear path, making it vastly easier to understand and maintain.
- **Resolved Runtime Bugs**: By evaluating environment variables within the request-time functions instead of as module-level constants, we have eliminated the class of bugs related to build-time vs. runtime configuration.
- **Improved Testability**: The new modular functions are easier to unit test, and the overall predictability of the middleware has increased the stability of E2E tests.
- **Performance**: The explicit `matcher` configuration prevents the middleware from running on static asset requests, reducing unnecessary processing.

### Negative

- None identified. This change was a direct simplification and bug-fix initiative that removed complexity without adding new constraints.
