# PLAN: I8 - EPIC I - Final Cleanup & CI Green

**Last Updated**: 2025-10-09 12:59 UTC
**Status**: `IN_PROGRESS` - Critical build failures identified
**Issue**: `ANT-153`
**Latest Commit**: `7b5c16ba` (workflow fixes)

---

## CRITICAL ISSUES IDENTIFIED FROM CI LOGS

### Log Analysis Summary (from run 18375639295 - commit bff01bd2)

**Test Results**: 62 failed, 57 passed, 1 flaky, 4 skipped

### 🔴 BLOCKING ISSUE #1: Missing nodemailer dependency

**CI Run**: 18376960954 (commit 7b5c16ba)
**Status**: **BLOCKING** - Build fails to compile

```
Error: Cannot find module 'nodemailer' or its corresponding type declarations.
File: ./lib/email/gmail.ts:11:24
```

**Root Cause**:

- `lib/email/gmail.ts` imports `nodemailer`
- Package not installed in node_modules
- Causes Next.js build to fail in CI
- webServer cannot start → all tests fail

**Fix Required**:

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

### 🟡 ISSUE #2: Test ID Contract Mismatch (FIXED but not yet verified)

**Status**: Fixed in commit bff01bd2, awaiting CI validation

**Problem**: 62 tests failing with identical error:

```
Error: Timed out 8000ms waiting for expect(locator).toBeVisible()
Locator: getByTestId('open-waitlist-button').first()
Expected: visible
Received: <element(s) not found>
```

**Affected Tests**:

- All client-side-rendering tests
- All homepage-mode-detection tests
- All waitlist tests
- All full-user-journey tests
- All consent tests (cascade failures)

**Root Cause**:

- Test contract defined `openButton: 'waitlist-open'`
- Tests expected `'open-waitlist-button'`
- Component uses contract value → mismatch

**Fix Applied** (commit bff01bd2):

- Updated 3 contract files to use `'open-waitlist-button'`
  - `lib/testing/waitlistFormContract.ts`
  - `tests/contracts/journeyContract.ts`
  - `tests/contracts/waitlistFormContract.ts`

**Verification Status**: Cannot verify until nodemailer issue resolved

### 🟡 ISSUE #3: Flaky Test - Content Duplication

**Test**: `e2e/duplication.spec.ts:3:5 › check for content duplication`
**Status**: Flaky (intermittent failure)

**Error**:

```
expect(heroCount).toBe(1)
Expected: 1
Received: 0
```

**Analysis**:

- Test checks for duplicate nav/main/footer/hero elements
- Hero text element sometimes not found (timing issue)
- Likely needs waitForSelector or retry logic

**Impact**: Low (1 flaky test, marked as flaky in CI)

### 🟡 ISSUE #4: Workflow Package Manager Inconsistency (FIXED)

**Status**: Fixed in commit 7b5c16ba

**Problem**: 11 workflow files still using npm instead of pnpm

- Caused "Dependencies lock file is not found" errors
- Blocked e2e-phase1 and other workflows

**Files Fixed**:

- e2e-phase1.yml through e2e-phase6.yml
- complete-e2e-success.yml
- basic-ci.yml
- smoke-visual.yml
- visual-regression.yml

**Changes Applied**:

- Removed `cache: 'npm'` from Setup Node.js
- Added Setup pnpm step (version 9)
- Replaced `npm ci` → `pnpm install --frozen-lockfile`
- Replaced all `npx` → `pnpm exec`
- Added DIRECT_URL env var
- Added SENDGRID_API_KEY: test_key_mock

### ⚠️ ISSUE #5: Datadog SDK Warning (Non-blocking)

**Warning Pattern** (appears ~12 times in logs):

```
[WebServer] Datadog Browser SDK: SDK is loaded more than once.
This is unsupported and might have unexpected behavior.
```

**Analysis**:

- SDK being initialized multiple times during page loads
- May indicate client/server hydration issue
- Non-blocking but could cause telemetry duplication

**Impact**: Low (warning only, tests still run)

### ⚠️ ISSUE #6: Sentry Deprecation Warning (Non-blocking)

**Warning**:

```
[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your
`sentry.client.config.ts` file, or moving its content to `instrumentation-client.ts`.
When using Turbopack `sentry.client.config.ts` will no longer work.
```

**Impact**: Low (deprecation warning, not breaking)
**Action**: Can migrate to instrumentation-client.ts in future

### ⚠️ ISSUE #7: Webpack Performance Warning (Non-blocking)

**Warning**:

```
<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (253kiB)
impacts deserialization performance (consider using Buffer instead and decode when needed)
```

**Impact**: Low (performance optimization suggestion)

### ⚠️ ISSUE #8: PostgreSQL Role Errors (Expected, Non-blocking)

**Pattern** (~50 occurrences):

```
FATAL: role "root" does not exist
```

**Analysis**:

- Expected behavior from health checks
- Service container logs showing connection attempts
- Does not affect test execution

**Impact**: None (expected postgres behavior)

---

## CURRENT CI STATUS

### Latest Runs (commit 7b5c16ba - workflow fixes)

| Workflow          | Run ID      | Status         | Issue              |
| ----------------- | ----------- | -------------- | ------------------ |
| Comprehensive E2E | 18376960954 | ❌ FAILED      | nodemailer missing |
| E2E Phase 1       | 18376960950 | 🔄 In Progress | -                  |
| E2E Phase 2       | 18376960936 | 🔄 In Progress | -                  |
| E2E Phase 3       | 18376960938 | 🔄 In Progress | -                  |
| E2E Phase 4       | 18376960941 | 🔄 In Progress | -                  |
| E2E Phase 5       | 18376960925 | 🔄 In Progress | -                  |
| E2E Phase 6       | 18376960928 | 🔄 In Progress | -                  |

### Previous Run Analysis (commit bff01bd2 - test ID fix only)

| Workflow          | Run ID      | Status    | Issue                          |
| ----------------- | ----------- | --------- | ------------------------------ |
| Comprehensive E2E | 18375639295 | ❌ FAILED | Test ID mismatch (62 failures) |
| E2E Phase 1       | 18376861536 | ❌ FAILED | npm/pnpm mismatch              |

---

## IMMEDIATE ACTION PLAN

### Priority 1: Fix Build Blocker (nodemailer)

**Tasks**:

1. ✅ Identify issue: nodemailer not in dependencies
2. ⏳ Install nodemailer: `pnpm add nodemailer`
3. ⏳ Install types: `pnpm add -D @types/nodemailer`
4. ⏳ Verify local build: `pnpm build`
5. ⏳ Commit + push
6. ⏳ Monitor CI run

### Priority 2: Verify Test ID Fix

**Once nodemailer is fixed**:

1. Wait for CI run to complete
2. Check if 62 test failures are resolved
3. Verify only expected 4 skipped tests remain
4. Confirm 1 flaky test (duplication) is marked as flaky

### Priority 3: Address Flaky Test (If Time Permits)

**File**: `e2e/duplication.spec.ts`
**Fix**: Add proper wait for hero element before assertion

---

## DEFINITION OF DONE (I8)

**Green Policy**:

1. ✅ `pnpm typecheck` → 0 errors
2. ✅ `pnpm lint` → warnings acceptable
3. ✅ `pnpm test:unit` → 0 failing tests
4. ✅ `pnpm test:e2e` (local) → 61 passed, 4 skipped
5. ⏳ `pnpm test:e2e:ci` → **BLOCKED by nodemailer**
6. ✅ Pre-commit hook passes

**Evidence Required**:

- ✅ Local E2E report (61/65 passing)
- ⏳ CI run with 0 build failures
- ⏳ CI run with 0 test failures (except 4 intentional skips, 1 flaky)
- ⏳ 3 consecutive green CI runs

---

## COMMIT HISTORY (I8)

| Commit   | Description                              | Status                |
| -------- | ---------------------------------------- | --------------------- |
| 50182c59 | feat(test): complete I8 pre-flight fixes | ✅ Green locally      |
| 0878dfe1 | test(e2e): fix journey tests             | ⚠️ Missing nodemailer |
| bff01bd2 | fix(test): align test ID contracts       | ⚠️ npm/pnpm issues    |
| 7b5c16ba | fix(ci): convert workflows npm→pnpm      | ⚠️ nodemailer missing |
| **NEXT** | fix(deps): add nodemailer dependency     | ⏳ Pending            |

---

## PROGRESS SUMMARY

### Completed

- ✅ TypeScript errors (4 blockers fixed)
- ✅ Package manager consistency (pre-commit)
- ✅ Missing scripts (check:all)
- ✅ Playwright CI config (production build)
- ✅ Journey test logic (waitlist + purchase)
- ✅ Test IDs and selectors
- ✅ Cookie consent handling
- ✅ JWT UTM token parsing
- ✅ Console error filtering
- ✅ Workflow npm→pnpm conversion (11 files)
- ✅ Test ID contract alignment (3 files)

### Blocked

- ❌ CI validation - **BLOCKED by missing nodemailer**
- ❌ Evidence gathering - Cannot proceed until CI green

### Next Actions

1. **IMMEDIATE**: Install nodemailer + types
2. **THEN**: Push + monitor CI
3. **VALIDATE**: 62 test failures should become 0
4. **DOCUMENT**: Update SCRATCHPAD with results
5. **CLOSE**: Mark I8 complete with evidence
