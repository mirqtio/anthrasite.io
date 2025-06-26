#!/bin/bash

# Development server startup script
# This ensures all necessary environment variables are loaded

echo "🚀 Starting Anthrasite Development Server..."
echo "📋 Loading environment variables from .env and .env.local"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please create .env.local with the necessary environment variables"
    exit 1
fi

# Check for required keys
required_vars=(
    "DATABASE_URL"
    "ENABLE_TEST_MODE"
    "UTM_BYPASS_TOKEN"
    "ADMIN_API_KEY"
)

echo "✅ Checking required environment variables..."
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.local; then
        echo "⚠️  Warning: ${var} not found in .env.local"
    fi
done

echo "📦 Installing dependencies if needed..."
pnpm install

echo "🔄 Running database migrations..."
pnpm prisma migrate deploy

echo "🌱 Seeding development data if needed..."
# Add seed command here if you have one
# pnpm prisma db seed

echo "🎯 Starting Next.js development server..."
echo ""
echo "📌 Available test URLs:"
echo "   Homepage (Organic): http://localhost:3333"
echo "   Homepage (Purchase): http://localhost:3333/?utm=dev-test-token"
echo "   Purchase Page: http://localhost:3333/purchase?utm=dev-test-token&preview=true"
echo "   Test Harness: http://localhost:3333/test-harness"
echo "   Analytics: http://localhost:3333/analytics"
echo ""
echo "🔑 Test Credentials:"
echo "   UTM Bypass Token: dev-test-token"
echo "   Admin API Key: dev-admin-key-123"
echo "   Test Harness Key: test-harness-key-456"
echo ""

# Start the development server
pnpm dev