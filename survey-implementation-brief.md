# Survey Implementation Brief: Multi-Step Report Feedback System

**Project:** anthrasite.io Survey Feature
**Target Platform:** Vercel (Next.js)
**Database:** Supabase PostgreSQL (shared with LeadShop)
**Date:** 2025-11-11
**Status:** Ready for Implementation

---

## Table of Contents

1. [Product Requirements (PRD)](#product-requirements-prd)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Specification](#api-specification)
5. [Token Architecture](#token-architecture)
6. [Frontend Implementation](#frontend-implementation)
7. [Survey Questions & Flow](#survey-questions--flow)
8. [Environment Configuration](#environment-configuration)
9. [Implementation Checklist](#implementation-checklist)
10. [Testing Strategy](#testing-strategy)
11. [Migration Path](#migration-path)

---

## Product Requirements (PRD)

### 1. Background

We are offering a free, valuable report to potential customers in exchange for product feedback. To maximize the value of this feedback, we need to understand the user's perceptions _before_ they see our report and _after_ they have reviewed it.

Third-party form tools (like Tally) do not support our desired "mid-survey reward" flow. Building this on our own platform will give us full control over the user experience and allow us to collect the high-quality data we need.

### 2. Goal

To create a single, seamless survey experience that captures a user's feedback both before and after they view their unique, generated report.

### 3. User Story

- **As a** potential customer,
- **I want to** provide feedback on my marketing priorities and on a report I was offered,
- **So that** I can get my free, valuable report in a single, easy-to-understand process.

### 4. Functional Requirements

#### 4.1. Entry Point & Data Handling

1.  **Unique Survey Link:** The user will initiate the survey by clicking a unique link (e.g., from an email).
2.  **Data Ingestion:** This link must pass two critical, hidden parameters into the survey page:
    - **Lead Identifier:** A token to identify the user (e.g., `lead_id`, `run_id`).
    - **Report URL:** The unique, secure URL to the user's downloadable report (e.g., the S3 PDF link).

#### 4.2. User Flow

The survey must consist of a single, multi-step flow presented to the user.

1.  **Step 1: "Before" Questions**

    - The user is presented with the first set of questions (e.g., "What are your top digital marketing priorities?").
    - A "Next" button proceeds to the next step.

2.  **Step 2: Report Access & "The Gate"**

    - After completing Part 1, the user is presented with a "Report Access" step.
    - This step must display a **clickable link or button**.
    - The destination of this link **must be** the unique `Report URL` that was passed into the page.
    - The link must open the report (e.g., the PDF) in a new browser tab to prevent the user from losing their place in the survey.
    - Clear instructions must be provided (e.g., "Great! Your report is ready. Click the link below to open it in a new tab. When you're done, return to this tab and click 'Next' for the final questions.").

3.  **Step 3: "After" Questions**

    - After proceeding from the "Report Access" step, the user is presented with the second set of questions (e.g., "Now that you've seen the report, what was your impression?").

4.  **Step 4: Submission**
    - Upon clicking the final "Submit" button, the system must capture all responses from _both_ "Before" and "After" question sets.

#### 4.3. Data Storage

1.  **Complete Submissions:** All captured responses must be successfully stored and associated with the `Lead Identifier`.
2.  **Partial Submissions:** The system should be able to gracefully handle (and ideally, store) partial data if a user completes Step 1 but abandons the survey during or after Step 2.

### 5. Non-Functional Requirements

- **User Experience:** The entire process must feel like a single, cohesive experience. The user should not have to leave the survey page (except via the new tab) or log in.
- **Data Integrity:** The association between the submitted feedback and the `Lead Identifier` must be 100% reliable.

---

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Email with Survey Link                    │
│  https://anthrasite.io/survey?token={encrypted_jwt_token}   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              anthrasite.io (Vercel Next.js)                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /survey Page (React Component)                       │  │
│  │  - Multi-step form UI                                 │  │
│  │  - Step 1: Before questions                           │  │
│  │  - Step 2: Report access gate                         │  │
│  │  - Step 3: After questions                            │  │
│  │  - Step 4: Thank you                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Next.js API)                             │  │
│  │  - GET /api/survey/[token]                            │  │
│  │    → Validate token, return survey config             │  │
│  │  - POST /api/survey/[token]/submit                    │  │
│  │    → Store responses in database                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
                 ┌────────────────────┐
                 │  Supabase PostgreSQL│
                 │  (LeadShop DB)      │
                 │  - survey_responses │
                 │  - leads            │
                 │  - reports          │
                 └────────────────────┘
```

### Component Responsibilities

**Frontend (`/survey` page):**

- Render multi-step form UI
- Client-side validation
- Progress tracking
- Handle report link opening
- Submit final responses

**API Routes:**

- Token validation and decryption
- Database read/write operations
- Error handling
- Response formatting

**Database:**

- Store survey responses with lead association
- Track partial completions
- Record timestamps for analytics

---

## Database Schema

### New Table: `survey_responses`

Add this table to the existing LeadShop Supabase database:

```sql
-- Migration: 011_survey_responses.sql

CREATE TABLE survey_responses (
  id SERIAL PRIMARY KEY,

  -- References
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  run_id TEXT REFERENCES runs(id_str),
  contact_id INTEGER REFERENCES contacts(id),
  report_id TEXT NOT NULL,  -- Report ID for server-side lookup

  -- Token & Session
  token_hash TEXT NOT NULL UNIQUE,  -- SHA256 hash of jti for lookup (enforces single session)
  session_id UUID DEFAULT gen_random_uuid(),

  -- Step 1: Before Questions
  before_responses JSONB,
  before_completed_at TIMESTAMPTZ,

  -- Step 2: Report Access
  report_accessed_at TIMESTAMPTZ,
  time_to_report_click INTEGER,  -- Milliseconds from start to report click

  -- Step 3: After Questions
  after_responses JSONB,
  after_completed_at TIMESTAMPTZ,

  -- Timing Metrics
  time_before_ms INTEGER,  -- Time spent on before questions
  time_after_ms INTEGER,   -- Time spent on after questions

  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_completion CHECK (
    (completed_at IS NULL) OR
    (before_completed_at IS NOT NULL AND after_completed_at IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_survey_responses_lead_id ON survey_responses(lead_id);
CREATE UNIQUE INDEX idx_survey_responses_token_hash ON survey_responses(token_hash);
CREATE INDEX idx_survey_responses_completed_at ON survey_responses(completed_at);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX idx_survey_responses_lead_completed ON survey_responses(lead_id, completed_at);

-- RLS Policies (optional - for future admin UI)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Materialized View for Analytics
CREATE MATERIALIZED VIEW survey_responses_flat AS
SELECT
  sr.lead_id,
  sr.run_id,
  sr.completed_at,
  l.business_name,
  l.website,
  -- Flatten before responses
  (sr.before_responses->>'q1_website_rating')::INTEGER as website_rating,
  sr.before_responses->>'q2_customer_attraction' as customer_attraction,
  (sr.before_responses->>'q3_online_percentage')::INTEGER as online_percentage,
  -- Flatten after responses
  (sr.after_responses->>'q4_accuracy_rating')::INTEGER as accuracy_rating,
  sr.after_responses->>'q5_most_useful' as most_useful,
  sr.after_responses->>'q6_priority_fix' as priority_fix,
  (sr.after_responses->>'q7_likelihood_to_act')::INTEGER as likelihood_to_act,
  sr.after_responses->>'q8_fair_price' as fair_price,
  sr.after_responses->>'q9_business_value' as business_value,
  sr.after_responses->>'q10_improvements' as improvements,
  (sr.after_responses->>'q11_future_updates')::BOOLEAN as wants_updates,
  -- Metrics
  sr.time_before_ms,
  sr.time_after_ms,
  sr.time_to_report_click,
  sr.report_accessed_at IS NOT NULL as accessed_report
FROM survey_responses sr
JOIN leads l ON sr.lead_id = l.id
WHERE sr.completed_at IS NOT NULL;

-- Refresh the view periodically
CREATE INDEX idx_survey_responses_flat_lead_id ON survey_responses_flat(lead_id);
CREATE INDEX idx_survey_responses_flat_completed ON survey_responses_flat(completed_at);
```

### JSON Response Schema

**`before_responses` structure:**

```json
{
  "q1_website_rating": 3,
  "q2_customer_attraction": "Google / web search",
  "q3_online_percentage": 45
}
```

**`after_responses` structure:**

```json
{
  "q4_accuracy_rating": 4,
  "q5_most_useful": "The SEO insights were eye-opening...",
  "q6_priority_fix": "Website content / structure",
  "q7_likelihood_to_act": 4,
  "q8_fair_price": "$199",
  "q9_business_value": "$5,000–$20,000",
  "q10_improvements": "Would love to see competitor comparison...",
  "q11_future_updates": true
}
```

---

## API Specification

### Base URL

```
https://anthrasite.io/api/survey
```

### Endpoints

#### 1. GET `/api/survey/[token]`

**Description:** Validate token and return survey configuration with lead context.

**Request:**

```
GET /api/survey/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**

```json
{
  "valid": true,
  "survey": {
    "lead_id": 3093,
    "run_id": "lead_3093_batch_20251111_211119_136683ac",
    "business_name": "Anthrasite",
    "contact_name": "Anthra",
    "report_id": "3093",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "questions": {
    "before": [
      {
        "id": "q1_website_rating",
        "type": "rating",
        "question": "How would you rate your business's website and Google presence overall?",
        "description": "1 = Terrible · 5 = Excellent",
        "max": 5,
        "required": true
      },
      {
        "id": "q2_customer_attraction",
        "type": "multiple_choice",
        "question": "How do you usually attract new customers?",
        "options": [
          "Word-of-mouth / referrals",
          "Google / web search",
          "Social media",
          "Ads (online or offline)",
          "Other"
        ],
        "allow_other": true,
        "required": true
      },
      {
        "id": "q3_online_percentage",
        "type": "slider",
        "question": "About what percentage of your new customers find you online (through your website or Google)?",
        "min": 0,
        "max": 100,
        "required": true
      }
    ],
    "after": [
      {
        "id": "q4_accuracy_rating",
        "type": "rating",
        "question": "How accurate did the report feel for your business?",
        "description": "1 = Way off · 5 = Spot on",
        "max": 5,
        "required": true
      },
      {
        "id": "q5_most_useful",
        "type": "text",
        "question": "What part of the report felt most useful or surprising?",
        "placeholder": "Your answer...",
        "required": false
      },
      {
        "id": "q6_priority_fix",
        "type": "multiple_choice",
        "question": "If you could fix only one thing next on your website or Google presence, what would it be?",
        "options": [
          "Google Business Profile",
          "Website content / structure",
          "SEO visibility",
          "Speed / mobile experience",
          "Reviews / trust signals",
          "Other"
        ],
        "allow_other": true,
        "required": true
      },
      {
        "id": "q7_likelihood_to_act",
        "type": "rating",
        "question": "How likely are you to act on the recommendations in the next 60 days?",
        "description": "1 = Not at all · 5 = Already started",
        "max": 5,
        "required": true
      },
      {
        "id": "q8_fair_price",
        "type": "multiple_choice",
        "question": "If you hadn't received this report for free, what do you think a fair price would be?",
        "options": [
          "$0 (I wouldn't pay for this)",
          "$99",
          "$199",
          "$399",
          "$599",
          "$799+",
          "Other"
        ],
        "allow_other": true,
        "required": true
      },
      {
        "id": "q9_business_value",
        "type": "multiple_choice",
        "question": "Roughly how much value do you think this report could unlock for your business if you acted on its insights?",
        "options": [
          "None",
          "Under $1,000",
          "$1,000–$5,000",
          "$5,000–$20,000",
          "Over $20,000"
        ],
        "required": true
      },
      {
        "id": "q10_improvements",
        "type": "text",
        "question": "What could we add or change to make this report more useful for your business?",
        "placeholder": "Your suggestions...",
        "required": false
      },
      {
        "id": "q11_future_updates",
        "type": "checkbox",
        "question": "Would you like to receive future updates from Anthrasite, including new report features and insights?",
        "options": ["Yes, keep me updated"],
        "required": false
      }
    ]
  }
}
```

**Response (Error - 401):**

```json
{
  "valid": false,
  "error": "invalid_token",
  "message": "Token is invalid or expired"
}
```

**Response (Error - 410):**

```json
{
  "valid": false,
  "error": "already_completed",
  "message": "This survey has already been completed"
}
```

#### 2. POST `/api/survey/[token]/submit`

**Description:** Submit survey responses (supports partial and complete submissions).

**Request Body:**

```json
{
  "step": "before", // or "after" or "complete"
  "before_responses": {
    "q1_website_rating": 3,
    "q2_customer_attraction": "Google / web search",
    "q3_online_percentage": 45
  },
  "after_responses": {
    "q4_accuracy_rating": 4,
    "q5_most_useful": "The SEO insights...",
    "q6_priority_fix": "Website content / structure",
    "q7_likelihood_to_act": 4,
    "q8_fair_price": "$199",
    "q9_business_value": "$5,000–$20,000",
    "q10_improvements": "Would love to see...",
    "q11_future_updates": true
  },
  "report_accessed": true, // Boolean: did they click the report link?
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "screen_width": 1920,
    "time_spent_seconds": 240
  }
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "submission_id": 42,
  "completed": true,
  "message": "Thank you for your feedback!"
}
```

**Response (Partial Save - 200):**

```json
{
  "success": true,
  "submission_id": 42,
  "completed": false,
  "message": "Progress saved. You can continue later."
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "error": "validation_error",
  "fields": {
    "q1_website_rating": "Required field missing"
  }
}
```

#### 3. GET `/api/report/open`

**Description:** Report redirect shim that generates a pre-signed S3 URL and logs access.

**Request:**

```
GET /api/report/open?sid=550e8400-e29b-41d4-a716-446655440000
```

**Response (Success - 302):**

```
302 Found
Location: https://leadshop-raw.s3.amazonaws.com/public-reports/3093/report.pdf?X-Amz-Signature=...
```

**Side Effects:**

- Updates `report_accessed_at` in database
- Generates short-lived (5 minute) pre-signed S3 URL
- Logs access metrics

**Response (Error - 404):**

```json
{
  "error": "invalid_session",
  "message": "Session not found or expired"
}
```

#### 4. GET `/api/survey/export`

**Description:** Export survey responses for analysis (admin endpoint).

**Request:**

```
GET /api/survey/export?format=csv&auth=[admin_token]
```

**Query Parameters:**

- `format`: `csv` or `json` (default: csv)
- `from`: ISO date for start range
- `to`: ISO date for end range
- `completed_only`: boolean (default: true)

**Response (CSV):**

```csv
lead_id,business_name,website_rating,customer_attraction,accuracy_rating,fair_price,completed_at
3093,Anthrasite,3,"Google / web search",4,"$199",2024-11-11T10:30:00Z
```

**Response (JSON):**

```json
{
  "export_date": "2024-11-11T12:00:00Z",
  "total_responses": 42,
  "completed": 38,
  "partial": 4,
  "data": [
    /* flattened response data */
  ]
}
```

---

## Token Architecture

### Token Generation (LeadShop Side)

**Generated by:** `scripts/send_survey_email.py` when sending invitation email

**Library:** PyJWT

**Token Payload:**

```json
{
  "lead_id": 3093,
  "run_id": "lead_3093_batch_20251111_211119_136683ac",
  "contact_id": 2028,
  "report_id": "3093", // ID for server-side report lookup
  "jti": "550e8400-e29b-41d4-a716", // JWT ID for uniqueness
  "aud": "survey", // Audience claim
  "scope": "feedback", // Permission scope
  "iat": 1699747200, // Issued at (Unix timestamp)
  "exp": 1702425600 // Expires at (30 days from issue)
}
```

**Algorithm:** HS256 (HMAC with SHA-256)

**Secret Key:** See `survey-secrets.md` for `SURVEY_SECRET_KEY`

**Generation Code (Python - LeadShop):**

```python
import jwt
import time
import uuid

def generate_survey_token(lead_id: int, run_id: str, contact_id: int, report_id: str) -> str:
    """Generate JWT token for survey access."""
    secret_key = os.getenv("SURVEY_SECRET_KEY")

    payload = {
        "lead_id": lead_id,
        "run_id": run_id,
        "contact_id": contact_id,
        "report_id": report_id,
        "jti": str(uuid.uuid4())[:24],  // Unique JWT ID
        "aud": "survey",
        "scope": "feedback",
        "iat": int(time.time()),
        "exp": int(time.time()) + (30 * 24 * 3600)  # 30 days
    }

    return jwt.encode(payload, secret_key, algorithm="HS256")
```

### Token Validation (Vercel Side)

**Library:** jsonwebtoken (npm package)

**Validation Steps:**

1. Decode JWT with secret key
2. Verify signature (HMAC-SHA256)
3. Check expiration timestamp
4. Verify audience and scope claims
5. Verify required fields present
6. Check if survey already completed (database lookup using jti hash)

**Validation Code (TypeScript - Vercel):**

```typescript
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

interface SurveyToken {
  lead_id: number
  run_id: string
  contact_id: number
  report_id: string
  jti: string
  aud: string
  scope: string
  iat: number
  exp: number
}

async function validateToken(token: string): Promise<SurveyToken | null> {
  try {
    const decoded = jwt.verify(token, process.env.SURVEY_SECRET_KEY!, {
      algorithms: ['HS256'],
      audience: 'survey',
      complete: true,
    }) as SurveyToken

    // Validate required claims
    if (
      !decoded.lead_id ||
      !decoded.run_id ||
      !decoded.report_id ||
      !decoded.jti
    ) {
      return null
    }

    // Validate scope
    if (decoded.scope !== 'feedback') {
      throw new Error('invalid_scope')
    }

    // Check if already completed using jti hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(decoded.jti)
      .digest('hex')
    const existing = await checkIfCompleted(tokenHash)

    if (existing?.completed_at) {
      throw new Error('already_completed')
    }

    return decoded
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}
```

### Security Considerations

1. **Token Storage:** Never store raw tokens in database, only SHA256 hash
2. **Expiration:** 30-day validity prevents indefinite access
3. **Single-Use:** Check `completed_at` to prevent resubmission
4. **HTTPS Only:** All communication must be over HTTPS
5. **No PII in Token:** Only IDs, not names/emails

---

## Frontend Implementation

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Form State:** React Hook Form
- **HTTP Client:** Fetch API (native)
- **Validation:** Zod

### File Structure

```
app/
├── survey/
│   ├── page.tsx                    # Main survey page
│   ├── components/
│   │   ├── SurveyContainer.tsx     # Survey state machine
│   │   ├── BeforeQuestions.tsx     # Step 1 component
│   │   ├── ReportAccess.tsx        # Step 2 component
│   │   ├── AfterQuestions.tsx      # Step 3 component
│   │   ├── ThankYou.tsx            # Step 4 component
│   │   ├── ProgressBar.tsx         # Visual progress indicator
│   │   ├── QuestionTypes/
│   │   │   ├── RatingQuestion.tsx
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── SliderQuestion.tsx
│   │   │   ├── TextQuestion.tsx
│   │   │   └── CheckboxQuestion.tsx
│   │   └── ErrorBoundary.tsx
│   └── hooks/
│       ├── useSurveyState.ts       # Survey state management
│       └── useAutoSave.ts          # Auto-save partial responses
│
└── api/
    └── survey/
        └── [token]/
            ├── route.ts            # GET endpoint
            └── submit/
                └── route.ts        # POST endpoint

lib/
├── db.ts                           # Supabase client
├── survey/
│   ├── validation.ts               # Token validation
│   ├── questions.ts                # Question definitions
│   └── storage.ts                  # Database operations
└── types/
    └── survey.ts                   # TypeScript interfaces
```

### Component Structure

**1. Survey Container (State Machine)**

```tsx
// app/survey/components/SurveyContainer.tsx

type SurveyStep = 'loading' | 'before' | 'report' | 'after' | 'thank-you' | 'error';

interface SurveyState {
  step: SurveyStep;
  token: string;
  surveyData: SurveyData | null;
  beforeResponses: Record<string, any>;
  afterResponses: Record<string, any>;
  reportAccessed: boolean;
}

export default function SurveyContainer({ token }: { token: string }) {
  const [state, setState] = useState<SurveyState>({
    step: 'loading',
    token,
    surveyData: null,
    beforeResponses: {},
    afterResponses: {},
    reportAccessed: false
  });

  // Load survey on mount
  useEffect(() => {
    loadSurvey();
  }, []);

  // Auto-save on state change
  useAutoSave(state);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {state.step !== 'loading' && state.step !== 'error' && (
          <ProgressBar currentStep={state.step} />
        )}

        {state.step === 'loading' && <LoadingSpinner />}
        {state.step === 'before' && <BeforeQuestions {...} />}
        {state.step === 'report' && <ReportAccess {...} />}
        {state.step === 'after' && <AfterQuestions {...} />}
        {state.step === 'thank-you' && <ThankYou />}
        {state.step === 'error' && <ErrorMessage {...} />}
      </div>
    </div>
  );
}
```

**2. Report Access Gate**

```tsx
// app/survey/components/ReportAccess.tsx

export default function ReportAccess({
  sessionId,
  onContinue,
  onReportClick,
}: ReportAccessProps) {
  const [clicked, setClicked] = useState(false)

  const handleReportClick = () => {
    setClicked(true)
    onReportClick()
    // Open report via redirect shim (generates pre-signed S3 URL on-demand)
    const reportUrl = `/api/report/open?sid=${sessionId}`
    window.open(reportUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <svg className="w-20 h-20 mx-auto text-green-500 mb-4">
          {/* Checkmark icon */}
        </svg>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Report is Ready!
        </h2>
        <p className="text-lg text-gray-600">
          Thanks for answering those questions. Now it's time to see your
          personalized audit.
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg text-blue-900 mb-3">
          📊 Access Your Report
        </h3>
        <p className="text-blue-800 mb-4">
          Click the button below to open your report in a new tab. Take your
          time reviewing it, then return to this page to answer a few quick
          questions about your experience.
        </p>

        <button
          onClick={handleReportClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          🔗 Open My Report
        </button>

        {clicked && (
          <p className="text-sm text-blue-600 mt-3 text-center">
            ✓ Report opened in new tab
          </p>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onContinue}
          disabled={!clicked}
          className={`px-8 py-3 rounded-lg font-semibold transition-all ${
            clicked
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {clicked
            ? 'Continue to Final Questions →'
            : 'Open report first to continue'}
        </button>
      </div>
    </div>
  )
}
```

### API Route Implementation

**GET /api/survey/[token]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/survey/validation'
import { getSurveyQuestions } from '@/lib/survey/questions'
import { checkExistingResponse } from '@/lib/survey/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    // Validate token
    const decoded = await validateToken(token)
    if (!decoded) {
      return NextResponse.json(
        {
          valid: false,
          error: 'invalid_token',
          message: 'Token is invalid or expired',
        },
        { status: 401 }
      )
    }

    // Check if already completed
    const existing = await checkExistingResponse(token)
    if (existing?.completed_at) {
      return NextResponse.json(
        {
          valid: false,
          error: 'already_completed',
          message: 'This survey has already been completed',
        },
        { status: 410 }
      )
    }

    // Get survey configuration
    const questions = getSurveyQuestions()

    return NextResponse.json({
      valid: true,
      survey: {
        lead_id: decoded.lead_id,
        run_id: decoded.run_id,
        contact_id: decoded.contact_id,
        report_url: decoded.report_url,
        session_id: existing?.session_id || crypto.randomUUID(),
      },
      questions,
    })
  } catch (error) {
    console.error('Survey GET error:', error)
    return NextResponse.json(
      { valid: false, error: 'server_error', message: 'An error occurred' },
      { status: 500 }
    )
  }
}
```

**POST /api/survey/[token]/submit/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/survey/validation'
import { saveSurveyResponse } from '@/lib/survey/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    const body = await request.json()

    // Validate token
    const decoded = await validateToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'invalid_token' },
        { status: 401 }
      )
    }

    // Extract metadata
    const metadata = {
      user_agent: request.headers.get('user-agent') || null,
      ip_address:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        null,
      ...body.metadata,
    }

    // Save to database
    const result = await saveSurveyResponse({
      token,
      lead_id: decoded.lead_id,
      run_id: decoded.run_id,
      contact_id: decoded.contact_id,
      report_url: decoded.report_url,
      step: body.step,
      before_responses: body.before_responses,
      after_responses: body.after_responses,
      report_accessed: body.report_accessed,
      metadata,
    })

    return NextResponse.json({
      success: true,
      submission_id: result.id,
      completed: result.completed,
      message: result.completed
        ? 'Thank you for your feedback!'
        : 'Progress saved. You can continue later.',
    })
  } catch (error) {
    console.error('Survey POST error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}
```

---

## Survey Questions & Flow

### Step 1: Before Questions (3 questions)

**Q1: Rating (Required)**

- Type: Star rating (1-5)
- Question: "How would you rate your business's website and Google presence overall?"
- Description: "1 = Terrible · 5 = Excellent"

**Q2: Multiple Choice (Required)**

- Type: Single select with "Other" option
- Question: "How do you usually attract new customers?"
- Options:
  - Word-of-mouth / referrals
  - Google / web search
  - Social media
  - Ads (online or offline)
  - Other (with text input)

**Q3: Slider (Required)**

- Type: Percentage slider (0-100)
- Question: "About what percentage of your new customers find you online (through your website or Google)?)"

### Step 2: Report Access Gate

**Content:**

- Celebration message
- Clear instructions to open report in new tab
- "Open My Report" button (must click before continuing)
- "Continue to Final Questions" button (enabled after report click)

**Tracking:**

- Record timestamp when report button clicked
- Set `report_accessed = true`

### Step 3: After Questions (8 questions)

**Q4: Rating (Required)**

- Type: Star rating (1-5)
- Question: "How accurate did the report feel for your business?"
- Description: "1 = Way off · 5 = Spot on"

**Q5: Text (Optional)**

- Type: Short text input
- Question: "What part of the report felt most useful or surprising?"
- Placeholder: "Your answer..."

**Q6: Multiple Choice (Required)**

- Type: Single select with "Other" option
- Question: "If you could fix only one thing next on your website or Google presence, what would it be?"
- Options:
  - Google Business Profile
  - Website content / structure
  - SEO visibility
  - Speed / mobile experience
  - Reviews / trust signals
  - Other (with text input)

**Q7: Rating (Required)**

- Type: Star rating (1-5)
- Question: "How likely are you to act on the recommendations in the next 60 days?"
- Description: "1 = Not at all · 5 = Already started"

**Q8: Multiple Choice (Required)**

- Type: Single select with "Other" option
- Question: "If you hadn't received this report for free, what do you think a fair price would be?"
- Options:
  - $0 (I wouldn't pay for this)
  - $99
  - $199
  - $399
  - $599
  - $799+
  - Other (with text input)

**Q9: Multiple Choice (Required)**

- Type: Single select
- Question: "Roughly how much value do you think this report could unlock for your business if you acted on its insights?"
- Options:
  - None
  - Under $1,000
  - $1,000–$5,000
  - $5,000–$20,000
  - Over $20,000

**Q10: Text (Optional)**

- Type: Long text input
- Question: "What could we add or change to make this report more useful for your business?"
- Placeholder: "Your suggestions..."

**Q11: Checkbox (Optional)**

- Type: Single checkbox
- Question: "Would you like to receive future updates from Anthrasite, including new report features and insights?"
- Option: "Yes, keep me updated"

### Step 4: Thank You

**Content:**

- Thank you message
- Confirmation that responses were saved
- Link to download report again (if needed)
- Optional: Share on social media
- Optional: Subscribe to newsletter (if not already opted in Q11)

---

## Environment Configuration

### Environment Variables

Create `.env.local` in the Next.js project root:

```bash
# Database (Supabase)
DATABASE_URL=<see survey-secrets.md>

# Survey Security
SURVEY_SECRET_KEY=<see survey-secrets.md>

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=<see survey-secrets.md>
UPSTASH_REDIS_REST_TOKEN=<see survey-secrets.md>

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://anthrasite.io,https://leadshop.io,http://localhost:3000

# Admin
ADMIN_EXPORT_TOKEN=<see survey-secrets.md>

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=<your-analytics-id>
```

**Important:** See `survey-secrets.md` for actual secret values.

### Supabase Client Setup

```typescript
// lib/db.ts
import { createClient } from '@supabase/supabase-js'

// For direct PostgreSQL connection (API routes)
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Increased for burst handling
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  queueLimit: 10, // Queue requests when pool is exhausted
})

// Helper for queries with automatic retry
export async function query(text: string, params?: any[]) {
  let retries = 3
  while (retries > 0) {
    try {
      const client = await pool.connect()
      try {
        const result = await client.query(text, params)
        return result.rows
      } finally {
        client.release()
      }
    } catch (error) {
      retries--
      if (retries === 0) throw error
      await new Promise((resolve) => setTimeout(resolve, 100 * (4 - retries)))
    }
  }
}
```

### Rate Limiting Setup

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiter: 10 requests per minute per IP/token
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'survey_ratelimit',
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } =
    await rateLimiter.limit(identifier)

  return {
    allowed: success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    },
  }
}
```

### Idempotent Submission Handler

```typescript
// lib/survey/storage.ts
export async function saveSurveyResponse(data: SurveySubmission) {
  const tokenHash = crypto.createHash('sha256').update(data.jti).digest('hex')

  // UPSERT with conflict resolution for idempotency
  const query = `
    INSERT INTO survey_responses (
      token_hash, lead_id, run_id, contact_id, report_id,
      before_responses, after_responses,
      before_completed_at, after_completed_at,
      report_accessed_at, time_before_ms, time_after_ms,
      time_to_report_click, ip_address, user_agent,
      completed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (token_hash) DO UPDATE SET
      before_responses = COALESCE(survey_responses.before_responses, EXCLUDED.before_responses),
      after_responses = COALESCE(survey_responses.after_responses, EXCLUDED.after_responses),
      before_completed_at = COALESCE(survey_responses.before_completed_at, EXCLUDED.before_completed_at),
      after_completed_at = COALESCE(survey_responses.after_completed_at, EXCLUDED.after_completed_at),
      report_accessed_at = COALESCE(survey_responses.report_accessed_at, EXCLUDED.report_accessed_at),
      time_before_ms = COALESCE(survey_responses.time_before_ms, EXCLUDED.time_before_ms),
      time_after_ms = COALESCE(survey_responses.time_after_ms, EXCLUDED.time_after_ms),
      time_to_report_click = COALESCE(survey_responses.time_to_report_click, EXCLUDED.time_to_report_click),
      completed_at = EXCLUDED.completed_at,
      updated_at = NOW()
    WHERE survey_responses.completed_at IS NULL  -- Only allow updates if not yet completed
    RETURNING id, completed_at IS NOT NULL as completed;
  `

  const values = [
    tokenHash,
    data.lead_id,
    data.run_id,
    data.contact_id,
    data.report_id,
    JSON.stringify(data.before_responses),
    JSON.stringify(data.after_responses),
    data.step === 'before' || data.step === 'complete' ? new Date() : null,
    data.step === 'after' || data.step === 'complete' ? new Date() : null,
    data.report_accessed ? new Date() : null,
    data.time_before_ms || null,
    data.time_after_ms || null,
    data.time_to_report_click || null,
    data.ip_address,
    data.user_agent,
    data.step === 'complete' ? new Date() : null,
  ]

  return await query(query, values)
}
```

### Auto-Save Hook

```typescript
// app/survey/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react'
import { debounce } from 'lodash'

const STORAGE_KEY = 'survey_draft'

export function useAutoSave(state: SurveyState) {
  const saveToLocal = useRef(
    debounce((data: SurveyState) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...data,
            savedAt: Date.now(),
          })
        )
      } catch (e) {
        console.warn('Failed to save draft:', e)
      }
    }, 1000)
  ).current

  // Save on state change
  useEffect(() => {
    if (state.step !== 'loading' && state.step !== 'error') {
      saveToLocal(state)
    }
  }, [state, saveToLocal])

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only restore if same token and saved within 24 hours
        if (
          parsed.token === state.token &&
          Date.now() - parsed.savedAt < 86400000
        ) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to load draft:', e)
    }
  }, [])

  // Clear on completion
  useEffect(() => {
    if (state.step === 'thank-you') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state.step])
}
```

### CORS Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

export function middleware(request: NextRequest) {
  // Check if it's an API route
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')
    const response = NextResponse.next()

    // Set CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      )
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }

    return response
  }
}

export const config = {
  matcher: '/api/:path*',
}
```

### Error Handling with Retry

```typescript
// lib/survey/api-client.ts
export async function submitWithRetry(
  url: string,
  data: any,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok || response.status < 500) {
        return response // Success or client error (no retry)
      }

      throw new Error(`Server error: ${response.status}`)
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Failed after retries')
}
```

---

## Implementation Checklist

### Phase 1: Database & Backend (Priority 1)

- [ ] Create database migration `011_survey_responses.sql`
- [ ] Run migration on Supabase
- [ ] Create materialized view for analytics
- [ ] Create `lib/db.ts` with PostgreSQL pool (max: 20, with retry logic)
- [ ] Set up Upstash Redis for rate limiting
- [ ] Create `lib/rate-limit.ts` with rate limiter (10 req/min)
- [ ] Create `lib/survey/validation.ts` with enhanced JWT validation
- [ ] Create `lib/survey/questions.ts` with question definitions
- [ ] Create `lib/survey/storage.ts` with idempotent UPSERT operations
- [ ] Create API route `app/api/survey/[token]/route.ts`
- [ ] Create API route `app/api/survey/[token]/submit/route.ts`
- [ ] Create API route `app/api/report/open` (redirect shim)
- [ ] Create API route `app/api/survey/export` (admin endpoint)
- [ ] Implement CORS middleware
- [ ] Test API routes with Postman/curl

### Phase 2: Frontend Components (Priority 2)

- [ ] Create `app/survey/page.tsx` (main page)
- [ ] Create `SurveyContainer.tsx` (state machine)
- [ ] Create `hooks/useAutoSave.ts` (localStorage persistence)
- [ ] Create `ProgressBar.tsx`
- [ ] Create `BeforeQuestions.tsx`
- [ ] Create `ReportAccess.tsx` (with redirect shim integration)
- [ ] Create `AfterQuestions.tsx`
- [ ] Create `ThankYou.tsx`
- [ ] Create question type components:
  - [ ] `RatingQuestion.tsx` (with ARIA roles)
  - [ ] `MultipleChoice.tsx` (with "Other" support)
  - [ ] `SliderQuestion.tsx` (keyboard accessible)
  - [ ] `TextQuestion.tsx` (with sanitization)
  - [ ] `CheckboxQuestion.tsx`
- [ ] Implement Zod validation schemas
- [ ] Add loading states and skeletons
- [ ] Add error handling with retry UI
- [ ] Implement `lib/survey/api-client.ts` with retry logic

### Phase 3: LeadShop Integration (Priority 3)

- [ ] Update `scripts/send_survey_email.py` to generate JWT tokens with jti
- [ ] Add `SURVEY_SECRET_KEY` to LeadShop `.env`
- [ ] Configure S3 bucket for pre-signed URL generation
- [ ] Test token generation with all required claims
- [ ] Update email template with new survey URL format
- [ ] Implement batch sending logic (groups of 50)
- [ ] Send test email to verify end-to-end flow

### Phase 4: Polish & Testing (Priority 4)

- [ ] Responsive design testing (mobile/tablet/desktop)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (Lighthouse score > 90)
- [ ] Analytics integration (track completion rate, drop-off points)
- [ ] Error logging (Sentry or similar)
- [ ] Test expired token handling
- [ ] Test already-completed token handling
- [ ] Test partial submission + resume flow

### Phase 5: Deployment (Priority 5)

- [ ] Deploy to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Test production deployment
- [ ] Update LeadShop email templates with production URL
- [ ] Send test email to real email address
- [ ] Complete end-to-end test
- [ ] Monitor error logs for 24 hours
- [ ] Document deployment process

---

## Testing Strategy

### Pre-Launch Testing (200-Person Focus)

**Soft Launch Protocol:**

1. Internal testing with 10-20 team members
2. Test across different email clients (Gmail, Outlook, Apple Mail)
3. Verify mobile experience (expect 30-40% mobile users)
4. Test corporate network access (S3 might be blocked)
5. Monitor first 10 real responses closely

### Unit Tests

**API Routes:**

- Token validation (valid, expired, malformed, replay attempts)
- Rate limiting (10 req/min enforcement)
- Database operations (UPSERT idempotency)
- Pre-signed URL generation
- Export functionality

**Components:**

- Question components with accessibility
- Form validation with Zod schemas
- State persistence with localStorage
- Retry logic with exponential backoff

### Integration Tests

**Critical User Flows:**

1. **Happy Path:**

   - Generate token with jti → Click email link → Complete before questions
   - Click report (redirect shim) → Report opens in new tab
   - Return to survey → Complete after questions → Submit → Thank you

2. **Recovery Scenarios:**

   - Browser refresh mid-survey (localStorage restore)
   - Network failure during submission (retry with backoff)
   - Report link fails (continue without opening)
   - Session timeout (24-hour localStorage validity)

3. **Edge Cases:**
   - Expired token (30-day expiry)
   - Already completed (jti uniqueness)
   - Multiple devices (session locking)
   - Popup blocker (fallback messaging)

### Load Testing (200 Concurrent Users)

**Scenarios:**

- Batch send simulation (50 emails at once)
- 20 simultaneous survey starts (10% immediate open rate)
- Connection pool stress (20 max connections)
- Rate limit verification (per-IP and per-token)

### Security Validation

- JWT signature verification
- Audience/scope claim validation
- CORS origin restrictions
- Input sanitization (Zod + backend)
- SQL injection prevention (parameterized queries)
- Rate limiting effectiveness

---

## Migration Path

When LeadShop Lite API is deployed to production:

### Option 1: Proxy Through Vercel

Update Vercel API routes to proxy to LeadShop:

```typescript
// app/api/survey/[token]/route.ts
export async function GET(request, { params }) {
  // Forward to LeadShop API
  const response = await fetch(
    `https://api.leadshop.com/survey/${params.token}`,
    { headers: { 'X-API-Key': process.env.LEADSHOP_API_KEY } }
  )
  return response
}
```

### Option 2: Update Frontend URLs

Change frontend to call LeadShop API directly:

```typescript
// lib/survey/api.ts
const API_BASE = process.env.NEXT_PUBLIC_LEADSHOP_API_URL

export async function loadSurvey(token: string) {
  const response = await fetch(`${API_BASE}/survey/${token}`)
  return response.json()
}
```

### Migration Steps

1. Deploy LeadShop Lite API
2. Test LeadShop API endpoints
3. Update Vercel environment variables
4. Choose migration option (proxy or direct)
5. Update code accordingly
6. Deploy to Vercel
7. Test end-to-end
8. Monitor for errors
9. Optionally: Remove database dependencies from Vercel

---

## Additional Resources

- **Secrets File:** `survey-secrets.md` (contains DATABASE_URL and SURVEY_SECRET_KEY)
- **Email Template:** `email_templates/survey_invitation/template.html` in LeadShop repo
- **LeadShop Script:** `scripts/send_survey_email.py` for email sending
- **Database:** Supabase dashboard at https://supabase.com/dashboard/project/cfp1dmdlqpjuwwklpmwg

---

## Questions for Implementation

1. **Styling:** Should we match existing anthrasite.io branding exactly? Need design system/style guide.
2. **Analytics:** Which analytics platform? Google Analytics, Plausible, or custom?
3. **Error Logging:** Sentry account? Or use Vercel's built-in logging?
4. **Mobile Optimization:** Any specific mobile-first considerations?
5. **Accessibility:** Target WCAG level (A, AA, or AAA)?
6. **Browser Support:** Minimum supported browsers/versions?
7. **Testing:** Preference for testing frameworks (Jest, Vitest, Playwright)?

---

## Success Metrics

**Primary Metrics (200-Person Campaign):**

- Survey completion rate > 60%
- Total time to complete < 5 minutes
- Report access rate > 90%
- Zero data loss (idempotent submissions)

**Secondary Metrics:**

- Mobile completion rate > 40%
- API response time < 500ms (p95)
- Report redirect latency < 2s
- Recovery from failure > 95% (retry success)

**Engagement Metrics (via Analytics):**

- Time on before questions (`time_before_ms`)
- Time to report click (`time_to_report_click`)
- Time on after questions (`time_after_ms`)
- Drop-off points by step
- "Other" response frequency

**Technical Health:**

- Rate limit violations < 1%
- Database pool exhaustion: 0 incidents
- Failed submissions after retry < 0.5%
- localStorage recovery success > 90%

---

## Contact & Support

For questions during implementation:

- Review this document first
- Check `survey-secrets.md` for credentials
- Refer to LeadShop codebase for context
- Test against local LeadShop instance before production

**Ready to build!** 🚀
