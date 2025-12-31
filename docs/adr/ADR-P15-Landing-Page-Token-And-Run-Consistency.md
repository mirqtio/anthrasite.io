# ADR-P15: Landing Page Token & Run ID Consistency

**Status**: Accepted
**Date**: 2025-12-30

## Context

The Anthrasite landing page (`/landing/[token]`) is the primary sales page that leads see after receiving a marketing email. This page must display data that is **consistent with the email that brought them there**—including the same score, issue count, impact range, and screenshots.

The challenge is ensuring **data consistency across the entire customer journey**:

1. **Email** - Sent based on a specific pipeline run
2. **Landing Page** - Must show the same data as the email
3. **Report** - Must contain the same data when purchased

If these three touchpoints show different data (because they query different runs), the customer experience breaks down and trust is lost.

### Prior Art

- ADR-P13 established the JWT-based survey token pattern with `leadId` and `runId` in the payload
- LeadShop already generates survey JWTs with `construct_survey_url(lead_id, run_id, batch_id)`
- The landing page previously used a stub `validatePurchaseToken()` that returned mock data

### Requirements

1. Landing page URLs must contain a JWT with both `leadId` AND `runId`
2. All landing page data queries must filter by the same `runId`
3. Token validation must extract and verify both identifiers
4. The system must be compatible with existing survey JWT infrastructure

## Decision

### 1. JWT Token Structure for Landing Pages

Landing page tokens use the same JWT infrastructure as survey tokens (shared `SURVEY_SECRET_KEY`), with a distinct `aud` claim:

```typescript
interface LandingTokenPayload {
  leadId: string // Required: identifies the lead
  runId: string // Required: identifies the specific pipeline run
  jti: string // Unique token ID
  aud: 'landing' // Audience claim (distinct from 'survey')
  scope: 'view' // View-only access
  version?: string // Token version
  batchId?: string // Optional batch tracking
  iat: number // Issued at
  exp: number // Expires (30 days default)
}
```

### 2. Token Generation in LeadShop

New function `construct_landing_url()` in `email_routes.py`:

```python
def construct_landing_url(lead_id: int, run_id: str, batch_id: str | None = None) -> str:
    """
    Construct JWT-authenticated landing page URL.

    CRITICAL: run_id ensures LP shows data from the same run as the email.
    """
    payload = {
        "leadId": str(lead_id),
        "runId": run_id,  # MUST match the run used for email content
        "jti": str(uuid.uuid4()),
        "aud": "landing",
        "scope": "view",
        "iat": int(time.time()),
        "exp": int(time.time()) + (30 * 24 * 3600),  # 30 days
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return f"https://anthrasite.io/landing/{token}"
```

### 3. Token Validation in Anthrasite

`validatePurchaseToken()` in `lib/purchase/index.ts`:

```typescript
export async function validatePurchaseToken(
  token: string
): Promise<{ leadId: string; runId?: string } | null> {
  // Dev tokens for testing (no runId = uses latest)
  if (/^\d+$/.test(token)) {
    return { leadId: token }
  }

  const secret = new TextEncoder().encode(process.env.SURVEY_SECRET_KEY)
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
    audience: ['landing', 'purchase'],
  })

  const leadId = payload.leadId as string
  const runId = payload.runId as string

  if (!leadId) return null
  if (!runId) {
    console.warn('Token missing runId - will use latest run')
  }

  return { leadId, runId }
}
```

### 4. Data Query Consistency

`lookupLandingContext()` in `lib/landing/context.ts` uses a single `targetRunId` for ALL queries:

```typescript
// Determine run_id ONCE at the start
let targetRunId = runId // From token
if (!targetRunId) {
  // Fallback: get latest run from lead_scores
  const latestRun = await sql`
    SELECT run_id_str FROM lead_scores
    WHERE lead_id = ${leadIdInt}
    ORDER BY created_at DESC LIMIT 1
  `
  targetRunId = latestRun[0]?.run_id_str
}

// ALL subsequent queries filter by this same run_id:
// - lead_scores → overall score
// - phaseb_journey_context → impact range, friction points
// - assessment_results → screenshots
```

## Data Flow

```
Email Sent
    └─ JWT contains {leadId: "3093", runId: "lead_3093_batch_20251227..."}
           │
           ▼
User Clicks → /landing/{token}
           │
           ▼
validatePurchaseToken()
    └─ Extracts leadId="3093", runId="lead_3093_batch_20251227..."
           │
           ▼
lookupLandingContext(leadId, runId)
    └─ ALL queries filter by runId:
        ├─ lead_scores WHERE run_id_str = runId → score
        ├─ phaseb_journey_context WHERE run_id = runId → impact, issues
        └─ assessment_results WHERE run_id = runId → screenshots
           │
           ▼
Landing Page renders data from EXACTLY the same run as the email
```

## Database Tables Used

| Table                    | Field                         | Purpose                               |
| ------------------------ | ----------------------------- | ------------------------------------- |
| `leads`                  | `company`, `domain`           | Basic lead info (not run-specific)    |
| `lead_scores`            | `overall_score`, `run_id_str` | Score for specific run                |
| `phaseb_journey_context` | `context`, `run_id`           | Impact range, friction points for run |
| `assessment_results`     | `value_text`, `run_id`        | Screenshots for run                   |

All tables with run-specific data include a `run_id` column that MUST be used in queries.

## Consequences

### Positive

- **Data consistency guaranteed**: Email, LP, and report all show data from the same pipeline run
- **No stale data**: Users see exactly what was analyzed, not newer (or older) analysis results
- **Shared infrastructure**: Uses existing JWT signing key and validation patterns from survey system
- **Audit trail**: `runId` in token provides clear provenance for debugging/support

### Negative / Trade-offs

- **Longer tokens**: JWT with full payload is longer than simple numeric IDs (acceptable for URL path)
- **Token expiration**: 30-day expiry means very old emails may have expired links (intentional—stale leads shouldn't access outdated reports)
- **Dev testing requires run_id awareness**: Numeric dev tokens (`/landing/3093`) fall back to latest run, which may not match email content in dev scenarios

### Alternatives Considered

1. **Query parameter with lead_id + run_id**

   - Rejected: Exposes internal IDs, no signature verification, trivial to tamper

2. **Lookup run_id from email_deliveries table**

   - Rejected: Requires additional query, introduces dependency on email tracking table

3. **Store context snapshot in database keyed by token**
   - Rejected: Duplicates data, requires cleanup, more complex than JWT-based approach

## Implementation Notes

### Files Modified

**LeadShop (token generation):**

- `src/leadshop/api/email_routes.py` - Added `construct_landing_url()`

**Anthrasite (token validation + data lookup):**

- `lib/purchase/index.ts` - Replaced stub with real JWT validation
- `lib/landing/context.ts` - All queries now filter by `targetRunId`

### Testing

- Dev tokens (`/landing/3093`) still work but fall back to latest run
- Production tokens must be generated via `construct_landing_url()` with explicit `run_id`
- Token generation script updated: `scripts/gen_purchase_token.mjs`

### Migration

No database migration required. The `run_id` columns already exist in all relevant tables.
