# Anthrasite.io Payment Site - Project Dashboard (v1.0)

- **Total Effort (Estimated)**: 155 Story Points
- **Completed Points**: 61 Points
- **Remaining Points**: 94 Points
- **Estimated Completion**: ~10 Workdays

---

# GTM Backlog (Open)

This section lists all launch-critical issues for the Anthrasite.io payment site.

### EPIC G - Codebase Cleanup & Build Stabilization - (21 pts)

**Goal:** Aggressively refactor the codebase, fix critical build issues, and establish a clean, stable baseline for future development.

- **G1 (21 pts)**: Combined task including initial codebase cleanup (G1), fixing critical build hangs (G2), and archiving unused features (G3).
- **Status**: `CLOSED`
- **Commit**: `30835ed`
- **Checklist**:
  - [x] 0. Pre-flight: Create safety branch and golden path smoke test.
  - [x] 1. Archive: Move non-essential files to a tracked `_archive` directory.
  - [x] 2. Validate & Fix: Run `typecheck`, `build`, and `test:e2e` in a loop until the smoke test passes.
  - [x] 3. Evidence: Provide passing test logs, git status, and final file tree.
  - [x] 4. Guardrails: Added environment checks and a `@smoke` test suite to CI before merging.

### EPIC A — Embedded Payments (Stripe) — 12 pts

**Goal:** On-page payment; branded receipts; robust tests.
**Status**: `CLOSED` - All implementation work is complete as of 2025-10-10.

- **A1 (2 pts)**: Wire Payment Element to /purchase; idempotent PaymentIntent API with tier support
- **Status**: `CLOSED`
- **A2 (2 pts)**: PRICE_TIERS config (basic=$399, pro=$699) with unit tests
- **Status**: `CLOSED`
- **A3 (2 pts)**: Stripe receipts + business identity (manual Dashboard config)
- **Status**: `CLOSED`
- **A4 (1 pt)**: Feature flag enforcement (UI + API gating)
- **Status**: `CLOSED`
- **A5 (5 pts)**: E2E iframe tests (happy path + decline) with CI parity
- **Status**: `CLOSED`

### EPIC B — UTM & Business Onboarding — 8 pts

**Goal:** Personalized purchase from cold email; admin can seed data.

- **B1 (3 pts)**: Production UTM generator (admin-only)
- **B2 (3 pts)**: Business creation (admin)
- **B3 (2 pts)**: Page personalization & safe failure states

### EPIC C — Webhook → LeadShop Bridge & Orchestration — 10 pts

**Goal:** Durable payment→workflow pipeline, idempotent and observable.

- **C1 (3 pts)**: Public Stripe webhook listener (Anthrasite.io)
- **C2 (4 pts)**: Managed queue bridge
- **C3 (3 pts)**: Temporal kickoff contract

### EPIC D — Report Generation & Delivery — 13 pts

**Goal:** Deterministic PDF + emailed attachment from a robust ESP.

- **D1 (3 pts)**: PDF generation service
- **D2 (2 pts)**: Storage & traceability
- **D3 (3 pts)**: Activate Gmail SMTP Provider in Webhook
- **Status**: `CLOSED`
- **Commit**: `f5a638f`
- **D4 (2 pts)**: Resend & fallback download

### EPIC E — Sales Page & Messaging — 11 pts

**Goal:** Tight sales page; locked email copy; clear post-purchase UX.

- **E1 (3 pts)**: Sales page redesign (final copy/UX)
- **E2 (1 pt)**: Report email subject/body (plain + HTML)
- **E3 (2 pts)**: Success page states
- **E4 (2 pts)**: Pre-launch Site QA
- **E5 (3 pts)**: Delivery Failure Detection

### EPIC F — Ops, Support, Compliance — 40 pts

**Goal:** Safe operations from Day 1, with runbooks and guardrails.

- **F1 (5 pts)**: Idempotency & event log
- **F2 (2 pts)**: Domain/DNS hardening
- **Status**: `CLOSED`
- **F3 (5 pts)**: Monitoring & alerts
- **F4 (3 pts)**: Runbooks
- **F5 (3 pts)**: Refund policy & implementation
- **F6 (13 pts)**: Support Tooling MVP
- **F7 (5 pts)**: Privacy compliance
- **F8 (3 pts)**: Final Production E2E Checkout & Validation
- **F9 (3 pts)**: Secret Management & Env Audit

### EPIC I - Test Suite Hardening - (15 pts)

**Goal:** Achieve a fully green CI by resolving all remaining E2E and unit test failures.

- **I1 (3 pts)**: Fix Consent Modal Visibility (E2E)
- **Status**: `CLOSED`
- **I2 (2 pts)**: Implement Waitlist Validation Logic (E2E)
- **Status**: `CLOSED`
- **I3 (2 pts)**: Fix UTM Cookie Persistence & Expired Route (E2E)
- **Status**: `CLOSED`
- **Commit**: `fc9259a`
- **I4 (2 pts)**: Fix Homepage Component Drift in Tests (Unit)
- **Status**: `CLOSED`
- **Commits**: `7becd48`, `2955eb9`, `3f05f3c`
- **I5 (1 pt)**: Fix Analytics Test Mock (Unit)
- **Status**: `CLOSED`
- **Commit**: `6af616f`
- **I6 (2 pts)**: Fix Client-Side Journey Tests (E2E)
- **Status**: `CLOSED`
- **Commits**: `ebbae60`, `b7e7440`, `4d13fef`
- **I7 (5 pts)**: Address Remaining Skipped Unit Tests
- **Status**: `CLOSED`
- **Commit**: `5d89582`
- **I8 (13 pts)**: EPIC I - Final Cleanup & Deferred Tasks
- **Status**: `CLOSED`
- **Commit**: `57fc0fc1`

### EPIC H - Hardening & CI/CD - (24 pts)

**Goal:** Ensure the repository is secure and the CI/CD pipeline is reliable before public launch.

- **H1 (3 pts)**: Integrate GitGuardian for secret scanning.
- **Status**: `CLOSED`
- **H2 (13 pts)**: Review and update CI/CD to run correct E2E and unit tests.
- **H3 (8 pts)**: (DEFERRED) Refactor testing system for clarity and maintainability.
- **H4 (3 pts)**: Fix Stripe SDK Build-Time Initialization in CI
- **Status**: `IN PROGRESS`

### EPIC Admin UI Overhaul — 15 pts

**Goal:** Build a minimal, stable admin UI for internal testing and demos, focusing on a "Prompt Lab" and fixing existing bugs.

- **Admin UI Overhaul (Epic)** (2 pts): Coordination, QA, and polish for the Admin UI MVP.
- **Fix Existing Admin UI Bugs** (5 pts): Audit and fix known issues in the current Admin UI.
- **"Prompt Lab" UI** (8 pts): Build a minimal UI for testing AI model configurations.

---

# Issue History (Completed)

_(No issues completed for this project yet.)_

---

<details>
<summary>Original Locked Implementation Plan (Preserved for Context)</summary>

# Anthrasite.io Payment Site - LOCKED IMPLEMENTATION PLAN

**Last Updated**: 2025-10-07
**Status**: DECISIONS LOCKED — Ready for Implementation
**Total Effort**: 59 Story Points (~8 days @ 7.4 pts/day)
**Duration**: ~1-2 weeks (working 7 days/week)
**Codebase**: `/Users/charlieirwin/Documents/GitHub/anthrasite.io`

---

# Final Decisions (ADRs)

- **ADR-P01: Payment UX** → **Stripe Payment Element (embedded)**.
- **ADR-P02: Receipts** → Stripe receipts **ON** with **custom sending domain** (brand-aligned).
- **ADR-P03: Website ↔ LeadShop** → **Managed queue bridge** (Vercel → Queue → Mac-mini worker). If the mini is offline, jobs persist.
- **ADR-P04: PDF Engine (MVP)** → **Playwright print-to-PDF** on the Mac mini; revisit DocRaptor once volume/SLAs demand it.
- **ADR-P05: Emailing reports** → **Google Workspace SMTP** (transactional, from our inbox). Build a switchable provider interface for later Postmark/SendGrid.
- **ADR-P06: Pricing** → UTM carries **tier label**, server validates against **allow-listed tier→amount** map.
- **ADR-P07: Deploy split** → **Keep Anthrasite.io and LeadShop as separate projects**; public webhook stays on Anthrasite.io.

---

# Epics & Issues (Implementation-Agnostic)

## EPIC A — Embedded Payments (Stripe) — **10 pts**

**Goal:** On-page payment; branded receipts; robust tests.

### A1 (2 pts): Switch to Payment Element

- **Exists:** Checkout redirect path, purchase page.
- **Do:** Server PaymentIntent endpoint; client renders Element; success page shows "report incoming".
- **Done:** 1 happy-path payment in staging; success copy shown.

### A2 (2 pts): Price tiers (server allowlist)

- **Exists:** UTM validation.
- **Do:** Define `PRICE_TIERS` ; validate UTM tier→amount; snapshot amount on purchase.
- **Done:** Only allow-listed tiers chargeable; mismatch fails safely.

### A3 (2 pts): Stripe receipts + business identity

- **Exists:** —
- **Do:** Enable receipts; set legal entity details; configure custom sender domain.
- **Done:** Test purchase shows branded receipt.

### A4 (1 pt): Feature flag control

- **Exists:** Flag scaffold.
- **Do:** Gate UI + server endpoints.
- **Done:** One switch disables whole flow.

### A5 (3 pts): E2E & failure paths

- **Exists:** —
- **Do:** Tests for success + declined card; webhook retry verified.
- **Done:** Green tests; observed retry succeeds.

---

## EPIC B — UTM & Business Onboarding — **8 pts**

**Goal:** Personalized purchase from cold email; admin can seed data.

### B1 (3 pts): Production UTM generator (admin-only)

- **Exists:** Dev generator; validator lib.
- **Do:** Admin API/UI to mint expiring tokens (businessId, campaign, tier).
- **Done:** Link minting with audit log; expired/used states handled.

### B2 (3 pts): Business creation (admin)

- **Exists:** Business model.
- **Do:** Minimal admin flow to create/update Business (domain, name, email, reportData placeholder).
- **Done:** Seed a Business in <60s.

### B3 (2 pts): Page personalization & safe failure states

- **Exists:** —
- **Do:** Friendly messages for expired/used/missing; support link.
- **Done:** All 3 edge cases verified.

---

## EPIC C — Webhook → LeadShop Bridge & Orchestration — **10 pts**

**Goal:** Durable payment→workflow pipeline, idempotent and observable.

### C1 (3 pts): Public Stripe webhook listener (Anthrasite.io)

- **Exists:** Webhook route.
- **Do:** Signature verify; event dedupe; persist minimal event log.
- **Done:** Double-delivery processed once.

### C2 (4 pts): Managed queue bridge (Option A)

- **Exists:** —
- **Do:** Enqueue `payment_completed` jobs with idempotency key; Mac-mini worker consumes.
- **Done:** Mini offline for 5 min → job still delivers later.

### C3 (3 pts): Temporal kickoff contract

- **Exists:** —
- **Do:** Define payload `{purchaseUid, businessId, email, priceCents, utmId, idempotencyKey}` ; priorities (normal/urgent).
- **Done:** One paid purchase = one workflow; duplicates ignored.

---

## EPIC D — Report Generation & Delivery — **15 pts**

**Goal:** Deterministic PDF + emailed attachment from our Gmail inbox.

### D0 (3 pts): Report template & content design

- **Exists:** Mock `getReportPreview()` generating random scores.
- **Do:** Approve HTML structure/sections (Exec Summary, Scores, Issues, Recs); brand-aligned; define `reportData` JSON schema.
- **Done:** Stakeholder sign-off; renders correctly in browser; max-length fixtures tested.

### D1 (4 pts): PDF generation (Playwright, MVP)

- **Exists:** Playwright infrastructure.
- **Do:** Service boundary `generateReport(businessId) → {pdfBytes, url}` ; page breaks, backgrounds, determinism.
- **Done:** Same input → same PDF; opens on mobile; <30s target.

### D2 (2 pts): Storage & traceability

- **Exists:** S3 bucket.
- **Do:** Persist `reportUrl` on Purchase; `/reports` prefix; correlate IDs in logs.
- **Done:** Ops can fetch any PDF by purchaseUid.

### D3 (4 pts): Gmail SMTP transactional send

- **Exists:** Google Workspace account.
- **Do:** SPF/DKIM/DMARC set; send "report delivery" with PDF attached; provider abstraction for future ESP.
- **Done:** Inbox delivery confirmed across Gmail/Outlook/Yahoo; attachment <10MB; limits documented.

### D4 (2 pts): Resend & fallback download

- **Exists:** —
- **Do:** Admin "Resend"; success page shows download link via expiring URL.
- **Done:** Works; link expires in 24–48h.

---

## EPIC E — Sales Page & Messaging — **6 pts**

**Goal:** Tight sales page; locked email copy; clear post-purchase UX.

### E1 (3 pts): Sales page redesign (final copy/UX)

- **Exists:** Components.
- **Do:** Finalize hero/trust/FAQ; Element placement; legal links; A/B scaffold (off by default).
- **Done:** Approved copy; mobile Lighthouse OK.

### E2 (1 pt): Report email subject/body (plain + HTML)

- **Exists:** —
- **Do:** Concise subject; key findings placeholder; support link; brand footer.
- **Done:** Approved templates in repo.

### E3 (2 pts): Success page states

- **Exists:** Success page shell.
- **Do:** "Within ~5 min" message; 10s polling for status; >15 min fallback support CTA.
- **Done:** State transitions verified.

---

## EPIC F — Ops, Support, Compliance — **10 pts**

**Goal:** Safe operations from Day 1, with runbooks and guardrails.

### F1 (2 pts): Idempotency & event log

- **Exists:** Stripe event ID check.
- **Do:** Unique event store; processed flags; purchase state transitions logged.
- **Done:** Verified with Stripe CLI replays.

### F2 (2 pts): Domain/DNS hardening

- **Exists:** —
- **Do:** SPF/DKIM/DMARC + Stripe sender domain; optional BIMI.
- **Done:** Headers aligned; mail-tester ≥9/10.

### F3 (2 pts): Monitoring & alerts

- **Exists:** Sentry configured.
- **Do:** Alerts for: webhook 5xx bursts; paid-not-enqueued; no PDF in 30m; email failed after retries.
- **Done:** Alerts tested to Slack/admin email.

### F4 (2 pts): Runbooks

- **Exists:** —
- **Do:** Webhook replay; manual regenerate/resend; refund procedure; deliverability triage.
- **Done:** One-pagers in repo.

### F5 (1 pt): Refund policy & implementation

- **Exists:** Webhook handles `charge.refunded` event; `Purchase.status` field.
- **Do:** 30-day policy; admin refund trigger; customer notification; reason capture.
- **Done:** Tested end-to-end with Stripe test refund; policy live at `/legal/refunds` .

### F6 (1 pt): Support tooling (MVP)

- **Exists:** —
- **Do:** Admin view for purchase status, email logs, "Resend report", manual PDF trigger.
- **Done:** Operator can resolve "I paid but didn't get it" in <2min.

### F7 (2 pts - OPTIONAL): Privacy compliance

- **Exists:** Generic terms/privacy pages.
- **Do:** Update privacy policy; retention; export/delete request flow; GDPR deletion endpoint.
- **Done:** Pages published; process documented.

---

## Points & Sequence (Realistic)

**Totals:** A10 + B8 + C10 + D15 + E6 + F10 = **59 pts** (~8 days)

**Sequence:**

- **Days 1–2:** B1, B2, A1, A2, A4, D0
- **Days 3–4:** C1, C2, C3, D1, D2, A3, A5
- **Days 5–6:** D3, D4, E1, E2, E3, F1, F2
- **Days 7–8:** F3, F4, F5, F6 (+ F7 if needed), UAT, soft launch

---

## What's "In Place" vs "To Build"

### Already Built:

- Purchase page scaffolding
- Checkout redirect variant (to be superseded by Payment Element)
- Webhook route with signature verification
- Prisma models (Business, Purchase, UtmToken)
- SendGrid stub (unused - will use Gmail SMTP)
- Playwright infrastructure
- UTM validation lib
- Success page shell
- Feature flag scaffold
- Dev UTM generator (`/api/generate-test-hash` )
- Test harness and dev routes

### To Build/Finish:

- Payment Element endpoints & UI
- Price-tier allowlist
- Stripe receipts branding
- Production UTM generator (admin-only)
- Admin business onboarding UI/API
- Queue bridge (Vercel → Mac mini)
- Temporal kickoff contract
- PDF service (Playwright-based)
- Gmail SMTP send (with provider abstraction)
- Resend/download UX
- Sales copy finalization
- Monitoring/alerts/runbooks
- Refunds UI
- Support view
- Privacy updates (optional)

---

## Architecture Flow (Final)

```
┌─────────────────────────────────────────────────────────────────┐
│ CUSTOMER JOURNEY                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Email with UTM link → Anthrasite.io purchase page           │
│  2. Stripe Payment Element (embedded) → Payment                  │
│  3. Webhook → Anthrasite DB + Queue → Mac mini worker           │
│  4. Temporal workflow → PDF generation → Gmail SMTP              │
│  5. Customer receives report email with PDF attachment           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE TOPOLOGY                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Vercel (Anthrasite.io)                                          │
│    ├─ Public-facing purchase page                                │
│    ├─ Stripe webhook listener                                    │
│    ├─ PostgreSQL (Business, Purchase, UtmToken)                  │
│    └─ Queue enqueue (SQS/Upstash)                                │
│                                                                   │
│  Mac Mini (LeadShop)                                             │
│    ├─ Queue consumer worker                                      │
│    ├─ Temporal workflow orchestration                            │
│    ├─ PDF generation (Playwright)                                │
│    ├─ S3 storage (reports)                                       │
│    └─ Gmail SMTP (report delivery)                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Requirements

### Stripe (Production Keys Needed)

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Google Workspace SMTP

```env
GMAIL_SMTP_HOST="smtp.gmail.com"
GMAIL_SMTP_PORT="587"
GMAIL_SMTP_USER="reports@anthrasite.io"
GMAIL_SMTP_PASSWORD="<app-specific password>"
```

### Queue (SQS/Upstash)

```env
QUEUE_URL="https://sqs.us-east-1.amazonaws.com/..."
# OR
UPSTASH_REDIS_URL="..."
```

### Feature Flags

```env
NEXT_PUBLIC_FF_PURCHASE_ENABLED="true"
```

---

## Quick Start (Development)

### Start Dev Server

```bash
cd /Users/charlieirwin/Documents/GitHub/anthrasite.io
pkill -f "next dev"
npm run dev
```

### Access Points

1. **Dev route** (bypasses middleware):

   ```
   http://localhost:3333/dev/purchase
   ```

2. **With UTM token**:

   ```
   http://localhost:3333/purchase?utm={token}
   ```

3. **Test harness**:
   ```
   http://localhost:3333/test-harness
   ```

### Generate Test Token

```bash
curl http://localhost:3333/api/generate-test-hash \
  -H "Authorization: Bearer dev-admin-key-123" \
  -H "Content-Type: application/json" \
  -d '{"businessId": "550e8400-e29b-41d4-a716-446655440000"}'
```

---

## Key File Locations

### Purchase Flow

- `app/purchase/page.tsx` - Main purchase page
- `app/purchase/success/page.tsx` - Success confirmation
- `components/purchase/` - All purchase components

### Stripe

- `lib/stripe/checkout.ts` - Session creation
- `lib/stripe/config.ts` - Stripe configuration
- `app/api/webhooks/stripe/route.ts` - Webhook handler

### Business Logic

- `lib/purchase/purchase-service.ts` - Main service layer
- `lib/utm/crypto.ts` - Token validation

### Database

- `prisma/schema.prisma` - Full schema
- `prisma/seed.ts` - Seed data

---

## Notes

- **Hosting Decision**: Keep LeadShop on Mac mini for batch compute; public webhook on Anthrasite.io (Vercel) with managed queue bridge for durability.
- **Email Strategy**: Start with Gmail SMTP (500/day limit), build switchable provider interface for future Postmark/SendGrid migration.
- **PDF Strategy**: Start with Playwright (already available), migrate to DocRaptor if volume/SLAs demand it.
- **Database Strategy**: Minimal duplication - store references to LeadShop data, not full copies.

---

## Open Questions (RESOLVED)

All critical decisions have been locked in via ADRs P01-P07. No blocking questions remain.

</details>
