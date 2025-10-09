#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for potential secrets..."

# Common patterns to check
PATTERNS=(
  # Stripe
  "sk_live_[0-9a-zA-Z]{24,}"
  "sk_test_[0-9a-zA-Z]{24,}"
  
  # SendGrid
  "SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}"
  
  # Generic API keys
  "api[_-]?key[\"']?\s*[:=]\s*[\"'][^\"']{32,}"
  "secret[_-]?key[\"']?\s*[:=]\s*[\"'][^\"']{32,}"
  
  # AWS
  "AKIA[0-9A-Z]{16}"
  
  # GitHub
  "ghp_[0-9a-zA-Z]{36}"
  "gho_[0-9a-zA-Z]{36}"

  # Sentry
  "sntryu_[0-9a-zA-Z]{64}"

  # Datadog
  "DD_API_KEY[\"']?\s*[:=]\s*[\"']?[0-9a-f]{32}"

  # Private keys
  "-----BEGIN (RSA|EC|DSA) PRIVATE KEY-----"
)

FOUND_SECRETS=0

# Check each pattern
for pattern in "${PATTERNS[@]}"; do
  # Search for pattern, excluding common safe locations
  results=$(grep -rE "$pattern" . \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --include="*.jsx" \
    --include="*.json" \
    --include=".env" \
    --include=".env.local" \
    --include=".env.production" \
    --include=".env.development" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=.git \
    --exclude="*.test.*" \
    --exclude="*.spec.*" \
    --exclude=".env.example" \
    --exclude=".env.test" \
    2>/dev/null)
  
  if [ ! -z "$results" ]; then
    echo -e "${RED}❌ Found potential secrets matching pattern: $pattern${NC}"
    echo "$results" | head -5
    FOUND_SECRETS=1
  fi
done

# Check for specific files that shouldn't be committed
SENSITIVE_FILES=(
  ".env"
  ".env.local"
  ".env.production"
  ".env.development"
  "secrets.json"
  "credentials.json"
)

for file in "${SENSITIVE_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if file is in git (not ignored)
    git ls-files --error-unmatch "$file" 2>/dev/null
    if [ $? -eq 0 ]; then
      echo -e "${RED}❌ Found sensitive file in git: $file${NC}"
      FOUND_SECRETS=1
    fi
  fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
  echo -e "${GREEN}✅ No secrets detected!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Potential secrets found! Please review and remove them before committing.${NC}"
  echo -e "${YELLOW}Tip: Use environment variables instead of hardcoding secrets.${NC}"
  exit 1
fi