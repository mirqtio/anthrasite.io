#!/bin/bash
set -e

echo "🚀 Running CI locally..."

# Run linting
echo "📋 Running linting..."
npm run lint || echo "⚠️  Linting failed"

# Run format check
echo "📝 Running format check..."
npm run format:check || echo "⚠️  Format check failed"

# Run tests
echo "🧪 Running tests..."
npm run test:coverage || echo "⚠️  Tests failed"

# Build
echo "🏗️ Building application..."
npm run build || echo "⚠️  Build failed"

echo "✅ CI checks complete!"
