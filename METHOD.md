# Our Collaborative Method (Version 1.4)

This document defines the process for the Human, Cascade, and Claude collaboration.

## 1. Principles

- **Systematic & Documented:** We do not guess. We verify, document, and then act.
- **Issue-Driven:** All work is tracked in **Plane**. `ISSUES.md` is a generated snapshot, not the source of truth.
- **PR-Centric:** All code changes are submitted via Pull Requests, providing a formal, asynchronous review and quality gate.
- **Single Source of Truth:** `SYSTEM.md` contains the confirmed, terse ground truth of the codebase.
- **Atomic Commits:** Each closed issue should result in a clean git commit history within its PR.
- **Versioned Method:** This document is versioned. The canonical version is `METHOD.md`; previous versions are stored as `METHOD.XXX.md`.

## 2. Roles & Responsibilities

- **Cascade (You): Technical Project Manager & System Architect.**

  - **Responsibilities**:
    1.  **Manage the Backlog**: Decompose goals into issues and modules in **Plane**.
    2.  **Maintain the Dashboard**: Update project velocity and completion metrics.
    3.  **Architect Solutions**: Create high-level implementation plans in `SCRATCHPAD.md`.
    4.  **Delegate & Direct**: Provide clear, structured instructions for Claude.
    5.  **Review Pull Requests**: Review Claude's PRs for architectural alignment, correctness, and adherence to the plan. Provide feedback and approval.
    6.  **Verify & Document**: After a PR is merged, update the corresponding issue in **Plane** to `Done`, and update `SYSTEM.md` with any architectural changes.
    7.  **Maintain `ISSUES.md` Snapshot**: Periodically generate and commit an updated `ISSUES.md` from Plane to keep a file-based record.
  - **Strict Prohibition**: You do not write implementation code. Your role is to plan, delegate, and review.

- **Claude: The Engineer.**

  - **Responsibilities:**
    1.  Execute delegated tasks from `SCRATCHPAD.md` on a dedicated feature branch.
    2.  Implement solutions, run tests, and ensure all automated checks pass.
    3.  **Open a Pull Request** against the `main` branch upon completion, using a template that links to the issue.
    4.  Address feedback from Cascade by pushing new commits to the PR branch.
  - **Definition of Done:** A task is complete when a PR is opened, CI is passing, and it is ready for Cascade's review.

- **The Human: The Facilitator & Product Owner.**
  - **Responsibilities:** Provide high-level direction, facilitate AI-to-AI communication, and **merge approved Pull Requests**.
  - **Operating Principle:** Guide the overall direction and ensure adherence to the defined process.

## 3. The Workflow

1.  **Issue Creation & Planning:**

    - Cascade creates/updates an issue in **Plane**.
    - Cascade defines the implementation plan in `SCRATCHPAD.md`.

2.  **Implementation (Claude):**

    - The Human triggers Claude with the plan from `SCRATCHPAD.md`.
    - Claude creates a feature branch (e.g., `feature/G1-cleanup`).
    - Claude implements the solution and ensures all local tests and quality checks pass.

3.  **Pull Request & Automated Validation:**

    - Claude pushes the branch and opens a Pull Request against `main`.
    - The PR title references the issue number (e.g., "G1: Codebase Cleanup").
    - **CI Pipeline runs automatically**: `typecheck`, `build`, `lint`, and `@smoke` tests are executed.

4.  **Architectural Review (Cascade):**

    - Cascade is notified that the PR is ready for review (CI is green).
    - Cascade reviews the code changes for architectural correctness and adherence to the plan.
    - Cascade provides feedback by commenting on the PR. If changes are needed, Claude pushes new commits to the branch.
    - Once satisfied, Cascade approves the PR.

5.  **Merge & Closure (Human & Cascade):**

    - The Human merges the approved PR into the `main` branch.
    - Cascade updates the issue in **Plane** to `Done`, referencing the PR link.
    - Cascade updates `SYSTEM.md` or `docs/adr/` with any changes to the system's ground truth.

6.  **Next Cycle:**
    - The Human clears Claude's context to prepare for the next task.
    - Cascade and the Human agree on the next issue from the backlog.
    - The cycle repeats.

## 4. File Index

- `METHOD.md`: This file. Our process.
- `SYSTEM.md`: Ground truth about the code (terse, structured).
- `ISSUES.md`: A **generated snapshot** of the project backlog from Plane. This file is a read-only report; Plane is the source of truth.
- `SCRATCHPAD.md`: Ephemeral communication channel for AI-to-AI tasks.
- `docs/adr/`: Architectural Decision Records, documenting the 'why' behind key decisions.

## 5. Session Context & Bootstrapping

To ensure continuity and focus between sessions, a new session should be initialized with a concise context package. This avoids the need to re-establish the project's state from scratch.

**Essential Context Package:**

1.  **Core Method & State Files:** The full contents of @[METHOD.md], @[ISSUES.md], and @[SYSTEM.md].
2.  **Project Mission & GTM Objective:** A short, synthesized summary of the project's high-level goal.
3.  **Current Task Handoff:** An explicit statement of the current issue number and a reference to @[SCRATCHPAD.md] if it contains a plan.
4.  **Key Architectural Decisions:** A list of filenames and one-sentence summaries of the most critical ADRs in @[docs/adr/].
