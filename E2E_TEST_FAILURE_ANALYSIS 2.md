# E2E Test Failure Analysis

## Summary
- **Total Tests**: 100
- **Passed**: 50
- **Failed**: 48
- **Skipped**: 2
- **Success Rate**: 50%

## Test Failures by Category

### 1. Consent Modal Tests (5 failures)
- `should open preferences modal` - Timeout waiting for modal
- `should save custom preferences` - Timeout
- `should close preferences modal when clicking backdrop` - Timeout
- `should be keyboard accessible` - Timeout
- `should maintain state during client-side interactions` - Timeout

**Root Cause**: Likely the consent preferences modal is not rendering or not interactive

### 2. Homepage Mode Detection Tests (14 failures)
- Multiple tests failing with purchase mode detection
- UTM parameter validation not working
- Mode persistence issues across refreshes
- Error states for invalid UTMs not showing

**Root Cause**: Site mode context or UTM validation logic issues

### 3. Waitlist Tests (6 failures)
- All waitlist signup tests timing out after 16.5s
- Form submission not completing
- Domain validation not working
- Loading states not showing

**Root Cause**: Waitlist form not functional or API endpoints not responding

### 4. Purchase Page Tests (9 failures)
- Page not loading with UTM parameters
- Trust signals not showing
- Features list not rendering
- Checkout button not functional

**Root Cause**: Purchase page requires valid UTM but mock data not working

### 5. UTM Validation Tests (6 failures)
- Valid UTM not displaying purchase page
- Expired UTM not showing error page
- One-time use enforcement not working

**Root Cause**: UTM validation API or mock data issues

### 6. Full User Journey Tests (9 failures)
- Complete flows timing out
- Network error handling failing
- 404 page not working

**Root Cause**: Integration between multiple components failing

## Common Patterns
1. **Timeouts**: Most failures are 7-8 second timeouts waiting for elements
2. **Mock Data**: Tests expecting mock purchase data but not receiving it
3. **API Endpoints**: Validation endpoints may not be configured for test env
4. **Modal Interactions**: Any test involving modals is failing

## Priority Fixes

### High Priority (Blocking Many Tests)
1. **Fix UTM mock data in test environment**
   - Ensure `NEXT_PUBLIC_USE_MOCK_PURCHASE=true` is working
   - Check mock UTM generation and validation

2. **Fix consent modal rendering**
   - Check if consent components are loading
   - Verify modal trigger mechanisms

3. **Fix waitlist API endpoint**
   - Ensure `/api/waitlist` is responding
   - Check domain validation endpoint

### Medium Priority
4. **Fix site mode context**
   - Mode switching logic
   - Cookie persistence

5. **Fix error pages**
   - 404 handling
   - Expired UTM pages

## Next Steps
1. Start with fixing mock data configuration
2. Then fix individual component issues
3. Finally fix integration tests