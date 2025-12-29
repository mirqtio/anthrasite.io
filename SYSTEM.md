# SYSTEM.md (v1.5)

**Project**: Anthrasite.io
**Last Updated**: 2025-12-25
**Change Summary**: Updated Cross-Project Temporal Contract for journey_v2 profile support.
**Owner**: Anthrasite Platform Team
**Status**: Canonical Architecture Document (Ground Truth)

**LeadShop**: LeadShop is the backend system that powers Anthrasite. Details can be found in the [LeadShop SYSTEM.md](../LeadShop-v3-clean/SYSTEM.md).

## System Topology (Cloud/Hybrid Target)

**Core Architecture:**

1.  **Data Ingestion:** Data Axle -> Mac Mini (LeadShop) -> **Supabase (Cloud)**.
2.  **Data Processing:** Temporal Cloud (Orchestration) -> Local Workers (Mac Mini) -> **Supabase (Data) & S3 (Artifacts)**.
3.  **Marketing:** Mac Mini (LeadShop) -> **Supabase (Content)** -> GMass (Delivery).
4.  **Commerce (Vercel):** User clicks Email Link -> Next.js Landing Page -> Stripe Purchase.
5.  **Orchestration (Phase D):** Stripe Webhook -> Triggers **Phase D** in Temporal Cloud.
6.  **Fulfillment:** Temporal Worker -> Generates PDF -> S3 -> Email.

**Data Source of Truth:**

- **Customer/Lead Data:** Supabase (`leads`, `purchases` tables).
- **Execution State:** Temporal Cloud (Workflows).
- **Logs/Debug:** Temporal History.
- **Reports:** S3.

## 3. Core Technology Stack

| Layer                    | Technology                               | Notes                                                      |
| :----------------------- | :--------------------------------------- | :--------------------------------------------------------- |
| **Frontend**             | Next.js (App Router)                     | React 18, streaming server components enabled              |
| **Styling**              | Tailwind CSS                             | Consistent with Anthrasite brand kit                       |
| **Database**             | PostgreSQL (Vercel-hosted)               | Supabase-compatible schema                                 |
| **ORM**                  | Prisma                                   | Enforces type safety and schema consistency                |
| **Payments**             | Stripe Payment Element                   | Embedded flow using `PaymentIntent` API                    |
| **Queue / Job Dispatch** | Vercel KV or Upstash Queue               | Provides lightweight asynchronous job delivery             |
| **Worker Runtime**       | Node.js Worker or Supabase Edge Function | Consumes queued jobs and generates reports                 |
| **PDF Generation**       | Playwright (print-to-PDF)                | Deterministic, headless Chromium rendering                 |
| **Email Delivery**       | Google Workspace (Gmail SMTP)            | Provider-abstracted; swappable later for Postmark/SendGrid |
| **Testing**              | Vitest (unit) / Playwright (E2E)         | Multi-project CI pipeline with Vercel build parity         |
| **Deployment**           | Vercel                                   | Continuous deployment from main branch                     |

## 4. Key Architectural Decisions & Patterns

- **ADR-P01 (Payment UX)**: Use Stripe's embedded **Payment Element**.
- **ADR-P02 (Receipts)**: Enable Stripe's automated receipts with a **custom sending domain**.
- **ADR-P03 (Website ↔ LeadShop Bridge)**: Implement a **managed queue** for durable communication.
- **ADR-P04 (PDF Engine)**: Utilize **Playwright's print-to-PDF** as the MVP.
- **ADR-P05 (Email Delivery)**: Send reports via **Gmail SMTP** using `nodemailer`.
- **ADR-P06 (Pricing)**: Pricing is controlled by a **server-side allow-list** validated against a tier label in the UTM token.
- **ADR-P07 (Deployment)**: `anthrasite.io` and `LeadShop` remain **separate projects and deployments**.
- **ADR-P08 (Build-Time Rendering)**: Pages with runtime dependencies must be explicitly marked for dynamic rendering (`export const dynamic = 'force-dynamic'`)
- **ADR-P11 (Middleware Architecture)**: Middleware is implemented as a single, chainable architecture in `middleware.ts`.
- **ADR-P12 (CI/CD & Testing)**: The CI pipeline uses a multi-project Playwright setup with Vercel build parity, favoring integration tests over heavy mocking.

**Operational Reliability Patterns:**
Anthrasite.io inherits the _Producer–Validator_ and _Failure Contract_ conventions defined in LeadShop’s SYSTEM.md §4.3 and §6, ensuring consistent idempotency and explicit validation across environments.

## 5. Post-G1 File Structure

- `/app`: Core Next.js routing, including API routes and pages.
- `/components`: Reusable React components.
- `./docs`: Project documentation, including ADRs.
- `./e2e`: Playwright end-to-end tests.
- `/lib`: Shared libraries for services like database access and Stripe.
- `/prisma`: Database schema and migration files.
- `/_archive`: A tracked directory containing all non-essential files from before the G1 cleanup.

## 6. Cross-Project Temporal Contract (LeadShop Integration)

Anthrasite.io acts as an additional Temporal client for LeadShop's workflows, primarily for Phase D (Premium Report Generation) triggered by Stripe webhooks or internal ops portals.

### 6.1 Report Configuration Profiles

LeadShop supports two report configuration profiles that affect Phase D behavior:

| Profile      | Description                        | Phase D Approach                                   | Eligibility                             |
| ------------ | ---------------------------------- | -------------------------------------------------- | --------------------------------------- |
| `issue_v1`   | Memo-based reports                 | Loads reasoning memo + LLM segment composers       | Requires `reasoning_memo_s3_key`        |
| `journey_v2` | **Default.** Journey-based reports | Phase B journey context + LLM synthesis (Opus 4.5) | Requires `phase_a_status = 'completed'` |

The profile is stored in `runs.report_config_profile` and defaults to `journey_v2`.

### 6.2 Workflow Contract

- **Shared Workflow IDs (Phase D):**

  - All callers (LeadShop FastAPI, Anthrasite, CLI tools) MUST use the workflow ID format `premium-report-{run_id}-{timestamp}` when starting `PhaseDReportWorkflow`.
  - The timestamp suffix allows re-runs for the same run_id if needed.
  - This guarantees idempotent starts and consistent observability in Temporal.

- **Run Eligibility for Phase D (Profile-Aware):**

  - **`issue_v1` profiles:** Anthrasite must only start Phase D for runs where `reasoning_memo_s3_key` is non-null.
  - **`journey_v2` profiles:** Anthrasite must only start Phase D for runs where `phase_a_status = 'completed'` (no memo required).
  - The selection rule should mirror LeadShop's behavior: pick the most recent run (by `COALESCE(started_at, created_at)`) that meets the eligibility criteria for its profile.

- **Profile Passthrough:**

  - Anthrasite MUST pass `report_config_profile` from the run record to the `PhaseDReportWorkflow` input.
  - This determines which execution path Phase D takes (memo-based vs journey-based).

- **Task Queue:**
  - Production post-purchase flows use the `premium-reports` queue.

### 6.3 State Management

- **Execution State Source of Truth:**

  - Phase status fields (`phase_a_status`, `phase_b_status`, `phase_c_status`, `phase_d_status`) on `runs` are updated by LeadShop activities (e.g. `update_run_phase_status`).
  - Anthrasite MUST NOT maintain its own parallel phase-status state; it should read status from the shared database or Temporal queries only.

- **Temporal Client Placement & Secrets:**
  - The Temporal TS client used by Anthrasite lives in `lib/temporal/client.ts` and is **server-only**; it must never be imported into client components or Edge runtimes.
  - It reuses the same credential set as the LeadShop worker/CLI. These secrets remain LeadShop-grade and are only consumed from server environment variables.

### 6.4 Change Management

- Any change to workflow IDs, task queues, profiles, or Phase D eligibility logic MUST be reflected in both this section and the corresponding contract section in `LeadShop-v3-clean/SYSTEM.md`.

---

**Maintainer:** Anthrasite Platform Team
**Review Cadence:** Quarterly or on major ADR merge

---
