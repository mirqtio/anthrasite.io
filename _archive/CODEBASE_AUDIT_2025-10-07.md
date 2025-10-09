# Codebase Audit - Anthrasite.io
**Date:** 2025-10-07
**Purpose:** Inventory for G1 cleanup decisions (Keep/Archive/Delete)

---

## A. Route & API Inventory

### Route Map

| Route Path | File Path | Dynamic Export | Client Component | Has generateMetadata | Has generateStaticParams | Imports Payment/Stripe | Imports Analytics | Imports Server-Only | Recommendation |
|------------|-----------|----------------|------------------|---------------------|--------------------------|------------------------|-------------------|---------------------|----------------|
| / | app/page.tsx | force-dynamic | Yes | No | No | No | No | No | **KEEP** |
| /about | app/about/page.tsx | | Yes | No | No | No | No | No | **KEEP** |
| /legal | app/legal/page.tsx | | Yes | No | No | Yes | Yes | No | **KEEP** |
| /purchase | app/purchase/page.tsx | force-dynamic | No | No | No | Yes | Yes | No | **KEEP** |
| /purchase/success | app/purchase/success/page.tsx | | Yes | No | No | Yes | Yes | No | **KEEP** |
| /purchase-preview | app/purchase-preview/page.tsx | force-dynamic | Yes | No | No | Yes | Yes | No | **KEEP** (temp) |
| /dev/purchase | app/dev/purchase/page.tsx | | Yes | No | No | Yes | No | No | **KEEP** (dev-guarded) |
| /link-expired | app/link-expired/page.tsx | force-dynamic | Yes | No | No | No | No | No | **ARCHIVE** |

**Summary:** 8 total routes, 7 KEEP, 1 ARCHIVE candidate

---

### API Route Map

| API Path | File Path | Inbound References | Reads Stripe Env | Reads SendGrid Env | Reads DB | Recommendation |
|----------|-----------|-------------------|------------------|-------------------|----------|----------------|
| /admin/generate-utm | app/api/admin/generate-utm/route.ts | 0 | No | No | No | **KEEP** (admin, guarded) |
| /checkout/session | app/api/checkout/session/route.ts | 1 | Yes | No | Yes | **KEEP** (core payment) |
| /generate-test-hash | app/api/generate-test-hash/route.ts | 0 | No | No | No | **KEEP** (dev) |
| /health | app/api/health/route.ts | 0 | No | No | Yes | **KEEP** (monitoring) |
| /validate-utm | app/api/validate-utm/route.ts | 0 | No | No | Yes | **KEEP** (utm validation) |
| /waitlist | app/api/waitlist/route.ts | 3 | No | No | No | **REVIEW** (waitlist live?) |
| /waitlist/validate-domain | app/api/waitlist/validate-domain/route.ts | 3 | No | No | No | **REVIEW** (waitlist live?) |
| /webhooks/stripe | app/api/webhooks/stripe/route.ts | 0 | Yes | No | Yes | **KEEP** (core payment) |

**Summary:** 8 total APIs, 6 KEEP, 2 REVIEW (waitlist status TBD)

---

### Middleware Analysis

**File:** `middleware.ts`

**Imports:**
- `@/lib/utm/crypto` - UTM validation (server-only crypto)
- `@/lib/ab-testing/middleware` - A/B test assignment
- Next.js standard imports (NextRequest, NextResponse)

**Functionality:**
- UTM validation for protected paths (/purchase, /checkout)
- A/B test cookie assignment
- Security headers (CSP, X-Frame-Options, etc.)
- Public path bypasses for /api, /_next, /dev, /purchase-preview

**Heavy Operations:** None - simple header manipulation and cookie reads
**Refactor Needed:** No - appropriate for edge middleware

---

## B. Dependency Graph & Dead Code

### Component Use Graph (Top 30)

| Component Path | Import Count | Archive Candidate |
|----------------|--------------|-------------------|
| components/Button/Button.tsx | 13 | No |
| components/Card/Card.tsx | 12 | No |
| components/Logo.tsx | 10 | No |
| components/ErrorBoundary.tsx | 7 | No |
| components/Skeleton/Skeleton.tsx | 4 | No |
| components/analytics/FunnelVisualization.tsx | 3 | No |
| components/consent/ConsentBanner.tsx | 3 | No |
| components/consent/ConsentPreferences.tsx | 3 | No |
| components/help/HelpWidget.tsx | 6 | No |
| components/purchase/PricingCard.tsx | 3 | No |
| **components/analytics/ABTestResults.tsx** | **0** | **YES** |

**Archive Candidates (0 imports):**
- `components/analytics/ABTestResults.tsx`

---

### Lib Module Use Graph (Top 40)

| Module Path | Import Count | Server-Only | Archive Candidate |
|-------------|--------------|-------------|-------------------|
| lib/analytics/analytics-client.ts | 7 | No | No |
| lib/analytics/analytics-server.ts | 3 | Yes | No |
| lib/db.ts | 12 | Yes | No |
| lib/stripe/client.ts | (via barrel) | No | No |
| **lib/abandoned-cart/analytics.ts** | **0** | **Yes** | **YES** |
| **lib/abandoned-cart/index.ts** | **0** | **No** | **YES** |
| **lib/abandoned-cart/tracker.ts** | **0** | **Yes** | **YES** |
| **lib/analytics/event-schemas.ts** | **0** | **No** | **YES** |
| **lib/analytics/providers/ga4.ts** | **0** | **No** | **YES** |
| **lib/analytics/providers/hotjar.ts** | **0** | **No** | **YES** |
| **lib/analytics/providers/posthog.ts** | **0** | **No** | **YES** |
| **lib/analytics/types.ts** | **0** | **No** | **YES** |
| **lib/context/SiteModeProviderClient.tsx** | **0** | **No** | **YES** |
| **lib/db/queries.ts** | **0** | **Yes** | **YES** |
| **lib/design-system/animations.ts** | **0** | **No** | **YES** |
| **lib/email/config.ts** | **0** | **Yes** | **YES** |
| **lib/email/index.ts** | **0** | **No** | **YES** |
| **lib/email/queue.ts** | **0** | **Yes** | **YES** |
| **lib/email/templates/cartRecovery.ts** | **0** | **No** | **YES** |
| **lib/email/templates/orderConfirmation.ts** | **0** | **No** | **YES** |
| **lib/email/templates/reportReady.ts** | **0** | **No** | **YES** |
| **lib/email/templates/welcomeEmail.ts** | **0** | **No** | **YES** |
| **lib/email/types.ts** | **0** | **No** | **YES** |
| **lib/help/content.ts** | **0** | **No** | **YES** |
| **lib/monitoring/alerts.ts** | **0** | **Yes** | **YES** |

**Archive Candidates (0 imports):** 24 modules total

---

### Asset Use Map

| Asset Path | Size | References in Code | Over 300KB |
|------------|------|-------------------|------------|
| public/logo_full_black.svg | 5.6K | 0 | No |
| public/logo_full_white.svg | 5.1K | 1 | No |
| public/test.html | 306B | 0 | No |

**Archive Candidates:**
- `public/logo_full_black.svg` (0 references)
- `public/test.html` (0 references)

**Large Assets:** None over 300KB

---

### Fonts & CSS

**Font Usage:**
- `next/font/google` - Used in `app/layout.tsx` for Inter font
- **Location:** Root layout only (correct - no build-time imports elsewhere)
- **Local Fallback:** Yes (system font stack in tailwind.config)

**CSS:**
- Tailwind CSS (v4.1.10) - Configured via `tailwind.config.ts`
- Global styles in `app/globals.css`
- No CSS-in-JS libraries detected

---

## C. Payments, Webhooks, Email

### Stripe Integration Paths

**Payment Intent Creation:**
- **File:** `app/api/checkout/session/route.ts:46`
- **Method:** `stripe.checkout.sessions.create()`
- **API Version:** `2025-05-28.basil`
- **Guard:** UTM validation required

**Webhook Handler:**
- **File:** `app/api/webhooks/stripe/route.ts`
- **Events Handled:**
  - `checkout.session.completed` (creates Purchase record)
  - `payment_intent.payment_failed` (updates Purchase status)
  - `charge.refunded` (records refund in metadata)
- **API Version:** `2025-05-28.basil`
- **Guard:** Webhook signature verification via `STRIPE_WEBHOOK_SECRET`

**Stripe Environment Variables:**

| Variable | Referenced In | Purpose |
|----------|---------------|---------|
| STRIPE_SECRET_KEY | app/api/checkout/session/route.ts, app/api/webhooks/stripe/route.ts, lib/stripe/config.ts | Server-side Stripe SDK |
| STRIPE_WEBHOOK_SECRET | app/api/webhooks/stripe/route.ts, lib/stripe/config.ts | Webhook signature verification |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | lib/stripe/client.ts | Client-side Stripe.js |

**✅ Single Source of Truth:** Only 1 checkout creation path, 1 webhook handler
**✅ No Leaked Keys:** All Stripe envs properly guarded (server-only or NEXT_PUBLIC_)

---

### Email Paths

| File | Function | Provider | Status |
|------|----------|----------|--------|
| lib/email/gmail.ts | sendEmail(), sendPurchaseConfirmation() | **Gmail SMTP** | **Active (G3)** |
| lib/email/sendgrid.ts | sendEmail() | **Error stub** | **Archived (G3)** |
| app/api/webhooks/stripe/route.ts | sendPurchaseConfirmation() call | Gmail SMTP | **Commented out (TODO: D3)** |

**Gmail SMTP Implementation (G3):**
- `nodemailer` package with Gmail SMTP transport
- Used for purchase confirmations (webhook integration pending D3)
- Templates: HTML/text purchase confirmation email built-in
- Required envs: `GMAIL_USER`, `GMAIL_APP_PASSWORD`

**SendGrid Archived (G3):**
- All SendGrid files moved to `_archive/lib/email/` (10 files total)
- `lib/email/sendgrid.ts` replaced with error stub to catch legacy imports
- Templates archived: orderConfirmation, reportReady, welcomeEmail, cartRecovery
- See `_archive/ARCHIVE_INDEX.md` Phase C for restoration instructions

**Current Email Status:**
- ✅ Gmail SMTP provider implemented
- ⚠️ Webhook email calls commented out (D3 integration pending)
- ✅ Error stub prevents silent failures from old imports

---

### UTM & Business Admin

**UTM Minting:**
- **Endpoint:** `/api/admin/generate-utm` (POST)
- **Functions:** `generateUTMToken()`, `createUTMParameter()` from `lib/utm/crypto.ts`
- **Guards:**
  - `x-admin-api-key` header check
  - `ADMIN_API_KEY` env variable
  - Environment check (dev/preview only unless `ALLOW_ADMIN_UTM_GENERATION` set)
- **Inbound References:** 0 (external tool hits this)

**Business Record Creation:**
- **Direct Creation:** None found (webhook creates Purchase records only)
- **Business Model:** Exists in Prisma schema with fields: id, domain, name, email, reportData
- **Usage:** Referenced in checkout/webhook for Purchase.businessId foreign key

**UTM Validation:**
- **Endpoint:** `/api/validate-utm`
- **Middleware:** `middleware.ts` validates UTM on /purchase paths
- **Function:** `validateUTMToken()` from `lib/utm/crypto.ts`

---

## D. Tests & CI

### Test Inventory

| Test File | Has @smoke Tag | Imports Dev Routes | Recommendation |
|-----------|----------------|-------------------|----------------|
| e2e/smoke.spec.ts | **Yes** | Yes | **KEEP** |
| e2e/smoke-marketing.spec.ts | **Yes** | No | **KEEP** |
| e2e/basic.spec.ts | No | No | REVIEW |
| e2e/client-side-rendering.spec.ts | No | Yes | REVIEW |
| e2e/consent.spec.ts | No | Yes | REVIEW |
| e2e/css-loading.spec.ts | No | Yes | REVIEW |
| e2e/full-user-journey.spec.ts | No | Yes | REVIEW |
| e2e/homepage-mode-detection.spec.ts | No | No | REVIEW |
| e2e/homepage-rendering.spec.ts | No | Yes | REVIEW |
| e2e/purchase-flow.spec.ts | No | Yes | REVIEW |
| e2e/purchase.spec.ts | No | Yes | REVIEW |
| e2e/site-mode-context.spec.ts | No | Yes | REVIEW |
| e2e/utm-validation.spec.ts | No | No | REVIEW |
| e2e/waitlist.spec.ts | No | Yes | REVIEW |

**Summary:**
- Total tests: 21
- Smoke tests: 2 (KEEP)
- Non-smoke tests: 19 (REVIEW - many test dev routes or duplicate coverage)

**Archive Candidates:** All non-@smoke tests pending review of coverage overlap

---

### CI/Hook Scripts

**Husky Hooks (Active):**
- `.husky/pre-commit` - Secret scan, lint-staged, typecheck, unit tests
- `.husky/pre-push` - Typecheck, ESLint, **production build**

**GitHub Workflows (17 files):**
| Workflow File | Purpose | Network/Deploy Risk |
|---------------|---------|---------------------|
| basic-ci.yml | Basic CI checks | Low |
| ci.yml | Main CI pipeline | Medium (runs tests) |
| ci-docker.sh | Local CI simulation | None (local only) |
| complete-e2e-success.yml | Full E2E suite | High (boots app) |
| comprehensive-e2e.yml | Comprehensive E2E | High (boots app) |
| deployment-check.yml | Pre-deploy validation | Medium |
| e2e-phase1.yml through e2e-phase6.yml | **Phased E2E (6 files)** | **High (boots app)** |
| secrets-check.yml | Secret scanning | None |
| smoke-visual.yml | Visual regression | High (boots app) |
| vercel-deploy-check.yml | Vercel deployment | **High (deploys)** |
| visual-regression.yml | Visual regression | High (boots app) |

**Scripts Directory (26 files):**
- `check-secrets.sh` - **Active in pre-commit** (local only)
- `dev-server.sh` - Dev server launcher (local only)
- `run-ci-*.sh` (5 files) - Local CI simulation (safe)
- `test-*.sh` (3 files) - Local test runners (safe)
- `fix-*.sh` (8 files) - Test fix scripts (archive candidates - one-time use)

**Archive Candidates:**
- All `e2e-phase*.yml` workflows (superseded by main ci.yml + smoke tests)
- `fix-*.sh` scripts (8 files - one-time test fixes)
- Duplicate CI workflows (keep ci.yml, basic-ci.yml, secrets-check.yml only)

**Network/Push Risk Assessment:**
- **Secrets-check.yml:** ✅ Safe (local scans only)
- **Pre-commit hook:** ✅ Safe (local checks only)
- **Pre-push hook:** ✅ Safe (local build only, no deploy)
- **CI workflows:** ⚠️ Boot app but don't auto-deploy
- **Vercel workflows:** ⚠️ May trigger deploys (review before keeping)

---

## Final Keep/Archive/Delete Manifest

### KEEP (Core Production)

**Routes (7):**
- `/` (homepage)
- `/about`
- `/legal`
- `/purchase`
- `/purchase/success`
- `/purchase-preview` (temporary - mark for removal after testing)
- `/dev/purchase` (dev-guarded)

**APIs (6):**
- `/api/admin/generate-utm` (admin, guarded)
- `/api/checkout/session` (core payment)
- `/api/generate-test-hash` (dev utility)
- `/api/health` (monitoring)
- `/api/validate-utm` (core validation)
- `/api/webhooks/stripe` (core payment)

**Components (High Usage):**
- All components with >3 imports (15 total)
- Logo, Button, Card, ErrorBoundary, Skeleton, etc.

**Lib Modules (Core):**
- `lib/analytics/analytics-client.ts`
- `lib/analytics/analytics-server.ts`
- `lib/db.ts`
- `lib/stripe/*` (all files)
- `lib/utm/crypto.ts`
- `lib/email/email-service.ts`
- `lib/email/sendgrid.ts`
- `lib/context/ConsentContext.tsx`
- `lib/context/SiteModeContext.tsx`

**Tests:**
- `e2e/smoke.spec.ts`
- `e2e/smoke-marketing.spec.ts`

**CI/Hooks:**
- `.husky/pre-commit`
- `.husky/pre-push`
- `scripts/check-secrets.sh`
- `scripts/dev-server.sh`
- `.github/workflows/ci.yml`
- `.github/workflows/basic-ci.yml`
- `.github/workflows/secrets-check.yml`

---

### REVIEW (Awaiting Decision)

**Routes:**
- `/link-expired` (2 references, low traffic?)

**APIs:**
- `/api/waitlist` (3 references - is waitlist feature live?)
- `/api/waitlist/validate-domain` (3 references - is waitlist feature live?)

**Tests:**
- All 19 non-smoke E2E tests (evaluate coverage overlap)

---

### ARCHIVE (0 Imports or Superseded)

**Components (1):**
- `components/analytics/ABTestResults.tsx`

**Lib Modules (24):**
- `lib/abandoned-cart/*` (3 files)
- `lib/analytics/event-schemas.ts`
- `lib/analytics/providers/*` (3 files)
- `lib/analytics/types.ts`
- `lib/context/SiteModeProviderClient.tsx`
- `lib/db/queries.ts`
- `lib/design-system/animations.ts`
- `lib/email/config.ts`
- `lib/email/index.ts`
- `lib/email/queue.ts`
- `lib/email/templates/*` (4 files)
- `lib/email/types.ts`
- `lib/help/content.ts`
- `lib/monitoring/alerts.ts`

**Assets (2):**
- `public/logo_full_black.svg`
- `public/test.html`

**Scripts (8):**
- `scripts/fix-*.sh` (8 files)

**CI Workflows (13):**
- `.github/workflows/e2e-phase*.yml` (6 files)
- `.github/workflows/complete-e2e-success.yml`
- `.github/workflows/comprehensive-e2e.yml`
- `.github/workflows/deployment-check.yml`
- `.github/workflows/smoke-visual.yml`
- `.github/workflows/vercel-deploy-check.yml`
- `.github/workflows/visual-regression.yml`

---

## Summary Statistics

| Category | Keep | Review | Archive | Total |
|----------|------|--------|---------|-------|
| Routes | 7 | 1 | 0 | 8 |
| APIs | 6 | 2 | 0 | 8 |
| Components | 15+ | 0 | 1 | 16+ |
| Lib Modules | 15+ | 0 | 24 | 39+ |
| Assets | 1 | 0 | 2 | 3 |
| Tests | 2 | 19 | 0 | 21 |
| CI/Scripts | 6 | 0 | 21 | 27 |

**Total Archive Candidates:** ~48 files/modules

---

## Next Steps

1. **Decision on REVIEW items:**
   - Confirm waitlist feature status → Keep or Archive `/api/waitlist/*`
   - Evaluate `/link-expired` traffic → Keep or Archive
   - Run coverage analysis on 19 non-smoke tests → Keep top 5, Archive rest

2. **Execute Archive:**
   - Move 48 identified items to `_archive/` (reversible)
   - Update `_archive/ARCHIVE_INDEX.md`
   - Run smoke tests to verify no breakage

3. **Post-Archive Validation:**
   - `pnpm build` → Must succeed (20/20 pages)
   - `pnpm test:e2e -g "@smoke"` → Must pass
   - Check bundle sizes (expect reduction)

4. **Create ADR-P08:**
   - Document build-time rules
   - Document archive decisions
   - Set guardrails for future additions
