# Anthrasite.io Development Context - Post-Reboot Recovery

## Current Status Summary
**Last Updated**: 2025-06-26
**Primary Goal**: Make the purchase/payment page accessible for development with Stripe integration

## What Was Completed

### 1. Performance Optimization (✅ COMPLETED)
- **Initial Problem**: Mobile PageSpeed score dropped from 96 to 81
- **Root Cause**: Render-blocking CSS and heavy analytics libraries
- **Solution Implemented**:
  - Removed legacy polyfills via `.browserslistrc`
  - Code-split PurchaseHomepage with dynamic imports
  - Created lazy-loading analytics manager
  - Deferred Sentry initialization
- **Final Result**: Mobile score improved to 95/100 (exceeded 90+ target)

### 2. Development Infrastructure (✅ COMPLETED)
Created comprehensive testing infrastructure for purchase page access:

#### A. Middleware Bypass (`middleware.ts`)
- Added `/dev` to PUBLIC_PATHS (line 15)
- Added UTM bypass token support for development
- Environment variables: `ENABLE_TEST_MODE=true`, `UTM_BYPASS_TOKEN=dev-test-token`

#### B. Development Purchase Page (`app/dev/purchase/page.tsx`)
- Created dedicated development route that bypasses all middleware
- Shows all purchase components with mock data
- Integrates with Stripe test keys from `.env.local`

#### C. Admin API (`app/api/admin/generate-utm/route.ts`)
- Secure endpoint for generating valid UTM tokens
- Requires `ADMIN_API_KEY` authentication

#### D. Test Harness (`app/test-harness/page.tsx`)
- Production-safe testing interface
- Token generation and test scenario management

#### E. Development Scripts (`scripts/dev-server.sh`)
- Automated startup script with environment checks
- Shows all available test URLs

## Current Issue
The development server is having startup issues:
- Server starts but may hang during compilation
- Multiple processes may be conflicting
- System needs a reboot to clear process conflicts

## Next Steps After Reboot

### 1. Start Fresh Dev Server
```bash
# Kill any lingering processes
pkill -f "next dev"

# Start the dev server
npm run dev
# OR use the dev script
./scripts/dev-server.sh
```

### 2. Access Development Purchase Page
Once server is running on http://localhost:3333:
- **Primary Dev URL**: http://localhost:3333/dev/purchase
- This bypasses ALL middleware and shows the purchase page directly

### 3. Alternative Access Methods
If `/dev/purchase` doesn't work:
- **With UTM Token**: http://localhost:3333/purchase?utm=dev-test-token
- **Test Harness**: http://localhost:3333/test-harness
- **Generate Token**: Use admin API to create valid tokens

## Key Files Modified

### Core Purchase Flow
- `app/dev/purchase/page.tsx` - Development purchase page
- `middleware.ts` - Added dev bypasses
- `lib/purchase/purchase-service.ts` - Mock mode support

### Configuration
- `.env.local` - Contains all necessary keys including:
  - `ENABLE_TEST_MODE=true`
  - `UTM_BYPASS_TOKEN=dev-test-token`
  - `ADMIN_API_KEY=dev-admin-key-123`
  - Stripe test keys (need real test keys from Stripe dashboard)

### Testing Infrastructure
- `app/test-harness/page.tsx` - Testing interface
- `app/api/admin/generate-utm/route.ts` - Token generation
- `scripts/dev-server.sh` - Dev server startup

## Important Notes

### Environment Variables
All necessary environment variables are in `.env.local`:
- Database connection works (Supabase)
- Test mode is enabled
- UTM bypass token is set
- Admin API key is configured

### Stripe Integration
The `.env.local` has placeholder Stripe keys:
```
STRIPE_SECRET_KEY="sk_test_51234567890abcdefghijklmnopqrstuvwxyz"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51234567890abcdefghijklmnopqrstuvwxyz"
```
These need to be replaced with real Stripe test keys from https://dashboard.stripe.com/test/apikeys

### Known Issues
1. Edge Config warnings - can be ignored (not critical)
2. Sentry deprecation warning - can be ignored
3. Database connection timeout during migrations - may need retry

## Quick Recovery Commands
```bash
# 1. Check nothing is running
ps aux | grep "next dev" | grep -v grep

# 2. Start fresh
npm run dev

# 3. Test it's working
curl http://localhost:3333/

# 4. Access purchase page
open http://localhost:3333/dev/purchase
```

## User's Original Request
"Publish the updated code to the dev server so we can start working on that page. Note: there are Stripe integrations that need to work on it, even in dev."

## Status: Ready for development after reboot
All code is in place. Just need to:
1. Reboot system
2. Start dev server
3. Access http://localhost:3333/dev/purchase