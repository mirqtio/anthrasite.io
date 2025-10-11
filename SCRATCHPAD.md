# CI v2 - Hermetic E2E Pipeline - Iteration 9 (Consent Bypass Fix)

**Status**: 🔧 LOCAL TESTING - Implementing consent bypass fix
**Last CI Run**: #18428588539 (iteration 8 - completed with failures)
**Goal**: Fix consent modal blocking 80% of tests - recursive local testing until green

---

## 🔄 Current Status: Iteration 9 (Local Development)

### What We're Fixing

**Primary Issue**: Cookie consent modal not rendering in CI, causing 413/674 tests (61.3%) to fail

**Root Cause**: localStorage has persistent consent from previous runs → `showBanner = false` → tests wait for modal that never appears → timeout → fail

**Solution Strategy**:
1. ✅ Use Playwright `storageState` to pre-accept consent (bypasses modal entirely)
2. ✅ Add `networkidle` waits to prevent chunk loading races
3. ✅ Add WebKit-specific timeout buffers
4. 🔄 **Test locally until green** before pushing to CI
5. ⏳ Monitor iteration 9 CI results
6. ⏳ Create dedicated consent test suite if needed

### Files Modified (Ready for Testing)

1. ✅ `e2e/storage/consent-accepted.json` - Pre-accepted consent state
2. ✅ `playwright.config.ci.ts` - Added storageState + WebKit timeouts
3. ✅ `e2e/_utils/ui.ts` - Added `gotoStable()` with networkidle waits
4. ✅ `e2e/helpers/test-utils.ts` - Export `gotoStable()`

### Recursive Testing Workflow

```
┌─────────────────────────────────────────┐
│ 1. TEST LOCALLY (current step)         │
│    - Run single browser project         │
│    - Verify consent bypass works        │
│    - Check for new failures             │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ 2. DIAGNOSE any failures                │
│    - Review error logs                  │
│    - Identify root causes               │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ 3. FIX issues found                     │
│    - Implement targeted fixes           │
│    - No workarounds, proper solutions   │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│ 4. RETEST until green locally           │
│    - Loop back to step 1                │
│    - Continue until >90% pass rate      │
└────────────┬────────────────────────────┘
             │
             ↓ ALL GREEN LOCALLY
┌─────────────────────────────────────────┐
│ 5. COMMIT & PUSH to CI                  │
│    - Trigger iteration 9                │
│    - Monitor for issues                 │
└─────────────────────────────────────────┘
```

---

## 📊 Iteration 8 Results (CI Baseline)

### Test Metrics
- **Total Tests**: 674
- **Passed**: 261 (38.7%)
- **Failed**: 413 (61.3%)

### By Browser Project
| Browser | Passed | Failed | Pass Rate | Duration | Notes |
|---------|--------|--------|-----------|----------|-------|
| chromium-desktop | 64 | 60 | 51.6% | 11m36s | ~50% passing |
| firefox-desktop | 63 | 60 | 51.2% | ~12min | Similar to Chrome |
| chromium-mobile | 62 | 57 | 52.1% | 10m47s | ~50% passing |
| **webkit-desktop** | 6 | **118** | **4.8%** | 6m21s | 💥 95% failure! |
| **webkit-mobile** | 6 | **118** | **4.8%** | 6m16s | 💥 95% failure! |

### Key Achievement in Iteration 8
✅ **Port Conflict RESOLVED** - All servers started successfully with `reuseExistingServer: !!process.env.CI`

### Failure Breakdown
1. **Consent Modal Timeout** (80% of failures)
   - Modal selector: `.fixed.inset-0.z-50.flex`
   - Error: `TimeoutError: locator.elementHandle: Timeout 15000ms exceeded`
   - Blocks: ALL tests using `gotoAndDismissCookies()`

2. **Payment "Invalid tier"** (10% of failures)
   - Error: `Payment initialization error: Error: Invalid tier`
   - Affects: Purchase page tests

3. **Static Chunk Loading** (5% of failures)
   - Error: `[requestfailed] GET .../chunks/*.js - net::ERR_ABORTED`
   - Impact: Incomplete page hydration

4. **Form State Issues** (2% of failures)
   - Input values not persisting

5. **API 400 Errors** (3% of failures)
   - Bad requests on UTM/purchase APIs

---

## 🔧 Iteration History (Previous)

### Iteration 7 (Run 18428468038) - ❌ Port Conflict
- **Error**: `http://localhost:3333 is already used`
- **Root Cause**: Multiple E2E jobs trying to start webServer on same port
- **Fix**: Changed `reuseExistingServer: false` → `!!process.env.CI`
- **Commits**: 50920d1a, 7585e02d

### Iteration 6 (Run 18428280948) - ✅ Unit Tests Passing
- **Milestone**: Unit tests finally passing!
- **Issue**: Config mismatch - workflow used base config (1 worker) instead of CI config (6 workers)
- **Fix**: Updated workflow to use `pnpm test:e2e:ci`
- **Commits**: d077deed, 90807ce6

### Iteration 5 (Run 18427843562) - ❌ First E2E Execution (25min, all failed)
- **Milestone**: Tests actually ran for first time!
- **Issue**: Very slow (25min per job) due to 1 worker
- **Analysis**: Led to iteration 6 config fixes

### Iterations 1-4
- **Iteration 4**: Port mismatch (3000 vs 3333)
- **Iteration 3**: Seed script model errors
- **Iteration 2**: Migration conflicts
- **Iteration 1**: Missing DIRECT_URL env var

---

## 🧪 Local Testing Plan (CURRENT STEP)

### Step 1: Verify Consent Bypass Works
```bash
# Ensure production build exists
pnpm build

# Start production server
PORT=3333 pnpm start &

# Run single browser project locally with CI settings
export CI=1
pnpm test:e2e:ci --project="chromium-desktop" e2e/basic.spec.ts

# Expected: Tests should NOT wait for consent modal
# Expected: Tests should use pre-accepted consent from storageState
```

### Step 2: Test Across Multiple Browsers
```bash
# Test WebKit (highest failure rate)
pnpm test:e2e:ci --project="webkit-desktop" e2e/basic.spec.ts

# Test Firefox
pnpm test:e2e:ci --project="firefox-desktop" e2e/basic.spec.ts

# Test Mobile
pnpm test:e2e:ci --project="chromium-mobile" e2e/basic.spec.ts
```

### Step 3: Run Full Suite Locally (if steps 1-2 pass)
```bash
# Run all 5 projects
pnpm test:e2e:ci \
  --project="chromium-desktop" \
  --project="firefox-desktop" \
  --project="webkit-desktop" \
  --project="chromium-mobile" \
  --project="webkit-mobile"
```

### Step 4: Address Any New Failures
- Review error logs
- Identify root causes
- Implement fixes
- **Loop back to Step 1** until >90% pass rate locally

---

## 📋 Detailed Failure Analysis (from Iteration 8)

### Consent Modal Investigation

**Code Review Findings**:
- `lib/context/ConsentContext.tsx` line 88-94: Checks localStorage on mount
- If `anthrasite_cookie_consent` exists with matching version → `showBanner = false`
- `components/consent/ConsentBanner.tsx`: Renders based on `showBanner` state
- When `showBanner = false` → modal returns `null` → tests timeout waiting

**Why CI Differs from Local**:
- CI may have persistent browser contexts between runs
- Previous test run accepted cookies → saved to localStorage
- Next run loads, finds consent → hides banner
- Tests written expecting banner → timeout

**Why WebKit is Worse**:
- WebKit may have more persistent storage
- Stricter hydration requirements
- Different chunk loading behavior
- Tests fail faster (6min vs 12min) → fewer retries succeed

### Expected Impact of Fix

With `storageState: 'e2e/storage/consent-accepted.json'`:
- Every test starts with consent pre-accepted in localStorage
- Banner component sees existing consent → `showBanner = false`
- Tests don't need to wait for or dismiss modal
- Tests can proceed immediately

**Estimated Pass Rate Jump**: 39% → 90%+ (fixing 80% of failures)

---

## 🎯 Next Actions (Ordered)

### Current Focus
1. 🔄 **TEST LOCALLY** - Run basic tests to verify consent bypass
2. ⏳ Diagnose any new failures from local testing
3. ⏳ Fix issues found
4. ⏳ Retest locally until >90% pass rate
5. ⏳ Commit all fixes
6. ⏳ Push to trigger iteration 9
7. ⏳ Monitor CI iteration 9 results
8. ⏳ Download logs if any failures
9. ⏳ Continue recursive debugging

### Later (If Needed)
- Create dedicated consent test suite with `storageState: undefined`
- Address "Invalid tier" payment errors
- Fix static chunk loading races
- Optimize for 5 consecutive green runs

---

## 📊 Success Criteria

- ✅ Port conflict resolved (iteration 8)
- ✅ Browser project isolation working
- ✅ 6-worker parallelism active
- ✅ Comprehensive failure analysis completed
- 🔄 **>90% pass rate locally** (current goal)
- ⏳ >90% pass rate in CI
- ⏳ All 5 browser projects passing
- ⏳ 5 consecutive green CI runs

---

## 📝 Files to Commit (After Local Green)

```
e2e/storage/consent-accepted.json     [NEW] Pre-accepted consent state
playwright.config.ci.ts               [MODIFIED] Added storageState + WebKit timeouts
e2e/_utils/ui.ts                      [MODIFIED] Added gotoStable() with networkidle
e2e/helpers/test-utils.ts             [MODIFIED] Export gotoStable()
SCRATCHPAD.md                         [MODIFIED] Updated with iteration 9 status
```

---

## 💡 Key Learnings

1. **Recursive Testing Works**: Port conflict fix (iteration 8) proved fast iteration
2. **Root Cause Analysis Essential**: Comprehensive analysis revealed single blocking issue
3. **Local Testing Critical**: Must verify fixes locally before pushing to CI
4. **StorageState Power**: Playwright's storageState can bypass entire test blockers
5. **WebKit Needs Special Care**: Different behavior requires extra timeouts/handling

---

## 🚨 Reminders

- **NO WORKAROUNDS** - Fix root causes properly
- **TEST LOCALLY FIRST** - Don't push until green locally
- **RECURSIVE PROCESS** - Test → Diagnose → Fix → Retest
- **ONE ISSUE AT A TIME** - Fix consent, then address next issue
- **DOCUMENTATION MATTERS** - Keep scratchpad updated for context
