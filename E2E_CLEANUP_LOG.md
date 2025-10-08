# E2E Test Cleanup Log

**Date**: 2025-10-08
**Goal**: Remove duplicates, fix real issues, achieve <5min test suite

---

## Phase 1: Remove Obvious Duplicates

### Files Deleted (3 files, 5 tests removed)

#### 1. `e2e/homepage.spec.ts` - 1 test ❌ DELETED
**Reason**: Exact duplicate of `homepage-rendering.spec.ts`

**Evidence**:
- Both test homepage title, h1 heading, content text, waitlist button
- `homepage-rendering.spec.ts` has 5 tests covering same + more
- `homepage.spec.ts` adds zero value

**Tests removed**:
- "should display the homepage" - covered by homepage-rendering.spec.ts

---

#### 2. `e2e/consent-banner-visibility.spec.ts` - 3 tests ❌ DELETED
**Reason**: Subset of `consent.spec.ts`

**Evidence**:
- "should show consent banner for new users" = consent.spec.ts "should show consent banner on first visit"
- "should not show banner after accepting cookies" = consent.spec.ts "should hide banner after accepting all cookies"
- "should show consent banner in incognito mode" = same as test 1, just different context setup

**Tests removed**:
- "should show consent banner for new users"
- "should show consent banner in incognito mode"
- "should not show banner after accepting cookies"

**Note**: One of these (test 3) was failing in CI. Now we'll see the failure in consent.spec.ts instead.

---

#### 3. `e2e/test-analytics-component.spec.ts` - 1 test ❌ DELETED
**Reason**: Debug/diagnostic code, not a real E2E test

**Evidence**:
- Manually injects GA4 scripts
- Logs debug output to console
- Navigates to `/pricing` which doesn't exist
- Tests analytics plumbing, not user functionality

**Tests removed**:
- "Analytics Component Rendering Test"

---

## Summary Phase 1

**Before**: 116 tests across 21 files
**After**: 111 tests across 18 files
**Reduction**: 5 tests, 3 files

**Next**: Run remaining 111 tests locally, diagnose failures

---

## Phase 2A: Local Test Run - COMPLETED ✅

**Setup**: Docker PostgreSQL configured for local testing
- Created `anthrasite_test` database in existing `anth-db` container
- Fixed database credentials in `.env`, `.env.local`, `.env.test`
- Fixed `playwright.config.ts` hardcoded password fallback

**Results**: 56 failed, 55 passed (111 total tests, 5.2 minutes)
- Database connectivity: ✅ Working (no auth errors)

---

## Phase 2B: Failure Analysis - IN PROGRESS

**Failure Categories Identified**:

1. **UTM Token Generation (401 Unauthorized)** - ~25-30 tests ❌
   - **Root Cause**: Missing `ADMIN_API_KEY` and `x-admin-api-key` header
   - **Impact**: Blocks all purchase flow, journey, site mode tests

2. **Cookie Consent Modal Visibility** - ~8 tests ❌
   - **Root Cause**: CSS visibility issue (dialog in DOM but "hidden")
   - **Impact**: Consent flow tests

3. **Client-Side Hydration** - ~4 tests ❌
   - **Root Cause**: `isInteractive` check failing
   - **Impact**: CSR tests

4. **Waitlist Form** - ~8 tests ❌
5. **Homepage Rendering** - ~5 tests ❌
6. **Purchase Flow** - ~8 tests ❌ (dependent on UTM)
7. **CSS/Styling** - ~2 tests ❌
8. **Other** - ~6 tests ❌

---

## Phase 2C: Root Cause Fixes - IN PROGRESS

### Fix #1: UTM Token Generation ✅ FIXED

**Problem**:
- Admin API requires `x-admin-api-key` header with `ADMIN_API_KEY` env var
- `utm-generator.ts` wasn't sending the header
- Parameter mismatch: generator sent `price`, API expected `domain`

**Files Changed**:
1. `.env`, `.env.local`, `.env.test`: Added `ADMIN_API_KEY=test-admin-key-local-only`
2. `playwright.config.ts`: Added `ADMIN_API_KEY` to webServer env
3. `e2e/helpers/utm-generator.ts`:
   - Added `x-admin-api-key` header to fetch request
   - Changed interface: `price: number` → `domain: string`
   - Updated request body to match API expectations
4. `e2e/full-user-journey.spec.ts`: Updated 2 calls to use `domain` instead of `price`

**Expected Impact**: ~25-30 tests should now pass (all UTM-dependent tests)

**Actual Impact**:
- Before: 56 failed, 55 passed
- After: 54 failed, 1 flaky, 56 passed
- Result: ✅ 401 errors eliminated, but UTM-dependent tests still failing for other reasons
- Net: +1 passing test, -2 failures

**Next Investigation**: Why are UTM-dependent tests still failing if token generation works?

---

### Fix #2: Port Mismatch ✅ FIXED (Improved for Portability)

**Problem**:
- Tests in `homepage-mode-detection.spec.ts` and `utm-validation.spec.ts` used hardcoded `http://localhost:3000`
- Playwright webServer runs on port `3333` (defined in `playwright.config.ts`)
- Caused `ERR_CONNECTION_REFUSED` errors for ~12+ tests

**Root Cause**:
- Tests calling `generateUTMUrl()` with hardcoded port 3000 instead of 3333
- Hardcoded URLs are brittle - won't work if port changes or in Docker

**Files Changed**:
1. `playwright.config.ts`: Added `BASE_URL` env var to webServer env
2. `e2e/helpers/test-config.ts`: Created `getTestBaseUrl()` helper (new file)
3. `e2e/homepage-mode-detection.spec.ts`: Replaced hardcoded URLs with `getTestBaseUrl()` (7 instances)
4. `e2e/utm-validation.spec.ts`: Replaced hardcoded URLs with `getTestBaseUrl()` (4 instances)

**Expected Impact**: ~12+ tests should now pass (all tests using generateUTMUrl with wrong port)

**Actual Impact**:
- Before: 56 failed, 55 passed
- After: 54 failed, 57 passed
- Result: ✅ Port errors eliminated, +2 passing tests
- Net: +2 passing tests, -2 failures

**Note**: Port fix had less impact than expected - most UTM tests still failing for OTHER reasons (not port-related).

**Portability**: Now environment-agnostic - tests will work in Docker/CI by setting `BASE_URL` env var.

---

## Current Status After Fix #2

**Test Results**: 54 failed, 57 passed (111 total tests)

**Remaining Failure Categories**:
1. **Cookie Consent Modal** - ~4 tests (modal visibility issues)
2. **Client-Side Rendering** - ~3 tests (hydration, navigation, interactive elements)
3. **Waitlist Form** - ~8 tests (form not appearing after button click)
4. **Homepage Rendering** - ~5 tests
5. **Purchase Flow & UTM** - ~12+ tests (still failing despite token generation working)
6. **Full User Journey** - ~6 tests
7. **Homepage Mode Detection** - ~12+ tests
8. **Other** - ~4 tests

**Next**: Investigate why cookie consent modal is in DOM but reported as "hidden"

---

### Fix #3: Cookie Consent Modal Visibility ✅ FIXED (Partial)

**Problem**:
- Cookie consent modal exists in DOM but Playwright reports it as "hidden"
- Modal has special E2E handling to avoid animation visibility issues
- Component checked `process.env.NODE_ENV === 'test'` but Playwright sets `NODE_ENV: 'development'`
- E2E environment flag was `E2E_TESTING` but component couldn't access it (not `NEXT_PUBLIC_`)

**Root Cause**:
- ConsentPreferences.tsx checked wrong environment variable
- Client-side components need `NEXT_PUBLIC_` prefix to access env vars
- Special test visibility handling was never triggered

**Files Changed**:
1. `playwright.config.ts`: Added `NEXT_PUBLIC_E2E_TESTING: 'true'` to webServer env
2. `components/consent/ConsentPreferences.tsx`:
   - Replaced all 3 instances of `process.env.NODE_ENV === 'test'` with `process.env.NEXT_PUBLIC_E2E_TESTING === 'true'`
   - Lines 110, 118, 128

**Expected Impact**: ~4-7 consent tests should now pass

**Actual Impact**:
- Consent tests only: 7 failed → 4 failed
- **Status**: ✅ Partial fix - improved modal visibility, 3 tests now passing
- **Remaining**: 4 consent tests still failing (need investigation)


---

## Hour 0-1: Infrastructure Hardening ✅ COMPLETED

**Goal**: Implement hardened test runner configuration for speed and reliability

**Changes Made**:

### 1. Updated `playwright.config.ts` - Optimized for Local Development
- **Parallelism**: Workers increased from `1` (CI) / `undefined` (local) → `8` (local) / `6` (CI)
- **Timeouts**: Tightened to force optimization:
  - Test timeout: `60s` → `45s`
  - Expect timeout: `15s` → `5s`
  - Action timeout: `15s` → `10s`
  - Navigation timeout: `30s` → `15s`
- **Retries**: `1` (local) → `0` (local) - Forces flake fixes, not hiding them
- **Global Setup/Teardown**: Added hooks for database initialization and cleanup
  - `globalSetup: './e2e/_setup/global-setup'`
  - `globalTeardown: './e2e/_setup/global-teardown'`

### 2. Updated `playwright.config.ci.ts` - Conservative CI Settings
- **Parallelism**: 6 workers (vs 8 locally)
- **Retries**: 1 retry in CI (vs 0 locally) - for network flakes only
- **Timeouts**: Longer for cold CI environment:
  - Test timeout: `45s` → `60s`
  - Expect timeout: `5s` → `8s`
  - Action timeout: `10s` → `15s`
  - Navigation timeout: `15s` → `30s`
  - Server startup: `120s` → `180s` (3 minutes)
- **Reporters**: Added JUnit output for CI parsing
  - `['line'], ['html'], ['junit', { outputFile: 'test-results/junit.xml' }]`

### 3. Created `e2e/_setup/db.ts` - Database Utilities
- `ensureDb()`: One-time database connectivity check
- `resetDb()`: Clean database state (optional, can be heavy)
- `closeDb()`: Cleanup database connections
- `getPrisma()`: Singleton Prisma client for tests

### 4. Created `e2e/_setup/global-setup.ts` - Test Suite Initialization
- Runs once before all tests
- Calls `ensureDb()` to verify database connectivity
- Ensures schema is current

### 5. Created `e2e/_setup/global-teardown.ts` - Test Suite Cleanup
- Runs once after all tests
- Calls `closeDb()` to cleanup Prisma connections
- Graceful failure handling (doesn't throw)

### 6. Created `e2e/_utils/ui.ts` - UI Test Helpers
- `openModal(page, trigger, modal)`: Safely open modals with animation handling
- `acceptConsentIfPresent(page)`: Dismiss consent modal if it appears (non-blocking)
- `gotoAndDismissConsent(page, url)`: Convenience navigation + consent handler
- `waitForStable(locator)`: Wait for element animations to settle
- `safeClick(locator)`: Click with animation stability handling

### 7. Updated `package.json` - New Test Scripts
- `test:e2e`: Changed from `--config=playwright.config.ci.ts` → default config (local-optimized)
- `test:e2e:ci`: Explicitly uses CI config
- `test:e2e:1of2`: Shard 1 of 2 for parallel CI jobs
- `test:e2e:2of2`: Shard 2 of 2 for parallel CI jobs
- `test:e2e:maxfail`: Run with `--max-failures=10` for faster failure detection

**Expected Impact**:
- Runtime: 10+ minutes → ~4-5 minutes (with 8 workers, after deduplication)
- Stability: Tighter timeouts force better test practices
- CI Consistency: Separate configs prevent local/CI drift
- Debuggability: Helpers reduce boilerplate, improve maintainability

**Validation**: ✅ Config loads successfully (`playwright test --list`)

**Next**: Hour 1-2 - Execute deduplication to remove ~20-25 duplicate tests

