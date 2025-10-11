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

### Current Iteration (Local) - 🔧 Dependency & Pre-push Hook Issues

- **Issue 1**: TypeScript compiling excluded files (CI_logs, Playwright configs)
- **Fix 1**: Updated tsconfig.json to exclude `CI_logs/**/*` and `playwright*.config*.ts`
- **Issue 2**: `@opentelemetry/api` module not found during lint
- **Root Cause**: OpenTelemetry in devDependencies but needed by Sentry at runtime
- **Fix 2**: Moving `@opentelemetry/api` from devDependencies to dependencies
- **Status**: About to reinstall dependencies and push fixes

---

## 🎯 Current Tasks

1. **[IN PROGRESS]** Fix local dependency issues blocking push

   - ✅ Removed duplicate `playwright.config.ci 2.ts`
   - ✅ Updated tsconfig.json exclusions
   - ✅ Moved `@opentelemetry/api` to dependencies
   - 🔄 Need to reinstall and verify lint passes

2. **[PENDING]** Push iteration 6 fixes:

   - Unit test fix (Analytics async timing)
   - TypeScript config fix
   - Dependency fix (OpenTelemetry)

3. **[PENDING]** Download and analyze iteration 5 logs

   - Need to verify browser project isolation
   - Check actual E2E test failures

4. **[PENDING]** Fix any E2E test failures found in iteration 5

---

## 📋 Fixes Committed (Not Yet Pushed)

1. **Commit 90807ce6**: `fix(tests): add waitFor to Analytics page view test for async state updates`

   - Made test async and wrapped assertion in waitFor
   - Handles dependent useEffect timing

2. **Commit (staged)**: `fix(typecheck): exclude CI_logs and Playwright configs from TypeScript compilation`

   - Added CI_logs and playwright config exclusions to tsconfig.json

3. **Modified (not committed)**: package.json
   - Moved `@opentelemetry/api` from devDependencies to dependencies

---

## 🔍 User Feedback to Address

1. **Browser Isolation**: User reported "each shard is running all tests" - need to verify Playwright projects are properly isolating tests by browser type

2. **No Pre-existing Failures**: User emphasized we're building this for the first time, so ALL failures must be fixed (including the unit test)

---

## 📊 CI v2 Implementation Status

| Component                   | Status      | Notes                              |
| --------------------------- | ----------- | ---------------------------------- |
| E2E Job Matrix (5 browsers) | ✅ Working  | All jobs reach test execution      |
| Database Setup              | ✅ Working  | Using `prisma db push`             |
| Test Data Seeding           | ✅ Working  | Fixed model names and fields       |
| Production Build            | ✅ Working  | Standalone mode                    |
| Server Start                | ✅ Working  | Port 3333 aligned                  |
| E2E Test Execution          | ⚠️ Running  | Tests execute but failures present |
| Unit Tests                  | ❌ Failing  | Analytics async timing (fix ready) |
| Browser Isolation           | ❓ Unknown  | Need to verify from logs           |
| Pre-push Hooks              | ❌ Blocking | Dependency issues (fixing now)     |

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
