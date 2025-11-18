# Survey Email Open Tracking — Implementation (FINAL)

**Date:** 2025-11-18
**Status:** ✅ SCHEMA FIXED & DEPLOYED TO PRODUCTION

## Critical Fixes (2025-11-18)

🐛 **Bug:** Email tracking pixel returned 200 + GIF but did NOT write to database

**Root Cause:** Used raw SQL function `gen_random_uuid()` instead of parameterized `${randomUUID()}` in INSERT statement. postgres.js requires ALL values to be passed as tagged template parameters, not raw SQL.

**Fix:** Changed line 301 in `lib/survey/storage.ts`:

```diff
- VALUES (gen_random_uuid(), ${jtiHash}, ...)
+ VALUES (${randomUUID()}, ${jtiHash}, ...)
```

✅ **Deployed:** Commit `faf782f` - "fix(survey): correct UUID generation in logEmailOpen"

**Lesson Learned:** When debugging postgres.js issues, compare with working functions in same file. Vercel logs are useless without a drain setup.

### Fix #2: Schema Mismatch (ROOT CAUSE)

🐛 **Bug:** Anthrasite code used wrong column names and data types

**Root Cause:** Anthrasite Prisma schema didn't match actual LeadShop database:

- Used camelCase columns (`jtiHash`, `leadId`) instead of snake_case (`jti`, `lead_id`)
- Expected UUID primary key instead of BIGSERIAL
- Expected `jtiHash` (hashed) instead of `jti` (raw JTI string)
- Included non-existent columns: `runId`, `version`, `batchId`, `openCount`

**Fix:** Updated to match actual schema:

- Column names: camelCase → snake_case (send_id, lead_id, ip_hash, user_agent, email_type)
- Primary key: UUID → BIGSERIAL (auto-increment)
- jti: Store raw JTI string (not hashed)
- Removed: runId, version, batchId, openCount
- Simplified UPSERT: only update opened_at, ip_hash, user_agent on conflict

✅ **Deployed:** Commit `b3bd208` - "fix(pixel): match actual database schema with snake_case columns"

---

## Implementation Summary

✅ **DEPLOYED** - Code pushed to production:

- Initial: commit 4421c04
- Bug fix #1: commit faf782f
- Schema fix #2: commit b3bd208 (FINAL)

1. ✅ **Environment variables configured:**

   - `SURVEY_SECRET_KEY` - Added to local `.env.local` (synced with LeadShop)
   - `IP_HASH_SALT` - Added to local `.env.local` AND Vercel production environment

2. ✅ **LeadShop `.env` updated** with `IP_HASH_SALT` (same value as Anthrasite)

3. ✅ **Database schema synced** (`prisma db push` locally)

4. ✅ **Code committed and pushed:**

   - Commit: `4421c04` - "feat: add survey email tracking pixel endpoint"
   - All checks passed (TypeScript, ESLint, unit tests, production build)
   - Pushed to `origin/main`
   - Vercel auto-deployment initiated

5. **Production endpoint available at:**

   ```
   https://www.anthrasite.io/api/pixel/survey-open
   ```

6. **Test locally:**
   ```bash
   curl "http://localhost:3000/api/pixel/survey-open?token=<JWT>&send_id=<UUID>"
   # Returns: 1x1 transparent GIF
   # Check logs: [Pixel] Successfully logged email open
   ```

## Files Created/Modified

✅ **lib/survey/validation.ts** - Added `hashIp()` function (line 51)
✅ **lib/survey/storage.ts** - Added `logEmailOpen()` function (line 247)
✅ **app/api/pixel/survey-open/route.ts** - New tracking pixel endpoint (~140 lines)
✅ **.env.example** - Documented `IP_HASH_SALT` environment variable

## Architecture: Shared Database Pattern

Both Anthrasite (Vercel) and LeadShop (Mac Mini) connect to the **same Supabase PostgreSQL database**.

```
Email Client (opens email)
    ↓
GET https://anthrasite.io/api/pixel/survey-open?token=<JWT>&send_id=<UUID>
    ↓
Anthrasite validates JWT → extracts leadId, jti, hashes IP
    ↓
Anthrasite writes to Supabase (survey_email_opens table) via UPSERT on sendId
    ↓
Anthrasite returns 1x1 GIF (always, even on errors)
    ↓
LeadShop can query survey_email_opens from same Supabase DB
```

**Key Design Decisions:**

- ✅ Write directly to shared Supabase database (no API proxy needed)
- ✅ Always return pixel (200 + GIF) even if database write fails
- ✅ Hash IP addresses for privacy (SHA256 with salt)
- ✅ UPSERT on `sendId` for idempotency (tracks opens per email send)
- ✅ Use existing JWT validation (`validateSurveyToken`)
- ✅ Reuses existing `SurveyEmailOpen` Prisma model

---

## Technical Details

### Database Schema

The `SurveyEmailOpen` model already exists in `prisma/schema.prisma` (lines 167-185):

```prisma
model SurveyEmailOpen {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  jtiHash         String
  leadId          String
  runId           String?
  version         String?
  batchId         String?
  emailType       String?
  campaign        String?
  sendId          String?  @unique  // UPSERT conflict target
  firstOpenedAt   DateTime @default(now())
  lastOpenedAt    DateTime @updatedAt
  openCount       Int      @default(1)
  userAgentLast   String?
  ipHashLast      String?

  @@index([jtiHash])
  @@map("survey_email_opens")
}
```

### API Endpoint

**URL:** `GET /api/pixel/survey-open`

**Query Parameters:**

- `token` (required) - JWT survey token
- `send_id` (required) - Unique email send ID from LeadShop
- `email_type` (optional) - Type of email (e.g., 'invite', 'reminder_1')
- `campaign` (optional) - Campaign identifier (e.g., 'q4_2025_survey')

**Example:**

```
https://anthrasite.io/api/pixel/survey-open?token=eyJhbG...&send_id=550e8400-e29b-41d4-a716-446655440000&email_type=invite&campaign=q4_2025
```

**Response:** Always returns 1x1 transparent GIF (even on errors)

### Email Template Integration (LeadShop)

LeadShop should embed this pixel in survey emails:

```html
<img
  src="https://anthrasite.io/api/pixel/survey-open?token={{survey_jwt}}&send_id={{send_id}}&email_type={{email_type}}&campaign={{campaign}}"
  width="1"
  height="1"
  style="display:none;border:0;outline:none;"
  alt=""
/>
```

---

## What's NOT in This Implementation

- ❌ Email sending (handled by LeadShop)
- ❌ Email template changes (handled by LeadShop)
- ❌ Database migration (table already exists)
- ❌ LeadShop API endpoints (LeadShop queries Supabase directly)
