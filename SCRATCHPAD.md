# PLAN: I8 - EPIC I - Final Cleanup & Deferred Tasks

**Last Updated**: 2025-10-09
**Status**: `IN_PROGRESS`
**Issue**: `ANT-153` (TBD)

---

## 1. Goal & Strategy

Achieve a fully green test suite (unit + E2E) and remove the PR quarantine by:

1. **Fix TypeScript Blockers**: Resolve all type errors preventing builds/commits
2. **CI-First Testing**: Use built app (`pnpm build && pnpm start`) for E2E in CI
3. **Safe Cookie Rollout**: Environment-gated `__Host-` prefix (production only)
4. **Unified Checks**: Single `check:all` script for pre-commit + CI
5. **CI Consolidation**: One canonical workflow (`ci.yml`)
6. **Evidence-Based Closure**: Network assertions, traces, and reports for each task

---

## 2. Pre-Flight: Unblock Development (Must Fix First)

### Blocker 1: TypeScript Errors (4 errors preventing commits)

**Files to fix**:

- `lib/email/index.ts` - Add missing `sendPurchaseConfirmationEmail` export
- `lib/stripe/client.tsx` - Add missing `getStripe` export
- `app/purchase/success/page.tsx` - Fix import of `getStripe`
- `components/purchase/PaymentElementWrapper.tsx` - Resolve Stripe version conflict
- Delete: `app/purchase/success/page 2.tsx` (duplicate file)

**Actions**:

1. Export stub `sendPurchaseConfirmationEmail` from `lib/email/index.ts`
2. Export `getStripe` function from `lib/stripe/client.tsx`
3. Fix import in `app/purchase/success/page.tsx`
4. Pin Stripe version in `package.json` to resolve v7/v8 conflict
5. Delete duplicate success page file

**Acceptance**: `pnpm typecheck` exits with 0 errors

### Blocker 2: Package Manager Consistency

**Files to fix**: `.husky/pre-commit`

**Action**: Replace `npm` with `pnpm` for consistency

**Acceptance**: Pre-commit hook uses `pnpm` exclusively

### Blocker 3: Missing Scripts

**File**: `package.json`

**Action**: Add `check:all` and `test:unit` scripts

**Acceptance**: `pnpm check:all` runs successfully

---

## 3. Core Tasks (I8)

### Task 1: Fix Waitlist Journey Logic

**File**: `e2e/journeys.spec.ts`

**Action**: Assert network call to `/api/waitlist` using `page.waitForResponse()`

**Acceptance**:

- Test passes 2x locally with `--headed`
- Test passes in CI
- HTML report shows successful API request

### Task 2: Fix Purchase Journey Logic

**File**: `e2e/journeys.spec.ts`

**Action**:

- Use `generateUTMToken()` helper
- Assert purchase page elements visible
- No console errors

**Acceptance**:

- Test passes 2x locally
- Test passes in CI
- No console errors logged

### Task 3: Fix Pre-commit Hook Integration

**Files**: `.husky/pre-commit`, CI workflow

**Action**:

- Update pre-commit to use `pnpm check:all`
- Verify CI uses same checks

**Acceptance**:

- Commit succeeds without `--no-verify`
- CI unit job passes

### Task 4: Implement `__Host-` Cookie Security (Optional)

**Files**: `lib/utm/cookie-config.ts` (new), `middleware.ts`, tests

**Action**:

- Create env-gated cookie name constant
- Use `__Host-utm_token` in production, `utm_token` in dev
- Update tests to use constant

**Acceptance**:

- Cookie tests (I3) remain green
- Cookie name verified correct in both environments

### Task 5: Eliminate Dev Server Flakiness

**File**: `playwright.config.ci.ts`

**Action**:

- Change webServer to `pnpm build && pnpm start -p 3333`
- Set retries: 1, trace: 'on-first-retry'

**Acceptance**:

- `--repeat-each=3` passes locally for journey tests
- 3 consecutive green CI runs

---

## 4. CI Consolidation

### Action: Simplify CI Workflows

**Current state**: 17 workflow files (complex, redundant)

**Target state**:

- `ci.yml` - Canonical gate (typecheck, lint, unit, chromium E2E)
- `comprehensive-e2e.yml` - Full cross-browser (nightly/on-demand)
- `visual-regression.yml` - Visual tests (on-demand)
- Archive: Phase-based E2E files

**Acceptance**: PRs gated by single `ci.yml` workflow

---

## 5. Definition of Done (I8)

**Green Policy**:

1. `pnpm typecheck` → 0 errors
2. `pnpm lint --max-warnings=0` → 0 warnings
3. `pnpm test:unit` → 0 failing tests
4. `pnpm test:e2e:ci` (Chromium) → 0 failing tests
5. Pre-commit hook passes without `--no-verify`

**Evidence Required**:

- Final Playwright HTML report
- JUnit artifacts from CI
- 3 consecutive green CI runs

**Policy Change**: Remove E2E quarantine from PRs; require all checks to pass

---

## 6. Execution Order

1. **Pre-Flight** (Blockers 1-3) - Unblock commits
2. **Task 3** (Pre-commit hooks) - Prevent future breaks
3. **Task 5** (CI config) - Stabilize test environment
4. **Tasks 1-2** (Journey tests) - Fix failing tests
5. **Task 4** (Cookie security) - Optional hardening
6. **CI Consolidation** - Simplify workflows
7. **Validation** - 3x green runs
