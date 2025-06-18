# Purchase Flow Development Mode

This directory contains development tools for testing the purchase flow without backend dependencies.

## Overview

The development mode allows you to:
- Test the full purchase UI flow without valid UTM tokens
- Simulate different purchase scenarios (valid, used, invalid tokens)
- Use a mock checkout page instead of Stripe
- Test error states and edge cases

## Setup

1. Add the following to your `.env.local` file:
   ```
   NEXT_PUBLIC_USE_MOCK_PURCHASE=true
   ```

2. Restart your development server

3. Visit `/test-purchase` to see available test options

## Available Test Scenarios

### Pre-configured UTM Tokens

- **`dev-utm-valid`** - A valid token for testing successful purchase flow
- **`dev-utm-used`** - A token that has already been used (shows warning)
- **`dev-utm-test`** - Another valid token for testing

### Mock Businesses

Three mock businesses are available:
1. **Example Business** (example.com)
2. **Test Company** (testcompany.io)
3. **ACME Corporation** (acmecorp.com)

Each has different report scores and preview data.

## Testing Flow

1. **Test Purchase Page** (`/test-purchase`)
   - Shows all available mock tokens and businesses
   - Provides quick links to test different scenarios
   - Only accessible in development mode

2. **Purchase Page** (`/purchase?utm=dev-utm-valid`)
   - Uses mock data when `NEXT_PUBLIC_USE_MOCK_PURCHASE=true`
   - Shows personalized content based on mock business
   - Checkout redirects to simulator instead of Stripe

3. **Checkout Simulator** (`/test-purchase/checkout-simulator`)
   - Simulates Stripe checkout experience
   - Auto-fills test card details
   - Redirects to success page after "payment"

## API Endpoints

### Generate Test UTM Token
```bash
# Generate random token
curl http://localhost:3000/api/dev/generate-utm

# Generate token for specific business
curl -X POST http://localhost:3000/api/dev/generate-utm \
  -H "Content-Type: application/json" \
  -d '{"businessId": "dev-business-1"}'
```

## Security

- All development features are **only** available when:
  - `NODE_ENV === 'development'`
  - `NEXT_PUBLIC_USE_MOCK_PURCHASE === 'true'`
- The `/test-purchase` page and API endpoints return 403 in production
- Mock data is never used in production, even if env var is set

## Adding New Test Cases

To add new mock businesses or tokens, edit:
- `/lib/purchase/purchase-service-dev.ts`
- Update the `MOCK_BUSINESSES` and `MOCK_UTM_TOKENS` objects

## Troubleshooting

1. **"Access Denied" on test page**
   - Ensure you're running in development mode
   - Check that Next.js is not in production build

2. **Mock data not being used**
   - Verify `NEXT_PUBLIC_USE_MOCK_PURCHASE=true` is set
   - Restart the development server after changing env vars

3. **Checkout simulator not working**
   - Must be in development mode
   - Check browser console for errors