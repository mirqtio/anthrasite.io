# Deployment Troubleshooting Guide

This guide helps diagnose and fix common Vercel deployment issues.

## Common Build Failures

### 1. TypeScript Type Errors

**Error**: `Type error: Subsequent property declarations must have the same type`

**Solution**:
- Check `types/global.d.ts` for duplicate Window interface declarations
- Ensure all global type declarations are in one place
- Remove duplicate declarations from individual files

**Example Fix**:
```typescript
// ❌ Bad - duplicate declaration in provider file
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// ✅ Good - single declaration in types/global.d.ts
interface Window {
  gtag?: (command: string, ...args: any[]) => void
  // other global properties
}
```

### 2. Build Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**:
- Already configured in `vercel.json` with increased memory
- If still failing, contact Vercel support for higher limits

### 3. Missing Environment Variables

**Error**: `NEXT_PUBLIC_GA4_MEASUREMENT_ID is not defined`

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all required variables for Production environment
3. Redeploy the branch

### 4. pnpm Version Mismatch

**Error**: `Lockfile version mismatch`

**Solution**:
- Vercel now auto-detects pnpm version from lockfile
- Ensure local pnpm version matches CI

## Pre-Deployment Checklist

Run this before pushing to main:

```bash
# 1. Run deployment checks
node scripts/vercel-deploy-check.js

# 2. Test build locally
pnpm run build

# 3. Type check
pnpm exec tsc --noEmit

# 4. Run tests
pnpm test
```

## Automated Checks

GitHub Actions runs these checks automatically:
- TypeScript compilation
- Build test
- Deployment health check
- Vercel deployment status

## Quick Fixes

### Force Rebuild on Vercel
```bash
# Clear build cache
git commit --allow-empty -m "Force rebuild"
git push
```

### Check Recent Deployments
```bash
# Install Vercel CLI
npm i -g vercel

# List recent deployments
vercel ls

# Check deployment logs
vercel logs [deployment-url]
```

## Monitoring Deployment Health

### 1. Vercel Dashboard
- Check Functions tab for errors
- Review Analytics for performance issues
- Monitor Build Logs for warnings

### 2. Error Tracking
- Sentry captures runtime errors
- Check Sentry dashboard after deployment
- Look for new error patterns

### 3. Performance Monitoring
- Lighthouse scores in Vercel Analytics
- Core Web Vitals tracking
- Bundle size analysis

## Emergency Rollback

If a deployment breaks production:

1. **Instant Rollback** (Vercel Dashboard):
   - Go to Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Git Rollback**:
   ```bash
   # Revert the problematic commit
   git revert HEAD
   git push
   ```

3. **Environment Variable Rollback**:
   - Sometimes issues are caused by env var changes
   - Revert environment variables in Vercel Dashboard
   - Trigger redeployment

## Debug Failed Deployments

1. **Download Build Logs**:
   - Go to failed deployment in Vercel
   - Click "View Function Logs"
   - Download complete logs

2. **Local Reproduction**:
   ```bash
   # Simulate Vercel build environment
   NODE_ENV=production pnpm run build
   ```

3. **Check Dependencies**:
   ```bash
   # Verify all deps are in package.json
   pnpm ls
   
   # Check for missing types
   pnpm exec tsc --noEmit --listFiles | grep node_modules
   ```

## Contact Support

If issues persist:
1. Gather deployment URL and error logs
2. Check Vercel Status: https://vercel-status.com
3. Contact Vercel Support with:
   - Deployment URL
   - Error messages
   - Steps to reproduce

## Prevention

1. **Always test locally first**:
   ```bash
   pnpm run build && pnpm start
   ```

2. **Use preview deployments**:
   - Create PRs for testing
   - Vercel creates preview URLs automatically

3. **Monitor after deployment**:
   - Check Sentry for new errors
   - Verify analytics are working
   - Test critical user flows