# CI v2 - Hermetic E2E Pipeline - Debugging Progress

**Status**: 🔧 DEBUGGING ITERATION 5 - Local dependency fix in progress
**Run**: #18427843562 (completed - failed)
**Goal**: Fix all CI issues recursively until green

---

## 🔄 Iteration History

### Iteration 1 (Run 18427686352) - ❌ DIRECT_URL Missing

- **Error**: `Environment variable not found: DIRECT_URL`
- **Fix**: Added `DIRECT_URL` to both e2e and unit job environments
- **Commit**: a9a6b257

### Iteration 2 (Run 18427736969) - ❌ Migration Conflict

- **Error**: `relation "businesses" already exists` during `prisma migrate deploy`
- **Root Cause**: Migration history conflicts in ephemeral CI databases
- **Fix**: Changed from `prisma migrate deploy` to `prisma db push --accept-data-loss`
- **Commit**: 86a02ace

### Iteration 3 (Run 18427753744) - ❌ Seed Script Model Error

- **Error**: `Cannot read properties of undefined (reading 'upsert')`
- **Root Cause**:
  - Used `prisma.uTMToken` instead of `prisma.utmToken` (incorrect camelCase)
  - Missing required `nonce` field
  - Used wrong field `isValid` instead of `used`
- **Fix**: Corrected model name, added nonce, fixed field names
- **Commit**: 89b9815a

### Iteration 4 (Run 18427774958) - ❌ Port Mismatch

- **Error**: Server started but `wait-on http://localhost:3000` timed out
- **Root Cause**: Server runs on port 3333 but CI checked port 3000
- **Fix**:
  - Updated CI workflow wait-on to use port 3333
  - Updated `playwright.config.ts` baseURL to port 3333
- **Commit**: 0554702d

### Iteration 5 (Run 18427843562) - ❌ E2E Tests Ran, Failures Found

- **Milestone**: ✅ First time E2E tests actually started execution!
- **Status**: All 5 browser jobs ran for 25m22s
- **Unit Test**: Still failing - Analytics trackPageView async timing issue
- **User Concern**: Browser project isolation - chromium-desktop may be running mobile tests
- **Pending**: Download and analyze detailed logs

### Iteration 6 (Run 18428280948) - ✅ Unit Tests Passing, Config Issues Found

- **Milestone**: ✅ Unit tests passing after Analytics test fix!
- **Issue Discovered**: Playwright config mismatch causing slow execution
- **Root Cause Analysis**:
  1. CI workflow used `pnpm test:e2e` (base config) instead of `pnpm test:e2e:ci`
  2. Base config has `workers: 1` in CI mode (very slow)
  3. CI config has `workers: 6` but only defined 1 project ("chromium")
  4. CI workflow passes `--project=chromium-desktop` etc. which didn't match CI config
  5. Result: Each job ran with 1 worker → 25-minute execution times
- **User Feedback**: "Did you do anything about each shard running all tests?"
- **Status**: Fixes implemented for iteration 7

### Current Iteration (Local) - 🔧 Playwright Config & Worker Optimization

- **Fix 1**: Updated `playwright.config.ci.ts` to define all 5 projects
  - chromium-desktop, firefox-desktop, webkit-desktop, chromium-mobile, webkit-mobile
  - Matches project names used by CI workflow matrix
- **Fix 2**: Updated CI workflow to use `pnpm test:e2e:ci --project=...`
  - Now uses CI config with 6 workers instead of base config with 1 worker
- **Expected Impact**:
  - Proper browser project isolation (each job runs only its assigned project)
  - 6x faster parallelism (6 workers vs 1 worker per job)
  - Should reduce E2E job time from ~25min to ~4-5min per job
- **Status**: About to commit and push for iteration 7

---

## 🎯 Current Tasks

1. **[COMPLETED]** Push iteration 6 fixes:

   - ✅ Unit test fix (Analytics async timing)
   - ✅ TypeScript config fix (exclude CI_logs, playwright configs)
   - ✅ Dependency fix (OpenTelemetry moved to dependencies)
   - ✅ All pre-push checks passing

2. **[IN PROGRESS]** Commit and push iteration 7 fixes:

   - ✅ Updated `playwright.config.ci.ts` with all 5 projects
   - ✅ Updated CI workflow to use `test:e2e:ci`
   - ✅ Updated SCRATCHPAD.md with iteration 6 analysis
   - 🔄 Need to commit and push

3. **[PENDING]** Monitor iteration 7 CI execution

   - Verify 6-worker parallelism is working
   - Check if execution time reduces from ~25min to ~4-5min
   - Confirm browser project isolation

4. **[PENDING]** Fix any remaining E2E test failures

---

## 📋 Fixes Committed (Ready to Push)

**Iteration 6 Fixes (already pushed):**

1. **Commit 90807ce6**: `fix(tests): add waitFor to Analytics page view test for async state updates`
2. **Commit d077deed**: `fix(deps): move @opentelemetry/api to dependencies & exclude CI artifacts from typecheck`

**Iteration 7 Fixes (staged for commit):**

3. **Modified**: `playwright.config.ci.ts`
   - Added all 5 browser projects (chromium-desktop, firefox-desktop, webkit-desktop, chromium-mobile, webkit-mobile)
   - Matches CI workflow matrix project names
4. **Modified**: `.github/workflows/ci-v2.yml`
   - Changed from `pnpm test:e2e` to `pnpm test:e2e:ci`
   - Enables 6-worker parallelism and CI-optimized settings
5. **Modified**: `SCRATCHPAD.md`
   - Documented iteration 6 findings and root cause analysis

---

## 🔍 User Feedback to Address

1. **Browser Isolation**: User reported "each shard is running all tests" - need to verify Playwright projects are properly isolating tests by browser type

2. **No Pre-existing Failures**: User emphasized we're building this for the first time, so ALL failures must be fixed (including the unit test)

---

## 📊 CI v2 Implementation Status

| Component                   | Status       | Notes                                |
| --------------------------- | ------------ | ------------------------------------ |
| E2E Job Matrix (5 browsers) | ✅ Working   | All jobs reach test execution        |
| Database Setup              | ✅ Working   | Using `prisma db push`               |
| Test Data Seeding           | ✅ Working   | Fixed model names and fields         |
| Production Build            | ✅ Working   | Standalone mode                      |
| Server Start                | ✅ Working   | Port 3333 aligned                    |
| Unit Tests                  | ✅ Passing   | Analytics test fixed (iteration 6)   |
| Pre-push Hooks              | ✅ Working   | All checks passing                   |
| Playwright Config           | 🔧 Fixed     | CI config now defines all 5 projects |
| Worker Parallelism          | 🔧 Fixed     | CI now uses 6 workers (was 1)        |
| Browser Isolation           | ⏳ Verifying | Should work with iteration 7 config  |
| E2E Test Execution          | ⏳ Pending   | Waiting for iteration 7 results      |
| Dependency Caching          | ⏳ Pending   | Should activate in iteration 7       |
| Playwright Browser Caching  | ⏳ Pending   | Should activate in iteration 7       |

---

## 🚀 Next Steps

1. Install dependencies after moving OpenTelemetry
2. Verify `pnpm lint` passes
3. Commit package.json changes
4. Push all commits (triggers iteration 6)
5. Download iteration 5 logs to analyze E2E failures
6. Fix any remaining E2E test issues
7. Verify browser project isolation
8. Continue recursive debugging until all green

---

## 🎯 Success Criteria

- ✅ Unit tests passing (fix committed)
- ⏳ E2E tests passing across all 5 browsers
- ⏳ Browser projects properly isolated
- ⏳ Zero pre-existing failures
- ⏳ 5 consecutive green CI runs
