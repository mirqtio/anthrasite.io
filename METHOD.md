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
    1.  **Manage the Backlog**: Decompose goals into issues in **Plane**.
    2.  **Maintain the Dashboard**: Update project velocity and completion metrics in `ISSUES.md`.
    3.  **Architect Solutions**: Create high-level implementation plans in `SCRATCHPAD.md`.
    4.  **Verify & Document**: After the Human implements a solution, update the corresponding issue in **Plane** to `Done`, update `ISSUES.md`, and update `SYSTEM.md` with any architectural changes.
  - **Strict Prohibition**: You do not write or commit implementation code. Your role is to plan and document.

- **The Human: The Product Owner & Lead Engineer.**

  - **Responsibilities:**
    1.  Provide high-level direction and final approval.
    2.  **Implement solutions** based on the plan in `SCRATCHPAD.md`.
    3.  **Commit code changes** directly to the appropriate branch.
    4.  Ensure adherence to the defined process.

## 3. The Workflow

1.  **Issue Creation & Planning (Cascade):**

    - Cascade creates/updates an issue in **Plane**.
    - Cascade defines the implementation plan in `SCRATCHPAD.md`.

2.  **Implementation (The Human):**

    - Cascade marks the issue as `In Progress` in Plane.
    - The Human implements the solution based on the plan.
    - The Human runs all local tests and quality checks.
    - The Human commits the code directly to the `main` branch (or a feature branch, if preferred).

3.  **Closure (Cascade):**

    - The Human notifies Cascade that the implementation is complete.
    - Cascade reviews the final implementation in `SCRATCHPAD.md` to confirm if the initial point estimate was accurate. This is for reporting accuracy, not to retroactively change points.
    - Cascade updates the issue in **Plane** to `Done`.
    - Cascade updates `ISSUES.md` and `SYSTEM.md` with any relevant changes.
    - Cascade commits the documentation updates.

4.  **Next Cycle:**

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
