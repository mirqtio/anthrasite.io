#!/bin/bash
# Quick test runner using Docker

echo "🐳 Running tests in Docker..."

# Start PostgreSQL
docker run -d --name postgres-ci -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=anthrasite_test \
  postgres:15

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
for i in {1..30}; do
  if docker exec postgres-ci pg_isready -U postgres > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  sleep 1
done

# Run tests in Docker
docker run --rm \
  --network host \
  -v $(pwd):/app \
  -w /app \
  -e NODE_ENV=test \
  -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anthrasite_test \
  -e CI=true \
  node:20 \
  bash -c "
    npm ci
    npx prisma generate
    npx prisma db push --force-reset
    npm test 2>&1 | grep -E '(FAIL|Test Suites:|Tests:)' | tail -20
  "

# Cleanup
docker stop postgres-ci && docker rm postgres-ci