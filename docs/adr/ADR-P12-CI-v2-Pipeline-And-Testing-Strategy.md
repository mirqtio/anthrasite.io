# ADR-P12: CI v2 Pipeline and E2E Testing Strategy

**Date**: 2025-10-14
**Status**: Accepted

## Context

The original CI pipeline was monolithic, slow, and becoming increasingly flaky. It lacked a clear strategy for handling different test types (e.g., tests requiring a clean consent state vs. those that don't) and suffered from environment drift between local, CI, and production builds. This led to a high rate of test failures in CI that could not be reproduced locally, eroding trust in the test suite.

## Decision

We implemented a new CI/CD pipeline, `ci-v2.yml`, with the following key architectural decisions:

1.  **Multi-Project Testing**: The Playwright configuration was split into multiple projects (e.g., `chromium-desktop`, `consent-chromium-desktop`). This allows us to run specific test suites with tailored configurations. For example, consent tests run without a pre-existing `storageState`, while most other tests use a `storageState` to bypass the consent modal, dramatically improving speed and reducing flakiness.

2.  **Vercel Build Parity**: The CI job now uses `vercel build` and `vercel dev --prebuilt` to build and serve the application. This ensures the exact same build and runtime environment is used in CI as in Vercel's production environment, eliminating a major source of environment-specific bugs.

3.  **Shift from Mocking to Integration Testing**: We have made a strategic decision to favor E2E tests that perform real integration tests against a database over tests that rely on heavy mocking (e.g., MSW). As demonstrated in the `utm-api` test rewrite, creating real test data in a database and testing the full production code path provides higher-fidelity validation and catches bugs that mocks would miss. Mocks are still valuable for unit tests, but E2E tests should be as realistic as possible.

## Consequences

### Positive

- **Increased Reliability**: The new pipeline is significantly more stable and reliable, with a much higher pass rate.
- **Improved Speed & Efficiency**: Splitting projects allows for more targeted test runs and parallelization.
- **Reduced Environment Drift**: Build parity with Vercel means that what works in CI has a much higher probability of working in production.
- **Higher-Fidelity Tests**: The move towards integration testing in the E2E suite provides more confidence that the application works as a complete system.

### Negative

- **Increased Complexity**: The multi-project setup adds a layer of configuration complexity to `playwright.config.ci.ts` and the CI workflow file.
- **Dependency on Vercel CLI**: The build process is now dependent on the Vercel CLI being installed and configured correctly in the CI environment.
