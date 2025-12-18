# SCRATCHPAD

## Survey 500 Error Fix - RESOLVED (2025-12-02)

### Problem

Survey submissions were returning 500 errors on POST `/api/survey/[token]/submit`

### Root Cause

Two issues in `lib/survey/storage.ts`:

1. **Non-existent columns**: The INSERT statement referenced columns (`source`, `respondentId`, `ref`) that existed in Prisma schema but were never migrated to the database.

2. **Hardcoded null for leadId**: Line 94 had `null,` hardcoded instead of `${data.leadId}`, causing NOT NULL constraint violation.

### Fixes Applied

1. Removed non-existent columns from INSERT statement (commit: `fix(survey): remove non-existent columns from storage INSERT`)
2. Changed `null,` to `${data.leadId},` (commit: `fix(survey): use actual leadId instead of hardcoded null`)

### Verification

- Tested on production: `https://www.anthrasite.io/survey?token=...`
- POST `/api/survey/.../submit` returns 200 with `{"success":true,"submissionId":"...","completed":false,"message":"Progress saved"}`
- Survey advances from Step 1 to Step 2 correctly

### Status: COMPLETE

---

## Prompt Lab API Proxy Implementation - IN PROGRESS (2025-12-08)

### Problem

The Prompt Lab page (`/admin/prompt-lab`) loads in production but functionality doesn't work (model chooser, saving prompts, running tests, etc.).

**Root Cause:** The frontend was making API calls directly to `http://localhost:8000/prompt-lab/...` which only works during local development. In production on Vercel, `localhost` refers to the Vercel server, not the LeadShop backend.

### Solution Implemented

Created Next.js API routes that proxy requests from the frontend to the LeadShop backend.

**Architecture:**

```
User's Browser
     ↓
https://www.anthrasite.io/api/prompt-lab/*  (Next.js on Vercel)
     ↓
LEADSHOP_API_URL/prompt-lab/*  (LeadShop FastAPI on Hetzner VPS)
```

### Files Created

1. **Environment Config** (`.env.example`):

   - Added `LEADSHOP_API_URL` - URL where LeadShop FastAPI is accessible

2. **Shared Proxy Library** (`lib/prompt-lab/proxy.ts`):

   - `verifyAdminSession()` - validates Supabase session for authenticated admin
   - `proxyToLeadShop()` - forwards requests to LeadShop backend
   - Supports dev bypass via `ADMIN_AUTH_BYPASS=true`

3. **API Proxy Routes**:

   - `app/api/prompt-lab/models/route.ts` - GET models list
   - `app/api/prompt-lab/prompts/route.ts` - GET/POST prompts
   - `app/api/prompt-lab/runs/[leadId]/route.ts` - GET runs for a lead
   - `app/api/prompt-lab/context/[leadId]/[runId]/route.ts` - GET context data
   - `app/api/prompt-lab/test/route.ts` - POST test execution
   - `app/api/prompt-lab/scenarios/route.ts` - GET/POST scenarios

4. **Frontend Updated** (`app/admin/prompt-lab/page.tsx`):
   - All `http://localhost:8000/prompt-lab/...` URLs changed to `/api/prompt-lab/...`

### Remaining Steps

1. ~~**Determine LeadShop API URL**~~: `http://5.161.19.136:8000` (Hetzner Floating IP)

2. **Set Vercel Environment Variable**: Add `LEADSHOP_API_URL=http://5.161.19.136:8000` to Vercel project settings

3. **Deploy & Test**: Push changes, verify prompt-lab works in production

### Deployment

- **Commit**: `70a7ad3` - pushed to main
- **Vercel env var**: `LEADSHOP_API_URL=http://5.161.19.136:8000` (set by user)
- **GitHub Actions**: Security scan passed, E2E tests running

### Status: COMPLETE

**Issue discovered & resolved:** The Anthrasite proxy was working correctly, but LeadShop on Hetzner needed redeployment. User redeployed LeadShop and the API proxy now works.

---

## Prompt Lab UI Fixes (2025-12-08)

### Problems Reported

1. Action bar with buttons disappeared when pasting custom JSON context
2. App didn't resize to fit browser window - was constrained inside admin layout's max-width container with black sidebars/footer

### Fixes Applied

**1. Layout restructuring** (`app/admin/prompt-lab/layout.tsx`):

- Changed from calc-based height to fixed positioning
- Layout now uses `fixed top-16 left-0 right-0 bottom-0` to fill entire viewport below nav bar
- Breaks out of admin layout's container constraints (max-w-[1600px], padding)
- Full-bleed design - no black sidebars or footer

**2. Page layout fixes** (`app/admin/prompt-lab/page.tsx`):

- Changed outer container from `h-screen` to `h-full`
- Made action bar sticky with `sticky top-0 z-10`
- Added `flex-shrink-0` to headers to prevent collapse
- Added `min-h-0` to flex containers for proper overflow handling
- Context panel and lanes now use `h-full` to fill available space
- Proper overflow scrolling within each panel

### Verification

- Tested locally at http://localhost:3333/admin/prompt-lab?bypass=true
- Action bar stays visible when pasting large JSON
- Layout fills entire viewport below nav bar
- Panels resize properly with browser window

### Status: COMPLETE - Ready for deployment

---

## FE–BE Contract Audit: Purchase Page V2 (2025-12-17)

### Task 1: End-to-End Data Provenance (Authenticated Path)

**Flow Trace:**

```
/purchase?sid=JWT_TOKEN
        ↓
app/purchase/page.tsx:116
        ↓
validatePurchaseToken(token)  [lib/purchase/validation.ts:10-61]
        │
        ├─ Dev bypass: token === 'dev-token' → hardcoded PurchaseTokenPayload (leadId: '3093')
        └─ Production: jwtVerify() with SURVEY_SECRET_KEY, audience='purchase', scope='buy'
        ↓
PurchaseTokenPayload { leadId, runId?, businessId?, jti, aud, scope, tier?, iat, exp }
        ↓
lookupPurchaseContext(payload.leadId, payload.runId)  [lib/purchase/context.ts:86-258]
        │
        ├─ Dev override: leadIdInt === 3093 → hardcoded PurchaseContext
        └─ Production: SQL query to reports + leads tables
        │      SELECT l.company, l.domain, r.report_data->>'impact_range_*', r.report_data->'hero_issues'
        ↓
        + fetchHomepageScreenshotUrl(leadId) → LeadShop API /api/v1/mockups/{leadId}/desktop
        + fetchMobileScreenshotUrl(leadId) → LeadShop API /api/v1/mockups/{leadId}/mobile
        ↓
PurchaseContext { businessName, domainUrl, homepageScreenshotUrl, mobileScreenshotUrl,
                  impactMonthlyLow, impactMonthlyHigh, issues[], totalIssues?, leadId, runId?, businessId? }
        ↓
PurchasePageClient → HeroV2, PriorityDetailV2, WhatsInsideV2, FinalCloseV2, PaymentElementWrapper
```

**Data Sources:**
| Field | Source | Query Location |
|-------|--------|----------------|
| businessName | `leads.company` | context.ts:111 |
| domainUrl | `leads.domain` | context.ts:112 |
| impactMonthlyLow/High | `reports.report_data->>'impact_range_*'` | context.ts:113-114 |
| issues | `reports.report_data->'hero_issues'` | context.ts:115, sliced to first 3 |
| homepageScreenshotUrl | LeadShop API `/mockups/{id}/desktop` | context.ts:229 |
| mobileScreenshotUrl | LeadShop API `/mockups/{id}/mobile` | context.ts:230 |

---

### Task 2: Component Contract Satisfiability Matrix

| Component                 | Prop                   | TS Type          | Source Expression                                   | Backend Guarantee | Failure Mode                                              |
| ------------------------- | ---------------------- | ---------------- | --------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| **HeroV2**                | `issueCount`           | `number`         | `context.totalIssues \|\| context.issues.length`    | CONDITIONAL       | totalIssues only set for dev-token; DB uses issues.length |
| **HeroV2**                | `revenueImpact`        | `number`         | `context.impactMonthlyHigh`                         | GUARANTEED        | parseCurrency returns 0 if null                           |
| **HeroV2**                | `mobileScreenshotUrl`  | `string \| null` | `context.mobileScreenshotUrl \|\| null`             | OPTIONAL          | Graceful skeleton fallback                                |
| **HeroV2**                | `onCtaClick`           | `() => void`     | Client-side callback                                | N/A               |                                                           |
| **PriorityDetailV2**      | `issue`                | `PurchaseIssue`  | `context.issues[0]`                                 | CONDITIONAL       | Entire component guarded by `issues.length > 0`           |
| **PriorityDetailV2**      | `desktopScreenshotUrl` | `string \| null` | `context.homepageScreenshotUrl \|\| null`           | OPTIONAL          | Graceful skeleton fallback                                |
| **PriorityDetailV2**      | `onCtaClick`           | `() => void`     | Client-side callback                                | N/A               |                                                           |
| **WhatsInsideV2**         | `onCtaClick`           | `() => void`     | Client-side callback                                | N/A               | Static content                                            |
| **FinalCloseV2**          | `desktopScreenshotUrl` | `string \| null` | `context.homepageScreenshotUrl \|\| null`           | OPTIONAL          | Graceful skeleton fallback                                |
| **FinalCloseV2**          | `onCtaClick`           | `() => void`     | Client-side callback                                | N/A               |                                                           |
| **FooterV2**              | (none)                 | -                | -                                                   | -                 | Static                                                    |
| **PaymentElementWrapper** | `businessId`           | `string`         | `context.businessId \|\| context.leadId.toString()` | **⚠️ GAP**        | businessId never populated from DB query                  |
| **PaymentElementWrapper** | `businessName`         | `string`         | `context.businessName`                              | GUARANTEED        | Falls back to empty string                                |
| **PaymentElementWrapper** | `utm`                  | `string`         | Raw JWT token                                       | GUARANTEED        |                                                           |
| **PaymentElementWrapper** | `tier`                 | `string`         | Hardcoded `"basic"`                                 | N/A               |                                                           |
| **PaymentElementWrapper** | `leadId`               | `string`         | `String(context.leadId)`                            | GUARANTEED        |                                                           |

---

### Task 3: Formatting Responsibility Audit

| Data Field              | Raw Type from Backend                         | Formatted By         | Method                                           | Notes                                 |
| ----------------------- | --------------------------------------------- | -------------------- | ------------------------------------------------ | ------------------------------------- |
| `impactMonthlyHigh`     | `number` (whole dollars)                      | **HeroV2**           | `Intl.NumberFormat('en-US', {style:'currency'})` | ✅ Frontend owns presentation         |
| `impactMonthlyLow`      | `number` (whole dollars)                      | **NOT USED**         | -                                                | In types but never rendered in V2     |
| `issue.impact_low/high` | `string` (pre-formatted)                      | **NOT USED**         | Already "19,800" format from backend             | V2 doesn't show per-issue impact      |
| `issue.title`           | `string`                                      | Pass-through         | Raw                                              |                                       |
| `issue.description`     | `string`                                      | Pass-through         | Raw                                              | May contain `why_it_matters` fallback |
| `issue.effort`          | `'EASY' \| 'MODERATE' \| 'HARD' \| undefined` | **PriorityDetailV2** | Badge color mapping, default 'MODERATE'          | ✅ Frontend owns presentation         |
| `totalIssues`           | `number \| undefined`                         | **HeroV2**           | `${issueCount} issues.` interpolation            | Simple string                         |

**Currency Flow:**

```
Backend: report_data->>'impact_range_high' = "29,700" (string)
    ↓
parseCurrency() in context.ts → 29700 (number)
    ↓
PurchaseContext.impactMonthlyHigh: number
    ↓
HeroV2: Intl.NumberFormat → "$29,700" (displayed)
```

---

### Task 4: Cardinality & Hard Contract Validation

| Contract                | Constraint       | Enforcement                                                               | Risk                        |
| ----------------------- | ---------------- | ------------------------------------------------------------------------- | --------------------------- |
| `issues[]`              | Array, min 0     | `PriorityDetailV2` guarded: `context.issues && context.issues.length > 0` | LOW - Graceful skip         |
| `issues[]`              | Max 3 in context | `context.ts:211`: `.slice(0, 3)`                                          | ✅ Enforced server-side     |
| `totalIssues`           | Optional         | Fallback: `context.totalIssues \|\| context.issues.length`                | LOW                         |
| `homepageScreenshotUrl` | Nullable         | All components handle with `\|\| null` and conditional render             | ✅                          |
| `mobileScreenshotUrl`   | Nullable         | HeroV2 handles with conditional render + skeleton                         | ✅                          |
| `businessId`            | Optional         | **⚠️ GAP**: `context.businessId \|\| context.leadId.toString()`           | MEDIUM - DB never populates |
| `runId`                 | Optional         | Used for query but not required for rendering                             | ✅                          |

**Critical Validation:**

- ❌ `businessId` is **NEVER** populated from the database query in `lookupPurchaseContext`. Line 243 references `row.businessId` but the SQL SELECT doesn't include that column.
- Current mitigation: `PurchasePageClient.tsx:65` falls back to `context.leadId.toString()`.

---

### Task 5: Sample vs Real Data Isolation

**Dev Token Mechanism:**

```typescript
// validation.ts:20-31
if (token === 'dev-token') {
  return { leadId: '3093', businessId: 'dev-business-123', runId: 'dev-run', ... }
}

// context.ts:156-192
if (leadIdInt === 3093) {
  return { /* hardcoded test context */ }
}
```

**Isolation Assessment:**

| Check                                      | Status | Notes                               |
| ------------------------------------------ | ------ | ----------------------------------- |
| Dev data isolated to specific token        | ✅     | Requires exact string `'dev-token'` |
| Dev data isolated to specific leadId       | ✅     | Override only for `leadId === 3093` |
| Dev paths don't pollute production queries | ✅     | Early return before DB access       |
| Dev code stripped in production build      | ❌     | Code remains in bundle              |
| Dev screenshot URLs valid                  | ⚠️     | S3 presigned URLs expire in ~7 days |
| No dev data leaks into analytics           | ✅     | Real leadId used in tracking        |

**Verdict:** Sample data is properly isolated. The `dev-token` / `leadId=3093` pathway is self-contained and cannot affect real user flows.

---

### Task 6: Failure Modes & Edge Cases

| Scenario                  | Detection                             | User-Facing Result                                                   | Code Location                          |
| ------------------------- | ------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| Invalid/expired JWT       | `validatePurchaseToken` returns null  | `TokenError`: "This link has expired or is invalid"                  | page.tsx:119                           |
| Missing `sid`/`utm` param | Empty token check                     | Redirect to `/`                                                      | page.tsx:112-114                       |
| No report in database     | `lookupPurchaseContext` returns null  | `TokenError`: "Report not found for this link"                       | page.tsx:125                           |
| Empty `hero_issues`       | `issues = []` after query             | PriorityDetailV2 **not rendered**                                    | PurchasePageClient.tsx:37              |
| Zero `impactMonthlyHigh`  | `parseCurrency` returns 0             | Hero shows "$0/month"                                                | HeroV2.tsx:70                          |
| Screenshot API failure    | Fetch returns null                    | Skeleton placeholder (`bg-[#1a1a1a]` or `bg-gray-200 animate-pulse`) | HeroV2.tsx:49, PriorityDetailV2.tsx:69 |
| LeadShop API unreachable  | 5-min cache + silent null             | Screenshots show skeleton                                            | context.ts:35-51                       |
| Image fails to load       | `onError={() => setImageError(true)}` | Skeleton shown                                                       | HeroV2.tsx:41                          |
| Missing `effort` field    | Default to `'MODERATE'`               | Amber badge displayed                                                | PriorityDetailV2.tsx:51                |

**Unhandled Edge Cases:**

1. If `businessName` is empty string → Payment form shows empty business name
2. If all 3 issues have empty descriptions → PriorityDetailV2 shows empty `<p>` tag
3. If `LEADSHOP_API_URL` env var missing → Falls back to hardcoded Hetzner IP

---

### Task 7: Drift Risk Summary

| Risk                                        | Severity | Current State                                                                                | Mitigation                                                   |
| ------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **businessId not queried from DB**          | MEDIUM   | SQL doesn't select `business_id`, code references `row.businessId` which is always undefined | Fallback to `leadId.toString()` works but semantically wrong |
| **totalIssues divergence**                  | LOW      | Dev-token uses `4` (from `opportunity_details.length`), DB uses `issues.length` (max 3)      | Consider querying `opportunity_details` count                |
| **Dev screenshot expiration**               | LOW      | Presigned URLs in hardcoded context expire after ~7 days                                     | Re-generate periodically or use permanent test images        |
| **Double currency parsing**                 | LOW      | Backend sends formatted strings → parseCurrency → number → Intl.NumberFormat                 | Works but wasteful; consider backend sending raw cents       |
| **Hardcoded tier in PaymentElementWrapper** | LOW      | Always `"basic"` despite `tier?` in token payload                                            | Token tier is ignored                                        |
| **PurchaseIssue.effort optional**           | LOW      | Type says `effort?: string`, component defaults `'MODERATE'`                                 | Consider making required in backend                          |

**Critical Action Items:**

1. **FIX**: Add `l.business_id` to SQL SELECT in `lookupPurchaseContext` to properly populate businessId
2. **MONITOR**: Dev-token screenshot URLs will stop working after S3 presigned expiry
3. **CONSIDER**: Query `opportunity_details` length for accurate totalIssues count

---

### Summary

The FE-BE contract is **largely sound** with proper:

- ✅ JWT authentication and validation
- ✅ Graceful handling of optional/nullable fields
- ✅ Proper sample/production data isolation
- ✅ Consistent formatting ownership (frontend)

**One actionable gap identified:** `businessId` is expected by `PaymentElementWrapper` but never populated from the database. The fallback to `leadId.toString()` works but creates a semantic mismatch that could cause issues in payment reconciliation.

### Status: COMPLETE
