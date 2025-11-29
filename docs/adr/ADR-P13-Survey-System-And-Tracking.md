# ADR-P13: Survey System & Tracking Pixel

**Status**: Accepted  
**Date**: 2025-11-21

## Context

Anthrasite needs a way to:

- Collect structured feedback about the report experience (before/after questions).
- Measure perceived accuracy, value, and pricing sensitivity.
- Tie survey responses and report access back to specific leads and report runs.
- Track survey email opens for basic engagement analytics.

Constraints and prior art:

- Anthrasite already uses **JWTs** for secure survey links (`/survey?token=...`).
- There is a shared **Supabase Postgres** database between Anthrasite and LeadShop.
- LeadShop is responsible for sending emails; Anthrasite is responsible for survey UI, APIs, and logging/report access.
- Prior UTM token implementation was effectively a placeholder and not used for the survey system.

We needed a design that:

- Keeps **identity and access** in a single token (JWT).
- Uses an **idempotent, per-invite key** for survey storage.
- Works with the existing database and infra (postgres.js, Prisma).
- Allows simple **tracking pixel integration** without adding another external service.

## Decision

1. **Use JWT as the canonical survey link token**

   - Survey links use `token=<JWT>` where the payload (`SurveyTokenPayload`) includes:
     - `leadId`
     - `runId?`
     - `jti` (unique per invite)
     - `version?`
     - `batchId?`
     - standard claims: `aud`, `iat`, `exp`, `scope`.
   - `validateSurveyToken` (in `lib/survey/validation.ts`) is the single source of truth for validating survey tokens.

2. **Store survey responses in a single `survey_responses` row per invite, keyed by `jtiHash`**

   - `jti` is hashed via `hashJti(jti)` and stored as `jtiHash` with a **unique constraint**.
   - All survey writes go through `saveSurveyResponse` / `completeSurveyResponse` in `lib/survey/storage.ts`, which use an **UPSERT** pattern on `jtiHash`.
   - The `SurveyResponse` model holds:
     - `leadId`, `runId`, `version`, `batchId`.
     - `beforeAnswers`, `afterAnswers`, `metrics` as JSON.
     - `reportAccessedAt`, `beforeCompletedAt`, `afterCompletedAt`, `completedAt`, `createdAt`, `updatedAt`.

3. **Survey flow is a two-step UX with autosave and report access logging**

   - Client flow:
     - `before` questions → report interstitial → `after` questions → thank-you.
     - Autosave for before and after sections via `POST /api/survey/[token]/submit` with `step`.
   - Back-end:
     - `GET /api/survey/[token]` validates the token, checks completion, and returns the question sets.
     - `POST /api/survey/[token]/submit` validates the token and zod-validated answers, then writes via `saveSurveyResponse` or `completeSurveyResponse`.
   - Report access is logged via `logReportAccess(jti, leadId, version?, batchId?)`, which also UPSERTs on `jtiHash`.

4. **Survey question content is defined in code with explicit validation**

   - Question sets live in `lib/survey/questions.ts` as `BEFORE_QUESTIONS` and `AFTER_QUESTIONS`.
   - Types and validation schemas live in `lib/survey/types.ts`:
     - `beforeAnswersSchema` and `afterAnswersSchema` define required/optional fields and numeric ranges.
   - The current survey is a **pre-report** and **post-report** questionnaire focused on:
     - Preferred audit format and pricing expectations (before).
     - Perceived accuracy, value, agency referral interest, and follow-up interest (after).

5. **Implement a survey email tracking pixel as a tiny Next.js API route**

   - New route: `GET /api/pixel/survey-open` (in `app/api/pixel/survey-open/route.ts`).
   - Inputs (query params):
     - `token` (survey JWT)
     - `send_id` (unique email send ID from LeadShop)
     - `email_type?` (e.g., `invite`, `reminder_1`)
     - `campaign?` (e.g., `q4_2025_survey`)
   - Behavior:
     - Validate `token` via `validateSurveyToken` and extract `leadId` + `jti`.
     - Hash IP with a salted SHA-256 (`IP_HASH_SALT`) to avoid storing raw addresses.
     - Call `logEmailOpen` in `lib/survey/storage.ts` to upsert into `survey_email_opens`.
     - Always return a 1x1 transparent GIF with `Cache-Control: no-store`, even on errors.

6. **Reuse the shared Supabase database for email opens**

   - Rather than introducing a separate analytics store, Anthrasite writes directly to the shared Supabase database.
   - LeadShop can query `survey_email_opens` directly for analytics (open rates, invite vs reminder performance, etc.).

## Consequences

### Positive

- **Single token for identity and access**: The survey JWT encodes everything needed to identify a lead + run + batch; there is no second token format for survey.
- **Idempotent storage**: The `jtiHash`-keyed UPSERT pattern ensures each invite has a single, canonical `survey_responses` row.
- **Tight coupling of survey, report access, and metrics**: Before/after answers, report access time, and environment/timing metrics live in one table.
- **No external tracking service required**: The tracking pixel is a simple Next.js API route writing to the existing Postgres database.
- **Shared-data-friendly**: Since Anthrasite and LeadShop share Supabase, LeadShop can compute email open metrics without another integration layer.

### Negative / Trade-offs

- **Basic open tracking only**: Pixel-based open tracking is inherently approximate (image blocking, Apple Mail Privacy Protection). This is acceptable for directional analytics, not exact counts.
- **Tighter coupling to DB schema**: Both the survey system and pixel route assume the presence of `survey_responses` and `survey_email_opens`. Schema drift with LeadShop must be managed carefully.
- **JWT dependency**: Survey links and pixels depend on the correctness of the survey JWTs generated by LeadShop; malformed tokens will result in no opens or responses.

### Alternatives Considered

1. **Separate UTM-based token for survey**

   - Rejected: would introduce a second token format alongside JWT, increasing complexity and surface area without clear benefit.

2. **Using a third-party analytics pixel provider**

   - Rejected: overkill for current needs, adds new integration dependencies and data residency questions.

3. **Storing survey data per question (normalized schema)**
   - Rejected for now: JSON-based storage in `survey_responses` is simpler and more flexible while question sets are still evolving.

## Public Survey Extension (2025-11-21)

The survey system was extended to support **non-lead participants** (e.g., experts from UserInterviews, Wynter, Prolific) while preserving the existing lead-based flow.

### Design Decisions

1. **Single Table with Optional `leadId`**

   - Made `leadId` optional in `survey_responses` rather than creating a separate table
   - Allows easy aggregation across lead and non-lead responses
   - Added fields: `respondentId`, `source`, `respondentEmail`, `questionSetVersion`, `ref`

2. **Public Entry Endpoint**

   - New route: `GET /survey/start?source=<source>&pid=<participant_id>&ref=<ref>`
   - Auto-generates JWTs with 14-day expiration (vs 24-72h for leads)
   - Implements IP-based throttling to prevent abuse
   - Redirects to `/survey?token=<jwt>`

3. **Demo Report for Public Users**

   - Public tokens (missing `leadId`) trigger demo report display
   - Configured via `DEMO_REPORT_S3_KEY` environment variable
   - UI shows informational banner explaining it's a sample report

4. **JWT Claims for Provenance**
   - `source` and `respondentId` included in JWT claims (not just metadata)
   - Ensures provenance is trustworthy and prevents query parameter spoofing

### Updated Token Payload

```typescript
interface SurveyTokenPayload {
  leadId?: string // Optional for public surveys
  runId?: string
  jti: string // Still required, primary anchor
  source?: string // e.g., "wynter", "linkedin"
  respondentId?: string // External ID from research platform
  aud: string
  scope: string
  version?: string
  batchId?: string
  iat: number
  exp: number // 14 days for public, 24-72h for leads
}
```

### Database Schema Updates

```prisma
model SurveyResponse {
  // ... existing fields ...
  leadId            String?   // Made optional

  // Public survey fields
  respondentId      String?   // External ID (e.g. from UserInterviews)
  source            String?   // Origin (e.g. "wynter", "linkedin")
  respondentEmail   String?   // Optional capture
  questionSetVersion String?  @default("v1")
  ref               String?   // Referral/funnel tracking

  // ... rest of fields ...

  @@index([respondentEmail])
}
```

### Integration Examples

**UserInterviews**:

```
https://anthrasite.io/survey/start?source=userinterviews&pid=UI_12345
```

**Wynter**:

```
https://anthrasite.io/survey/start?source=wynter&pid=WYN_67890&ref=q4_campaign
```

**LinkedIn Outreach**:

```
https://anthrasite.io/survey/start?source=linkedin&pid=linkedin_user_123
```

### Consequences

**Positive**:

- Enables feedback collection from broader audience beyond leads
- Maintains data integrity with single-table design
- Preserves all existing lead-based functionality
- Simple integration with research platforms

**Negative**:

- Requires `DEMO_REPORT_S3_KEY` configuration for demo report
- Public responses dilute lead-specific metrics (mitigated by `WHERE leadId IS NOT NULL` queries)
- Longer JWT expiration increases window for token reuse (acceptable for public surveys)

## Implementation Notes

- Survey system core files:
  - `app/survey/page.tsx` and `app/survey/components/*` (client flow and UI).
  - `app/api/survey/[token]/route.ts` and `app/api/survey/[token]/submit/route.ts` (API).
  - `lib/survey/questions.ts`, `lib/survey/types.ts`, `lib/survey/storage.ts`, `lib/survey/validation.ts` (schema, types, storage, validation).
  - `app/api/report/open/route.ts` (report redirect + report access logging).
- Tracking pixel:
  - `app/api/pixel/survey-open/route.ts`.
  - `logEmailOpen` in `lib/survey/storage.ts`.
  - `SurveyEmailOpen` model in `prisma/schema.prisma` (if used) OR direct writes to the existing `survey_email_opens` table in the shared DB, depending on schema alignment.
- External coordination:
  - LeadShop is responsible for **email sending** and for generating `send_id` + embedding the pixel URL in the survey email templates.
