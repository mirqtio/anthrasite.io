# Privacy Compliance Testing Guide (ANT-92)

This guide covers testing all privacy compliance features implemented in this task.

---

## 🤖 Automated Tests (Recommended)

### Run E2E Test Suite

We have 7 comprehensive E2E tests in `e2e/specs/privacy.spec.ts`:

**IMPORTANT**: Start the dev server first!

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run privacy tests (in a new terminal)
npm run test:e2e -- privacy.spec.ts

# Or run with UI to watch tests execute
npm run test:e2e -- privacy.spec.ts --ui

# Or run in headed mode (see browser)
npm run test:e2e -- privacy.spec.ts --headed
```

**What it tests:**

- ✅ Footer links on homepage
- ✅ Privacy Policy page loads
- ✅ Terms of Service page loads
- ✅ "Do Not Sell" page sets cookie
- ✅ GPC header detection and cookie setting
- ✅ DSAR API accepts valid requests
- ✅ DSAR API rejects invalid requests

**Note**: Tests require dev server running at `localhost:3333`

---

## 🧪 Quick API Test (curl)

### Test DSAR Submission

```bash
# Submit a valid privacy request
curl -X POST http://localhost:3333/api/privacy/requests \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "type": "access"
  }'

# Expected response:
# {
#   "message": "Your request has been received.",
#   "trackingId": "some-uuid-here",
#   "dueDate": "2025-11-28"
# }
```

### Test Rate Limiting

```bash
# Run this 6 times quickly to trigger rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3333/api/privacy/requests \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"type\":\"deletion\"}"
  echo ""
done

# 6th request should return:
# {"error":"Too many requests"} with 429 status
```

### Verify Database Storage

```bash
# Check that requests are being saved
npx prisma studio
# Navigate to PrivacyRequest table and verify entries
```

---

## 👨‍💻 Manual UI Testing

### 1. Test Footer Links

```bash
# Start dev server
npm run dev
```

**Visit these pages and verify footer:**

- http://localhost:3333/ (organic homepage)
- http://localhost:3333/purchase (with valid UTM - may need admin to generate)

**Check footer contains:**

- [ ] Privacy Policy → `/legal/privacy`
- [ ] Terms of Service → `/legal/terms`
- [ ] Do Not Sell or Share My Personal Information → `/legal/do-not-sell`
- [ ] Contact link

### 2. Test Legal Pages

**Privacy Policy** - http://localhost:3333/legal/privacy

- [ ] Page loads without errors
- [ ] Contains US-only language (no GDPR sections)
- [ ] Links to subprocessor list work
- [ ] Contact email is `privacy@anthrasite.io`

**Terms of Service** - http://localhost:3333/legal/terms

- [ ] Page loads without errors
- [ ] Contains all ToS sections

**Do Not Sell** - http://localhost:3333/legal/do-not-sell

- [ ] Page loads without errors
- [ ] "Opt Out" button is visible
- [ ] Clicking button sets cookie (check DevTools → Application → Cookies)
- [ ] Should see `do_not_share=1` cookie

### 3. Test GPC Detection

**Using Chrome DevTools:**

1. Open DevTools (F12)
2. Go to Network tab
3. Click on any request
4. Right-click → Edit and Resend
5. Add header: `Sec-GPC: 1`
6. Send request
7. Check Application → Cookies
8. Should see `do_not_share=1` cookie

**Or use curl:**

```bash
curl http://localhost:3333/ \
  -H "Sec-GPC: 1" \
  -c cookies.txt \
  -v

# Check cookies.txt for do_not_share=1
cat cookies.txt | grep do_not_share
```

### 4. Test Consent Modal Integration

1. Clear all cookies in DevTools
2. Reload homepage
3. Cookie consent banner should appear
4. Click "Reject All"
5. Check DevTools → Application → Cookies
6. Should see `do_not_share=1` cookie
7. Analytics should be disabled (check localStorage for `anthrasite_cookie_consent`)

---

## 🗄️ Database & Script Testing

### Test Retention Script

```bash
# Run the retention script (dry run - it won't delete anything yet unless you have old data)
npx tsx scripts/privacy/retention-purge.ts

# Expected output:
# Starting data retention check...
# Searching for Waitlist entries older than [date]
# No expired waitlist entries found. (or "Found X entries to purge")
# Data retention check complete.
```

### Verify Database Schema

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to PrivacyRequest table
# Verify columns exist:
# - id
# - email
# - requestType
# - status
# - trackingId
# - createdAt
# - dueDate
# - resolvedAt
# - notes
```

---

## 📋 Complete Test Checklist

### Automated (Run First)

- [ ] `npm run test:e2e -- privacy.spec.ts` - All 7 tests pass

### API Testing

- [ ] DSAR endpoint accepts valid requests
- [ ] DSAR endpoint rejects invalid types
- [ ] Rate limiting triggers after 5 requests
- [ ] Requests are saved to database

### UI Testing

- [ ] Footer links appear on homepage
- [ ] All legal pages load correctly
- [ ] "Do Not Sell" button sets cookie
- [ ] Links to subprocessor list work

### Middleware Testing

- [ ] GPC header sets `do_not_share` cookie
- [ ] Consent modal "Reject All" sets `doNotSell: true`
- [ ] Analytics disabled when opted out

### Database & Scripts

- [ ] PrivacyRequest table exists with correct schema
- [ ] Retention script runs without errors
- [ ] Prisma Studio shows privacy requests

---

## 🚀 Quick Smoke Test (2 minutes)

If you just want to verify everything works:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2 (in a new terminal window):

# 1. Submit a test DSAR
curl -X POST http://localhost:3333/api/privacy/requests \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"access"}'

# Expected output:
# {"message":"Your request has been received.","trackingId":"...","dueDate":"2025-11-28"}

# 2. Verify it's in the database
npx prisma studio
# Navigate to PrivacyRequest table → you should see your test request

# 3. Check a page loads
curl -s http://localhost:3333/legal/privacy | grep "Privacy Policy"
# Should output: <h1 class="...">Privacy Policy</h1>

# 4. Run the E2E tests
npm run test:e2e -- privacy.spec.ts
```

If all four work, you're good to go! ✅

---

## 🐛 Troubleshooting

### "Property 'privacyRequest' does not exist"

- Run: `npx prisma generate`

### E2E tests fail with "Page not found"

- Make sure dev server is running: `npm run dev`
- Check that E2E is configured to run against correct port

### Rate limiting doesn't work

- This is expected - in-memory storage resets on server restart
- For production, upgrade to Redis-based rate limiting

### Cookies not setting

- Check browser console for errors
- Verify middleware chain in `middleware.ts` includes `withPrivacyGPC`
- Check that response headers include Set-Cookie

---

## ✅ Success Criteria

All features are working if:

- ✅ All 7 E2E tests pass
- ✅ DSAR API returns trackingId and stores in DB
- ✅ Footer links visible on all pages
- ✅ GPC header sets cookie
- ✅ "Do Not Sell" button sets cookie
- ✅ TypeScript compiles with no errors
- ✅ Retention script runs without crashes
