# Survey System Overview

## 1. High-Level Architecture

The survey system is a JWT-secured, two-phase feedback flow wrapped around the Anthrasite report. It is designed to:

- **Authenticate and scope each survey invite** to a specific lead/run using a signed JWT.
- **Collect structured pre- and post-report feedback** ("before" and "after" questions).
- **Persist responses idempotently** in a single `survey_responses` row keyed by a hashed `jti`.
- **Track report access** so you can correlate survey answers with actual report usage.
- **Capture basic UX metrics and environment data** (timing, device, user agent).

At a high level, the flow is:

1. Lead receives an email with a survey link (`/survey?token=<JWT>`).
2. The survey client validates the token via an API endpoint and loads the survey definition.
3. The user completes a **before** section, views their report, then completes an **after** section.
4. All answers, report access, and metrics are stored in `survey_responses` using an UPSERT keyed by a hashed `jti`.
5. Subsequent visits with the same token see an "already completed/expired" experience.

## 2. Tokens and Identity

### 2.1 SurveyTokenPayload

Each survey link carries a JWT with payload:

````ts
interface SurveyTokenPayload {
  leadId: string
  runId?: string
  jti: string
  aud: string
  scope: string
  version?: string
  batchId?: string
  iat: number
  exp: number
}
``

Key aspects:

- **`leadId`**: Identifies the lead in the upstream system (LeadShop).
- **`runId`**: Optional; identifies a specific report run or experiment.
- **`jti`**: Unique token identifier used as the stable key for a single survey invite.
- **`version` / `batchId`**: Allow versioning the survey and grouping invites (e.g., campaigns or batches).
- **`exp`**: Token expiration; expired tokens are rejected.

### 2.2 Validation

A helper (`validateSurveyToken`) uses `SURVEY_SECRET_KEY` with the `jose` library to:

- Verify the signature and standard JWT claims (`exp`, `aud`, etc.).
- Return a `SurveyTokenPayload` if valid, or `null` if invalid/expired.

This is used consistently by:

- `GET /api/survey/[token]`
- `POST /api/survey/[token]/submit`
- `/api/report/open?sid=<JWT>` (report access flow)


## 3. API Endpoints

### 3.1 GET /api/survey/[token]

Responsible for bootstrapping the survey on the client.

Steps:

1. Validate the JWT via `validateSurveyToken`.
2. If invalid/expired → `401` with `{ valid: false, error: 'invalid_token' }`.
3. If valid, call `isSurveyCompleted(jti)`:
   - If already completed → `410` with `{ valid: false, error: 'already_completed' }`.
4. Load the survey definition via `getSurveyQuestions()`.
5. Respond with:

```json
{
  "valid": true,
  "survey": {
    "leadId": "...",
    "runId": "...",
    "version": "v1",
    "batchId": "..."
  },
  "questions": {
    "before": [...],
    "after": [...]
  }
}
````

Errors are logged with stack traces for debugging; a generic `500` JSON is returned to clients.

### 3.2 POST /api/survey/[token]/submit

Handles both partial saves and final completion.

Request body is validated by `submitSchema`:

```ts
const submitSchema = z.object({
  step: z.enum(['before', 'after', 'after-partial', 'complete']),
  beforeAnswers: beforeAnswersSchema.optional(),
  afterAnswers: z.record(z.any()).optional(),
  reportAccessed: z.boolean().optional(),
  metrics: z
    .object({
      time_before_ms: z.number().optional(),
      time_after_ms: z.number().optional(),
      time_to_report_click: z.number().optional(),
      screen_width: z.number().optional(),
      screen_height: z.number().optional(),
      user_agent: z.string().optional(),
    })
    .optional(),
})
```

Flow:

1. Validate JWT.
2. Parse and validate JSON body via zod.
3. If `step === 'complete'` and both `beforeAnswers` and `afterAnswers` are present:
   - Call `completeSurveyResponse(jti, beforeAnswers, afterAnswers, metrics)`.
   - If the resulting row has an empty `leadId`, backfill `leadId`, `runId`, `version`, `batchId` from the JWT.
   - Return `{ success: true, completed: true, submissionId, message: 'Thank you for your feedback!' }`.
4. Otherwise (partial, autosave):
   - Call `saveSurveyResponse({...})` with the current answers and metrics.
   - Return `{ success: true, completed: false, submissionId, message: 'Progress saved' }`.
5. For zod validation errors, respond with `400` and a field-level error map.
6. For unexpected errors, log and return `500` with `{ success: false, error: 'server_error' }`.

## 4. Persistence Model: survey_responses

Persistence is handled in `lib/survey/storage.ts` using `postgres.js` and a `survey_responses` table.

### 4.1 Idempotency and keying

- All functions derive `jtiHash = hashJti(jti)` and use it as the logical key.
- The table has a unique constraint on `"jtiHash"`.
- All insertions use an UPSERT (`ON CONFLICT ("jtiHash") DO UPDATE`) to maintain a single row per invite.

This gives:

- **Idempotency** for repeated POSTs.
- **Single source of truth** for all survey state for a given invite.
- A simple way to determine completion (`completedAt` not null).

### 4.2 Saving partial responses

`saveSurveyResponse(options: SaveSurveyOptions)`:

- Inserts or updates a row with:
  - `leadId`, `runId`, `version`, `batchId`.
  - `beforeAnswers` / `beforeCompletedAt` if provided.
  - `afterAnswers` / `afterCompletedAt` if provided.
  - `metrics` if provided.
  - `reportAccessedAt` if `reportAccessed` is true.
  - `updatedAt` (always).
- Uses UPSERT to merge new fields with any existing data.

### 4.3 Completing a survey

`completeSurveyResponse(jti, beforeAnswers, afterAnswers, metrics?)`:

- Ensures both answer sets are present.
- UPSERTs a row with:
  - `beforeAnswers`, `afterAnswers`, `metrics`.
  - `beforeCompletedAt`, `afterCompletedAt`, and `completedAt` set to the current timestamp.
- Returns the row so the caller can, if necessary, backfill `leadId` and related fields.

### 4.4 Report access logging

`logReportAccess(jti, leadId, version?, batchId?)`:

- UPSERTs into `survey_responses`:
  - `jtiHash`, `leadId`, `version`, `batchId`.
  - `reportAccessedAt` and timestamps.
- Used by the report open route to ensure report access is recorded even if the user does not complete the survey.

### 4.5 Reading state / completion

- `getSurveyResponse(jti)` selects a row by `jtiHash` for introspection/debugging.
- `isSurveyCompleted(jti)` returns `true` if `completedAt` is not null.

## 5. Client Flow and UX

The primary client entry point is `/app/survey/page.tsx`, which:

- Reads the `token` query param.
- If missing, renders an "Invalid Survey Link" page.
- Otherwise, renders `SurveyContainer` with the token.

### 5.1 SurveyContainer state machine

`SurveyContainer` tracks a `SurveyStep` state:

- `loading` → initial state while fetching configuration.
- `before` → before-report questions.
- `report` → report access interstitial.
- `after` → after-report questions.
- `thank-you` → final confirmation.
- `error` → invalid/expired/already completed or failed load.

On mount:

1. Calls `GET /api/survey/[token]`.
2. If the response is invalid → moves to `error`.
3. If valid → moves to `before`, storing:
   - `surveyData` (lead/run/version/batchId).
   - `beforeQuestions` and `afterQuestions`.
   - `beforeStartTime` for timing.

### 5.2 Before section

- Renders a small set of pre-report questions.
- On completion:
  - Updates state to `report`.
  - Sends a partial submission with:
    - `step: 'before'`.
    - `beforeAnswers`.
    - `metrics.time_before_ms` (time spent on the before section).

### 5.3 Report access step

- Acts as a bridge between survey and report.
- The user can:
  - Click to open the report (via `/api/report/open?sid=<JWT>`), which:
    - Validates the JWT.
    - Resolves the report’s S3 key.
    - Logs report access via `logReportAccess`.
    - Redirects to a pre-signed S3 URL.
  - Continue to the after section.
- Local state tracks whether the report was accessed (`reportAccessed`).

### 5.4 After section

- Renders the post-report questions.
- On completion:
  - Moves to `thank-you`.
  - Sends a final submission with:
    - `step: 'complete'`.
    - `beforeAnswers` (from state).
    - `afterAnswers` (newly collected).
    - `reportAccessed` flag.
    - Metrics:
      - `time_before_ms` and `time_after_ms`.
      - `screen_width`, `screen_height`, `user_agent`.

### 5.5 Thank-you / repeat visits

- The `thank-you` view is purely client-side.
- Subsequent hits to the survey API with the same `token` will see a `410 already_completed` response, which leads the client into the `error` state and surfaces a "Survey Unavailable" UX.

## 6. Current Survey Content

The current survey is defined in `lib/survey/questions.ts` and uses the shared `Question`/`Answer` types from `lib/survey/types.ts`.

### 6.1 Before questions (baseline & acquisition)

1. **Overall website/Google rating**

   - Type: `rating` (1–5).
   - Question: "How would you rate your business's website and Google presence overall?"
   - Description: `1 = Terrible · 5 = Excellent`.
   - Required.

2. **How do you usually attract new customers?**

   - Type: `multiple_choice` + optional "Other".
   - Options:
     - Word-of-mouth / referrals
     - Google / web search
     - Social media
     - Ads (online or offline)
   - Required.

3. **Percentage of customers acquired online**
   - Type: `slider` (0–100).
   - Question: "About what percentage of your new customers find you online (through your website or Google)?"
   - Required.

### 6.2 After questions (perception, value, pricing, improvement)

4. **Report accuracy rating**

   - Type: `rating` (1–5).
   - Question: "How accurate did the report feel for your business?"
   - Description: `1 = Way off · 5 = Spot on`.
   - Required.

5. **Most useful/surprising part**

   - Type: `text`.
   - Question: "What part of the report felt most useful or surprising?"
   - Optional.

6. **Top priority fix**

   - Type: `multiple_choice` + optional "Other".
   - Question: "If you could fix only one thing next on your website or Google presence, what would it be?"
   - Options: Google Business Profile, Website content/structure, SEO visibility, Speed/mobile experience, Reviews/trust signals.
   - Required.

7. **Likelihood to act in the next 60 days**

   - Type: `rating` (1–5).
   - Question: "How likely are you to act on the recommendations in the next 60 days?"
   - Description: `1 = Not at all · 5 = Already started`.
   - Required.

8. **Perceived fair price for the report**

   - Type: `multiple_choice` + optional "Other".
   - Options: `$0`, `$99`, `$199`, `$399`, `$599`, `$799+`.
   - Required.

9. **Estimated business value unlocked**

   - Type: `multiple_choice`.
   - Options: `None`, `Under $1,000`, `$1,000–$5,000`, `$5,000–$20,000`, `Over $20,000`.
   - Required.

10. **Improvements to the report**

    - Type: `text`, multiline.
    - Question: "What could we add or change to make this report more useful for your business?"
    - Optional.

11. **Opt-in for future updates**
    - Type: `checkbox`.
    - Question: "Would you like to receive future updates from Anthrasite, including new report features and insights?"
    - Options: `Yes, keep me updated`.
    - Optional.

### 6.3 Validation

Zod schemas (`beforeAnswersSchema` and `afterAnswersSchema`) enforce:

- Required questions (non-empty strings or valid numeric ranges).
- Valid ranges for ratings and sliders.
- Optionality for free-text and opt-in fields.

## 7. What This Enables

With this system in place, Anthrasite can:

- Tie **every survey response** to a specific lead, run, and batch.
- Understand **how leads perceive the report** and its value.
- See **behavioral signals** like report access and time spent.
- Run **A/B tests** of survey content or report versions by changing `version`/`batchId` and analyzing the resulting `survey_responses`.
- Later, correlate survey data with downstream actions (e.g., purchases) using shared identifiers (`leadId`, `runId`, `batchId`, `jtiHash`).
