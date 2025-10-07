#!/bin/bash

echo "🚀 Testing visual regression fixes in Docker CI environment..."

# Test just one simple homepage test to verify our fixes
echo "📱 Testing homepage organic mode..."
docker run --rm \
  -e CI=true \
  -e NEXT_PUBLIC_USE_MOCK_PURCHASE=true \
  -e SKIP_ENV_VALIDATION=true \
  -e SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1 \
  anthrasite-ci \
  npm run test:visual -- --grep "full page screenshot" --timeout=90000 --max-failures=1

echo ""
echo "✅ Docker test completed. Check the output above for results."
echo "Key success indicators:"
echo "  - No 'Test timeout' errors"
echo "  - Tests find elements with data-testid attributes" 
echo "  - Animation warnings are handled gracefully"
echo "  - Server builds and starts successfully"