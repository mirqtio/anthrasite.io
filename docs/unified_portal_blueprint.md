# Detailed Implementation & Testing Blueprint: Unified Portal

**Target:** `anthrasite-clean` (Next.js) & `LeadShop-v3-clean` (Backend)
**Goal:** Build "The Control Room" for Ops & Support.

---

## Part 1: The Schema & Types (The Foundation)

### 1. Database Schema Updates

**File:** `LeadShop-v3-clean/migrations/20251127_add_portal_indexes.sql` (New)

- **Status:** [Implemented] Migration file created.
- **Action:** Create raw SQL migration to add B-Tree indexes for "Master List" performance.
  ```sql
  CREATE INDEX IF NOT EXISTS idx_leads_state_city ON leads(state, city);
  CREATE INDEX IF NOT EXISTS idx_leads_zip ON leads(zip_code);
  CREATE INDEX IF NOT EXISTS idx_leads_naics ON leads(da_primary_naics6);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  -- Ensure sales volume index exists
  CREATE INDEX IF NOT EXISTS idx_leads_sales_volume ON leads(da_location_sales_volume DESC);
  ```

### 2. TypeScript Definitions & Read Models

**File:** `anthrasite-clean/types/admin.ts` (New)

- **Status:** [Implemented]
- **Action:** Define shared interfaces for the Portal, including read-only views of LeadShop tables. We do **not** introspect LeadShop's schema into Prisma; instead we manually define the shapes we need and back them with `getSql()` queries.

  ```typescript
  export type WorkerHealthStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN'

  export type LeadAction =
    | 'RUN_ASSESSMENT' // Phase A-C
    | 'GENERATE_REPORT' // Phase D (Full)
    | 'REGENERATE_PDF' // Repair Level 2
    | 'RESEND_EMAIL' // Repair Level 1

  export interface ManualLeadInput {
    url: string
    company: string
    monthly_revenue: number
    contact_email?: string
  }

  // Read model for LeadShop-owned leads table (subset of columns the portal needs)
  export interface LeadRow {
    id: number
    company: string | null
    city: string | null
    state: string | null
    zip_code: string | null
    da_location_sales_volume: number | null
    status: string | null
  }

  // Read model for runs table
  export interface RunRow {
    id_str: string // run_id
    lead_id: number
    reasoning_memo_s3_key: string | null
    started_at: string | null
    created_at: string
    phase_a_status: string | null
    phase_b_status: string | null
    phase_c_status: string | null
    phase_d_status: string | null
  }
  ```

---

## Part 2: The Infrastructure (Backend)

### 1. Database Access

**Pattern:** Use `getSql()` from `lib/db.ts` for all runtime queries.

- **Status:** [Implemented]
- **Why:** Consistent with existing connection pooling (PgBouncer) and architecture.
- **Example:**
  ```typescript
  import { getSql } from '@/lib/db'
  const sql = getSql()
  const leads = await sql<LeadRow[]>`SELECT * FROM leads WHERE ...`
  ```

### 2. Temporal Client Isolation

**File:** `anthrasite-clean/lib/temporal/client.ts` (New)

- **Status:** [Implemented]
- **Constraint:** `server-only`. Never import into Edge functions.
- **Logic:** Exports a singleton `Client` instance connected to Temporal Cloud.
- **Security:** Loads certs/keys from env vars.

### 3. Auth & RBAC (Control Room Gate)

**Goal:** Ensure the Unified Portal is accessible only to authenticated internal roles.

- **Auth Provider:** Supabase Auth (existing Anthrasite pattern).
- **Status:** [Implemented]
  - `lib/supabase/client.ts` created.
  - `app/login/page.tsx` created.
  - Middleware redirects unauthenticated users to `/login`.
- **Routes:** All `/admin/*` pages and associated Server Actions (e.g., `ingestManualLead`, `triggerBatchPhaseD`) are wrapped in a middleware or layout that:
  - Verifies an authenticated Supabase session.
  - Checks that the user has an internal role (e.g., `role IN ('ops_admin', 'support')`).
- **Enforcement:**
  - Unauthorized users receive `403` and no UI for Control Room actions is rendered.
  - No client-side code calls Temporal directly; all orchestration flows through these gated server entrypoints.

### 4. Server Actions

#### Lead Ingestion (`actions/ingest.ts`)

- **Status:** [Implemented]
- **Function:** `ingestManualLead(data: ManualLeadInput)`
- **Logic Flow:**
  1.  **Validate:** Zod schema check.
  2.  **Dupe-Guard:**
      ```typescript
      const existing =
        await sql`SELECT id FROM leads WHERE url = ${cleanedUrl} OR domain = ${domain}`
      if (existing.length > 0) throw new Error('Lead exists')
      ```
  3.  **Insert:** `await sql`INSERT INTO leads ... RETURNING id``.
  4.  **Revalidate:** `revalidatePath`.

#### Pipeline Control (`actions/pipeline.ts`)

- **Status:** [Implemented]
- **Function:** `triggerBatchPhaseD(leadIds: number[], confirmationToken?: string)`
- **Logic Flow:**
  1.  **Safety:** Check `confirmationToken` if batch > 100.
  2.  **Resolve Eligible Runs:** For each `leadId`, select the most recent `run_id` with a non-null `reasoning_memo_s3_key` (mirrors LeadShop's Phase D batch API):
      ```typescript
      const row = await sql`
        SELECT r.id_str       AS run_id,
               r.reasoning_memo_s3_key,
               COALESCE(l.company, '') AS business_name,
               COALESCE(r.started_at, r.created_at) AS t
        FROM runs r
        JOIN leads l ON l.id = r.lead_id
        WHERE r.lead_id = ${leadId} AND r.reasoning_memo_s3_key IS NOT NULL
        ORDER BY t DESC
        LIMIT 1
      `
      if (!row) {
        skipped.push({ leadId, reason: 'no_run_with_memo' })
        continue
      }
      ```
  3.  **Idempotent Workflow Start (Temporal Contract):**
      ```typescript
      await client.start('PremiumReportGenerationWorkflow', {
        workflowId: `premium-report-${row.run_id}`,
        workflowIdReusePolicy: 'REJECT_DUPLICATE', // Critical: prevent double-start
        args: [
          {
            run_id: row.run_id,
            lead_id: leadId,
            batch_id,
            business_name: row.business_name,
            memo_s3_key: row.reasoning_memo_s3_key,
          },
        ],
      })
      ```
  4.  **Error Handling:** Catch `WorkflowExecutionAlreadyStartedError` and treat as "Success (Already Running)".

#### Observability (`actions/observability.ts`)

- **Status:** [Implemented]
- **Function:** `getWorkerStatus()`
- **Optimization:** Wrap `describeTaskQueue` with a short in-memory cache (e.g., `unstable_cache` or simple global var with timestamp) to prevent hammering Temporal Cloud on every poll.

---

## Part 3: The UI Components (Frontend)

### 1. Ingest Wizard (`LeadIngestModal.tsx`)

- **Status:** [Implemented]
- **State:** React Hook Form + Zod.
- **Feedback:** Show specific error if "Lead exists" is returned.

### 2. Worker Beacon (`WorkerBeacon.tsx`)

- **Status:** [Implemented]
- **Strategy:** `useSWR` polling `/api/admin/worker-status` (which calls the cached Server Action).
- **Visuals:** Green/Red indicator.

### 3. Master List (`admin/leads/page.tsx`)

- **Status:** [Implemented]
- **Data Fetching:** Server Component calling `sql`SELECT ... OFFSET ... LIMIT ...``.
- **Type Safety:** Cast result to `LeadRow[]` (from manual read models in `types/admin.ts`).

---

## Part 4: The Execution Order

1.  **[LeadShop]** Run SQL Migration (`20251127_add_portal_indexes.sql`). This must be applied before relying on the portal's "Master List" performance characteristics; without it, the portal still functions but queries may be slower.
2.  **[Anthrasite]** Define/read models in `types/admin.ts` (e.g., `LeadRow`, `RunRow`) and wire them to `getSql()`-backed queries. No `prisma db pull` is run for LeadShop-owned tables.
3.  **[Anthrasite]** Create `lib/temporal/client.ts` (Isolated Client).
4.  **[Anthrasite]** Implement Server Actions (using `getSql` & `lib/temporal`).
5.  **[Anthrasite]** Build UI Components.
6.  **[Anthrasite]** Assemble Pages.

**Verification:**

- Ensure `lib/temporal/client.ts` is NOT imported by any layout/page using `export const runtime = 'edge'`.
- Verify `workflowIdReusePolicy` prevents double-triggering via a test script.

---

## Part 5: Missing Features (Gap Analysis)

### 1. "Agent Superpowers" (Support)

- **Magic Link Generator (Capability B)**: [Pending] The "Broken Link" solver is missing. There is no UI to generate a long-lived, bypass-auth link for a report to send to a customer.
- **Pipeline X-Ray (Capability C)**: [Pending] The UI shows Phase status, but lacks the "X-Ray" view to see S3 file sizes (e.g., "PDF: 0 bytes") or raw logs, which is critical for diagnosing "Blank Page" issues.

### 2. "Dream Dashboard" Views

- **Order Timeline (View 1)**: [Pending] The current `LeadDetailsView` shows the _Internal Pipeline_ (Phase A-D), but misses the _Customer Journey_ (`Ingest -> Email -> Click -> Pay -> Workflow`).
- **Anomaly Feed (View 2)**: [Pending] There is no "Proactive Triage" sidebar showing stuck workflows or payment failures.
- **Communication History**: [Pending] The Lead Detail view does not show the history of emails sent to the lead.
