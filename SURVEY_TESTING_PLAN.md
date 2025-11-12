# Survey System Testing Plan

## Objective

Autonomously test the complete survey system end-to-end using Chrome DevTools MCP, recursively diagnosing and resolving issues until the system is fully functional.

---

## Test Environment

- **Local Dev Server**: http://localhost:3333
- **Test Token**: Valid JWT for lead_id=1 with real report in Supabase
- **Database**: Local Prisma + Supabase for reports

---

## Testing Phases

### Phase 1: Server & Basic Connectivity

**Goal**: Verify dev server is running and survey page loads

1.1. Start dev server if not running
1.2. Navigate to survey page with test token
1.3. Verify page renders without console errors
1.4. Check for network errors in DevTools

**Success Criteria**:

- ✅ Page loads (status 200)
- ✅ No JavaScript errors in console
- ✅ No failed network requests

**Failure Actions**:

- If server not running: Start with `pnpm dev`
- If build errors: Run `pnpm build` and fix TypeScript/build errors
- If page 404: Check Next.js routing configuration

---

### Phase 2: Token Validation & Survey Initialization

**Goal**: Verify JWT validation and survey config loading

2.1. Check API call to `/api/survey/[token]`
2.2. Verify response contains survey questions
2.3. Verify "Before Questions" step renders
2.4. Check for proper question rendering

**Success Criteria**:

- ✅ API returns 200 with valid survey data
- ✅ Questions array populated
- ✅ "Before We Begin" heading visible
- ✅ All 3 before questions render correctly

**Failure Actions**:

- If 401: Check token validation logic in `lib/survey/validation.ts`
- If 410: Clear database entry for this jti
- If 500: Check API route error logs
- If questions missing: Verify `lib/survey/questions.ts`

---

### Phase 3: Before Questions Form Validation

**Goal**: Test form validation and submission

3.1. Attempt to submit empty form (should fail)
3.2. Fill rating question (Q1)
3.3. Fill multiple choice question (Q2)
3.4. Fill slider question (Q3)
3.5. Submit form
3.6. Verify transition to "Report Access" step

**Success Criteria**:

- ✅ Empty form shows validation errors
- ✅ All question types accept input
- ✅ Submit triggers API call to `/api/survey/[token]/submit`
- ✅ API returns success
- ✅ Progress bar updates
- ✅ "Your Report is Ready!" page displays

**Failure Actions**:

- If validation fails: Check Zod schemas in `lib/survey/types.ts`
- If submission fails: Check POST route in `app/api/survey/[token]/submit/route.ts`
- If no state change: Debug SurveyContainer state machine

---

### Phase 4: Report Access & Redirect Shim

**Goal**: Test report redirect and S3 pre-signed URL generation

4.1. Verify "Open My Report" button renders
4.2. Click button
4.3. Check for new tab opening
4.4. Verify redirect to `/api/report/open?sid=...`
4.5. Check Supabase query for report S3 key
4.6. Verify S3 pre-signed URL generation
4.7. Verify PDF loads in new tab

**Success Criteria**:

- ✅ Button clickable
- ✅ New tab opens
- ✅ API returns 302 redirect
- ✅ Redirect to S3 with signed URL
- ✅ PDF loads successfully
- ✅ "Continue" button becomes enabled

**Failure Actions**:

- If button doesn't work: Check ReportAccess component logic
- If 404: Verify report exists in Supabase for lead_id=1
- If 500: Check `lib/survey/reports.ts` database query
- If S3 error: Verify AWS credentials in `.env`
- If no PDF: Check S3 bucket permissions

---

### Phase 5: After Questions Form & Completion

**Goal**: Complete survey and verify final submission

5.1. Click "Continue" button
5.2. Verify "Your Feedback" step renders
5.3. Fill all 8 after questions
5.4. Submit final form
5.5. Verify "Thank You" page displays
5.6. Check final API call with step="complete"

**Success Criteria**:

- ✅ After questions render correctly
- ✅ All question types work (rating, multiple choice, text, checkbox)
- ✅ Submit triggers complete submission
- ✅ API returns success with completed=true
- ✅ Thank you page displays
- ✅ Progress bar at 100%

**Failure Actions**:

- If questions don't render: Check AfterQuestions component
- If validation fails: Check afterAnswersSchema
- If submission fails: Debug completeSurveyResponse in storage.ts
- If no thank you page: Check SurveyContainer step transition

---

### Phase 6: Database Verification

**Goal**: Verify data persisted correctly

6.1. Check local database for survey_responses record
6.2. Verify jtiHash matches token
6.3. Verify beforeAnswers JSON populated
6.4. Verify afterAnswers JSON populated
6.5. Verify completedAt timestamp set
6.6. Verify metrics captured

**Success Criteria**:

- ✅ Record exists with matching jtiHash
- ✅ All timestamps populated correctly
- ✅ JSON fields contain form data
- ✅ Metrics include timing data

**Failure Actions**:

- If no record: Check Prisma UPSERT logic
- If incomplete data: Debug saveSurveyResponse function
- If wrong structure: Verify Prisma schema matches code

---

### Phase 7: Error Handling & Edge Cases

**Goal**: Test error scenarios and edge cases

7.1. Test with expired token
7.2. Test with invalid token
7.3. Test with already-completed token (resubmit)
7.4. Test browser back button during survey
7.5. Test page refresh mid-survey
7.6. Test without clicking report (fallback)

**Success Criteria**:

- ✅ Expired token shows appropriate error
- ✅ Invalid token shows error
- ✅ Already-completed shows 410 error
- ✅ Back button doesn't break flow
- ✅ Refresh doesn't lose progress (if localStorage implemented)
- ✅ Fallback "Continue without opening" works

**Failure Actions**:

- Fix error handling in validation.ts
- Add better error messages to UI
- Implement localStorage if needed

---

### Phase 8: Console & Network Analysis

**Goal**: Ensure clean execution with no warnings or errors

8.1. Review all console logs for errors/warnings
8.2. Review network tab for failed requests
8.3. Check for memory leaks
8.4. Verify all assets load correctly

**Success Criteria**:

- ✅ No console errors
- ✅ No console warnings (except known dev warnings)
- ✅ All network requests succeed
- ✅ No memory leaks

---

## Test Execution Checklist

- [ ] Phase 1: Server & Basic Connectivity
- [ ] Phase 2: Token Validation & Survey Initialization
- [ ] Phase 3: Before Questions Form Validation
- [ ] Phase 4: Report Access & Redirect Shim
- [ ] Phase 5: After Questions Form & Completion
- [ ] Phase 6: Database Verification
- [ ] Phase 7: Error Handling & Edge Cases
- [ ] Phase 8: Console & Network Analysis

---

## Success Definition

System is considered **fully functional** when:

1. All 8 phases pass without errors
2. Complete survey flow works end-to-end
3. Data persists correctly in database
4. Report redirect and PDF load work
5. No console errors or network failures
6. Error handling works for edge cases

---

## Test Results Log

Results will be documented here as each phase completes...
