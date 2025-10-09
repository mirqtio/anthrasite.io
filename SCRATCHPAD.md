# PLAN: I8 - EPIC I - Final Cleanup & Deferred Tasks

**Last Updated**: 2025-10-09
**Status**: `IN_PROGRESS`
**Issue**: `ANT-153` (TBD)
**Commit**: `50182c59`

---

## 1. Goal & Strategy

Achieve a fully green test suite (unit + E2E) and remove the PR quarantine by:

1. **Fix TypeScript Blockers**: ✅ COMPLETE
2. **CI-First Testing**: ✅ COMPLETE (built app config)
3. **Safe Cookie Rollout**: ⏸️ DEFERRED (optional hardening)
4. **Unified Checks**: ✅ COMPLETE (`check:all` script)
5. **CI Consolidation**: 🔄 IN PROGRESS
6. **Evidence-Based Closure**: 🔄 IN PROGRESS

---

## 2. Pre-Flight: Unblock Development ✅ COMPLETE

### Blocker 1: TypeScript Errors ✅ COMPLETE

**Actions Taken**:

1. ✅ Exported `sendPurchaseConfirmationEmail` from `lib/email/index.ts`
2. ✅ Exported `getStripe` function from `lib/stripe/client.tsx`
3. ✅ Fixed import in `app/purchase/success/page.tsx`
4. ✅ Upgraded `@stripe/stripe-js` to v8.0.0
5. ✅ Added `@stripe/react-stripe-js` dependency
6. ✅ Deleted duplicate `app/purchase/success/page 2.tsx`

**Result**: `pnpm typecheck` → 0 errors ✅

### Blocker 2: Package Manager Consistency ✅ COMPLETE

**Action**: Replaced `npm` with `pnpm` in `.husky/pre-commit`

**Result**: Pre-commit hook uses `pnpm` exclusively ✅

### Blocker 3: Missing Scripts ✅ COMPLETE

**Actions**:

- Added `check:all`: `pnpm typecheck && pnpm lint && pnpm test:unit`
- Added `test:unit` alias

**Result**: `pnpm check:all` runs successfully ✅

---

## 3. Core Tasks (I8)

### Task 1: Fix Waitlist Journey Logic ✅ COMPLETE

**File**: `e2e/journeys.spec.ts`

**Verification**: Network assertion already present via `page.waitForResponse(/\/api\/waitlist$/)`

**Status**: No changes needed - test already correct ✅

### Task 2: Fix Purchase Journey Logic ✅ COMPLETE

**File**: `e2e/journeys.spec.ts`

**Actions Taken**:

- ✅ Added console error monitoring
- ✅ Verified UTM token generation via `generateUTMToken()`
- ✅ Assert purchase page elements visible
- ✅ Assert no console errors

**Status**: Test enhanced with error monitoring ✅

### Task 3: Fix Pre-commit Hook Integration ✅ COMPLETE

**Files**: `.husky/pre-commit`, `package.json`

**Actions Taken**:

- ✅ Consolidated checks into `check:all` script
- ✅ Updated pre-commit to use `pnpm check:all`

**Result**: Commit succeeds with all checks passing ✅

### Task 4: Implement `__Host-` Cookie Security ⏸️ DEFERRED

**Rationale**: Optional security hardening; not blocking green CI.

**Status**: Deferred to future epic (can be added post-launch)

### Task 5: Eliminate Dev Server Flakiness ✅ COMPLETE

**File**: `playwright.config.ci.ts`

**Actions Taken**:

- ✅ Changed webServer to `pnpm build && pnpm start -p 3333`
- ✅ Fixed env type safety with proper guards
- ✅ Set retries: 1, trace: 'on-first-retry' (already configured)

**Status**: CI will use production build ✅

---

## 4. Validation Phase ✅ COMPLETE

### Phase 1: Local E2E Test Validation ✅ COMPLETE

**Objective**: Run journey tests locally to identify any failures

**Command**: `pnpm exec playwright test --project=chromium --grep="@journey"`

**Result**: 2 passed (14.1s) ✅

**Tests**:

- ✅ Organic visitor joins waitlist successfully
- ✅ Purchase journey with UTM token

### Phase 2: Fix Any Failures ✅ COMPLETE

**Issues Fixed**:

1. ✅ Waitlist form two-step flow (domain → email)
2. ✅ Added data-testid attributes for stable selectors
3. ✅ Cookie consent banner blocking clicks
4. ✅ Purchase page JWT token parsing for dynamic UTMs
5. ✅ Console error filtering (analytics warnings)
6. ✅ Playwright webServer port configuration (PORT=3333)

**Commit**: `0878dfe1` - "test(e2e): fix journey tests for waitlist and purchase flows"

### Phase 3: Full Local E2E Suite ✅ COMPLETE

**Command**: `pnpm exec playwright test --project=chromium`

**Result**: **61 passed, 4 skipped (1.3m)** ✅

**Skipped Tests** (intentional):

- Help widget interaction (not implemented)
- Visual regression (not critical)
- Domain typo suggestions (future feature)
- Back navigation handling (future feature)

---

## 5. CI Consolidation 🔄 PENDING

### Current State Analysis

**Workflow Count**: 17 files in `.github/workflows/`

**Redundant Workflows**:

- `e2e-phase[1-6].yml` - Phased rollout (no longer needed)
- `e2e-phase2-alt.yml` - Alternative approach
- `complete-e2e-success.yml` - Success marker
- `comprehensive-e2e.yml` vs `ci.yml` - Overlapping

**Action Plan**:

1. Identify canonical CI workflow
2. Archive redundant phase-based workflows
3. Keep: `ci.yml`, `comprehensive-e2e.yml` (nightly), `visual-regression.yml`

**Status**: ⏳ PENDING VALIDATION COMPLETION

---

## 6. Definition of Done (I8)

**Green Policy**:

1. ✅ `pnpm typecheck` → 0 errors
2. ✅ `pnpm lint` → warnings acceptable (not blocking)
3. ✅ `pnpm test:unit` → 0 failing tests
4. ✅ `pnpm test:e2e` (local) → **61 passed, 4 skipped** (1.3m)
5. ⏳ `pnpm test:e2e:ci` → 0 failing tests in CI
6. ✅ Pre-commit hook passes without `--no-verify`

**Evidence Required**:

- ✅ Final Playwright HTML report (local) - `playwright-report/index.html`
- ⏳ JUnit artifacts from CI
- ⏳ 3 consecutive green CI runs

**Policy Change**: Remove E2E quarantine from PRs; require all checks to pass

---

## 7. Progress Summary

### Completed (10/11 tasks)

- ✅ Fix TypeScript errors (4 blockers)
- ✅ Fix package manager consistency
- ✅ Add missing scripts
- ✅ Update pre-commit hooks
- ✅ Fix Playwright CI config
- ✅ Fix waitlist journey test (two-step flow, test IDs, cookie consent)
- ✅ Fix purchase journey test (JWT tokens, console filtering)
- ✅ Fix Playwright webServer configuration (port, env vars)
- ✅ Commit implementation changes (0878dfe1)
- ✅ Validate full E2E suite locally (61/65 passing, 4 intentionally skipped)

### In Progress (1/11 tasks)

- 🔄 Final CI validation (3x green runs)

### Next Action

**Update SCRATCHPAD → Push to CI → Validate 3x green runs**
