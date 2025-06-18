#!/bin/bash
set -e

echo "🚀 Running CI tests locally with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test step
run_step() {
    local step_name=$1
    local command=$2
    
    echo -e "\n${YELLOW}Running: $step_name${NC}"
    if eval $command; then
        echo -e "${GREEN}✓ $step_name passed${NC}"
    else
        echo -e "${RED}✗ $step_name failed${NC}"
        exit 1
    fi
}

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker-compose -f docker-compose.test.yml up -d postgres
sleep 5

# Set environment variables
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anthrasite_test

# Run CI steps in order
run_step "Install dependencies" "npm ci"

run_step "Setup test database" "npx prisma generate && npx prisma db push"

run_step "Linting" "npm run lint"

run_step "Format check" "npm run format:check"

run_step "Unit tests with coverage" "npm run test:coverage"

run_step "Build application" "npm run build"

run_step "Check build output size" "
    NEXT_SIZE=\$(du -sm .next | cut -f1)
    echo \"Build output size: \${NEXT_SIZE}MB\"
    if [ \"\$NEXT_SIZE\" -gt 2048 ]; then
        echo \"Build output exceeds 2GB limit\"
        exit 1
    fi
"

# E2E tests need special handling
echo -e "\n${YELLOW}Running: E2E tests${NC}"
# Kill any existing dev server
lsof -ti:3333 | xargs kill -9 2>/dev/null || true

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for dev server..."
for i in {1..30}; do
    if curl -s http://localhost:3333 > /dev/null; then
        break
    fi
    sleep 1
done

# Run E2E tests
if npm run test:e2e; then
    echo -e "${GREEN}✓ E2E tests passed${NC}"
else
    echo -e "${RED}✗ E2E tests failed${NC}"
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

# Kill dev server
kill $DEV_PID 2>/dev/null || true

# Cleanup
docker-compose -f docker-compose.test.yml down

echo -e "\n${GREEN}🎉 All CI tests passed locally!${NC}"