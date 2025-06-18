#!/bin/bash
set -e

echo "🐳 Running CI in Docker (exact match to GitHub Actions)..."

# Stop any existing containers
docker-compose -f docker-compose.ci.yml down

# Build and run
docker-compose -f docker-compose.ci.yml up --build --abort-on-container-exit --exit-code-from ci-runner

# Cleanup
docker-compose -f docker-compose.ci.yml down