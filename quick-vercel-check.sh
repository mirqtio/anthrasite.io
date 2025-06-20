#!/bin/bash
set -e

echo "🚀 Quick Vercel compatibility check..."
echo "======================================"

# 1. Check for lockfile sync
echo "1️⃣ Checking pnpm lockfile sync..."
if pnpm install --frozen-lockfile --dry-run 2>&1 | grep -q "ERR_PNPM_OUTDATED_LOCKFILE"; then
    echo "❌ Lockfile is out of sync! Run 'pnpm install' to fix."
    exit 1
else
    echo "✅ Lockfile is in sync"
fi

# 2. Quick TypeScript check
echo "2️⃣ Running quick TypeScript check..."
if ! pnpm tsc --noEmit --incremental false; then
    echo "❌ TypeScript errors found!"
    exit 1
else
    echo "✅ TypeScript check passed"
fi

# 3. Check for missing imports/modules
echo "3️⃣ Checking for missing imports..."
if ! pnpm next build --dry-run 2>/dev/null; then
    # Try actual build if dry-run not supported
    if ! NODE_ENV=production pnpm next build; then
        echo "❌ Build failed! Check for missing imports or modules."
        exit 1
    fi
fi
echo "✅ No missing imports detected"

# 4. Check for duplicate files with " 2" suffix
echo "4️⃣ Checking for duplicate files..."
DUPLICATE_FILES=$(find . -name "* 2.*" -type f | grep -v node_modules | grep -v .git || true)
if [ -n "$DUPLICATE_FILES" ]; then
    echo "❌ Found duplicate files:"
    echo "$DUPLICATE_FILES"
    echo "Remove these files before pushing!"
    exit 1
else
    echo "✅ No duplicate files found"
fi

# 5. Check package.json scripts
echo "5️⃣ Verifying build script..."
if ! grep -q '"build":' package.json; then
    echo "❌ No build script found in package.json!"
    exit 1
else
    echo "✅ Build script exists"
fi

echo ""
echo "✅ Quick Vercel check passed!"
echo "======================================"
echo "Run ./vercel-local-test.sh for full verification"