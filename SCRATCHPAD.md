# PLAN: I3 - UTM Cookie Persistence & /link-expired (REVISED)

**Last Updated**: 2025-10-08
**Status**: `EXECUTING`
**Issue**: `ANT-148` (2 SP)

---

## 1. Scope Clarification

**I3 is a test-fix/coverage task, not an architectural rework.**

### Current State Audit ✅

- `/link-expired` page **already exists** at `app/link-expired/page.tsx` with proper UX
- Middleware **already validates** UTM tokens with HMAC signatures + expiration
- Middleware **already redirects** expired tokens to `/link-expired` (middleware.ts:107-109)
- Cookies **already use** `SameSite=Lax` for `site_mode` and `business_id`
- E2E tests **already exist** in `utm-validation.spec.ts` covering expiration/tampering

### Actual Problem ❌

**Missing test helper files** preventing E2E suite from running:

- `e2e/helpers/utm-generator.ts` - missing (referenced by `full-user-journey.spec.ts:2`)
- `e2e/helpers/stripe-mocks.ts` - missing (referenced by `full-user-journey.spec.ts:3`)

### Decision: Keep Working Architecture

- **KEEP**: Current `site_mode` / `business_id` cookie approach (SameSite=Lax, 30min expiry)
- **DEFER**: `__Host_utm_token` approach → separate security enhancement issue
- **FIX**: Missing test helpers to unblock test suite
- **VERIFY**: Run targeted tests to confirm what (if anything) actually fails

---

## 2. Implementation Plan (Revised)

### A) Create Missing Test Helper: `e2e/helpers/utm-generator.ts`

Minimal UTM token generator aligned to current `lib/utm/crypto.ts` implementation.

```typescript
import crypto from 'node:crypto'

const SECRET = process.env.UTM_SECRET_KEY || 'test-secret'

type UTMClaims = {
  exp: number
  businessId?: string
  timestamp?: number
  nonce?: string
  [k: string]: any
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function sign(json: string) {
  return crypto.createHmac('sha256', SECRET).update(json).digest('base64url')
}

export function makeValidUtmToken(claims: Partial<UTMClaims> = {}): string {
  const now = Date.now()
  const payload: UTMClaims = {
    exp: now + 60 * 60 * 1000, // 1h expiry
    businessId: 'test-business-001',
    timestamp: now,
    nonce: crypto.randomBytes(16).toString('hex'),
    ...claims,
  }
  const json = base64url(JSON.stringify(payload))
  const mac = sign(json)
  return `${json}.${mac}`
}

export function makeExpiredUtmToken(claims: Partial<UTMClaims> = {}): string {
  const now = Date.now()
  const payload: UTMClaims = {
    exp: now - 60 * 1000, // already expired
    businessId: 'test-business-001',
    timestamp: now - 25 * 60 * 60 * 1000,
    nonce: crypto.randomBytes(16).toString('hex'),
    ...claims,
  }
  const json = base64url(JSON.stringify(payload))
  const mac = sign(json)
  return `${json}.${mac}`
}

export function makeTamperedUtmToken(): string {
  const valid = makeValidUtmToken()
  const [json] = valid.split('.')
  const tampered = json.slice(0, -1) + (json.endsWith('A') ? 'B' : 'A')
  const bogusMac = 'bogusmac'
  return `${tampered}.${bogusMac}`
}

// Re-export for compatibility with existing imports
export const generateUTMToken = makeValidUtmToken
```

### B) Create Missing Test Helper: `e2e/helpers/stripe-mocks.ts`

Minimal Stripe mock strategy for browser E2E tests.

```typescript
import { Page, BrowserContext } from '@playwright/test'

export async function enableMockPurchase(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('NEXT_PUBLIC_USE_MOCK_PURCHASE', '1')
    ;(window as any).__E2E__MOCK_PURCHASE__ = true
  })
}

export async function mockStripeCheckout(context: BrowserContext) {
  await context.route(
    /stripe\.com|api\/stripe|\/create-payment-intent/i,
    async (route) => {
      const url = route.request().url()
      if (/create-payment-intent/.test(url)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            clientSecret: 'pi_test_secret_123',
            id: 'pi_test_123',
            status: 'requires_confirmation',
          }),
        })
      }
      return route.continue()
    }
  )
}
```

---

## 3. Validation Plan (Revised)

### A) Execute in Order

1. **Create helper files** (above)
2. **Run UTM validation tests**:
   ```bash
   npm run test:e2e -- utm-validation.spec.ts --reporter=list
   ```
3. **Run full journey tests**:
   ```bash
   npm run test:e2e -- full-user-journey.spec.ts --reporter=list
   ```
4. **Fix any actual failures** (not pre-emptive changes)

### B) Success Criteria

- All UTM validation tests pass (expiration redirect, tampering detection)
- Full user journey test can import helpers without errors
- No architectural changes to working middleware/cookie system

---

## 4. Commit Sequence (Revised)

1. `test(e2e): add utm-generator and stripe-mocks helpers`
2. `test(e2e): verify utm validation specs pass`
3. _(only if needed)_ `fix(test): adjust specs to match current middleware behavior`

---

## 5. Deferred to Separate Issue

**Security Enhancement: `__Host_utm_token` Cookie Storage**

- Store UTM token itself (not derived values) in cookie
- Use `__Host-` prefix for additional security
- Requires re-validation on each use
- Track as separate issue after I3 completion
