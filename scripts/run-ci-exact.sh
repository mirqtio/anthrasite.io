#!/bin/bash
set -e

# This script runs EXACTLY what CI runs, in the same order
echo "🎯 Running exact CI replication locally..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ensure we're using the same environment as CI
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/anthrasite_test
export CI=true

# Track failures
FAILURES=0

run_step() {
    local step_name=$1
    local command=$2
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Running: $step_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if eval $command; then
        echo -e "${GREEN}✓ $step_name passed${NC}"
    else
        echo -e "${RED}✗ $step_name failed${NC}"
        ((FAILURES++))
    fi
}

# Start timer
START_TIME=$(date +%s)

# Ensure PostgreSQL is running on port 5433
if ! docker ps | grep -q postgres-test; then
    echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
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

# Run the exact CI steps
echo -e "\n${BLUE}Starting CI workflow replication...${NC}"

# 1. Install dependencies (CI uses npm ci)
run_step "Install dependencies" "npm ci"

# 2. Setup test database
run_step "Setup test database" "npx prisma generate && npx prisma db push"

# 3. Run linting
run_step "Run linting" "npm run lint"

# 4. Run format check
run_step "Run format check" "npm run format:check"

# 5. Run unit tests with coverage
run_step "Run unit tests with coverage" "npm run test:coverage"

# 6. Build application
run_step "Build application" "npm run build"

# 7. Check build output size
run_step "Check build output size" "
    NEXT_SIZE=\$(du -sm .next | cut -f1)
    echo \"Build output size: \${NEXT_SIZE}MB\"
    if [ \"\$NEXT_SIZE\" -gt 2048 ]; then
        echo \"Build output exceeds 2GB limit\"
        exit 1
    fi
"

# 8. Install Playwright browsers
run_step "Install Playwright browsers" "npx playwright install --with-deps"

# 9. Run E2E tests
# Kill any existing dev server
lsof -ti:3333 | xargs kill -9 2>/dev/null || true

# Start dev server in background
echo -e "${YELLOW}Starting dev server for E2E tests...${NC}"
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for dev server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3333 > /dev/null; then
        echo "Dev server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Dev server failed to start after 30 seconds${NC}"
        cat /tmp/dev-server.log
        kill $DEV_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

run_step "Run E2E tests" "npm run test:e2e"

# Kill dev server
kill $DEV_PID 2>/dev/null || true

# Calculate total time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}CI Replication Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total time: ${MINUTES}m ${SECONDS}s"
echo -e "Total failures: ${FAILURES}"

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 All CI checks passed locally!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILURES CI checks failed${NC}"
    exit 1
fi