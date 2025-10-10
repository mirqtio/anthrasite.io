#!/bin/bash
# E2E Test Server Startup Script
# Starts Next.js dev server with all required environment variables

export PORT=3333
export NODE_ENV=development
export ENABLE_TEST_MODE=true
export E2E_TESTING=true
export NEXT_PUBLIC_E2E_TESTING=true
export NEXT_PUBLIC_USE_MOCK_PURCHASE=true

# Database
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/anthrasite_test}"

# UTM and Admin
export UTM_SECRET_KEY="development-secret-key-replace-in-production"
export ADMIN_API_KEY="test-admin-key-local-only"

# Stripe keys (required from environment, no fallbacks for secrets)
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-whsec_test_fake}"

# Feature flag - CRITICAL
export NEXT_PUBLIC_FF_PURCHASE_ENABLED=true

# Analytics
export NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-TEST123456"
export GA4_API_SECRET="test-secret"
export NEXT_PUBLIC_POSTHOG_KEY="phc_test_key"
export NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
export EDGE_CONFIG=""

# Start the server
exec pnpm run dev
