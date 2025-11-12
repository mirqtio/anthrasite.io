# E2E Test Failure Analysis - I8

**Date**: 2025-10-09
**Test Run**: Journey tests (`@journey` tag)
**Command**: `pnpm test:e2e --grep "@journey"`

---

## Failures Summary

**Total Tests**: 10 (2 tests × 5 browsers)
**Failed**: 10/10 (100%)
**Root Causes**: 2 distinct issues

---

## Issue 1: Missing Playwright Browser Binaries

### Symptoms

- ❌ Firefox tests fail immediately
- ❌ WebKit tests fail immediately
- ❌ Mobile Safari tests fail immediately

### Error Message

```
Error: browserType.launch: Executable doesn't exist at /Users/charlieirwin/Library/Caches/ms-playwright/firefox-1488/firefox/Nightly.app/Contents/MacOS/firefox
```

### Root Cause

Playwright browsers (Firefox, WebKit) not installed after dependency updates.

### Affected Browsers

- Firefox (2 tests)
- WebKit (2 tests)
- Mobile Safari (2 tests)

### Fix

```bash
pnpm exec playwright install
```

---

## Issue 2: Dev Server Not Starting / Health Endpoint Timeout

### Symptoms

- ❌ Chromium tests timeout waiting for `/api/health`
- ❌ Mobile Chrome tests timeout waiting for `/api/health`
- ⏱️ Request timeout after 10000ms (10 seconds)

### Error Message

```
Error: apiRequestContext.get: Request timed out after 10000ms
Call log:
  - → GET http://localhost:3333/api/health
```

### Root Cause

The Playwright `webServer` config uses `npm run dev` but:

1. Dev server may not be starting
2. Server might be taking >120s to start (exceeds timeout)
3. Health endpoint might not be responding correctly

### Affected Tests

- Chromium (2 tests)
- Mobile Chrome (2 tests)

### Diagnosis Steps

1. Check if dev server is configured to start
2. Verify `playwright.config.ts` webServer settings
3. Test health endpoint manually
4. Check for port conflicts on 3333

### Potential Fixes

1. Ensure webServer command is correct in config
2. Increase webServer timeout if needed
3. Verify health endpoint works in dev mode
4. Check for port conflicts

---

## Test Execution Environment

**Config File**: `playwright.config.ts`
**Base URL**: `http://localhost:3333`
**WebServer Command**: `NEXT_PUBLIC_USE_MOCK_PURCHASE=false npm run dev`
**WebServer Timeout**: 120000ms (2 minutes)
**Action Timeout**: 10000ms (10 seconds)
**Workers**: 8

---

## Next Steps

1. ✅ Document failures (this file)
2. ⏳ Install Playwright browsers
3. ⏳ Diagnose dev server startup issue
4. ⏳ Fix root causes
5. ⏳ Re-run tests until green
