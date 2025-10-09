# I8 EPIC: CI MONITORING & FIXES

## Current Status (2025-10-09)

**Test Results**: 62 passing ✅, 57 failing ❌ (52% pass rate)
**Infrastructure**: ✅ FIXED - All setup issues resolved
**Next Phase**: Speed optimizations + remaining test failures

---

## COMPLETED FIXES (4 commits)

### ✅ 1. Fixed missing nodemailer dependency (commit c59045b7)

- **Problem**: Build failing with "Cannot find module 'nodemailer'"
- **Fix**: Installed `nodemailer ^7.0.9` and `@types/nodemailer ^7.0.2`
- **Impact**: Build now succeeds, webServer can start

### ✅ 2. Fixed test ID contract mismatch (commit bff01bd2)

- **Problem**: 62 tests failing looking for `'open-waitlist-button'` but contract defined `'waitlist-open'`
- **Fix**: Updated 3 contract files to use `'open-waitlist-button'`
- **Impact**: All 62 test ID failures resolved, tests now passing

### ✅ 3. Fixed Playwright browser installation (commit 531de62c)

- **Problem**: Workflows only installing chromium, tests run on multiple browsers
- **Fix**: Changed all 12 workflows from `--with-deps chromium` to `--with-deps`
- **Impact**: Firefox, webkit tests can now run

### ✅ 4. Fixed CI Playwright config usage (commit 9219d3bf)

- **Problem**: Phase workflows not using CI config, webServer wouldn't start
- **Fix**: Added `--config=playwright.config.ci.ts` to all 7 phase workflows
- **Impact**: webServer starts properly with production build

---

## IN PROGRESS: SPEED OPTIMIZATIONS (Phase 2 - Quick Wins)

### Goal: Reduce CI time from ~15 minutes to ~5-7 minutes

### ✅ Completed Optimizations:

1. **pnpm store caching**

   - Caches `~/.pnpm-store` across runs
   - Eliminates redownloading dependencies every time
   - Expected savings: ~2-3 minutes

2. **Playwright browser caching**

   - Caches `~/.cache/ms-playwright` keyed by Playwright version
   - Only installs browsers on cache miss
   - Expected savings: ~5-8 minutes (browsers take 480s currently)

3. **Artifacts upload on failure only**

   - Changed from `if: always()` to `if: failure()`
   - Reduces storage from ~628 MB every run to ~0 MB on success
   - Expected savings: ~30-60 seconds upload time

4. **Playwright config optimizations**
   - Disabled video recording (`video: 'off'`)
   - Keep traces/screenshots only on failure
   - Added `forbidOnly` to prevent `.only()` commits
   - Expected savings: Smaller artifacts, faster test execution

### 🔄 Currently Applying:

- Propagating caching to all phase workflows (e2e-phase1 through phase6)
- Will commit once complete

---

## DEFERRED: STABILITY & ARCHITECTURE (Phase 3+)

### Phase 3: Test Stability (Low Risk, keeps NODE_ENV=production)

1. **Determinism flags** (NOT STARTED)

   - Add `DISABLE_ANALYTICS`, `DISABLE_SENTRY`, `DISABLE_DD`, `DISABLE_EMAIL` env vars
   - Gate SDK initialization in code
   - Keeps `NODE_ENV=production` for build fidelity
   - **Why deferred**: Want to see impact of speed improvements first

2. **Fix flaky duplication test** (NOT STARTED)
   - Add `data-e2e-ready` marker to signal app hydration complete
   - Use role/label locators instead of raw counts
   - **Why deferred**: Only affects 1 test, not blocking

### Phase 4: Architecture Improvements (Later)

1. **Sentry migration** (NOT STARTED)

   - Move to `instrumentation-client.ts` (Turbopack requirement)
   - **Why deferred**: Not urgent until Turbopack adoption

2. **Test sharding** (NOT STARTED)

   - Split tests across parallel jobs if wall time still > 7-8 min
   - **Why deferred**: Wait to see if caching solves this

3. **Webpack cache optimization** (NOT STARTED)
   - Address "large string serialize" warning
   - **Why deferred**: Low priority, doesn't block

---

## REMAINING ISSUES: 57 TEST FAILURES

### Analysis Needed (NOT STARTED)

**Failure Categories** (from run 18377680290):

1. **Client-side rendering tests** (~20 failures)

   - `isInteractive` assertions failing
   - Likely timing/hydration issues

2. **Form input tests** (~15 failures)

   - Domain input not being filled: `expect("test.com") received ""`
   - Possible focus trap or client-side JS issue

3. **Duplication test** (1 flaky)

   - `expect(navCount).toBe(1)` receiving `0`
   - Known timing issue

4. **Other assertion failures** (~21)
   - Need detailed analysis

### Next Steps for Test Failures:

1. Download CI logs for run 18377680290
2. Categorize all 57 failures by root cause
3. Fix highest-impact issues first
4. Re-run to verify

---

## TIMELINE

### Completed (Dec 9, 13:00-13:30 UTC):

- ✅ Infrastructure fixes (4 commits)
- ✅ Speed optimizations design
- ✅ Comprehensive E2E workflow optimized

### In Progress (Dec 9, 13:30 UTC):

- 🔄 Applying optimizations to all phase workflows

### Next (Dec 9, 14:00 UTC):

- Commit and push optimizations
- Monitor CI run with caching
- Analyze 57 test failures

### Later (TBD):

- Phase 3: Stability improvements
- Phase 4: Architecture changes

---

## SUCCESS METRICS

### Before Optimizations:

- **CI Time**: ~15.5 minutes
- **Browser Install**: ~8 minutes (480s)
- **Test Execution**: ~6 minutes (377s)
- **Artifact Upload**: ~22s for 628 MB
- **Pass Rate**: 52% (62/119)

### Expected After Phase 2:

- **CI Time**: ~5-7 minutes (8-10 min savings)
- **Browser Install**: ~0 seconds (cached)
- **Test Execution**: ~5-6 minutes (slightly faster)
- **Artifact Upload**: ~0 seconds on success
- **Pass Rate**: 52% (unchanged, but faster iteration)

### Target After All Phases:

- **CI Time**: < 5 minutes
- **Pass Rate**: > 95% (fix remaining test issues)
- **Reliability**: < 1% flaky tests
- **Cost**: Minimal artifact storage

---

## NOTES

- Keeping `NODE_ENV=production` to maintain build fidelity
- All optimizations are **additive** - no breaking changes
- Caching strategy uses Playwright version + lockfile for cache keys
- Artifacts only uploaded on failure saves significant storage/bandwidth
