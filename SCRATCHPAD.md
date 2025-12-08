# SCRATCHPAD

## Survey 500 Error Fix - RESOLVED (2025-12-02)

### Problem

Survey submissions were returning 500 errors on POST `/api/survey/[token]/submit`

### Root Cause

Two issues in `lib/survey/storage.ts`:

1. **Non-existent columns**: The INSERT statement referenced columns (`source`, `respondentId`, `ref`) that existed in Prisma schema but were never migrated to the database.

2. **Hardcoded null for leadId**: Line 94 had `null,` hardcoded instead of `${data.leadId}`, causing NOT NULL constraint violation.

### Fixes Applied

1. Removed non-existent columns from INSERT statement (commit: `fix(survey): remove non-existent columns from storage INSERT`)
2. Changed `null,` to `${data.leadId},` (commit: `fix(survey): use actual leadId instead of hardcoded null`)

### Verification

- Tested on production: `https://www.anthrasite.io/survey?token=...`
- POST `/api/survey/.../submit` returns 200 with `{"success":true,"submissionId":"...","completed":false,"message":"Progress saved"}`
- Survey advances from Step 1 to Step 2 correctly

### Status: COMPLETE

---

## Prompt Lab API Proxy Implementation - IN PROGRESS (2025-12-08)

### Problem

The Prompt Lab page (`/admin/prompt-lab`) loads in production but functionality doesn't work (model chooser, saving prompts, running tests, etc.).

**Root Cause:** The frontend was making API calls directly to `http://localhost:8000/prompt-lab/...` which only works during local development. In production on Vercel, `localhost` refers to the Vercel server, not the LeadShop backend.

### Solution Implemented

Created Next.js API routes that proxy requests from the frontend to the LeadShop backend.

**Architecture:**

```
User's Browser
     ↓
https://www.anthrasite.io/api/prompt-lab/*  (Next.js on Vercel)
     ↓
LEADSHOP_API_URL/prompt-lab/*  (LeadShop FastAPI on Hetzner VPS)
```

### Files Created

1. **Environment Config** (`.env.example`):

   - Added `LEADSHOP_API_URL` - URL where LeadShop FastAPI is accessible

2. **Shared Proxy Library** (`lib/prompt-lab/proxy.ts`):

   - `verifyAdminSession()` - validates Supabase session for authenticated admin
   - `proxyToLeadShop()` - forwards requests to LeadShop backend
   - Supports dev bypass via `ADMIN_AUTH_BYPASS=true`

3. **API Proxy Routes**:

   - `app/api/prompt-lab/models/route.ts` - GET models list
   - `app/api/prompt-lab/prompts/route.ts` - GET/POST prompts
   - `app/api/prompt-lab/runs/[leadId]/route.ts` - GET runs for a lead
   - `app/api/prompt-lab/context/[leadId]/[runId]/route.ts` - GET context data
   - `app/api/prompt-lab/test/route.ts` - POST test execution
   - `app/api/prompt-lab/scenarios/route.ts` - GET/POST scenarios

4. **Frontend Updated** (`app/admin/prompt-lab/page.tsx`):
   - All `http://localhost:8000/prompt-lab/...` URLs changed to `/api/prompt-lab/...`

### Remaining Steps

1. ~~**Determine LeadShop API URL**~~: `http://5.161.19.136:8000` (Hetzner Floating IP)

2. **Set Vercel Environment Variable**: Add `LEADSHOP_API_URL=http://5.161.19.136:8000` to Vercel project settings

3. **Deploy & Test**: Push changes, verify prompt-lab works in production

### Status: CODE COMPLETE - Pending Vercel env var + deploy
