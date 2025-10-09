# PLAN: I2 - Implement Waitlist Validation Logic (E2E) [CORRECTED]

**Last Updated**: 2025-10-08
**Status**: `COMPLETED`
**Issue**: `ANT-147` (2 SP)

---

## 1. Goal

Fix failing E2E tests by implementing robust, race-safe, domain-based server-side validation for `/api/waitlist`. Enforce **one entry per domain** (company-centric), with email as latest contact metadata.

## 2. Business Rule (DECISION)

**One company = one waitlist entry (by domain).**
- Domain is the unique identifier (case-insensitive)
- Email is metadata (latest contact), not the unique key
- Matches current service behavior and SMB focus

**Solution: Option B - Domain-Based Uniqueness**

---

## 3. Implementation Plan

### A. Database Migration (Race-Safe Uniqueness on Domain)

**File**: `prisma/migrations/20251008_waitlist_domain_ci_unique/migration.sql`

```sql
-- Enable citext extension for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Add case-insensitive unique index on domain
-- This prevents race conditions and enforces one-entry-per-domain
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_domain_lower_unique
  ON waitlist (LOWER(domain));
```

### B. Service Layer (`lib/waitlist/service.ts`)

**Updates:**
- Normalize domain: `domain.trim().toLowerCase()`
- Normalize email: `email?.trim().toLowerCase()`
- Use `upsert` on domain (race-safe)
- On duplicate domain: update email/source/updatedAt (refresh latest contact)
- Return idempotent 200/201 (no enumeration risk)

**No major refactor needed** - current service already uses domain-based lookups. Just ensure normalization consistency.

### C. API Route (`app/api/waitlist/route.ts`)

**Replace with robust implementation:**

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const WaitlistSchema = z.object({
  domain: z.string().min(3).transform(s => s.trim().toLowerCase()),
  email: z.string().email().transform(s => s.trim().toLowerCase()).optional(),
  referralSource: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = WaitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { domain, email, referralSource } = parsed.data;

    // Race-safe upsert by domain
    const entry = await prisma.waitlistEntry.upsert({
      where: { domain },
      update: {
        email: email ?? undefined,
        variantData: referralSource ? { referralSource } : undefined,
        updatedAt: new Date(),
      },
      create: {
        domain,
        email: email ?? '',
        variantData: referralSource ? { referralSource } : undefined,
      },
    });

    // Idempotent response (201 on create, 200 on update)
    const created = entry.createdAt.getTime() === entry.updatedAt.getTime();
    return NextResponse.json(
      { ok: true, message: 'You are on the waitlist.' },
      { status: created ? 201 : 200 }
    );
  } catch (err: any) {
    // Handle unique constraint violation gracefully
    if (String(err?.code) === 'P2002' || /unique/i.test(String(err?.message))) {
      return NextResponse.json(
        { ok: true, message: 'You are on the waitlist.' },
        { status: 200 }
      );
    }
    console.error('waitlist POST error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### D. E2E Test Suite

**API-Level Tests** (fast, deterministic):

```typescript
test.describe('Waitlist API validation', () => {
  test('rejects invalid email format', async ({}) => {
    const api = await request.newContext();
    const res = await api.post('/api/waitlist', {
      data: { domain: 'example.com', email: 'not-an-email' }
    });
    expect(res.status()).toBe(400);
  });

  test('is idempotent on duplicate domain (different emails)', async ({}) => {
    const api = await request.newContext();
    const domain = `test${Date.now()}.com`;

    // First signup
    const first = await api.post('/api/waitlist', {
      data: { domain, email: 'first@test.com' }
    });
    expect([200, 201]).toContain(first.status());

    // Second signup with different email, same domain
    const second = await api.post('/api/waitlist', {
      data: { domain, email: 'second@test.com' }
    });
    expect(second.status()).toBe(200); // Idempotent OK
    const json = await second.json();
    expect(json.ok).toBe(true);
  });
});
```

**UI-Level Test** (ensure error messaging):

```typescript
test('UI shows error for invalid email', async ({ page }) => {
  await page.goto('/');
  // ... fill form with invalid email
  // ... assert error message visible
});
```

---

## 4. Validation Plan

1. **Run migration**: `pnpm prisma migrate dev --name waitlist_domain_ci_unique`
2. **Update API route**: Implement zod validation + upsert
3. **Run API tests**: `pnpm exec playwright test e2e/waitlist-functional.spec.ts -g "API validation"`
4. **Run full E2E**: `pnpm exec playwright test e2e/waitlist-functional.spec.ts`
5. **Verify no regressions**: `pnpm test:e2e`

---

## 5. Commit Plan

1. `db(waitlist): add CI-unique index on LOWER(domain)`
2. `feat(waitlist): domain-normalized idempotent upsert; optional email update (ANT-147)`
3. `test(e2e): waitlist API validation (invalid format, duplicate domain)`

---

## Notes

- **H1 (GitGuardian)**: Already integrated and green on hardening branch. No action needed now.
- **I1 (Consent)**: Already completed (marked CLOSED in ISSUES.md)
- **Current Focus**: I2 to burn down E2E test failures
