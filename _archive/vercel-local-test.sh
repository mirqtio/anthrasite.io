#!/bin/bash
set -e

echo "🔍 Running Vercel-equivalent local tests..."
echo "========================================"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies with frozen lockfile (like Vercel does in CI)
echo "📦 Installing dependencies with frozen lockfile..."
pnpm install --frozen-lockfile

# Run type checking
echo "🔍 Running TypeScript type checking..."
pnpm typecheck

# Run linting
echo "🔍 Running ESLint..."
pnpm lint

# Run unit tests
echo "🧪 Running unit tests..."
pnpm test

# Generate Prisma client
echo "🔨 Generating Prisma client..."
pnpm prisma generate

# Build the application (this is what Vercel runs)
echo "🏗️ Building application..."
pnpm build

# Run production server locally to verify
echo "🚀 Starting production server for verification..."
pnpm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test if server is responding
echo "🧪 Testing server response..."
if curl -f http://localhost:3333 > /dev/null 2>&1; then
    echo "✅ Server is responding correctly"
else
    echo "❌ Server is not responding"
    kill $SERVER_PID
    exit 1
fi

# Kill the server
kill $SERVER_PID

echo ""
echo "✅ All Vercel-equivalent tests passed!"
echo "========================================"
echo "It's now safe to push to main branch."