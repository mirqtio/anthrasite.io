# Testing Guide for Purchase Flow

This guide explains how to test the purchase flow in both development and production environments.

## Overview

We have a multi-layered testing approach:

1. **Development Testing** - Local testing with bypass tokens
2. **Preview/Staging Testing** - Testing on Vercel preview deployments
3. **Production Testing** - Safe testing in production with real tokens
4. **E2E Automation** - Playwright tests that work across all environments

## Environment Setup

### Development

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_PURCHASE=true
UTM_BYPASS_TOKEN=dev-bypass-token
ENABLE_TEST_MODE=true
ADMIN_API_KEY=dev-admin-key
NEXT_PUBLIC_ADMIN_API_KEY=dev-admin-key
```

### Staging/Preview

```bash
# Vercel Environment Variables
ENABLE_TEST_MODE=true
ADMIN_API_KEY=your-staging-admin-key
UTM_SECRET_KEY=your-staging-secret
```

### Production

```bash
# Vercel Environment Variables
ALLOW_ADMIN_UTM_GENERATION=true  # Only if needed
ADMIN_API_KEY=your-secure-admin-key
UTM_SECRET_KEY=your-production-secret
NEXT_PUBLIC_TEST_HARNESS_KEY=your-test-harness-key
NEXT_PUBLIC_ENABLE_TEST_HARNESS=true  # Only for specific test periods
```

## Testing Methods

### 1. Manual Testing with Bypass Token (Development Only)

```bash
# Visit these URLs in development:
http://localhost:3333/purchase?utm=dev-bypass-token
http://localhost:3333/purchase?utm=dev-bypass-token&preview=true
http://localhost:3333/?utm=dev-bypass-token
```

### 2. Generate Valid UTM Tokens (All Environments)

Use the admin API to generate valid tokens:

```bash
curl -X POST https://your-site.com/api/admin/generate-utm \
  -H "x-admin-api-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "test-001",
    "businessName": "Test Business",
    "domain": "test.example.com"
  }'
```

### 3. Test Harness Page (Production-Safe)

Visit `/test-harness` with authentication to:

- Generate test tokens
- Access all test scenarios
- Get direct links for testing

```bash
# Production
https://www.anthrasite.io/test-harness

# Enter the test harness key when prompted
```

### 4. E2E Tests with Playwright

```bash
# Run locally
TEST_ENV=development npm run test:e2e

# Run against staging
TEST_ENV=staging STAGING_URL=https://preview.vercel.app npm run test:e2e

# Run against production (be careful!)
TEST_ENV=production PROD_ADMIN_API_KEY=xxx npm run test:e2e
```

## Test Scenarios

### Critical User Flows

1. **Organic Visitor Flow**

   - Visit homepage without UTM → See organic content
   - Click "Join Waitlist" → Modal appears
   - Submit email → Success message

2. **Purchase Flow (Valid UTM)**

   - Visit with valid UTM → See purchase homepage
   - Click "Get Report" → Redirect to /purchase
   - See pricing → Click checkout → Redirect to Stripe

3. **Purchase Flow (Invalid UTM)**

   - Visit with invalid UTM → Redirect to homepage
   - Visit with expired UTM → Redirect to /link-expired

4. **Direct Purchase Access**
   - Visit /purchase without UTM → Redirect to homepage
   - Visit /purchase with valid UTM → See purchase page
   - Visit /purchase with preview=true → No Stripe redirect

### Edge Cases

- UTM token expiration handling
- Multiple UTM uses (should fail on second use)
- Network errors during checkout
- Mobile responsive behavior
- Analytics tracking verification

## Security Considerations

1. **Admin API Key** - Keep secure, rotate regularly
2. **Test Harness Key** - Separate from admin key, limited scope
3. **UTM Secret** - Never expose, used for token signing
4. **Bypass Token** - Development only, never in production

## Monitoring Test Impact

Track test sessions separately:

- Use specific business IDs for tests (prefix with "test-")
- Filter analytics by test user agents
- Monitor for anomalies in conversion data

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  pull_request:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
        env:
          TEST_ENV: staging
          STAGING_URL: ${{ github.event.deployment_status.target_url }}
          STAGING_ADMIN_API_KEY: ${{ secrets.STAGING_ADMIN_API_KEY }}
```

## Troubleshooting

### Common Issues

1. **"Unauthorized" error from admin API**

   - Check ADMIN_API_KEY is set correctly
   - Verify environment allows token generation

2. **Middleware redirects in development**

   - Ensure UTM_BYPASS_TOKEN is set
   - Check ENABLE_TEST_MODE=true

3. **Test harness not accessible**

   - Verify NEXT_PUBLIC_ENABLE_TEST_HARNESS=true
   - Check authentication key is correct

4. **E2E tests failing**
   - Check network connectivity
   - Verify test environment configuration
   - Look for timing issues (add waits if needed)

### Debug Mode

Enable detailed logging:

```bash
# Development
DEBUG=anthrasite:* npm run dev

# E2E Tests
DEBUG=pw:api npm run test:e2e
```
