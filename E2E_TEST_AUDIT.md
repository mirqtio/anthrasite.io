# E2E Test Suite Audit & Cleanup Plan

**Date**: 2025-10-08
**Status**: Audit in progress
**Context**: CI E2E tests timing out (15min) due to 26+ failures causing retries. Goal: **Cleanup codebase**, not make CI pass.

---

## Executive Summary

**Current State:**
- 116 tests across 21 files
- 26+ failures in CI run 18350664772
- ~14-15 minute execution time (expected: 2-3 minutes)
- Significant duplication and redundancy

**Key Findings:**
1. 🔴 **Duplicative Tests**: Multiple files testing same functionality
2. 🔴 **Obsolete Tests**: Tests for features no longer relevant
3. 🟡 **Brittle Tests**: Tests failing due to poor selectors/timing
4. 🟡 **Missing Features**: Tests expect UI elements that don't exist

**Recommended Actions:**
1. Remove/consolidate duplicative tests (est. -30 tests)
2. Fix failing tests that surface real bugs
3. Remove tests for non-existent features
4. Result: ~80-90 valuable, passing tests in <5 minutes

---

## Test Inventory Analysis

### Core Smoke Tests ✅ **KEEP**
| File | Tests | Purpose | Value |
|------|-------|---------|-------|
| `smoke-marketing.spec.ts` | 1 | Homepage marketing surface loads | High - fast validation |
| `smoke.spec.ts` | 1 | Purchase flow golden path | High - critical path |
| `basic.spec.ts` | 2 | Homepage + health check | Medium - partial dup with smoke-marketing |

**Recommendation**: Keep all but consolidate `basic.spec.ts` health check into smoke tests.

---

### Homepage Tests 🟡 **CONSOLIDATE**

| File | Tests | Overlap | Recommendation |
|------|-------|---------|----------------|
| `homepage.spec.ts` | 1 | Unknown | **DELETE** - likely redundant |
| `homepage-rendering.spec.ts` | 5 | SSR, hydration, basic rendering | **KEEP** - core functionality |
| `homepage-mode-detection.spec.ts` | 15 | Organic vs Purchase mode switching | **KEEP BUT FIX** - 12 failures |

**Duplication Analysis:**
- `homepage.spec.ts` (1 test) - **Suspected duplicate** of homepage-rendering
- Many failures in mode-detection suggest missing features or broken logic

**Action**: Read `homepage.spec.ts` to confirm redundancy, then delete or merge.

---

### Consent/Cookie Tests 🟡 **CONSOLIDATE**

| File | Tests | Focus | Issues |
|------|-------|-------|--------|
| `consent.spec.ts` | 10 | Full cookie consent flow | 4 failures - modal not found |
| `consent-banner-visibility.spec.ts` | 3 | Banner show/hide logic | 1 failure - banner persists |

**Duplication**: Both test banner visibility.
**Root Cause**: Likely missing cookie preferences modal or broken banner logic.

**Action**:
1. Determine if cookie modal exists in app
2. If yes: fix modal selectors/logic
3. If no: remove affected tests
4. Consolidate banner tests into consent.spec.ts

---

### Waitlist Tests ✅ **KEEP & FIX**

| File | Tests | Purpose |
|------|-------|---------|
| `waitlist.spec.ts` | 8 | Full waitlist signup flow |
| `waitlist-functional.spec.ts` | 3 | Waitlist form functionality |

**Duplication**: Likely overlap in form testing.
**Action**: Review both files, consolidate into `waitlist.spec.ts`, keep functional tests.

---

### Purchase Flow Tests ✅ **KEEP & FIX**

| File | Tests | Purpose | Issues |
|------|-------|---------|--------|
| `purchase.spec.ts` | 11 | Purchase page functionality | Unknown failures |
| `purchase-flow.spec.ts` | 10 | Full purchase journey | Unknown failures |
| `utm-validation.spec.ts` | 8 | UTM token validation | Likely failing |

**Note**: These are critical business logic tests. Failures likely indicate real bugs.

**Action**:
1. Diagnose failures - likely UTM/purchase page issues
2. Fix root causes in application code
3. These tests are valuable, must pass

---

### Site Mode Tests 🟡 **REVIEW**

| File | Tests | Purpose |
|------|-------|---------|
| `site-mode.spec.ts` | 5 | Prod vs Dev mode selection |
| `site-mode-context.spec.ts` | 5 | Site mode context behavior |

**Duplication**: Possible overlap in testing mode switching.
**Action**: Review and consolidate if redundant.

---

### Client-Side Rendering Tests 🔴 **FIX OR REMOVE**

| File | Tests | Failures |
|------|-------|----------|
| `client-side-rendering.spec.ts` | 7 | 3 failures |

**Issues**:
1. "should handle client-side navigation" - `isInteractive` check failing
2. "should have interactive elements after hydration" - `waitlist-form` not found
3. "should maintain state during client-side interactions" - unknown

**Root Cause**: Tests expect UI elements (`waitlist-form`) that may not exist, or hydration issues.

**Action**:
1. Determine if these tests are testing real functionality
2. If yes: fix app issues (hydration, form rendering)
3. If no: remove overly specific/brittle tests

---

### Full User Journey Tests 🟡 **HIGH VALUE, FIX**

| File | Tests | Failures |
|------|-------|----------|
| `full-user-journey.spec.ts` | 11 | 6+ failures |

**Value**: High - tests complete user flows end-to-end.

**Failures**:
- Waitlist signup journey
- Purchase journey with UTM
- Expired UTM handling
- Cookie preferences
- Error scenarios

**Action**: These are valuable integration tests. Diagnose and fix root causes.

---

### Supporting Tests ✅ **KEEP**

| File | Tests | Value |
|------|-------|-------|
| `css-loading.spec.ts` | 6 | CSS/styling loads correctly | Medium |
| `monitoring.spec.ts` | 2 | Datadog/Sentry integration | High |
| `duplication.spec.ts` | 1 | No duplicate nav/main/footer | High |
| `test-analytics-component.spec.ts` | 1 | Analytics component | Medium |

**Action**: Keep all, verify they pass.

---

## Failure Pattern Analysis

### Pattern 1: Missing UI Elements (Most Common)
**Symptom**: `waitlist-form not found`, `Invalid Purchase Link heading not found`
**Files Affected**: `client-side-rendering.spec.ts`, `homepage-mode-detection.spec.ts`, `consent.spec.ts`

**Possible Causes**:
1. Tests written for planned features not yet implemented
2. Features removed but tests not updated
3. Wrong selectors/test-ids

**Investigation Needed**: Check if these elements exist in the app.

---

### Pattern 2: Modal/Interaction Failures
**Symptom**: Cookie modal not opening, preferences not saving
**Files Affected**: `consent.spec.ts`, `full-user-journey.spec.ts`

**Possible Causes**:
1. Modal code broken or not implemented
2. Timing issues (modal loads async)
3. Event handlers not wired up

**Action**: Verify modal functionality manually, fix or remove tests.

---

### Pattern 3: UTM/Purchase Mode Failures (12 failures)
**Symptom**: Purchase mode detection failing, UTM validation errors
**Files Affected**: `homepage-mode-detection.spec.ts`, `full-user-journey.spec.ts`

**Possible Causes**:
1. UTM validation logic broken
2. Purchase mode state management issues
3. Missing error pages for invalid UTM

**Action**: This is critical business logic - must diagnose and fix.

---

## Cleanup Plan

### Phase 1: Remove Obvious Duplication (Est. -20 tests, -2min)

**Actions**:
1. Delete `homepage.spec.ts` if redundant with homepage-rendering
2. Consolidate `consent-banner-visibility.spec.ts` into `consent.spec.ts`
3. Consolidate `waitlist-functional.spec.ts` into `waitlist.spec.ts`
4. Review `site-mode.spec.ts` vs `site-mode-context.spec.ts`, merge if duplicate
5. Move health check from `basic.spec.ts` into smoke tests, delete basic.spec.ts

**Expected Result**: ~95 tests remaining

---

### Phase 2: Fix Critical Business Logic Tests (Est. 10-15 tests)

**Priority 1 - Purchase Flow** (Must work for business):
1. Diagnose UTM validation failures
2. Fix purchase mode detection
3. Fix purchase page rendering
4. Verify payment flow

**Priority 2 - User Journeys**:
1. Fix waitlist signup flow
2. Fix full-user-journey tests
3. Ensure error handling works

**Expected Result**: Core business flows tested and passing

---

### Phase 3: Remove/Fix Brittle Tests (Est. -10 to -15 tests)

**Criteria for Removal**:
1. Tests expecting features that don't exist and won't be built
2. Tests that are overly specific to implementation details
3. Tests that duplicate coverage from other tests

**Candidates**:
1. Some client-side-rendering tests (if too brittle)
2. Some homepage-mode-detection edge case tests
3. Any tests for removed features

**Expected Result**: ~75-85 high-value tests remaining

---

### Phase 4: Optimize Test Execution

**Actions**:
1. Review test timeouts (reduce where safe)
2. Optimize slow page loads
3. Remove unnecessary waits
4. Parallelize where possible (already at 1 worker in CI)

**Expected Result**: Test suite runs in 3-5 minutes

---

## Success Criteria

**Quantitative**:
- ✅ <90 total E2E tests
- ✅ <5 minute execution time in CI
- ✅ 0 duplicate test coverage
- ✅ All remaining tests passing

**Qualitative**:
- ✅ Tests only cover implemented, valuable features
- ✅ No brittle selectors or timing-dependent tests
- ✅ Clear test organization (one file per feature)
- ✅ Critical business flows fully covered

---

## Next Steps

1. **Investigate missing elements** - Check if `waitlist-form`, `Invalid Purchase Link`, cookie modal exist
2. **Review homepage.spec.ts** - Confirm it's duplicate, delete
3. **Consolidate consent tests** - Merge banner tests
4. **Diagnose UTM/purchase failures** - This is critical business logic
5. **Remove non-valuable tests** - Based on findings above
6. **Run full suite locally** - Verify cleanup worked
7. **Commit cleanup** - Single commit removing/consolidating tests
8. **Push and validate CI** - Should complete in <5 min with no failures

---

## Open Questions

1. Does the cookie preferences modal exist in the app?
2. Does the `data-testid="waitlist-form"` element exist?
3. Is there an "Invalid Purchase Link" error page?
4. What is the expected behavior for expired/invalid UTM tokens?
5. Are the site-mode tests testing actual functionality or obsolete features?
