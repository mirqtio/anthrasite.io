#!/bin/bash
set -e

echo "🐳 Running exact CI environment locally with Docker..."

# Create a temporary Dockerfile that matches CI exactly
cat > Dockerfile.ci-local << 'EOF'
FROM ubuntu:latest

# Install Node.js 20.x (matching CI)
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Install PostgreSQL client
RUN apt-get install -y postgresql-client

# Install browsers for Playwright
RUN npx playwright install-deps

WORKDIR /app
EOF

# Run the exact CI workflow
docker run --rm -it \
  --network host \
  -v $(pwd):/app \
  -e NODE_ENV=test \
  -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anthrasite_test \
  -e CI=true \
  node:20 \
  bash -c "
    cd /app
    
    echo '📦 Installing dependencies...'
    npm ci
    
    echo '🗄️ Setting up database...'
    npx prisma generate
    npx prisma db push
    
    echo '🔍 Running lint...'
    npm run lint
    
    echo '📝 Running format check...'
    npm run format:check
    
    echo '🧪 Running tests with coverage...'
    npm run test:coverage
    
    echo '🏗️ Building application...'
    npm run build
    
    echo '📊 Checking build size...'
    NEXT_SIZE=\$(du -sm .next | cut -f1)
    echo \"Build output size: \${NEXT_SIZE}MB\"
    if [ \"\$NEXT_SIZE\" -gt 2048 ]; then
        echo 'Build output exceeds 2GB limit'
        exit 1
    fi
    
    echo '🎭 Installing Playwright browsers...'
    npx playwright install --with-deps
    
    echo '🌐 Running E2E tests...'
    timeout 600 npm run test:e2e || exit 1
    
    echo '✅ All tests passed!'
  "

# Cleanup
rm -f Dockerfile.ci-local