# Archive Index - G1 Codebase Cleanup

**Date:** 2025-10-07
**Issue:** G1 - Aggressive codebase cleanup to establish minimal baseline
**Branch:** cleanup/G1
**Tag:** pre-G1 (safety restore point)

---

## Summary

This archive contains files and directories removed during the G1 codebase cleanup to establish a clean, minimal baseline for production development. All items here were non-essential for the core purchase flow and marketing site functionality.

**Total Items Archived:** ~150+ files and directories
**Categories:** Test scripts, analysis reports, screenshots, test routes, debug APIs, duplicate configs

---

## Phase A: Root-Level Cruft (Archived 2025-10-07)

### Test & Debug Scripts (44 files)
**Rationale:** Ad-hoc debugging and testing scripts not part of the standard test suite.

- `test-*.js` (14 files) - One-off test scripts for various features
- `debug-*.js` (3 files) - Debugging utilities
- `check-*.js` (5 files) - Validation scripts
- `capture-*.js` (3 files) - Screenshot/state capture scripts
- `analyze-*.js`, `assess-*.js` (2 files) - Analysis utilities
- `quick-test.js` - Quick test script
- Shell scripts: `verify-*.sh`, `test-docker.sh`, `quick-vercel-check.sh`, `vercel-local-test.sh`

### Analysis & Progress Reports (26 files)
**Rationale:** Historical documentation of past fixes and implementations; not needed for ongoing development.

- `CI_*.md` (9 files) - CI/CD troubleshooting and status reports
- `*_SUMMARY.md` (5 files) - Various feature implementation summaries
- `*_REPORT.md` (4 files) - Test and performance reports
- `PROGRESS.md` - Historical progress tracking
- `MISSION_ACCOMPLISHED.md` - Completion milestone doc
- `DEPLOYMENT_TROUBLESHOOTING.md`, `NETWORK_TROUBLESHOOTING_COMPLETE.md` - Resolved troubleshooting docs
- `HOTJAR_INTEGRATION.md`, `WAITLIST_DATABASE_STATUS.md` - Feature-specific docs
- `CONSENT_BANNER_FIX_SUMMARY.md`, `DESIGN_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md`, `FIX_SUMMARY.md` - Implementation notes
- `E2E_TEST_*.md` (2 files) - E2E test analysis
- `VERCEL_CONFIGURATION.md` - Vercel config notes
- `anthrasite_privacy_policy_terms_of_service.md` - Draft legal content
- `coverage-summary.md` - Test coverage snapshot

### Test Artifacts & Reports (7 files)
**Rationale:** Historical test outputs and performance reports; not needed for active development.

- `lighthouse-report*.json` (3 files) - Lighthouse audit snapshots
- `test_results*.json` (2 files) - Historical test results
- `performance-mobile-report.json` - Mobile performance snapshot
- `visual-test-results.json` - Visual regression results

### Screenshots & Images (31 files)
**Rationale:** Debug screenshots and intermediate design artifacts; brand logos moved to public/.

- `*.png` (31 files) - Debug screenshots, test outputs, homepage captures
- **Note:** Kept `logo_and_tagline.png` (brand asset)

### Logos (6 files)
**Rationale:** Duplicate logo files; canonical versions are in `public/`.

- `logo_full_black.svg`, `logo_full_black 3.svg`, `logo_full_black 4.svg`
- `logo_full_white.svg`
- `logo_small_black.svg`, `logo_small_white.svg`

### Configuration Duplicates (1 file)
**Rationale:** Keeping TypeScript version as source of truth.

- `tailwind.config.js` - Duplicate of `tailwind.config.ts`

### Build & CI Artifacts (3 files)
**Rationale:** CI-specific Docker setup archived for potential future use.

- `Dockerfile.test` - Test environment Docker config
- `docker-compose.ci.yml` - CI Docker Compose
- `playwright.config.ci.ts` - CI-specific Playwright config

### Logs (10+ files)
**Rationale:** Historical logs not needed for development.

- `dev-server.log`, `dev-server-output.log`
- `test_output.log`
- `pre-archive-typecheck.log`

### Husky Duplicates (1 file)
**Rationale:** Backup/duplicate pre-commit hook.

- `.husky/pre-commit 3` → `husky-pre-commit-3`

### Visual Test Suite (1 directory)
**Rationale:** Separate visual regression suite; core E2E tests remain in `e2e/`.

- `visual-tests/` - Visual regression test suite with snapshots

### Screenshots Directory (1 directory)
**Rationale:** Playwright test screenshots; not needed in main repository.

- `screenshots/` - E2E test screenshot artifacts

### Duplicate Files (1 file)
**Rationale:** macOS Finder duplicate causing potential TypeScript issues.

- `lib/db/queries 2.ts` - Duplicate of `lib/db/queries.ts`

---

## Phase B: Test Routes & Debug APIs (Archived 2025-10-07)

### App Test Routes (20 directories)
**Rationale:** Development/debug pages not used in production; cluttering the route structure.

- `app/analytics/` - Analytics testing page
- `app/carbon-test/`, `app/css-test/`, `app/debug-css/`, `app/tailwind-test/`, `app/verify-css/` - CSS/styling test pages
- `app/debug-datadog/`, `app/test-monitoring/` - Monitoring debug pages
- `app/design-test/`, `app/home-test/`, `app/refined-test/`, `app/simple/` - Design iteration pages
- `app/preview-homepage/` - Marketing preview (superseded by main homepage)
- `app/standalone/` - Standalone test page
- `app/test-background/`, `app/test-ga4-events/`, `app/test-harness/`, `app/test-purchase/`, `app/test-simple/`, `app/test/` - Various test pages

### API Debug & Test Routes (9 directories)
**Rationale:** Development/debug endpoints not needed in production.

- `app/api/debug-analytics/`, `app/api/debug-analytics-detailed/`, `app/api/debug-db/`, `app/api/debug-waitlist/` - Debug API endpoints
- `app/api/test-ga4/`, `app/api/test-monitoring/` - Test endpoints
- `app/api/waitlist-old/` - Deprecated waitlist API
- `app/api/sendgrid/` - Unused (using Gmail SMTP per ADR-P05)
- `app/api/cron/` - Unused cron jobs (no active production cron)

---

## What Remains (Production Code)

### Marketing Surface
- `app/page.tsx` - Homepage (dual mode: organic + purchase)
- `app/about/page.tsx` - About page
- `app/legal/page.tsx` - Legal pages
- `app/link-expired/page.tsx` - User-facing error page
- `components/homepage/`, `components/consent/`, `components/help/`, `components/waitlist/`
- `app/api/waitlist/`, `app/api/analytics/`, `app/api/health/`

### Payments Surface
- `app/purchase/page.tsx`, `app/purchase/success/page.tsx`, `app/purchase-preview/page.tsx`
- `app/dev/purchase/page.tsx` (with production guard)
- `components/purchase/`
- `app/api/checkout/`, `app/api/webhooks/`, `app/api/admin/`, `app/api/generate-test-hash/`, `app/api/validate-utm/`, `app/api/stripe/`

### Shared Infrastructure
- `components/` - UI primitives (Button, Card, Input, etc.)
- `lib/` - Services, utilities, database queries
- `middleware.ts`, `app/layout.tsx`, `app/globals.css`
- `prisma/`, `e2e/`, `public/`

---

## Restoration Instructions

If any archived file is needed:

1. **Individual file:** `cp _archive/path/to/file .`
2. **Entire directory:** `cp -r _archive/app/test-harness app/`
3. **Revert all changes:** `git checkout pre-G1`

---

## Notes

- All archived items are tracked in git under `_archive/`
- The `pre-G1` tag marks the state before cleanup
- Production guards added to `app/dev/purchase/` and `app/api/dev/`
- Duplicate `tailwind.config.js` removed; `tailwind.config.ts` is the source of truth
- Smoke tests created: `e2e/smoke.spec.ts` (payments), `e2e/smoke-marketing.spec.ts` (marketing)

---

## Known Issues

**Build Timeout:** TypeScript/Next.js build is timing out (>3 minutes) even after cleanup. This appears to be a pre-existing issue unrelated to the archived files. Investigation needed for:
- Sentry webpack plugin configuration
- TypeScript project references
- Next.js build optimization settings
- Potential circular dependencies in production code

---

## Phase C: G3 Archive + Tighten (Archived 2025-10-07)

**Tag:** pre-G3 (safety restore point)

### CI Workflows (1 file)
**Rationale:** Prevent auto-deploy triggers before GitGuardian protection is in place.

- `.github/workflows/vercel-deploy-check.yml` - Vercel deployment workflow

### Waitlist APIs (2 files)
**Rationale:** Not part of current go-to-market; safe to restore later.

- `app/api/waitlist/route.ts` - Waitlist signup endpoint
- `app/api/waitlist/validate-domain/route.ts` - Domain validation endpoint

**Impact:** 3 inbound references need updating if restored.

### SendGrid Email Provider (10 files)
**Rationale:** SendGrid provider never used in production; replaced with Gmail SMTP (see ADR-P05).

- `lib/email/config.ts` - Email provider configuration
- `lib/email/email-service.ts` - Email service abstraction
- `lib/email/queue.ts` - Email queue management
- `lib/email/types.ts` - Email type definitions
- `lib/email/sendgrid.ts` - SendGrid provider implementation (original)
- `lib/email/templates/cartRecovery.ts` - Cart recovery email template
- `lib/email/templates/orderConfirmation.ts` - Order confirmation template
- `lib/email/templates/reportReady.ts` - Report ready notification template
- `lib/email/templates/welcomeEmail.ts` - Welcome email template

**Replacement:**
- New: `lib/email/gmail.ts` - Gmail SMTP provider implementation (nodemailer)
- New: `lib/email/sendgrid.ts` - Error stub to catch legacy imports

**Total G3 Items Archived:** 13 files

**Restoration:**
- Individual file: `cp _archive/path/to/file .`
- Revert all G3 changes: `git checkout pre-G3`
