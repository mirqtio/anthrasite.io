# CI Test Analysis Report

## Summary

Currently, only 28.6% of E2E tests are running in the "Comprehensive E2E" workflow (4 out of 14 tests).

## Disabled/Bypassed Tests

### 1. Linting (basic-ci.yml)

- **Status**: Set to warnings only with `continue-on-error: true`
- **Impact**: Linting errors don't fail the build
- **Fix Required**: Remove `continue-on-error` flag

### 2. E2E Tests Excluded from Comprehensive Suite

The following 10 E2E tests are NOT running in comprehensive-e2e.yml:

1. **site-mode.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
2. **site-mode-context.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
3. **homepage-mode-detection.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
4. **utm-validation.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
5. **waitlist.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
6. **client-side-rendering.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
7. **full-user-journey.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
8. **homepage-rendering.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
9. **consent.spec.ts**
   - Status: Excluded
   - Reason: Unknown - needs investigation
10. **purchase.spec.ts**
    - Status: Excluded (and has uncommitted changes)
    - Reason: Unknown - needs investigation

### 3. Code Coverage Upload

- **Status**: Set to `fail_ci_if_error: false` and `continue-on-error: true`
- **Impact**: Coverage upload failures don't fail the build
- **Fix Required**: Investigate why coverage uploads fail

## Test Commands That Should Be Running

### Unit/Integration Tests

- `npm run lint` (without continue-on-error)
- `npm run format:check`
- `npm run test:coverage`

### E2E Tests

All 14 test files should run:

```bash
npx playwright test --config=playwright.config.ci.ts
```

## Priority Order for Fixes

1. **High Priority**: Re-enable all 10 excluded E2E tests
2. **High Priority**: Fix linting to fail on errors
3. **Medium Priority**: Fix code coverage upload issues
4. **Medium Priority**: Consolidate or document the 6 phase workflows

## Next Steps

1. Run each excluded test locally to identify failure reasons
2. Fix failing tests one by one
3. Update CI configuration to include all tests
4. Ensure local Docker environment matches CI for consistent results
