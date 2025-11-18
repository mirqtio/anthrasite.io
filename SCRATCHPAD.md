# Survey Email Open Tracking — Implementation (FINAL)

**Date:** 2025-11-18
**Status:** ✅ IMPLEMENTATION COMPLETE

## Implementation Summary

✅ **COMPLETE** - All setup tasks have been done:

1. ✅ **Environment variables added** to `.env.local`:

   - `SURVEY_SECRET_KEY` (copied from LeadShop)
   - `IP_HASH_SALT` (generated and synced with LeadShop)

2. ✅ **LeadShop `.env` updated** with `IP_HASH_SALT` (same value)

3. ✅ **Database schema pushed** to local database (`prisma db push`)

4. ⚠️ **TODO: Add to Vercel environment variables:**

   ```
   IP_HASH_SALT=ewOK2Jv+hVG2kt77sM1t+HRH/oJnEprwBiJe+nNfTwU=
   ```

   **Note:** `SURVEY_SECRET_KEY` is already set in Vercel. Only `IP_HASH_SALT` needs to be added.

5. **Test the endpoint** locally:

   ```bash
   # With valid JWT and send_id
   curl "http://localhost:3000/api/pixel/survey-open?token=<JWT>&send_id=<UUID>"

   # Should return: 1x1 transparent GIF (always, even on errors)
   # Check logs for: [Pixel] Successfully logged email open
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
