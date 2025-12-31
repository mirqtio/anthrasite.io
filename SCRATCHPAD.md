# SCRATCHPAD

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

---

## Landing Page v9 - Comprehensive Design Specification (2025-12-23)

### Document Purpose

This specification provides complete design guidance for implementing the Anthrasite Landing Page (Copy v9). A developer can implement this page without further design input.

**Reference Documents:**

- Copy Spec: `anthrasite-landing-page-copy-v9.md`
- Design System: `/design-system/src/polymet/data/anthrasite-tokens.ts`

---

## DESIGN PHILOSOPHY

### No Fallbacks Policy

**All fields are required.** No lead reaches this page without complete data. Fallbacks mask bugs—they don't prevent them. If data is missing, the page should error visibly so we fix the pipeline, not hide the problem.

---

## GLOBAL SETTINGS

### Page Configuration

```
Theme: Dark (Anthrasite brand default)
Background: var(--color-bg-canvas) → #0A0A0A
Max Content Width: 768px (prose-optimized)
Font Family: Inter (var(--font-family-primary))
Language: en-US
Direction: ltr
```

### Logo Treatment

**Asset:** Anthrasite wordmark (SVG)
**File:** `/public/anthrasite-logo.svg`

| Breakpoint | Width | Height | Position     |
| ---------- | ----- | ------ | ------------ |
| Desktop    | 120px | auto   | Left-aligned |
| Tablet     | 110px | auto   | Left-aligned |
| Mobile     | 100px | auto   | Left-aligned |

**Link behavior:** Not clickable (no navigation on this page—1:1 attention ratio)

```css
.logo {
  width: 120px;
  height: auto;
}

@media (max-width: 1023px) {
  .logo {
    width: 110px;
  }
}

@media (max-width: 767px) {
  .logo {
    width: 100px;
  }
}
```

### Divider Lines

Used between major sections (header/hero, hook sections, CTA/guarantee).

```css
.divider {
  height: 1px;
  background: var(--color-border-default); /* rgba(255,255,255,0.1) */
  border: none;
  margin: var(--spacing-8) 0; /* 32px */
}

@media (max-width: 767px) {
  .divider {
    margin: var(--spacing-6) 0; /* 24px */
  }
}
```

### Breakpoint Definitions

| Name    | Range      | Grid Columns | Container Padding  |
| ------- | ---------- | ------------ | ------------------ |
| Mobile  | 0–767px    | 1            | 16px (--spacing-4) |
| Tablet  | 768–1023px | 1            | 24px (--spacing-6) |
| Desktop | 1024px+    | 1            | 32px (--spacing-8) |

**Note:** This is a single-column landing page. No multi-column grid needed.

### Container System

```css
.page-container {
  max-width: 768px;
  margin: 0 auto;
  padding-inline: var(--spacing-4); /* 16px mobile */
}

@media (min-width: 768px) {
  .page-container {
    padding-inline: var(--spacing-6);
  }
}

@media (min-width: 1024px) {
  .page-container {
    padding-inline: var(--spacing-8);
  }
}
```

---

## SECTION 1: HERO

### Purpose

Prove we looked. Show company name, screenshots, score, and issue count.

### Layout Specification

**Desktop (1024px+)**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo: 120px wide]         Measured with industry-standard     │
│                             tools and benchmarks                │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  ┌──────────────────────────────┐   ┌─────────────────┐         │
│  │                              │   │                 │         │
│  │    Desktop Screenshot        │   │ Mobile          │         │
│  │    (480px × auto)            │   │ Screenshot      │         │
│  │                              │   │ (200px × auto)  │         │
│  │                              │   │                 │         │
│  └──────────────────────────────┘   └─────────────────┘         │
│               ↑ flex, gap-24px, align-end ↑                     │
│                                                                 │
│                      {{company}}                                │
│                                                                 │
│                 Score: {{overall_score}}/100                    │
│            Find, Trust, Understand, and Contact.                │
│                                                                 │
│         We found {{issue_count}} issues to address.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Tablet (768–1023px)**

- Same as desktop but screenshots scale proportionally
- Desktop screenshot: 400px max-width
- Mobile screenshot: 160px max-width

**Mobile (0–767px)**

```
┌───────────────────────────────────────┐
│  [Logo: 100px]                        │
│  Measured with industry-standard      │
│  tools and benchmarks                 │
│                                       │
│  ─────────────────────────────────    │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │   Desktop Screenshot             │  │
│  │   (100% width, max 360px)        │  │
│  └─────────────────────────────────┘  │
│                                       │
│         ┌─────────────────┐           │
│         │ Mobile Screenshot│          │
│         │ (50% width)      │          │
│         └─────────────────┘           │
│                                       │
│           {{company}}                 │
│                                       │
│       Score: {{overall_score}}/100    │
│  Find, Trust, Understand, and Contact.│
│                                       │
│   We found {{issue_count}} issues...  │
│                                       │
└───────────────────────────────────────┘
```

### Typography

| Element                 | Token            | Desktop | Mobile | Weight | Color                       |
| ----------------------- | ---------------- | ------- | ------ | ------ | --------------------------- |
| Trust badge (top-right) | --font-size-sm   | 14px    | 12px   | 400    | --color-text-secondary      |
| Company name (headline) | --font-size-5xl  | 40px    | 32px   | 700    | --color-text-primary        |
| Score display           | --font-size-4xl  | 32px    | 28px   | 600    | --color-text-link (#0066FF) |
| Score context           | --font-size-base | 16px    | 14px   | 400    | --color-text-secondary      |
| Issue count             | --font-size-lg   | 18px    | 16px   | 500    | --color-text-primary        |

### Spacing

| Element                   | Value (Desktop) | Value (Mobile) | Token                                       |
| ------------------------- | --------------- | -------------- | ------------------------------------------- |
| Section top padding       | 96px            | 64px           | --spacing-section-lg / --spacing-section-md |
| Section bottom padding    | 64px            | 48px           | --spacing-section-md / --spacing-section-sm |
| Logo to trust badge       | 16px            | 12px           | --spacing-4 / --spacing-3                   |
| Divider margin            | 32px top/bottom | 24px           | --spacing-8 / --spacing-6                   |
| Screenshots container gap | 24px            | 16px           | --spacing-6 / --spacing-4                   |
| Screenshots to headline   | 48px            | 32px           | --spacing-12 / --spacing-8                  |
| Headline to score         | 16px            | 12px           | --spacing-4 / --spacing-3                   |
| Score to context          | 8px             | 8px            | --spacing-2                                 |
| Context to issue count    | 24px            | 16px           | --spacing-6 / --spacing-4                   |

### Screenshot Treatment

```css
.screenshot-container {
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Bottom-aligned */
  gap: var(--spacing-6);
}

.screenshot-frame {
  border-radius: var(--radius-lg); /* 12px */
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-default);
  overflow: hidden;
  background: var(--color-bg-surface); /* Fallback while loading */
}

.screenshot-desktop {
  width: 480px;
  max-width: 65%;
}

.screenshot-mobile {
  width: 200px;
  max-width: 28%;
}

/* Mobile breakpoint */
@media (max-width: 767px) {
  .screenshot-container {
    flex-direction: column;
    align-items: center;
  }
  .screenshot-desktop {
    width: 100%;
    max-width: 360px;
  }
  .screenshot-mobile {
    width: 50%;
    max-width: 180px;
  }
}
```

**Screenshot Aspect Ratios (CLS Prevention):**

Explicit aspect-ratio prevents layout shift before images load:

```css
.screenshot-desktop {
  aspect-ratio: 16 / 10;
}

.screenshot-mobile {
  aspect-ratio: 9 / 19;
}
```

**Note:** These ratios match LeadShop mockup output. Images fill the container maintaining their natural aspect.

### Component States

**Screenshots:**

- **Loading (skeleton):** Shown during initial page load
  - Background: var(--color-skeleton-base)
  - Shimmer: var(--color-skeleton-shimmer)
  - Animation: 1.5s linear infinite
  - Maintains aspect-ratio container to prevent CLS
- **Loaded:** Image fades in (opacity 0 → 1, 200ms ease-out)
- **Error:** Per no-fallbacks policy, screenshot URLs are required. If an image fails to load after URL is provided, log error to monitoring. Do not show a placeholder—this indicates a pipeline issue that needs fixing.

---

## SECTION 2: THE HOOK

### Purpose

Echo email issue, show ONE metric with benchmark, introduce dollar range.

### Layout Specification

**Desktop/Tablet**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  {{email_issue_brief}}                                          │
│  (max-width: 600px, centered)                                   │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐     │
│     │  {{anchor_metric_label}}: {{anchor_metric_value}}   │     │
│     │  Benchmark: {{anchor_metric_benchmark}}             │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Based on US Census data, your industry, location, and other    │
│  factors, we estimate these issues are costing you              │
│  {{total_impact_low}} – {{total_impact_high}} per month         │
│  in lost revenue.                                               │
│                                                                 │
│  The full report shows all {{issue_count}} issues, prioritized  │
│  by impact, with estimated difficulty to address each. Ready    │
│  for you or the person who manages your website to tackle.      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Typography

| Element         | Token            | Size      | Weight | Color                                 |
| --------------- | ---------------- | --------- | ------ | ------------------------------------- |
| Issue brief     | --font-size-xl   | 20px/18px | 400    | --color-text-primary                  |
| Metric label    | --font-size-base | 16px      | 500    | --color-text-secondary                |
| Metric value    | --font-size-3xl  | 28px/24px | 700    | --color-status-error-text (#FF3B30)   |
| Benchmark label | --font-size-sm   | 14px      | 400    | --color-text-secondary                |
| Benchmark value | --font-size-base | 16px      | 500    | --color-status-success-text (#22C55E) |
| Dollar range    | --font-size-2xl  | 24px/20px | 700    | --color-text-link (#0066FF)           |
| Body text       | --font-size-lg   | 18px/16px | 400    | --color-text-secondary                |

### Metric Display Box

```css
.metric-box {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}
```

### Spacing

| Element                     | Value           | Token                |
| --------------------------- | --------------- | -------------------- |
| Section padding             | 64px top/bottom | --spacing-section-md |
| Issue brief to metric box   | 32px            | --spacing-8          |
| Metric box internal padding | 24px            | --spacing-6          |
| Metric value to benchmark   | 16px            | --spacing-4          |
| Metric box to divider       | 32px            | --spacing-8          |
| Divider to dollar paragraph | 32px            | --spacing-8          |
| Paragraph spacing           | 24px            | --spacing-6          |

---

## SECTION 3: WHAT YOU GET

### Layout Specification

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    What's in your report                        │
│                                                                 │
│  A detailed analysis of {{company}}, organized by what matters  │
│  most to your bottom line.                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ● {{issue_count}} issues identified                    │    │
│  │    Each one explained in plain language—what's wrong    │    │
│  │    and why it matters.                                  │    │
│  │                                                         │    │
│  │  ● Prioritized by business impact                       │    │
│  │    Not just a list of problems. We've ordered them...   │    │
│  │                                                         │    │
│  │  ● Difficulty ratings                                   │    │
│  │    Each issue marked Easy, Moderate, or Hard...         │    │
│  │                                                         │    │
│  │  ● The underlying measurements                          │    │
│  │    The specific metrics behind each issue...            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  PDF, delivered to your inbox in minutes.                       │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Most audits give you scores. This report tells you what        │
│  those scores mean for your business—and which problems         │
│  to tackle first.                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Typography

| Element                 | Size      | Weight | Color                  |
| ----------------------- | --------- | ------ | ---------------------- |
| Section header          | 32px/28px | 700    | --color-text-primary   |
| Intro paragraph         | 18px/16px | 400    | --color-text-secondary |
| Value list titles       | 18px      | 600    | --color-text-primary   |
| Value list descriptions | 16px      | 400    | --color-text-secondary |
| Format line             | 16px      | 500    | --color-text-secondary |
| Differentiator          | 18px      | 500    | --color-text-primary   |

### Value List Styling

```css
.value-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6); /* 24px */
}

.value-item {
  display: flex;
  gap: var(--spacing-3); /* 12px */
}

.value-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-interactive-cta-default);
  flex-shrink: 0;
  margin-top: 8px; /* Align with first line of text */
}

.value-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2); /* 8px */
}
```

---

## SECTION 4: WHY TRUST US

### Layout

Simple centered text block, no special styling.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  We analyzed your site using a combination of industry-leading  │
│  assessment tools, business and government standards, and our   │
│  own proprietary visual analysis.                               │
│                                                                 │
│  We check 40+ factors across search visibility, mobile          │
│  experience, security configuration, accessibility compliance,  │
│  local presence, and conversion friction.                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Typography

| Element       | Size      | Weight | Color                  |
| ------------- | --------- | ------ | ---------------------- |
| Body text     | 18px/16px | 400    | --color-text-secondary |
| "40+ factors" | 18px/16px | 600    | --color-text-primary   |

### Spacing

- Section padding: 48px top/bottom (--spacing-section-sm)
- Paragraph spacing: 24px (--spacing-6)

---

## SECTION 5: CTA + GUARANTEE

### Layout Specification

**Desktop**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │              Your report for {{company}}                  │  │
│  │                                                           │  │
│  │                         $299                              │  │
│  │                                                           │  │
│  │  ─────────────────────────────────────────────────────    │  │
│  │                                                           │  │
│  │  • {{issue_count}} issues identified and prioritized      │  │
│  │  • {{total_impact_low}} – {{total_impact_high}}/mo est.   │  │
│  │  • Difficulty rating for each issue                       │  │
│  │  • Delivered in minutes                                   │  │
│  │                                                           │  │
│  │              ┌─────────────────────────┐                  │  │
│  │              │    Get Your Report      │                  │  │
│  │              └─────────────────────────┘                  │  │
│  │                                                           │  │
│  │    You'll check out with Stripe. No forms to fill out.    │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  THE REPORT PAYS FOR ITSELF, OR IT'S FREE                       │
│                                                                 │
│  If you address the issues we identify and don't see enough     │
│  improvement to cover the cost of the report within 90 days,    │
│  we'll refund you in full. Just reply to your delivery email.   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### CTA Card Styling

```css
.cta-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl); /* 16px */
  padding: var(--spacing-8); /* 32px */
  text-align: center;
  box-shadow: var(--shadow-lg);
}

/* Add subtle gradient border effect */
.cta-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    var(--color-interactive-cta-default) 0%,
    transparent 50%
  );
  z-index: -1;
  opacity: 0.3;
}
```

### Primary CTA Button

```css
.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  padding: var(--spacing-4) var(--spacing-8); /* 16px 32px */
  min-width: 240px;

  background: var(--color-interactive-cta-default);
  color: var(--color-interactive-cta-text);

  font-size: var(--font-size-lg); /* 18px */
  font-weight: var(--font-weight-semibold);

  border: none;
  border-radius: var(--radius-lg); /* 12px */
  box-shadow: var(--shadow-cta);

  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.cta-primary:hover {
  background: var(--color-interactive-cta-hover);
  box-shadow: var(--shadow-cta-hover);
  transform: translateY(-1px);
}

.cta-primary:active {
  background: var(--color-interactive-cta-active);
  transform: translateY(0);
}

.cta-primary:focus-visible {
  outline: none;
  box-shadow:
    var(--shadow-cta),
    0 0 0 2px var(--color-focus-ring-offset),
    0 0 0 4px var(--color-focus-ring);
}

.cta-primary:disabled {
  background: var(--color-interactive-cta-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### Button States

| State    | Background          | Shadow                  | Transform        |
| -------- | ------------------- | ----------------------- | ---------------- |
| Default  | #0066FF             | shadow-cta              | none             |
| Hover    | #0052CC             | shadow-cta-hover        | translateY(-1px) |
| Active   | #0047B3             | shadow-cta              | translateY(0)    |
| Focus    | #0066FF             | shadow-cta + focus ring | none             |
| Disabled | rgba(0,102,255,0.3) | none                    | none             |
| Loading  | #0066FF             | shadow-cta              | none             |

### Loading State

```css
.cta-primary.loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.cta-primary.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-interactive-cta-text);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Typography

| Element            | Size      | Weight | Color                        |
| ------------------ | --------- | ------ | ---------------------------- |
| Card headline      | 24px/20px | 600    | --color-text-primary         |
| Price              | 48px/40px | 700    | --color-text-primary         |
| Bullet points      | 16px      | 400    | --color-text-secondary       |
| Button text        | 18px      | 600    | --color-interactive-cta-text |
| Stripe note        | 14px      | 400    | --color-text-muted           |
| Guarantee headline | 20px/18px | 700    | --color-text-primary         |
| Guarantee body     | 16px      | 400    | --color-text-secondary       |

### Guarantee Section

**DESIGN DEVIATION:** Adding a subtle background to differentiate the guarantee from other content.

```css
.guarantee-section {
  background: var(--color-bg-subtle); /* rgba(255,255,255,0.03) */
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-top: var(--spacing-8);
}
```

---

## SECTION 6: FAQ

### Layout

Accordion pattern with expand/collapse behavior.

**Default State:** First item ("Who is Anthrasite?") is OPEN by default. This answers the primary trust question immediately.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Who is Anthrasite?                                   [+] │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Is this legitimate?                                  [+] │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  How accurate is the revenue estimate?                [+] │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ... (more items)                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Expanded State

```
┌───────────────────────────────────────────────────────────────┐
│  Who is Anthrasite?                                       [-] │
├───────────────────────────────────────────────────────────────┤
│  We analyze small business websites using a combination of    │
│  industry-leading tools, established standards, and our own   │
│  visual assessment. Then we translate the results into a      │
│  prioritized list of what's actually affecting your business. │
└───────────────────────────────────────────────────────────────┘
```

### Accordion Styling

```css
.faq-item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-3);
  overflow: hidden;
  transition: border-color var(--duration-fast);
}

.faq-item:hover {
  border-color: var(--color-border-strong);
}

.faq-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.faq-trigger:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-focus-ring);
}

.faq-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  transition: transform var(--duration-normal) var(--easing-ease-out);
}

.faq-item[data-state='open'] .faq-icon {
  transform: rotate(180deg);
}

/* Content wrapper for grid animation */
.faq-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-normal) var(--easing-ease-out);
}

.faq-item[data-state='open'] .faq-content-wrapper {
  grid-template-rows: 1fr;
}

.faq-content {
  overflow: hidden;
  padding: 0 var(--spacing-4);
}

.faq-content > div {
  padding-bottom: var(--spacing-4);
}
```

### Typography

| Element  | Size      | Weight | Color                  |
| -------- | --------- | ------ | ---------------------- |
| Question | 18px/16px | 500    | --color-text-primary   |
| Answer   | 16px      | 400    | --color-text-secondary |

---

## SECTION 7: MOBILE STICKY CTA

### Purpose

Persistent CTA for mobile users who scroll past the main CTA.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔒  Get Your Report — $299                                 →   │
└─────────────────────────────────────────────────────────────────┘
```

### Behavior

| Property        | Value                                               |
| --------------- | --------------------------------------------------- |
| Visibility      | Mobile only (max-width: 767px)                      |
| Trigger         | Appears when hero leaves viewport (scroll > ~600px) |
| Position        | Fixed bottom, full width                            |
| Entry animation | Slide up from bottom, 300ms ease-out                |
| Exit animation  | Slide down, 200ms ease-in                           |
| Hide condition  | When main CTA card is in viewport                   |
| Z-index         | var(--z-sticky) (1100)                              |

### Styling

```css
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);

  padding: var(--spacing-4);
  padding-bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom));

  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-lg);

  transform: translateY(100%);
  transition: transform var(--duration-slow) var(--easing-ease-out);
}

.sticky-cta.visible {
  transform: translateY(0);
}

.sticky-cta-button {
  flex: 1;
  max-width: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  padding: var(--spacing-3) var(--spacing-6);

  background: var(--color-interactive-cta-default);
  color: var(--color-interactive-cta-text);

  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);

  border: none;
  border-radius: var(--radius-md);

  cursor: pointer;
}

.sticky-cta-lock-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.sticky-cta-arrow {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
```

---

## DATA STATES

### Required Data Contract

**All data is required.** Per company policy, no fallbacks. If any field is missing, render an error state—do not silently degrade.

| Field                   | Type               | Required |
| ----------------------- | ------------------ | -------- |
| company                 | string             | ✓        |
| overall_score           | number (0-100)     | ✓        |
| issue_count             | number             | ✓        |
| email_issue_brief       | string             | ✓        |
| anchor_metric_label     | string             | ✓        |
| anchor_metric_value     | string             | ✓        |
| anchor_metric_benchmark | string             | ✓        |
| total_impact_low        | string (formatted) | ✓        |
| total_impact_high       | string (formatted) | ✓        |
| desktop_screenshot_url  | string (URL)       | ✓        |
| mobile_screenshot_url   | string (URL)       | ✓        |

### Initial Page Load (Skeleton State)

Before data arrives, show skeleton placeholders with shimmer:

| Element      | Skeleton Dimensions                                |
| ------------ | -------------------------------------------------- |
| Screenshots  | Aspect-ratio containers (16/10, 9/19) with shimmer |
| Company name | 200px × 48px                                       |
| Score        | 80px × 36px                                        |
| Issue count  | 160px × 24px                                       |
| Metric value | 120px × 32px                                       |
| Dollar range | 180px × 28px                                       |

**Skeleton Animation:**

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-skeleton-base) 25%,
    var(--color-skeleton-shimmer) 50%,
    var(--color-skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
  border-radius: var(--radius-sm);
}
```

### Display Rules (Not Fallbacks)

**Company Name Length:**
| Length | Treatment |
|--------|-----------|
| 1-20 characters | Normal display |
| 21-30 characters | Font scales to --font-size-4xl |
| 31+ characters | Truncate with ellipsis at 30 chars |

**Score Color by Value:**
| Score | Color |
|-------|-------|
| 0-30 | --color-status-error-text (#FF3B30) |
| 31-60 | --color-status-warning-text (#FFC107) |
| 61-100 | --color-text-link (#0066FF) |

**Issue Count Grammar:**
| Count | Copy |
|-------|------|
| 1 | "We found 1 issue to address." |
| 2+ | "We found {{count}} issues to address." |

**Dollar Range:**

- Always displayed as provided
- Ensure no line break within range (use `white-space: nowrap` on the value)

---

## ACCESSIBILITY REQUIREMENTS

### Color Contrast (WCAG AA)

| Element         | Foreground | Background | Ratio | Status             |
| --------------- | ---------- | ---------- | ----- | ------------------ |
| Body text       | #9CA3AF    | #0A0A0A    | 7.2:1 | ✅ Pass            |
| Primary text    | #FFFFFF    | #0A0A0A    | 21:1  | ✅ Pass            |
| CTA button text | #FFFFFF    | #0066FF    | 4.6:1 | ✅ Pass            |
| Link text       | #0066FF    | #0A0A0A    | 5.3:1 | ✅ Pass            |
| Muted text      | #6B7280    | #0A0A0A    | 4.6:1 | ⚠️ Large text only |

### Focus States

All interactive elements must have visible focus indicators:

```css
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-focus-ring-offset),
    0 0 0 4px var(--color-focus-ring);
}
```

### Keyboard Navigation

| Element       | Key         | Action              |
| ------------- | ----------- | ------------------- |
| CTA Button    | Enter/Space | Activate            |
| FAQ Accordion | Enter/Space | Toggle open/close   |
| FAQ Accordion | Arrow Down  | Focus next item     |
| FAQ Accordion | Arrow Up    | Focus previous item |
| Sticky CTA    | Enter/Space | Activate            |

### Screen Reader Considerations

**Alt Text:**

- Desktop screenshot: "Screenshot of {{company}} website on desktop"
- Mobile screenshot: "Screenshot of {{company}} website on mobile"

**ARIA Labels:**

- Score: `aria-label="Score: {{score}} out of 100"`
- Dollar range: `aria-label="Estimated monthly impact: {{low}} to {{high}} dollars"`
- Lock icon in sticky CTA: `aria-hidden="true"` (decorative)

**Landmarks:**

```html
<header role="banner"><!-- Logo + trust badge --></header>
<main role="main">
  <section aria-labelledby="hero-heading"><!-- Hero --></section>
  <section aria-labelledby="hook-heading"><!-- Hook --></section>
  <section aria-labelledby="value-heading"><!-- What You Get --></section>
  <section aria-labelledby="trust-heading"><!-- Why Trust Us --></section>
  <section aria-labelledby="cta-heading"><!-- CTA + Guarantee --></section>
  <section aria-labelledby="faq-heading"><!-- FAQ --></section>
</main>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .sticky-cta {
    transform: none;
    opacity: 0;
  }

  .sticky-cta.visible {
    opacity: 1;
  }
}
```

---

## INTERACTIONS & MOTION

### Scroll Behavior

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

### Transition Defaults

| Property         | Duration | Easing   |
| ---------------- | -------- | -------- |
| Color/Background | 150ms    | ease-out |
| Transform        | 200ms    | ease-out |
| Opacity          | 200ms    | ease-out |
| Box-shadow       | 150ms    | ease-out |

### Page Load Sequence

1. **Critical (immediate):**

   - Page background
   - Header with logo
   - Hero text content (company name, score, issue count)

2. **Above-fold priority (within 100ms):**

   - Screenshot containers (with loading skeletons)

3. **Lazy load (when in viewport):**
   - Screenshots (with fade-in on load)
   - FAQ section (collapse all by default)

**Image Load Animation:**

```css
.screenshot-image {
  opacity: 0;
  transition: opacity var(--duration-normal) var(--easing-ease-out);
}

.screenshot-image.loaded {
  opacity: 1;
}
```

---

## CHECKOUT FLOW

### CTA Click Behavior

1. User clicks "Get Your Report"
2. Button enters loading state (spinner replaces text)
3. Redirect to Stripe Checkout (hosted)
4. Email pre-filled from lead data
5. On success → redirect to /purchase/success

### Success Page (`/purchase/success`)

**URL:** `/purchase/success?session_id={stripe_session_id}`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Logo: 120px]                                                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│                          ┌─────┐                                │
│                          │  ✓  │                                │
│                          └─────┘                                │
│                                                                 │
│                 Thank you for your purchase!                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Your report for {{company}} is being generated and will be     │
│  delivered to {{email}} within the next few minutes.            │
│                                                                 │
│  Check your inbox (and spam folder, just in case).              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Questions? Reply to your delivery email.                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Success Icon:**

```css
.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-status-success-bg); /* rgba(34,197,94,0.1) */
  border: 2px solid var(--color-status-success-text); /* #22C55E */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-8);
}

.success-icon svg {
  width: 32px;
  height: 32px;
  color: var(--color-status-success-text);
}
```

**Typography:**
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Headline | 32px/28px | 700 | --color-text-primary |
| Body (delivery info) | 18px/16px | 400 | --color-text-secondary |
| Body (spam note) | 16px | 400 | --color-text-muted |
| Help text | 16px | 400 | --color-text-secondary |

**Spacing:**

- Page padding: same as landing page (--spacing-section-lg top)
- Icon to headline: 32px (--spacing-8)
- Headline to divider: 24px (--spacing-6)
- Divider to body: 24px (--spacing-6)
- Paragraph spacing: 16px (--spacing-4)
- Body to final divider: 32px (--spacing-8)
- Final divider to help text: 24px (--spacing-6)

**Accessibility:**

- Focus on page load: none (informational page)
- aria-live="polite" on success message container

### Error States

| Scenario                           | User Experience                                          |
| ---------------------------------- | -------------------------------------------------------- |
| Payment fails                      | Stripe shows error on checkout page, user can retry      |
| User cancels                       | Returns to landing page, button returns to default state |
| Network error during checkout init | Toast notification (see below)                           |

### Toast Notification Component

For transient errors (network failures, API errors before Stripe redirect).

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠  Connection error. Please try again.                    ✕   │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**

```css
.toast {
  position: fixed;
  bottom: var(--spacing-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast); /* 1200 */

  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  padding: var(--spacing-3) var(--spacing-4);
  max-width: 400px;

  background: var(--color-bg-elevated);
  border: 1px solid var(--color-status-error-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: var(--color-status-error-text);
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.toast-dismiss {
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.toast-dismiss:hover {
  color: var(--color-text-primary);
}
```

**Behavior:**
| Property | Value |
|----------|-------|
| Entry animation | Slide up + fade in, 200ms ease-out |
| Auto-dismiss | 5 seconds |
| Exit animation | Fade out, 150ms ease-in |
| Dismissible | Yes (click X or tap anywhere on toast) |
| Stacking | One toast at a time (new replaces old) |

**Accessibility:**

- `role="alert"` for screen reader announcement
- `aria-live="assertive"` for immediate announcement
- Dismiss button: `aria-label="Dismiss notification"`

---

## PERFORMANCE CONSIDERATIONS

### Target Metrics

| Metric                         | Target  |
| ------------------------------ | ------- |
| LCP (Largest Contentful Paint) | < 2.5s  |
| FID (First Input Delay)        | < 100ms |
| CLS (Cumulative Layout Shift)  | < 0.1   |

### Image Optimization

- Format: WebP with JPEG fallback
- Desktop screenshot: max 1200px width, quality 80
- Mobile screenshot: max 600px width, quality 80
- Lazy loading for all images below fold

### Font Loading

```css
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter-var.woff2') format('woff2');
}
```

### Critical CSS

Inline styles for above-fold content:

- Page background
- Header/logo
- Hero section typography
- Screenshot containers (dimensions only)

---

## DESIGN SYSTEM DEVIATIONS

The following deviations from the standard design system tokens are noted:

| Element              | Design System | This Spec              | Reason                                    |
| -------------------- | ------------- | ---------------------- | ----------------------------------------- |
| Guarantee section bg | None          | var(--color-bg-subtle) | Visual differentiation needed             |
| Score color by value | Single color  | Conditional coloring   | UX improvement for score context          |
| CTA card border      | Standard      | Gradient accent        | Increased visual hierarchy for conversion |

---

## IMPLEMENTATION CHECKLIST

### Global

- [ ] CSS variables from design system tokens
- [ ] Container and breakpoint utilities
- [ ] Divider component
- [ ] Skeleton/shimmer animation utility

### Components

- [ ] Logo (SVG, responsive sizes, not clickable)
- [ ] Hero section with screenshots (aspect-ratio containers)
- [ ] Metric display box
- [ ] Value list (bullet + title + description)
- [ ] CTA card with gradient border accent
- [ ] Primary CTA button (all states: default, hover, active, focus, loading, disabled)
- [ ] Guarantee section (subtle background)
- [ ] FAQ accordion (grid-template-rows animation, first item open)
- [ ] Mobile sticky CTA (scroll detection, viewport visibility)
- [ ] Toast notification component
- [ ] Success page with icon

### Data & State

- [ ] Required data contract validation (error if missing fields)
- [ ] Initial skeleton state during data load
- [ ] Company name length handling (scale/truncate)
- [ ] Score color by value
- [ ] Issue count singular/plural grammar

### Checkout

- [ ] CTA → loading state → Stripe redirect
- [ ] Success page layout and styling
- [ ] Cancel return handling

### Accessibility

- [ ] Focus states on all interactive elements
- [ ] ARIA labels (score, dollar range, decorative icons)
- [ ] Keyboard navigation (FAQ arrows)
- [ ] Reduced motion support
- [ ] Semantic landmarks

### Performance

- [ ] Screenshot aspect-ratio containers (CLS prevention)
- [ ] Image lazy loading
- [ ] Font preload with swap
- [ ] Critical CSS inline

---

## CODEBASE NOTES

### Existing `utm` Prop Naming Issue

The existing `PaymentElementWrapper` component has a prop named `utm` that actually receives the raw JWT token (`sid`), not UTM attribution data. This is a naming mismatch.

**Recommendation for future refactor:**

- Rename `utm` → `purchaseToken` or `sid`
- If actual UTM attribution is needed, add separate props: `utm_source`, `utm_campaign`, etc.

This is an existing codebase issue, not introduced by this spec.

---

### Status: READY FOR IMPLEMENTATION

## ANT-580 — Migrate to Polymet Design System (2025-12-26)

### Linear Ticket

- **Title**: Migrate to Polymet design system
- **URL**: https://linear.app/anthrasite/issue/ANT-580/migrate-to-polymet-design-system
- **Goal**: Adopt the Polymet design system across anthrasite.io for a consistent, modern, mobile-first UI foundation.
- **Scope**:
  - Replace existing styling/components with Polymet equivalents (layout, typography, buttons, cards, sections, forms).
  - Ensure responsive behavior across common breakpoints.
  - Verify landing pages and key flows still function after migration.
- **Acceptance**:
  - Core pages render with Polymet components and consistent styling.
  - No obvious regressions in navigation/links/forms.
  - Mobile rendering verified.
  - Lighthouse regressions avoided (or documented).

### Current Repo Facts (anthrasite-clean)

- **Framework**: Next.js 15 (`next@15.5.7`) running on port `3333` (`pnpm dev`).
- **Styling**: Tailwind v4 in the app; lots of bespoke classes + additional CSS in `app/globals.css`.
- **Design system location**: `design-system/` is a separate Vite prototype app (React Router; React 19).
- **Polymet content**: `design-system/src/polymet/...` contains:
  - Tokens (CSS var export pack): `design-system/src/polymet/data/anthrasite-tokens.ts`
  - Theme provider that injects CSS vars: `design-system/src/polymet/components/anthrasite-theme-provider.tsx`
  - Component barrel: `design-system/src/polymet/components/index.tsx` (ContextHeader, AssessmentSummary, FindingsList, CTABlock, CredibilityAnchor, SecondaryButton, ProblemHeader, ValueProposition, SampleAssessmentPreview, MethodologySection, TrustSection, Footer)
  - Page archetypes: authenticated assessment landing + public explainer.
- **Important mismatch**: Polymet `Footer` currently imports `Link` from `react-router-dom` (not usable in Next without adaptation).
- **Docker available**:
  - `docker-compose.dev.yml`: postgres + redis + Next dev server.
  - `docker-compose.yml`: prod image build, expects an external network.

### Constraints / Goals

- Use the Polymet design system exclusively for UI primitives and styling.
- Minimize “forking” the design system. If the site needs pieces missing from Polymet, log them as DS gaps and (if approved) add them to the DS.
- Enable a “hot cut” once the migration is ready (avoid a long period where the new site exists but can’t be shipped).
- Must be locally validated via Docker before pushing to prod.

### Recommendation (Best Approach)

Implement the migration incrementally behind a single feature flag, while making the design system consumable by Next without copying it into `components/`.

- **Why**:
  - Lets us migrate page-by-page without blocking on the full site.
  - Maintains a deterministic rollback (flip flag off).
  - Keeps `design-system/` as the single source of truth (no divergence).

### Key Architectural Decision: How Next consumes `design-system/`

Preferred: treat `design-system/src/polymet` as “source” consumed by the Next app (not built artifacts), but make it Next-compatible.

Required steps:

1. **Resolve React version alignment**

   - Next app currently uses `react@18.3.1`, while `design-system` uses `react@19.0.0`.
   - Decide one:
     - Option A (safer): downgrade DS to React 18 to match app.
     - Option B: upgrade app to React 19 if Next 15 runtime + deps are compatible.

2. **Remove React Router coupling from Polymet components**

   - Replace `react-router-dom` usage inside DS components with one of:
     - Plain `<a href>` (framework-agnostic), or
     - A `LinkComponent` injection prop, or
     - Separate adapters: `Footer`/etc in DS + `FooterNext` wrapper in app.

3. **Make Tailwind pick up DS classes**

   - Ensure `tailwind.config.ts` `content` includes `design-system/src/**/*.{ts,tsx}` (or wherever Polymet lives).

4. **Tokens single-source**
   - Today tokens exist in both `app/globals.css` and `design-system/...tokens.ts`.
   - Unify to avoid drift:
     - Either import and inject `CSS_VARIABLES` from DS at the app root, or
     - Generate `globals.css` tokens from the DS export pack (build-time).

### Migration Strategy (Phased)

#### Phase 0 — Wiring + Compatibility (no visual changes yet)

- Decide React alignment (see above).
- Make Polymet components importable from Next (paths + transpilation + Tailwind content scanning).
- Fix DS components that are Next-incompatible (React Router dependency).
- Add a single feature flag (example: `NEXT_PUBLIC_FF_POLYMET_SITE`) and route switching for:
  - `/` (OrganicHomepage)
  - `/purchase` and `/purchase?utm=...` (PurchaseHomepage + purchase flow entry)
  - `/landing/[token]` (tokenized landing experience)
  - `/about` + `/legal/*`

Deliverable: flag-gated “new Polymet pages” exist and render, but production stays on legacy.

#### Phase 1 — Homepages (highest traffic surface)

- Build Polymet-based replacements for:
  - Organic homepage (`/`) public marketing page.
  - Purchase homepage (`/` in purchase mode) and purchase homepage preview content.

Keep logic the same (forms, navigation), but move UI primitives to Polymet components/tokens.

#### Phase 2 — Purchase + Token Landing

- Migrate `/purchase` and `/landing/[token]` UI to Polymet.
- Ensure embedded Stripe flow, error/skeleton states, and analytics tracking remain intact.

#### Phase 3 — Legal + About

- Replace `LegalPageLayout` + `/about` typography/layout to Polymet.
- Ensure all links, nav, and mobile menu remain functional.

#### Phase 4 — QA / Regression

- Mobile viewport validation (DevTools emulation + at least one real device profile).
- Run smoke E2E locally.
- Lighthouse pass on:
  - `/`
  - `/purchase` (and/or purchase homepage)
  - `/landing/[token]` (with a dev token or fixture)

#### Phase 5 — Hot Cut

- Flip the feature flag in prod env to route to Polymet pages.
- Keep the legacy implementation in the repo for at least one deploy window for quick rollback.
- After stabilization, schedule cleanup: delete legacy CSS/components that are no longer used.

### Docker Local Validation Workflow

Goal: validate in a reproducible environment before pushing.

- **Dev stack** (Next + DB + Redis): use `docker-compose.dev.yml`.

  - Expected behavior: runs Prisma push + seed, then `npm run dev` inside container.

- **Tests**: use `docker-compose.test.yml` for a containerized test runner against Postgres.

At minimum, validate:

- Homepage renders and navigation works.
- Waitlist form submission still works.
- Purchase homepage → `/purchase` path still works.
- Token pages still render and error boundaries work.

### Design System Gaps (Initial List to Review)

Polymet currently provides page-archetype components, but the live site needs additional primitives/patterns:

- **Global site shell**

  - Header / nav (desktop + mobile menu)
  - Logo component (and tagline lockup)

- **Marketing patterns**

  - FAQ accordion component
  - Section layout primitives (containers, max-width patterns)

- **Form primitives**

  - Text input + textarea + validation states
  - Modal/dialog (for the organic homepage waitlist modal)

- **Utilities**

  - Skeleton/loading blocks (Polymet token pack mentions skeletons, but Next uses a separate `Skeleton` component)

- **Next compatibility**
  - Router-agnostic Link pattern (needed for Footer and any DS component using navigation)

### Open Questions / Decisions Needed

- Should the Next app move to React 19, or should DS move down to React 18?
- Do you want the Polymet “page archetypes” to become the canonical homepage/purchase page layout, or are we keeping the current content structure and only swapping primitives?
- Are we OK using a single env flag for hot cut + rollback, or do you want an explicit preview route (e.g. `/preview-homepage`) as well?

### Follow-ups (from review) — Recommended Defaults

These are the defaults I recommend so we can start implementation immediately; override as desired.

1. **React version alignment (recommendation)**

   - **Default**: keep the Next app on React 18 and align the design system to React 18.
   - **Rationale**: minimizes risk for a hot cut (fewer dependency incompatibilities and fewer unknown runtime changes).
   - **Alternative**: upgrade app to React 19 (likely fine on Next 15), but should be treated as a separate risk bucket with a focused QA pass.

2. **Landing Page v9 spec vs Polymet migration (recommendation)**

   - **Default**: Landing Page v9 is part of the migration: implement the v9 target UI using Polymet/tokens.
   - **Rationale**: otherwise we build (and maintain) two UI systems in parallel (landing v9 components vs Polymet).

3. **Token unification (recommendation)**
   - **Default**: Option A (simple): source tokens from the DS export pack and inject them at the app root.
   - **Rationale**: fastest path to a single source of truth; build-time generation (Option B) can be added later if we want hard guarantees.

### Tailwind v4 Compatibility Notes (current state)

- App uses **Tailwind v4**.
- `design-system/` prototype uses **Tailwind v3** + `tailwindcss-animate` plugin.
- Polymet components themselves are mostly built from:
  - Standard Tailwind utilities (flex/layout/spacing), and
  - Arbitrary values that reference CSS variables (e.g. `bg-[var(--color-bg-canvas)]`).
- Risk areas to resolve before importing Polymet into the app:
  - Any reliance on `tailwindcss-animate` (or custom keyframes) should be explicitly ported into the app’s Tailwind config if needed.
  - Ensure Tailwind content scanning includes `design-system/src/polymet/**/*` so utility classes used there are generated.

### Mechanical Integration (concrete)

Goal: import Polymet components into Next without rewriting imports all over the DS.

- Add `tsconfig.json` path mappings to support DS-style imports inside Next:
  - `@/polymet/*` -> `design-system/src/polymet/*`
- Add Tailwind content paths:
  - `./design-system/src/polymet/**/*.{ts,tsx}`
- Fix router coupling:
  - Today `CTABlock`, `SecondaryButton`, and `Footer` use `react-router-dom` `Link`.
  - Make them use either:
    - `<a href>` (recommended default; simplest + Next-compatible), or
    - a small `LinkComponent` injection pattern.

### Feature Flag Scope (recommendation)

- **Default**: routing-level flag.
  - Same routes (`/`, `/purchase`, `/landing/[token]`, `/about`, `/legal/*`) but they render either legacy implementation or Polymet implementation.
  - **Pros**: simplest rollback; less “mixed UI” risk.
  - **Cons**: temporary duplication of page-level wiring.

### Phase -1 (Stabilization) — Current Work In Progress

Local working tree currently includes changes in:

- `app/landing/[token]/LandingPageClient.tsx`
- `components/landing/*` (Hero/Hook/Value/CTA/FAQ/MobileStickyCTA)
- `lib/landing/*`

Recommendation:

- Decide whether those changes are:
  - **(A)** “Landing Page v9” work we should finish and commit on a clean branch before starting Polymet integration, or
  - **(B)** intended to be replaced by Polymet immediately.

My default is **(A)**: stabilize/commit landing v9 changes first, then migrate the stabilized UI into Polymet (so we don’t lose work and can compare before/after).

### Phase 0 Acceptance Criteria (more explicit)

- `tsconfig.json` supports `@/polymet/*` imports from `design-system/src/polymet/*`.
- `tailwind.config.ts` content scanning includes Polymet sources.
- Router-agnostic links:
  - `CTABlock`, `SecondaryButton`, `Footer` no longer depend on `react-router-dom`.
- Tokens are sourced from DS in one place (root injection) and legacy duplicated token sources are either removed or clearly designated “temporary”.
- A single smoke route or page branch renders at least one Polymet component in Next.

### Component Mapping Table (initial)

This is a starting point for identifying gaps and minimizing new component surface area.

| Current (site)                            | Closest Polymet               | Status / Notes                                                                             |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `components/landing/HeroSection`          | `ProblemHeader` (partial)     | Likely needs a dedicated Polymet `Hero` / marketing header component.                      |
| `components/landing/HookSection`          | `AssessmentSummary` (partial) | Copy is different; may need a Polymet “ImpactSummary” component.                           |
| `components/landing/ValueSection`         | `ValueProposition`            | Partial match; confirm layout + content requirements.                                      |
| `components/landing/CTASection`           | `CTABlock`                    | Close, but pricing/guarantee/checkout states likely require extension.                     |
| `components/landing/FAQSection`           | (none)                        | **Gap**: needs Accordion/FAQ component in DS.                                              |
| `components/landing/MobileStickyCTA`      | (none)                        | **Gap**: needs sticky CTA pattern in DS.                                                   |
| `components/legal/LegalPageLayout`        | `Footer` (partial)            | DS footer exists, but header/nav is a **gap**.                                             |
| `components/Button` / `Card` / `Skeleton` | (none)                        | **Gap**: DS should expose primitives or we should rewrite pages to only use DS components. |

---

## Landing Page v10 Implementation Notes (2025-12-30)

### Overview

Major refactor of the landing page (`/landing/[token]`) focusing on:

1. **Layout redesign** - Bento box layouts, rationalized spacing
2. **Token & data consistency** - JWT tokens with `runId` for consistent data across email/LP/report

### Layout Changes

#### Spacing Rationalization

- **Before**: Nested `space-y-*` classes causing compounding (e.g., 136px instead of 96px)
- **After**: Single `flex flex-col gap-*` pattern at each level, no nested spacing

```tsx
// Parent controls all section gaps
<div className="flex flex-col gap-20 min-[800px]:gap-24">
  <HeroSection /> {/* NO external margin/padding */}
  <ValueSection /> {/* NO external margin/padding */}
  <CTASection /> {/* NO external margin/padding */}
</div>
```

#### Hero Section (`components/landing/HeroSection.tsx`)

- Flipped layout: Screenshot (1/3 left) + H1 (2/3 right) using `grid-cols-[1fr_2fr]`
- Added `score` prop for hero text
- New copy: "We assessed {company}'s website using tools that top companies like Google use. Your site scores {score}/100..."
- Desktop CTA hidden on mobile (sticky CTA handles it)

#### Bento Layout in Main Content

```
┌────────────────────────────────────────────────────────┐
│ "What's in your report" (full width header)            │
├─────────────────────────────────┬──────────────────────┤
│ Value bullets (2/3)             │ Issue card (1/3)     │
├─────────────────────────────────┴──────────────────────┤
│ "We estimate you're leaving $X-$Y on the table" (full) │
├────────────────────────────────────────────────────────┤
│ CTA button (centered)                                  │
└────────────────────────────────────────────────────────┘
```

#### CTA Section (`components/landing/CTASection.tsx`)

- Redesigned as bento layout:
  - Left column: "Your report for {company}" + 4 bullets
  - Right column: Differentiator text
  - Full width: Guarantee card
  - Centered: CTA button + "Checkout with Stripe • Delivered in minutes"

#### ValueSection (`components/landing/ValueSection.tsx`)

- Added `hideHeader` prop to render header separately in bento layout
- Changed internal spacing from `space-y-*` to `flex flex-col gap-*`

#### Removed

- "Why Trust Us" section (content moved/consolidated)
- Separate hr/divider elements (flat structure now)
- `order-*` classes for mobile (natural order works for both)

### Token & Data Consistency (ADR-P15)

**Problem**: Email, LP, and report could show different data if they queried different pipeline runs.

**Solution**: JWT tokens now include both `leadId` AND `runId`:

```typescript
// Token payload
{
  leadId: "3093",
  runId: "lead_3093_batch_20251227_013442_191569fa",
  aud: "landing",
  scope: "view",
  ...
}
```

**Files Changed**:

| File                             | Change                                              |
| -------------------------------- | --------------------------------------------------- |
| `lib/purchase/index.ts`          | Replaced stub with real JWT validation using `jose` |
| `lib/landing/context.ts`         | All queries now filter by single `targetRunId`      |
| `email_routes.py` (LeadShop)     | Added `construct_landing_url()` function            |
| `scripts/gen_purchase_token.mjs` | Updated to generate landing + purchase tokens       |

**Data Sources (all filtered by same run_id)**:

| Data                          | Table                               | Run ID Column          |
| ----------------------------- | ----------------------------------- | ---------------------- |
| Overall score                 | `lead_scores`                       | `run_id_str`           |
| Impact range                  | `phaseb_journey_context`            | `run_id`               |
| Friction points / issue count | `phaseb_journey_context`            | `run_id`               |
| Catalog hook text             | `CATALOG_HOOKS[topFrictionPointId]` | (derived from Phase B) |
| Screenshots                   | `assessment_results`                | `run_id`               |

### Mobile Sticky CTA

- Now observes `#main-cta-button` instead of whole CTA section
- Appears when hero leaves viewport
- Hides when main CTA button is visible

### Files Modified (anthrasite-clean)

```
app/landing/[token]/LandingPageClient.tsx
app/landing/[token]/page.tsx
components/landing/HeroSection.tsx
components/landing/CTASection.tsx
components/landing/ValueSection.tsx
components/landing/MobileStickyCTA.tsx
lib/landing/context.ts
lib/purchase/index.ts
scripts/gen_purchase_token.mjs
docs/adr/ADR-P15-Landing-Page-Token-And-Run-Consistency.md (NEW)
```

### Files Modified (LeadShop-v3-clean)

```
src/leadshop/api/email_routes.py  # Added construct_landing_url()
```

### Testing Notes

- Dev tokens (`/landing/3093`) still work but fall back to latest run
- Production tokens must be generated with explicit `run_id` via `construct_landing_url()`
- To generate test tokens: `node scripts/gen_purchase_token.mjs`

### Next Steps

- [ ] Update email templates to use `construct_landing_url()` instead of hardcoded URLs
- [ ] Verify Phase B context structure for all leads (impact_range field location)
- [ ] Consider adding `run_id` to checkout session for report generation consistency
- [ ] Mobile viewport testing on real devices
