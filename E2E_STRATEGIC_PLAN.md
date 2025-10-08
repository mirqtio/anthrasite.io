# E2E Test Suite: Strategic Improvement Plan

**Date**: 2025-10-08
**Current State**: 56 failed, 55 passed (111 tests, 10+ minute runtime)
**Target**: <5 minute runtime, <10 failures

---

## Problem Analysis

### Issue #1: Performance (10+ Minute Runtime)
**Root Causes**:
1. **Sequential execution** - 111 tests running on limited workers
2. **Retries doubling time** - Each failure retries once, adding ~5 minutes
3. **Slow operations** - Database setup/teardown, page loads, timeouts
4. **Redundant tests** - ~25 duplicate tests identified but not removed

**Impact**: If 10min locally, likely 15-20min in CI (slower environment)

### Issue #2: High Failure Rate (50%)
**Root Causes by Category**:
1. **Waitlist Form** (~8 failures) - Form not appearing after button click
2. **Homepage Mode Detection** (~12 failures) - UTM/purchase mode tests
3. **Full User Journey** (~6 failures) - End-to-end flow tests
4. **Consent Modal** (4 failures) - Still failing after partial fix
5. **Homepage Rendering** (~5 failures) - Various rendering issues
6. **Purchase Flow** (~5 failures) - Checkout/payment tests
7. **Client-Side** (~3 failures) - Hydration, navigation
8. **Other** (~13 failures) - Miscellaneous

**Pattern**: Many failures share root causes (e.g., modal visibility affects 12+ tests)

---

## Strategic Solution: 3-Pronged Approach

### Prong 1: Aggressive Deduplication (Target: -20 tests, -2min)
**Action**: Remove remaining ~20-25 duplicate/redundant tests identified in audit

**Evidence**: E2E_TEST_AUDIT.md shows ~30 duplicative tests, we've only removed 5

**Quick Wins**:
- `homepage-mode-detection.spec.ts` (26 tests) - Likely overlaps with `utm-validation.spec.ts` (11 tests)
- `full-user-journey.spec.ts` (7 tests) - May duplicate individual feature tests
- Multiple consent test files - Already removed 1, may have more overlap

**Method**:
1. Group tests by functionality tested
2. Keep most comprehensive version
3. Remove redundant variations
4. Document removals in E2E_CLEANUP_LOG.md

**Expected Impact**:
- 111 → ~85-90 tests (-20-25%)
- Runtime: ~8-9 minutes (-2min from fewer tests + retries)

---

### Prong 2: Increase Parallel Execution (Target: -4min)
**Current**: Playwright config uses 5 workers (default)
**Problem**: With 111 tests, each worker runs ~22 tests sequentially

**Action**: Optimize worker configuration

**Changes**:
```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : 8, // More workers locally, conservative in CI
  fullyParallel: true, // Allow tests in same file to run parallel
  // ... existing config
})
```

**Expected Impact**:
- 8 workers: 111 tests / 8 = ~14 tests per worker
- If avg test = 3s, serial time = 42s per worker vs 66s with 5 workers
- Runtime: ~9min → ~5min (-4min from parallelization)

**Risk**: More workers = more memory/CPU, may cause flakiness
**Mitigation**: Start with 6 workers, tune based on results

---

### Prong 3: Fix Root Causes, Not Symptoms (Target: -40 failures)
**Principle**: One root cause fix can resolve 10+ test failures

**Priority Fixes** (ordered by test impact):

#### Fix #5: Waitlist Form Modal Visibility (Impact: ~8 tests)
**Root Cause**: Same as consent modal - likely missing E2E visibility handling

**Investigation Needed**:
- Check if WaitlistForm component has E2E-specific visibility code
- May need same fix as ConsentPreferences (NEXT_PUBLIC_E2E_TESTING check)

**Expected**: +8 passing tests

#### Fix #6: Homepage Mode Detection Root Issue (Impact: ~12 tests)
**Root Cause**: Tests failing after UTM token generation fixed - likely middleware or cookie logic

**Investigation Needed**:
- Check middleware that processes UTM parameters
- Verify purchase mode cookie setting/reading logic
- May be timing issue (cookies not set before assertions)

**Expected**: +10-12 passing tests

#### Fix #7: Purchase Flow Database Issues (Impact: ~5 tests)
**Root Cause**: Database state, missing mock data, or Stripe mock issues

**Investigation Needed**:
- Check if NEXT_PUBLIC_USE_MOCK_PURCHASE is working
- Verify Stripe mocks are properly initialized
- Database cleanup may be interfering

**Expected**: +5 passing tests

**Total Expected**: ~25 tests fixed by addressing 3 root causes

---

## Recommended Execution Plan

### Option A: Aggressive (Fastest to "Clean Bill of Health")
**Order**: Deduplication → Root Causes → Parallelization

**Rationale**:
- Fewer tests = faster iteration on fixes
- Root cause fixes have highest ROI
- Parallelization last (validates final test count)

**Timeline**:
1. Deduplication: 1-2 hours (review + remove ~20 tests)
2. Root cause fixes: 2-3 hours (investigate + fix 3 issues)
3. Parallelization: 15 minutes (config change + test)
4. Verification: 30 minutes (Docker + local runs)

**Expected Outcome**:
- Tests: 111 → ~85-90
- Runtime: 10min → 3-4min
- Failures: 56 → ~10-15

### Option B: Conservative (Safer, Incremental)
**Order**: Parallelization → Root Causes → Deduplication

**Rationale**:
- Parallelization is low-risk, immediate benefit
- Root cause fixes validated with current test suite
- Deduplication last (removes proven-redundant tests only)

**Timeline**:
1. Parallelization: 15 minutes
2. Root cause fixes: 2-3 hours
3. Deduplication: 1-2 hours
4. Verification: 30 minutes

**Expected Outcome**: Same as Option A, but more validation steps

### Option C: Targeted (Focus on Failures Only)
**Order**: Root Causes → Parallelization (skip deduplication for now)

**Rationale**:
- Focus on passing tests, not reducing count
- Deduplication is time-consuming audit work
- Can revisit deduplication later if needed

**Timeline**:
1. Root cause fixes: 2-3 hours
2. Parallelization: 15 minutes
3. Verification: 30 minutes

**Expected Outcome**:
- Tests: 111 (unchanged)
- Runtime: 10min → ~6min
- Failures: 56 → ~15-20

---

## Recommendation: **Option A (Aggressive)**

**Why**:
1. **Addresses both problems** - Runtime AND failures
2. **Permanent solution** - Removes technical debt (duplicate tests)
3. **Faster future iterations** - Smaller test suite = faster debugging
4. **Aligns with goal** - User requested "cleanup", not just "green checkmarks"

**Next Steps**:
1. ✅ Update SCRATCHPAD with strategic plan
2. Execute deduplication (identify overlap, remove duplicates)
3. Fix top 3 root causes (waitlist, mode detection, purchase flow)
4. Configure parallel execution
5. Validate in Docker (Phase 3)
6. Commit and push (Phase 4)
7. Validate in CI (Phase 5)

---

## Success Metrics

**Before**:
- 116 tests, 21 files
- 56 failed, 55 passed (48% pass rate)
- 10+ minute runtime

**Target After All Fixes**:
- ~85-90 tests, ~15-16 files
- <10 failed, >80 passed (>90% pass rate)
- <5 minute runtime

**Minimum Acceptable**:
- ~100 tests (after conservative deduplication)
- <20 failed (>80% pass rate)
- <7 minute runtime
