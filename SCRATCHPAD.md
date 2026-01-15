# Scratchpad

## Open

- ANT-585 — SEO / performance / accessibility baseline pass

  - https://linear.app/anthrasite/issue/ANT-585/seo-performance-accessibility-baseline-pass

---

# Referral Admin UI — Implementation Plan

**Date:** 2026-01-12
**Status:** Ready for implementation

## Overview

Build a UI in the existing admin portal (`/admin/referrals`) to manage the referral program. This replaces the current CLI scripts (`create-ff-code.ts`, `toggle-code.ts`, etc.) with a proper admin interface.

---

## Data Architecture

### Source of Truth

All values are stored in the database and read by the application at runtime:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin UI                                 │
│                    /admin/referrals                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ writes to
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   referral_codes    │    │   referral_config   │            │
│  │   (per-code)        │    │   (global settings) │            │
│  └──────────┬──────────┘    └──────────┬──────────┘            │
└─────────────┼──────────────────────────┼────────────────────────┘
              │ read by                   │ read by
              ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  • /api/referral/validate → Toast, Pricing Badge                │
│  • /api/checkout/create-session → Stripe discount               │
│  • Stripe webhook → Payout calculation                          │
│  • ShareWidget → Success page messaging                         │
└─────────────────────────────────────────────────────────────────┘
```

### Tables

**`referral_codes`** — Per-code configuration:

- `code`, `tier`, `is_active`
- `discount_type`, `discount_amount_cents`, `discount_percent`
- `reward_type`, `reward_amount_cents`, `reward_percent`, `reward_trigger`
- `max_redemptions`, `redemption_count`
- `max_reward_total_cents`, `total_reward_paid_cents`
- `max_reward_per_period_cents`, `period_reward_paid_cents`, `reward_period_days`
- `company_name`, `notes`, `expires_at`

**`referral_config`** — Global settings:

- `ff_enabled` (boolean)
- `default_standard_discount_cents` (number)
- `default_standard_reward_cents` (number)
- `default_ff_discount_cents` (number)
- `default_affiliate_discount_cents` (number)
- `default_affiliate_reward_percent` (number)

**`referral_conversions`** — Conversion history (read-only in admin):

- Links referrer code to referee sale
- Tracks payout status, amounts, errors

---

## UI Design

### Navigation

Add "Referrals" link to admin layout nav bar:

```tsx
// app/admin/layout.tsx
<Link href="/admin/referrals" className="hover:text-white transition-colors">
  Referrals
</Link>
```

### Route: `/admin/referrals`

Three-tab interface:

#### Tab 1: Codes (Default)

**List View:**

| Code       | Tier           | Status   | Discount | Reward       | Uses | Paid Out   | Created    | Actions       |
| ---------- | -------------- | -------- | -------- | ------------ | ---- | ---------- | ---------- | ------------- |
| ACMECORP   | standard       | Active   | $100     | $100 (first) | 3    | $100       | 2026-01-10 | Edit, Disable |
| FRIENDS100 | friends_family | Active   | $100     | —            | 5/10 | —          | 2026-01-08 | Edit, Disable |
| INFLUENCER | affiliate      | Inactive | $50      | 10%          | 12   | $450/$1000 | 2026-01-05 | Edit, Enable  |

**Features:**

- Filter by: tier (all/standard/ff/affiliate), status (all/active/inactive)
- Search by code
- Sort by: created_at, redemption_count, total_reward_paid
- "Create Code" button → opens modal

**Create Code Modal:**

Step 1: Select tier

- Standard (auto-generated for purchasers)
- Friends & Family (manual seeding)
- Affiliate (recurring rewards)

Step 2: Configure (fields vary by tier)

| Field             | Standard           | F&F               | Affiliate               |
| ----------------- | ------------------ | ----------------- | ----------------------- |
| Code              | Auto or custom     | Required          | Required                |
| Discount Type     | Fixed/Percent      | Fixed/Percent     | Fixed/Percent           |
| Discount Amount   | Default or custom  | Default or custom | Default or custom       |
| Reward Type       | Fixed (first only) | None              | Fixed/Percent           |
| Reward Amount     | Default or custom  | —                 | Required                |
| Max Redemptions   | Optional           | Optional          | Optional                |
| Max Reward Total  | —                  | —                 | Optional                |
| Max Reward/Period | —                  | —                 | Optional                |
| Period (days)     | —                  | —                 | Optional (if above set) |
| Expires At        | Optional           | Optional          | Optional                |
| Notes             | Optional           | Optional          | Optional                |

**Edit Code Slide-out Panel:**

Click a row → slide-out panel with:

- All editable fields
- Read-only: code, tier, created_at, sale_id, lead_id
- Conversion history for this code
- "Save" and "Cancel" buttons

#### Tab 2: Conversions

**List View:**

| Date       | Referrer   | Referee     | Discount | Reward | Payout Status | Refund ID |
| ---------- | ---------- | ----------- | -------- | ------ | ------------- | --------- |
| 2026-01-12 | ACMECORP   | Widgets Inc | $100     | $100   | paid          | re_xxx    |
| 2026-01-11 | FRIENDS100 | Test Co     | $100     | —      | skipped       | —         |
| 2026-01-10 | INFLUENCER | BigCorp     | $50      | $15    | pending       | —         |

**Features:**

- Filter by: payout_status (all/paid/pending/failed/skipped)
- Filter by: referrer code
- Date range picker
- Click row → view full details

#### Tab 3: Settings

Global configuration form:

```
┌─────────────────────────────────────────────────────────────────┐
│ GLOBAL SETTINGS                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Friends & Family Program                                        │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ [Toggle] Enable F&F codes                            ✓ ON  ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Default Values (used when creating new codes)                   │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Standard Discount    [$] [100.00]                          ││
│ │ Standard Reward      [$] [100.00]                          ││
│ │ F&F Discount         [$] [100.00]                          ││
│ │ Affiliate Discount   [$] [100.00]                          ││
│ │ Affiliate Reward     [%] [10]                              ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                            [ Save Settings ]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Codes

```
GET    /api/admin/referrals/codes
       Query: ?tier=&status=&search=&sort=&order=&limit=&offset=
       Returns: { codes: ReferralCode[], total: number }

POST   /api/admin/referrals/codes
       Body: { code?, tier, discount_type, discount_amount_cents?, ... }
       Returns: { code: ReferralCode }
       Side effects: Creates Stripe coupon + promotion code

GET    /api/admin/referrals/codes/[id]
       Returns: { code: ReferralCode, conversions: Conversion[] }

PATCH  /api/admin/referrals/codes/[id]
       Body: { is_active?, max_redemptions?, notes?, ... }
       Returns: { code: ReferralCode }
       Side effects: Updates Stripe promotion code active status

DELETE /api/admin/referrals/codes/[id]
       Returns: { success: true }
       Note: Soft delete (set is_active = false) or hard delete?
```

### Conversions

```
GET    /api/admin/referrals/conversions
       Query: ?code_id=&status=&from=&to=&limit=&offset=
       Returns: { conversions: Conversion[], total: number }

GET    /api/admin/referrals/conversions/[id]
       Returns: { conversion: ConversionDetail }
```

### Config

```
GET    /api/admin/referrals/config
       Returns: { config: Record<string, any> }

PATCH  /api/admin/referrals/config
       Body: { ff_enabled?: boolean, default_standard_discount_cents?: number, ... }
       Returns: { config: Record<string, any> }
```

---

## Implementation Phases

### Phase 1: API Foundation

**Files to create:**

```
app/api/admin/referrals/codes/route.ts          # GET, POST
app/api/admin/referrals/codes/[id]/route.ts     # GET, PATCH, DELETE
app/api/admin/referrals/conversions/route.ts    # GET
app/api/admin/referrals/config/route.ts         # GET, PATCH
lib/admin/referrals/types.ts                    # Shared types
lib/admin/referrals/queries.ts                  # DB queries
```

**Validation:**

- [ ] GET /api/admin/referrals/codes returns list
- [ ] POST creates code + Stripe promo
- [ ] PATCH updates code
- [ ] Config endpoints work

### Phase 2: Codes List UI

**Files to create:**

```
app/admin/referrals/page.tsx                    # Main page with tabs
components/admin/referrals/CodesTable.tsx       # Table component
components/admin/referrals/CodesToolbar.tsx     # Filters + search
components/admin/referrals/CodeStatusBadge.tsx  # Active/Inactive badge
components/admin/referrals/TierBadge.tsx        # Tier indicator
```

**Files to modify:**

```
app/admin/layout.tsx                            # Add nav link
```

**Validation:**

- [ ] Table renders with data
- [ ] Filters work (tier, status)
- [ ] Search works
- [ ] Sorting works

### Phase 3: Create Code Modal

**Files to create:**

```
components/admin/referrals/CreateCodeModal.tsx  # Modal wrapper
components/admin/referrals/CodeForm.tsx         # Form fields
components/admin/referrals/TierSelector.tsx     # Step 1: tier selection
```

**Validation:**

- [ ] Modal opens/closes
- [ ] Tier selection changes form fields
- [ ] Form validates input
- [ ] Submit creates code
- [ ] Success shows new code in list

### Phase 4: Edit Code Panel

**Files to create:**

```
components/admin/referrals/CodeDetailPanel.tsx  # Slide-out panel
components/admin/referrals/CodeEditForm.tsx     # Edit form
components/admin/referrals/CodeConversions.tsx  # Mini conversion list
```

**Validation:**

- [ ] Panel opens on row click
- [ ] Shows all code details
- [ ] Edit form saves changes
- [ ] Toggle active/inactive works
- [ ] Shows conversion history

### Phase 5: Conversions Tab

**Files to create:**

```
components/admin/referrals/ConversionsTable.tsx
components/admin/referrals/ConversionsToolbar.tsx
components/admin/referrals/PayoutStatusBadge.tsx
```

**Validation:**

- [ ] Table renders conversions
- [ ] Filters work
- [ ] Date range picker works
- [ ] Click shows detail

### Phase 6: Settings Tab

**Files to create:**

```
components/admin/referrals/SettingsForm.tsx
```

**Validation:**

- [ ] Form loads current config
- [ ] Toggle F&F works
- [ ] Default values save
- [ ] Changes reflect in new code creation

---

## Bug Fix: ShareWidget Reward Display

**Issue:** `components/referral/ShareWidget.tsx` uses `discountDisplay` for both discount and reward, but these can differ.

**Fix:**

```tsx
// Current (line 56-57):
they'll get {discountDisplay}. When they purchase, you get {discountDisplay} back.

// Fixed:
interface ShareWidgetProps {
  code: string
  discountDisplay: string
  rewardDisplay: string  // NEW
}

// Usage:
they'll get {discountDisplay}. When they purchase, you get {rewardDisplay} back.
```

**Also update:** wherever ShareWidget is rendered to pass `rewardDisplay` from the referral code data.

---

## Security Considerations

1. **Admin auth:** All `/api/admin/referrals/*` endpoints use existing admin auth middleware
2. **Input validation:** Validate all inputs server-side (amounts, codes, etc.)
3. **Stripe sync:** When toggling `is_active`, also update Stripe promotion code `active` status
4. **Audit trail:** Log all admin actions (create, update, disable) with admin user ID

---

## Testing Plan

### Unit Tests

- [ ] `lib/admin/referrals/queries.ts` — query builders
- [ ] API route handlers — input validation

### Integration Tests

- [ ] Create code → verify DB + Stripe promo created
- [ ] Disable code → verify Stripe promo deactivated
- [ ] Update config → verify validation API returns new defaults

### E2E Tests

- [ ] Admin can create F&F code via UI
- [ ] Admin can disable code via UI
- [ ] Admin can update global settings
- [ ] Disabled code rejected at checkout

---

## Open Questions

1. **Hard delete vs soft delete?** Currently leaning toward soft delete (is_active = false) to preserve conversion history.

2. **Audit log?** Should we add an `admin_actions` table to track who changed what?

3. **Bulk operations?** Should the UI support bulk disable/enable?

---

## Definition of Done

- [x] All 6 phases implemented
- [x] ShareWidget bug fixed
- [x] Admin can manage all referral codes without CLI
- [x] Changes in admin UI immediately reflect in customer-facing flows
- [ ] All tests passing

---

## Browser-Based Functional Testing Results

**Date:** 2026-01-12
**Status:** ✅ All tests passed

### Bug Found & Fixed During Testing

**Issue:** Settings form validation error "Expected boolean, received string" for `ff_enabled`

**Root cause:** Config values stored as JSON strings in DB (`"true"` instead of `true`) weren't being parsed on retrieval.

**Fix:** Added JSON.parse in `fetchReferralConfig()`:

```typescript
for (const row of rows) {
  try {
    config[row.key] =
      typeof row.value === 'string' ? JSON.parse(row.value) : row.value
  } catch {
    config[row.key] = row.value
  }
}
```

**Commit:** `cda1ee0 fix(admin): Parse JSON config values from database`

### Test Results Summary

#### Codes Tab

| Feature                 | Status  | Notes                                        |
| ----------------------- | ------- | -------------------------------------------- |
| Toggle Status (Enable)  | ✅ Pass | BROWSERTEST: Inactive → Active               |
| Toggle Status (Disable) | ✅ Pass | Working correctly                            |
| Search filter           | ✅ Pass | `?q=LEAD` filtered correctly                 |
| Tier filter             | ✅ Pass | `?tier=friends_family` filtered correctly    |
| Status filter           | ✅ Pass | `?status=inactive` / `?status=active` worked |
| Column sorting          | ✅ Pass | `?sort=code&order=asc` sorted alphabetically |
| Code Detail Panel       | ✅ Pass | Shows code details, promo URL, Stripe link   |
| Edit code               | ✅ Pass | Added notes to BROWSERTEST                   |
| Soft-delete             | ✅ Pass | Uses Disable button (sets is_active=false)   |

#### Conversions Tab

| Feature       | Status  | Notes                                 |
| ------------- | ------- | ------------------------------------- |
| Code filter   | ✅ Pass | `?codeId=...` filtered by TESTCODE100 |
| Status filter | ✅ Pass | `?status=skipped` filtered correctly  |

#### Settings Tab

| Feature           | Status  | Notes                |
| ----------------- | ------- | -------------------- |
| F&F global toggle | ✅ Pass | Toggle + Save worked |

#### Create Code

| Feature               | Status  | Notes                                      |
| --------------------- | ------- | ------------------------------------------ |
| Create F&F code       | ✅ Pass | BROWSERTEST created                        |
| Create Affiliate code | ✅ Pass | AFFILIATE10 created - 10% reward on EVERY  |
| Create Standard code  | ✅ Pass | STANDARD100 created - $100 reward on FIRST |

### Codes Created During Testing

| Code        | Tier      | Discount | Reward       |
| ----------- | --------- | -------- | ------------ |
| BROWSERTEST | F&F       | $100 off | None         |
| AFFILIATE10 | Affiliate | $100 off | 10% (every)  |
| STANDARD100 | Standard  | $100 off | $100 (first) |

### Commits

1. `7841d09` - feat(admin): Add referral program admin UI (21 files)
2. `cda1ee0` - fix(admin): Parse JSON config values from database (1 file)

---

## ANT-677: UX Copy Rewrite

**Date:** 2026-01-13
**Status:** In progress

### Completed

#### A-F: Component Copy Review

- ShareWidget converted to expandable accordion (grid animation pattern from FAQSection)
- Analytics warnings fixed (added gtag fallback in analytics-client.ts)
- API error messages confirmed - toast handles friendly copy
- Terminology standardized: "referral code" (user), "?promo=" (URL), "promotion code" (Stripe)

#### Report Ready Email - Referral Section

Added conditional referral share section to `lib/email/templates/reportReady.ts`

**New interface field:**

```typescript
referral?: {
  code: string
  shareUrl: string      // e.g., https://www.anthrasite.io/?promo=CODE
  discountDisplay: string  // e.g., "$100 off"
  rewardDisplay: string    // e.g., "$100"
}
```

**Email structure (with referral):**

1. Logo + Tagline
2. Greeting
3. Intro paragraph
4. **First CTA** (Download Your Report)
5. How to Use the Report card
6. What's in the Report card
7. Encouragement text
8. **Referral section** (blue border accent) — "Know someone who'd find this useful?"
9. **Second CTA** (Download Your Report)
10. Agency help + Sign-off

**Preview file:** `email-preview.html` (delete after review)

#### G: Admin Portal Integration

Wired config variables from Settings to CreateCodeModal:

1. `app/admin/referrals/page.tsx` - Fetches config, passes to CodesToolbar
2. `components/admin/referrals/CodesToolbar.tsx` - Accepts config prop, passes to CreateCodeModal
3. `components/admin/referrals/CreateCodeModal.tsx` - Uses config values as form defaults:
   - Initial values when modal opens
   - Tier-specific defaults when user selects a tier type

**Config values now wired:**

- Standard: discount, reward
- F&F: discount
- Affiliate: discount, reward percent

### Commit

```
1508dd4 feat(referrals): Update referral UX copy and wire admin config

- Convert ShareWidget to expandable accordion pattern
- Add gtag fallback to analytics-client for when AnalyticsManager not initialized
- Add referral share section to report ready email template
- Wire admin config values to CreateCodeModal form defaults
- Fix ToasterClient descriptionStyle TypeScript error
```

**Files changed:** 7 files, 401 insertions(+), 225 deletions(-)

**Pushed to:** origin/main (2026-01-13)

### Status: Complete

All sections A-G reviewed, committed, and pushed.
