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
