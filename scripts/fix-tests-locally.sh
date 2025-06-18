#!/bin/bash
set -e

echo "🔧 Fixing tests locally to match CI environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Set up environment
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/anthrasite_test
export CI=true

# Ensure PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! docker ps | grep -q postgres-test; then
    echo "Starting PostgreSQL container..."
    docker run -d --name postgres-test -p 5433:5432 \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=anthrasite_test \
        postgres:15
    sleep 5
fi

# Reset database
echo -e "${YELLOW}Resetting test database...${NC}"
npx prisma db push --force-reset

# Run linting
echo -e "\n${YELLOW}Running linting...${NC}"
npm run lint

# Run format check
echo -e "\n${YELLOW}Running format check...${NC}"
npm run format:check

# Run unit tests
echo -e "\n${YELLOW}Running unit tests...${NC}"
npm test 2>&1 | grep -E "(Test Suites:|Tests:)" || true

# Show failing tests
echo -e "\n${YELLOW}Failing test files:${NC}"
npm test 2>&1 | grep "FAIL" | grep -v "FAILFAST" | sort | uniq || true

# Build
echo -e "\n${YELLOW}Running build...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build passed${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
fi

# Check build size
if [ -d .next ]; then
    NEXT_SIZE=$(du -sm .next | cut -f1)
    echo -e "\n${YELLOW}Build size: ${NEXT_SIZE}MB${NC}"
fi

echo -e "\n${YELLOW}Summary of issues to fix:${NC}"
echo "1. Fix remaining test failures"
echo "2. Fix any ESLint errors in build"
echo "3. Fix E2E tests to match actual UI"
echo "4. Ensure all tests pass with coverage thresholds"