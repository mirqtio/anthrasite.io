# E2E Test Fixes Implementation Plan

## Root Causes Identified

1. **Consent Banner Blocking**: Many tests fail because the consent banner blocks interactions
2. **Timing Issues**: Tests don't wait long enough for React hydration and dynamic content
3. **Mock Data Expectations**: Some tests expect different content than what mock data provides
4. **Missing Test Utilities**: Not all tests use the helper functions for safe interactions

## Quick Fixes to Apply

### 1. Update playwright.config.ci.ts
- Increase expect timeout from 7000ms to 10000ms for CI stability
- Add global setup to clear localStorage

### 2. Fix Consent Tests
- Add explicit waits for modal animations
- Use data-testid selectors consistently
- Clear localStorage in beforeEach

### 3. Fix Purchase Tests
- Update expected text to match actual mock data
- Add consent dismissal before interactions
- Wait for network idle after navigation

### 4. Fix Waitlist Tests
- Add proper form submission handling
- Wait for API responses
- Handle loading states

### 5. Fix Homepage Mode Tests
- Ensure UTM parameters are properly encoded
- Wait for site mode context to update
- Clear cookies between tests

## Implementation Strategy

1. **Phase 1**: Fix timing and waiting issues (quick win)
2. **Phase 2**: Update test expectations to match mock data
3. **Phase 3**: Add proper consent handling to all tests
4. **Phase 4**: Fix API endpoint issues for waitlist

## Test Environment Configuration

Ensure these are set in CI:
- `NODE_ENV=test`
- `NEXT_PUBLIC_USE_MOCK_PURCHASE=true`
- `DATABASE_URL` pointing to test database
- Clear localStorage and cookies before each test