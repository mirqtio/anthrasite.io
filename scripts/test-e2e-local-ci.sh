#!/bin/bash
# Run E2E tests in Docker environment matching CI exactly

set -e

echo "🐳 Starting local CI-matching E2E test environment..."

# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
sleep 3

# Run tests in Playwright container (same as CI)
docker run --rm \
  --network="host" \
  -v "$(pwd):/work" \
  -w /work \
  -e DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anthrasite_test" \
  -e DIRECT_URL="postgresql://postgres:postgres@localhost:5432/anthrasite_test" \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_E2E='true' \
  -e NEXT_PUBLIC_E2E_TESTING='true' \
  -e DISABLE_ANALYTICS='true' \
  -e DISABLE_SENTRY='true' \
  -e DISABLE_DD='true' \
  -e DISABLE_EMAIL='true' \
  -e NEXT_PUBLIC_USE_MOCK_PURCHASE='true' \
  -e SKIP_ENV_VALIDATION='true' \
  mcr.microsoft.com/playwright:v1.53.1-jammy \
  /bin/bash -c "
    # Install dependencies
    npm install -g pnpm@latest
    pnpm install --frozen-lockfile

    # Setup database
    pnpm exec prisma generate
    pnpm exec prisma db push

    # Build
    pnpm run build

    # Run Phase 1 tests
    pnpm exec playwright test --config=playwright.config.ci.ts e2e/basic.spec.ts e2e/homepage.spec.ts
  "

# Cleanup
docker-compose down

echo "✅ Local CI tests complete"
