# ADR-006: Strict & Truthful CI Philosophy

**Date**: 2025-10-10

**Status**: Adopted

## Context

During the E2E test stabilization epic (ANT-153), the CI pipeline was unreliable. The pass rate was 12%, and it was difficult to distinguish between actual code regressions and flaky tests. To ship a green build and restore trust in the CI, a clear philosophy was needed.

## Decision

We will adopt a **Strict & Truthful CI Philosophy**. The main CI pipeline's result must be an unambiguous signal of quality.

1.  **Green Means Ready**: A `pass` state on the main branch means the code is stable and deployable.
2.  **Red Means Stop**: A `fail` state means the code has a regression and must be fixed before merging.
3.  **Flakiness is a Bug**: Tests that are intermittently failing (`flaky`) are treated as bugs. They are moved to a separate, non-blocking "quarantine" workflow where they can be observed and fixed without disrupting development. They are never ignored or perpetually re-run.

This philosophy ensures that a green build is a reliable signal of quality, not a matter of luck.

## Consequences

### Positive

- **Trustworthy CI**: Developers can trust that a green build is safe to merge and deploy.
- **Reduced Debugging Time**: Clear pass/fail signals make it easier to identify the source of a problem.
- **Visibility into Flakiness**: Quarantined tests are not hidden; they run in a visible, non-blocking workflow, creating a backlog of stability improvements.

### Negative

- **Initial Overhead**: Requires the initial effort to create and maintain a separate quarantine workflow.
- **Discipline Required**: The team must be disciplined about not letting the quarantine workflow become a dumping ground for ignored tests.
