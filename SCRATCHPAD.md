# Scratchpad

## Open

- ANT-585 — SEO / performance / accessibility baseline pass

  - https://linear.app/anthrasite/issue/ANT-585/seo-performance-accessibility-baseline-pass

- ANT-656 — Funnel analytics: self-serve intake → ready → LP view → checkout start → purchase
  - https://linear.app/anthrasite/issue/ANT-656/funnel-analytics-self-serve-intake-→-ready-→-lp-view-→-checkout-start

## Notes

- Self-serve flow work (ANT-637 + children) is complete; the epic is canceled and closed tickets have been cleaned out of this scratchpad.

---

## Analytics Setup (for ANT-656)

### Current State

| Tool               | Status     | Coverage                       |
| ------------------ | ---------- | ------------------------------ |
| Microsoft Clarity  | ✅ Active  | `/`, `/landing/*`, `/purchase` |
| Google Analytics 4 | ❌ Dormant | Code present, env vars not set |
| PostHog            | ❌ Dormant | Code present, env vars not set |

### 1. Microsoft Clarity (Session Recording)

**Status:** Already active

**Vercel Env Var:**

```
NEXT_PUBLIC_CLARITY_PROJECT_ID=<project-id>
```

**Get Project ID:**

1. Go to https://clarity.microsoft.com/
2. Create project or select existing
3. Settings → Setup → Copy project ID

**Coverage configured in:** `app/_components/Analytics/Clarity.tsx`

Currently enabled on:

- `/` (homepage/self-serve intake)
- `/landing/*` (landing pages)
- `/purchase` (purchase flow)

To add more routes, edit the `enabledRoutes` array.

---

### 2. Google Analytics 4

**Status:** Dormant - code ready, needs env vars

**Vercel Env Vars:**

```
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Get Measurement ID:**

1. Go to https://analytics.google.com/
2. Admin → Data Streams → Web
3. Create stream for `anthrasite.io`
4. Copy Measurement ID (format: `G-XXXXXXXX`)

**How it works:**

- Loads only when user has analytics consent (cookie banner)
- Script injected dynamically in `app/_components/Analytics/Analytics.tsx`
- Provider class: `lib/analytics/providers/ga4.ts`

**Events tracked:**

- `page_view` (automatic on route change)
- `analytics_initialized` (test event on load)
- Custom events via `trackEvent()` calls

---

### 3. PostHog (Product Analytics + Feature Flags)

**Status:** Dormant - code ready, needs env vars

**Vercel Env Vars:**

```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Get API Key:**

1. Go to https://app.posthog.com/
2. Create project or select existing
3. Settings → Project API Key
4. Copy the key (format: `phc_...`)

**How it works:**

- Loads only when user has analytics consent
- Provider class: `lib/analytics/providers/posthog.ts`
- Also powers A/B testing via `lib/ab-testing/middleware.ts`

**Features available:**

- Event tracking (`capture`)
- User identification (`identify`)
- Feature flags (`getFeatureFlag`, `isFeatureEnabled`)
- Session recording (if enabled in PostHog dashboard)

---

### Enabling All Analytics

**Step 1:** Add env vars in Vercel Dashboard:

- Project → Settings → Environment Variables
- Add for Production (and Preview if desired)

**Step 2:** Redeploy:

```bash
# Vercel auto-deploys on env var changes, or force:
vercel --prod
```

**Step 3:** Verify in browser:

1. Open https://www.anthrasite.io/
2. Accept cookies in consent banner
3. Open DevTools → Network
4. Look for:
   - `googletagmanager.com/gtag/js?id=G-...` (GA4)
   - `app.posthog.com/static/array.js` (PostHog)
   - Clarity should already be loading

**Step 4:** Verify in dashboards:

- GA4: Realtime → Overview (should show active user)
- PostHog: Activity → Live Events
- Clarity: Dashboard → Recordings

---

### Funnel Events to Track (ANT-656)

For self-serve funnel analytics, these events should be tracked:

| Step                 | Event Name          | Properties                     |
| -------------------- | ------------------- | ------------------------------ |
| 1. Intake form shown | `intake_form_view`  | `source`                       |
| 2. Intake submitted  | `intake_submit`     | `domain`, `email_domain`       |
| 3. Analysis ready    | `analysis_ready`    | `lead_id`, `domain`            |
| 4. Landing page view | `landing_view`      | `lead_id`, `token`             |
| 5. Checkout started  | `checkout_start`    | `lead_id`, `price`             |
| 6. Purchase complete | `purchase_complete` | `lead_id`, `sale_id`, `amount` |

Implementation locations:

- Steps 1-2: `app/page.tsx` or intake form component
- Step 3: Backend (LeadShop workflow sends email)
- Step 4: `app/landing/[token]/page.tsx`
- Steps 5-6: Checkout flow components
