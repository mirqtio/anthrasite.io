# Self-Serve Public Purchase Flow (ANT-637) — Frontend Implementation

Project: https://linear.app/anthrasite/project/self-serve-public-purchase-flow-ant-637-fbf4a9fd2037

**Backend Status:** Complete and deployed to VPS (LeadShop-v3-clean)

---

## North Star

Enable an **organic, public self-serve funnel** where a cold visitor can:

- Submit a website + email (and any required info)
- Run the **pre-purchase** pipeline
- Land on the **existing** landing page (`/landing/{token}`)
- Check out via Stripe
- Receive report via Phase D/E delivery

---

## Locked decisions / invariants (source of truth: ANT-637)

- **Baseline monthly revenue is required** in self-serve intake, but user-provided estimates are acceptable.
- NAICS/zip/geo can be optional; Phase B must not fail due to missing NAICS/CBSA.
- Prefer durable, pollable state (don't block a browser request on Phase A/B).
- Consent/compliance is part of MVP (Terms/Privacy acceptance required; marketing opt-in optional).

---

## Canonical end-to-end flow (happy path)

### Phase 1: Intake (~3 seconds user wait)

```
┌─────────────────────────────────────────────────────────────────────┐
│  HOMEPAGE                                                           │
│                                                                     │
│  [Email field] [Website URL field] [Get Your Free Report →]        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ CTA click
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODAL (opens with animation, ~1s)                                  │
│                                                                     │
│  Fields greyed out, spinner active while backend works:             │
│  ├── Preflight check (is site reachable? canonical URL)             │
│  ├── Fetch homepage + /contact + /about (~2s via proxy)             │
│  └── LLM extraction (company, city, state, zip, industry)           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Company name:    [Acme Plumbing LLC        ] ← prefilled    │   │
│  │ City:            [Denver                   ] ← prefilled    │   │
│  │ State:           [CO                       ] ← prefilled    │   │
│  │ ZIP:             [                         ] ← blank if low │   │
│  │ Industry:        [Construction         ▼] ← dropdown, LLM picks│ │
│  │                                                              │   │
│  │ Monthly Revenue: (○) Under $10k                              │   │
│  │                  (○) $10k – $25k  ← pre-selected             │   │
│  │                  (○) $25k – $75k                              │   │
│  │                  (○) $75k – $200k                             │   │
│  │                  (○) Over $200k                               │   │
│  │                                                              │   │
│  │ □ I accept the Terms of Service and Privacy Policy          │   │
│  │                                                              │   │
│  │              [Analyze My Website →]                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Failure modes:**

- Preflight fails (site unreachable) → Show error: "We couldn't reach that website. Please check the URL."
- Scrape/LLM fails or low confidence → Leave fields blank, user enters manually
- Note: Having any address info (city, zip, state) improves accuracy, but not required

### Phase 2: Assessment Progress (~1-2 minutes)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROGRESS PAGE                                                      │
│                                                                     │
│  Analyzing acmeplumbing.com...                                      │
│                                                                     │
│  [✓] Checking security          ← completed                        │
│  [●] Measuring speed            ← in progress (spinner)            │
│  [ ] Analyzing design                                               │
│  [ ] Generating insights                                            │
│                                                                     │
│  This usually takes 1-2 minutes.                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Technical notes:**

- UI polls `GET /api/public/request/{id}/status` for status
- When `status = ready_for_lp`, **auto-redirect** to `/landing/{token}`
- Token includes `contactId` for delivery attribution

### Phase 3: Landing Page → Purchase → Delivery

Uses existing infrastructure:

1. `/landing/{token}` shows score, impact range, top issues
2. Stripe checkout ($199)
3. `checkout.session.completed` webhook → `PostPurchaseWorkflow`
4. Phase D generates report, Phase E delivers via email

---

## Backend API Endpoints (Deployed)

Base URL: `https://api.leadshop.io` (or `http://5.161.19.136:8000` direct)

### POST /api/public/intake/validate

Preflight check + LLM extraction for prefill (~4 seconds)

```json
// Request
{
  "url": "https://acmeplumbing.com",
  "email": "owner@acme.com"
}

// Response (success)
{
  "status": "ok",
  "canonical_url": "https://www.acmeplumbing.com",
  "prefill": {
    "company": { "value": "Acme Plumbing LLC", "confidence": 0.85 },
    "city": { "value": "Denver", "confidence": 0.72 },
    "state": { "value": "CO", "confidence": 0.88 },
    "zip": { "value": "80202", "confidence": 0.45 },
    "industry": { "value": "23", "confidence": 0.65 }
  },
  "cache_key": "acmeplumbing.com"
}

// Response (failure)
{
  "status": "error",
  "reason": "unreachable",
  "message": "We couldn't reach that website. Please check the URL."
}
```

### POST /api/public/intake/submit

Create request + start workflow

```json
// Request
{
  "email": "owner@acme.com",
  "url": "https://acmeplumbing.com",
  "cache_key": "acmeplumbing.com",
  "company": "Acme Plumbing LLC",
  "city": "Denver",
  "state": "CO",
  "zip": "80202",
  "industry": "23",
  "revenue_range": "25k-75k",
  "accepted_terms": true,
  "marketing_opt_in": false
}

// Response
{
  "status": "ok",
  "request_id": "uuid",
  "poll_url": "/api/public/request/{request_id}/status"
}
```

### GET /api/public/request/{request_id}/status

Poll for workflow progress

```json
// Response
{
  "status": "running" | "ready_for_lp" | "failed" | "expired",
  "phase": "validating" | "assessing" | null,
  "landing_url": "/landing/{token}",
  "error_message": "..."
}
```

---

## Locked decisions

| Decision                 | Answer                                               |
| ------------------------ | ---------------------------------------------------- |
| Email verification       | **No** - no verification gate                        |
| Industry field           | **Dropdown** - LLM selects from 2-digit NAICS labels |
| Revenue storage          | **Range selector** with midpoint stored for Phase B  |
| After progress completes | **Auto-redirect** to landing page                    |

### Industry dropdown options (2-digit NAICS)

| Label                           | NAICS |
| ------------------------------- | ----- |
| Agriculture & Natural Resources | 11    |
| Mining & Energy                 | 21    |
| Utilities                       | 22    |
| Construction                    | 23    |
| Manufacturing                   | 31    |
| Wholesale & Distribution        | 42    |
| Retail                          | 44    |
| Transportation & Logistics      | 48    |
| Technology & Information        | 51    |
| Finance & Insurance             | 52    |
| Real Estate                     | 53    |
| Professional Services           | 54    |
| Management & Holding            | 55    |
| Administrative Services         | 56    |
| Education                       | 61    |
| Healthcare                      | 62    |
| Arts & Entertainment            | 71    |
| Restaurants & Hospitality       | 72    |
| Personal & Other Services       | 81    |

### Revenue ranges (6 options)

| Range               | Value sent to backend |
| ------------------- | --------------------- |
| Under $10k/month    | `under-10k`           |
| $10k – $25k/month   | `10k-25k`             |
| $25k – $75k/month   | `25k-75k`             |
| $75k – $125k/month  | `75k-125k`            |
| $125k – $200k/month | `125k-200k`           |
| Over $200k/month    | `over-200k`           |

---

# Design Spec

## Existing Design System (from Landing Page + Survey)

**Colors:**
| Token | Value | Usage |
|-------|-------|-------|
| Background dark | `#232323` | Hero, landing page |
| Primary blue | `#0066FF` | CTAs, focus states |
| Primary hover | `#0052CC` | Button hover |
| Primary active | `#004099` | Button active |
| Text on dark | `text-white`, `text-white/60` | Headings, body |
| Text on light | `text-gray-900`, `text-gray-600` | Form labels |
| Error | `text-red-500` | Validation |
| Border | `border-gray-300` | Inputs |
| Success | `border-green-500` | High confidence |
| Warning | `border-yellow-500` | Low confidence |

**Typography:**
| Element | Style |
|---------|-------|
| H1 | 48px mobile → 64px desktop, `font-thin` |
| H2 | 24px, `font-semibold` |
| Body | 18px → 20px, `leading-[1.6]`, `tracking-[0.02em]` |
| Labels | `text-lg font-medium` |
| Helper text | `text-sm text-gray-600` |

**Components:**

- Tailwind CSS v4 (custom, no shadcn)
- Lucide icons (`Loader2`, `Check`, `ArrowRight`, etc.)
- Inputs: `rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`
- Cards: `rounded-2xl shadow-lg`
- Buttons: `rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)]`

---

## Progress Page (`/progress/{id}`)

**Layout:** Dark background, centered content, matches landing page style.

```
┌──────────────────────────────────────────────────────────────┐
│  bg-[#232323] min-h-screen                                   │
│                                                              │
│  ┌─ Logo ─┐  (top-left, links to homepage)                   │
│                                                              │
│        Analyzing acmeplumbing.com...                         │
│        (text-white text-[32px] md:text-[48px] font-thin)     │
│                                                              │
│        ┌────────────────────────────────────────┐            │
│        │  [✓] Checking security    (white/60)  │            │
│        │  [●] Measuring speed      (white)     │  gap-4     │
│        │  [ ] Analyzing design     (white/40)  │            │
│        │  [ ] Generating insights  (white/40)  │            │
│        └────────────────────────────────────────┘            │
│                                                              │
│        This usually takes 1-2 minutes.                       │
│        (text-white/60 text-[16px])                           │
│                                                              │
│        ┌─────────────────────────────────────┐               │
│        │ We'll email you when it's ready.   │               │
│        │ (text-white/40 text-[14px])        │               │
│        └─────────────────────────────────────┘               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Phase Indicators:**
| State | Icon | Text Color |
|-------|------|------------|
| Completed | `Check` (green-500) | `text-white/60` |
| In Progress | `Loader2` (animate-spin) | `text-white` |
| Pending | Empty circle outline | `text-white/40` |

**Error State:**

```
┌──────────────────────────────────────────────────────────────┐
│        Something went wrong                                  │
│        (text-white text-[32px] font-thin)                    │
│                                                              │
│        We couldn't complete the analysis.                    │
│        Please try again or contact support@anthrasite.io     │
│        (text-white/60)                                       │
│                                                              │
│        [Try Again]  (bg-[#0066FF])                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Intake Form (Modal)

**Trigger:** Homepage CTA opens modal overlay.

**Step 1: Email + URL** (~1 second)

```
┌──────────────────────────────────────────────────────────────┐
│  bg-black/50 backdrop-blur (overlay)                         │
│                                                              │
│    ┌────────────────────────────────────────────────────┐    │
│    │  bg-white rounded-2xl shadow-2xl p-8 max-w-md      │    │
│    │                                                    │    │
│    │  Get Your Free Website Analysis                    │    │
│    │  (text-gray-900 text-[24px] font-semibold)         │    │
│    │                                                    │    │
│    │  Your email                                        │    │
│    │  [____________________________________]            │    │
│    │                                                    │    │
│    │  Your website URL                                  │    │
│    │  [____________________________________]            │    │
│    │                                                    │    │
│    │  [Continue →]  (bg-[#0066FF] w-full py-3)          │    │
│    │                                                    │    │
│    └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Loading State:** (~4 seconds while validate endpoint runs)

```
│    │  Analyzing your website...                         │    │
│    │  (text-gray-900 text-[20px])                       │    │
│    │                                                    │    │
│    │  [Loader2 animate-spin] Fetching site data...      │    │
│    │  (text-gray-500)                                   │    │
```

**Step 2: Confirm Details**

```
┌────────────────────────────────────────────────────────────────┐
│  bg-white rounded-2xl shadow-2xl p-8 max-w-lg                  │
│                                                                │
│  Confirm Your Details                                          │
│  (text-gray-900 text-[24px] font-semibold)                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Company name *                                           │  │
│  │ [Acme Plumbing LLC_________________] ← border-green-500  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ City            │ │ State           │ │ ZIP             │   │
│  │ [Denver_______] │ │ [CO ▼]          │ │ [_____________] │   │
│  │ border-green    │ │ border-green    │ │ border-yellow   │   │
│  │                 │ │                 │ │ please verify ↑ │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                │
│  Industry                                                      │
│  [Construction                                            ▼]   │
│  border-yellow-500, "please verify" below                      │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Monthly Revenue (estimate is fine)                            │
│  (text-gray-900 font-medium)                                   │
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Under $10k  │ │ $10k-$25k   │ │ $25k-$75k   │ ...           │
│  │  (○)        │ │  (○)        │ │  (●)        │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│  (Radio button cards or simple radio group)                    │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  [✓] I accept the Terms of Service and Privacy Policy *        │
│      (links open in new tab)                                   │
│                                                                │
│  [ ] Send me tips and updates (optional)                       │
│                                                                │
│  [Analyze My Website →]  (bg-[#0066FF] w-full py-3)            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Confidence Styling:**
| Confidence | Border | Helper Text |
|------------|--------|-------------|
| ≥ 0.7 | `border-green-500` | (none) |
| < 0.7 | `border-yellow-500` | "please verify" in `text-yellow-600 text-xs` |
| null/error | `border-gray-300` | (default, user enters manually) |

**Validation Errors:**

- Below input: `text-red-500 text-sm mt-1`
- Example: "Please enter a valid email address"

---

## Homepage Entry (ANT-642)

**Option A: New route `/get-report`** (recommended for A/B testing)

```
┌──────────────────────────────────────────────────────────────┐
│  bg-[#232323]                                                │
│                                                              │
│  ┌─ Logo ─┐                              [Login]             │
│                                                              │
│        Is your website                                       │
│        losing you money?                                     │
│        (text-white text-[48px] md:text-[64px] font-thin)     │
│                                                              │
│        Get a free analysis of your site's                    │
│        performance, security, and conversion issues.         │
│        (text-white/60 text-[18px] md:text-[20px])            │
│                                                              │
│        ┌────────────────────────────────────────────┐        │
│        │ Email    [_______________________________] │        │
│        │ Website  [_______________________________] │        │
│        │                                            │        │
│        │ [Get Your Free Report →]                   │        │
│        └────────────────────────────────────────────┘        │
│        (bg-white/10 rounded-2xl p-6, inputs are light)       │
│                                                              │
│        ✓ No credit card required                             │
│        ✓ Results in under 2 minutes                          │
│        ✓ 90-day money-back guarantee                         │
│        (text-white/60 text-[14px])                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**CTA Click:** Opens intake modal (Step 1 pre-filled with entered email/URL).

---

# Current Mockup Implementation

**Location:** `/admin/mockups` (protected by admin auth)

Interactive mockups showing the complete self-serve flow. Each step auto-advances or can be manually navigated via tab buttons.

## 1. Homepage Entry

**Layout:** Dark background (`#232323`), existing site nav (Logo + "VALUE, CRYSTALLIZED" tagline + Method/FAQ/About Us links)

**Hero:**

- Headline: `"Your website has untapped potential"` (48px mobile → 80px desktop, `font-thin`, `leading-[0.9]`)
- Subhead: `"We analyze hundreds of data points to show you what to fix and what it's worth."` (24px → 32px, `text-white/70`, `font-medium`)

**Form Card:** (`bg-white/10 rounded-2xl p-6 md:p-8 max-w-md mx-auto`)

- Field 1: "Your website URL" → text input
- Field 2: "Your email" → email input
- CTA: "Analyze My Website →" (`bg-[#0066FF]`, blue glow shadow)

**Trust Signals:** (below form, `text-white/60 text-[14px]`)

- ✓ See your score before you pay
- ✓ Results in under 2 minutes

**Action:** CTA click → Intake Loading

---

## 2. Intake Modal — Loading State

**Overlay:** `bg-black/50 backdrop-blur-sm`

**Modal Card:** (`bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center`)

- Spinner: `Loader2` icon with `animate-spin`
- Text: `"Checking site availability..."` (18px, `text-gray-700`)

**Behavior:** Auto-advances to Form after 1.5 seconds

---

## 2. Intake Modal — Form State

**Modal Card:** (`bg-white rounded-2xl shadow-2xl p-8 max-w-lg`)

**Header:** `"Confirm Your Details"` (24px, `font-semibold`, `text-gray-900`)

**Fields:** (all inputs `h-11` for consistent height)

- **Company name** \* — text input, prefilled: "Acme Plumbing LLC"
- **City / State / ZIP** — 3-column row
  - City: text input, prefilled: "Denver"
  - State: dropdown (`<select>`), prefilled: "CO"
  - ZIP: text input, prefilled: "80202"
- **Industry** — dropdown with NAICS options (Construction selected)

**Revenue Section:**

- Label: `"Monthly Revenue"` with helper `"(estimate is fine)"` in gray
- 6 radio card options in 2x3 grid:
  - Under $10k
  - $10k-$25k
  - **$25k-$75k** (default selected, blue border + `bg-blue-50`)
  - $75k-$125k
  - $125k-$200k
  - Over $200k
- Selected state: `border-[#0066FF] border-2 bg-blue-50 text-[#0066FF]`
- Unselected state: `border-gray-300 hover:border-gray-400`

**Consent:**

- ☑ I accept the Terms of Service and Privacy Policy \* (checked by default)
- ☑ Send me tips and updates (checked by default)

**CTA:** `"Analyze My Website →"` (full width, `bg-[#0066FF]`)

**Action:** CTA click → Progress Running

---

## 3. Progress Page — Running State

**Layout:** Dark background (`#232323`), Logo top-left

**Header:** `"Analyzing acmeplumbing.com..."` (32px → 48px, `font-thin`, centered)

**Two-Column Layout:** (`grid md:grid-cols-2 gap-16`)

**Left Column — Progress Checklist:**
Each step cycles automatically (4 seconds per step):

| Step | Label               | Title             | Description                                                                                                                                                                        |
| ---- | ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Checking security   | Security & Trust  | "We check for SSL certificates, security headers, and common vulnerabilities. Visitors abandon sites that feel unsafe—and Google penalizes insecure pages in search rankings."     |
| 2    | Measuring speed     | Page Speed        | "We measure how fast your site loads on real devices. Every second of delay costs you customers—53% of mobile visitors leave if a page takes over 3 seconds to load."              |
| 3    | Analyzing design    | Visual Experience | "We review your layout, typography, and mobile responsiveness. First impressions happen in milliseconds, and outdated design erodes trust before visitors even read your content." |
| 4    | Generating insights | Business Impact   | "We translate technical findings into revenue impact. Not all issues matter equally—we prioritize what will actually move the needle for your specific business."                  |

**Step Icons:**

- Completed: `Check` icon (`text-green-500`)
- In Progress: `Loader2` icon (`animate-spin`, `text-white`)
- Pending: `Circle` icon (`text-white/40`)

**Right Column — Step Explanation:**

- Container: `bg-white/5 rounded-xl p-6`
- Title: Current step's title (20px, `font-medium`, `text-white`)
- Description: Current step's description (15px, `text-white/70`, `leading-relaxed`)

**Footer:**

- `"This usually takes 1-2 minutes."` (16px, `text-white/60`)
- `"We'll email you when it's ready."` (14px, `text-white/40`)

**Behavior:** After all 4 steps complete (16 seconds total), auto-advances to Ready state

---

## 3. Progress Page — Ready State

**Layout:** Dark background, Logo top-left, centered content

**Animated Checkmark:**

```
┌─────────────────────────────────────────┐
│   ┌─────────────────────────────────┐   │
│   │  ┌─────────────────────────┐    │   │
│   │  │         ✓               │    │   │  w-24 h-24, bg-green-500/20
│   │  │    (scale-in 0.3s)      │    │   │  w-16 h-16, bg-green-500/40
│   │  └─────────────────────────┘    │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Animations:**

- Outer ring: `animate-[scale-in_0.5s_ease-out]`
- Inner ring: `animate-[scale-in_0.5s_ease-out_0.1s_both]`
- Check icon: `animate-[scale-in_0.3s_ease-out_0.3s_both]`, `strokeWidth={3}`
- Title: `animate-[fade-in_0.5s_ease-out_0.4s_both]`
- Subtitle: `animate-[fade-in_0.5s_ease-out_0.6s_both]`

**CSS Keyframes:**

```css
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Text:**

- `"Analysis complete"` (32px → 48px, `font-thin`)
- `"Preparing your results..."` → changes to `"Redirecting to your results..."` with spinner after 1.5s

**Behavior:** Auto-redirects to Landing Page after 2.5 seconds

---

## 3. Progress Page — Error State

**Layout:** Dark background, Logo top-left, centered content

**Text:**

- `"Something went wrong"` (32px → 48px, `font-thin`)
- `"We couldn't complete the analysis."`
- `"Please try again or contact support@anthrasite.io"` (link styled `text-[#0066FF]`)

**CTA:** `"Try Again →"` (redirects to homepage)

---

## 4. Landing Page (Mockup)

**Display:** Static screenshot of actual landing page (`/public/mockups/landing-page-preview.png`)

Shows:

- Anthrasite logo + tagline
- Screenshot of analyzed site
- Headline: "Is your website working for you?"
- Assessment summary: "We assessed Anthrasite's website... Your site scores 77/100 and has 6 priority issues. These could be costing you up to $62,500/month."
- Value prop: "Learn what to fix and what it's worth. Get the full report detailing all 6 prioritized issues now. No risk money-back guarantee."
- CTA: "Get Your Report – $199 →"
- Trust badge: "Powered by Stripe" with lock icon

---

# Development Approach (TDD + Local Testing)

## Build Order (smallest testable slice first)

**1. Progress Page (ANT-640) — Start here**

- Zero dependencies on other new components
- Can test with existing request IDs from curl
- Single responsibility: poll → display → redirect

**2. Intake Form (ANT-638 + 645 + 643 together)**

- Build static form first (no API)
- Add client-side validation
- Add submit → routes to progress
- Add prefill step (validate endpoint)
- Add confidence UX (green/yellow borders)

**3. Homepage Entry (ANT-642) — Last**

- Just routing/CTA, depends on 1 & 2 existing

---

## Local Testing Strategy

**API Target:**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://5.161.19.136:8000
```

**Test Data:**
| Purpose | Data |
|---------|------|
| Completed request | `8668bab5-607e-4eea-8dd1-0f9ad31c7166` (ready_for_lp) |
| Quick domain | `google.com`, `basecamp.com` (~75s to ready) |
| Create fresh request | `curl -X POST .../intake/submit` |

**Progress page can be tested immediately:**

```
/progress/8668bab5-607e-4eea-8dd1-0f9ad31c7166
→ Should show ready state and redirect to landing
```

---

## TDD Cycles

**Progress Page:**

1. Test: renders loading state
2. Test: polls every 3s
3. Test: shows phase indicators (validating/assessing)
4. Test: redirects on `ready_for_lp`
5. Test: shows error with support contact on `failed`

**Intake Form:**

1. Test: renders required fields
2. Test: validation errors for empty fields
3. Test: submits and routes to progress
4. Test: calls validate on step 1
5. Test: prefills from response
6. Test: confidence borders (green ≥0.7, yellow <0.7)

---

## Testing Layers

| Layer       | Tool              | Purpose                          |
| ----------- | ----------------- | -------------------------------- |
| Unit        | Vitest            | Mock API, test states/validation |
| Integration | Vitest + real API | Test against VPS                 |
| E2E         | Playwright        | Full browser flow                |

---

# Frontend Tickets (in priority order)

## 1) ANT-640 (Todo) — Self-serve progress UX + redirect to existing landing page

- Link: https://linear.app/anthrasite/issue/ANT-640/self-serve-progress-ux-redirect-to-existing-landing-page-mint-jwt
- Estimate: 5
- Label: Growth
- **Recommended first** - smallest scope, backend ready

**Goal**

- Provide progress UI after intake submission, then redirect to `/landing/{token}` when ready.

**UX requirements**

- Progress page supports 3–5 minute typical runtime and longer tail.
- States: `queued | running | ready | failed | expired`
- Retry/reload safe.

**Implementation notes**

- Poll `GET /api/public/request/{id}/status` every 2-3 seconds
- Show phase indicators based on `phase` field
- Auto-redirect when `status=ready_for_lp` using `landing_url`
- Show error with support contact if `status=failed`

**Acceptance Criteria**

- Visitor can submit intake and see progress.
- If visitor closes tab, they can resume via emailed link.
- When pre-purchase completes, visitor redirected to valid landing page.
- Failures show actionable message and support contact.

---

## 2) ANT-645 (Todo) — Implement URL-extraction prefill v1 (confidence UX)

- Link: https://linear.app/anthrasite/issue/ANT-645/implement-url-extraction-prefill-v1-homepage-contact-about-confidence
- Estimate: 8
- Label: Growth

**Goal**

- Implement low-friction variant:
  - Step 1: website + email
  - Call validate endpoint (~4 seconds)
  - Step 2: user confirms/edits prefilled fields

**UX**

- confidence >= 0.7: green border
- confidence < 0.7: yellow border + "please verify"
- manual entry always possible

**Acceptance Criteria**

- Supports website+email-only first step.
- Prefill step populates: company name, city/state/zip, NAICS suggestion, revenue (user-confirmed)
- Confidence-driven UI implemented.
- Fallback: fetch/extraction failure → manual entry

---

## 3) ANT-638 (Todo) — Public self-serve intake UI + validation

- Link: https://linear.app/anthrasite/issue/ANT-638/public-self-serve-intake-ui-validation-createattach-leadcontact
- Estimate: 8
- Label: Growth

**Goal**

- Add a public-facing intake form for visitors to submit their website + contact info.

**Requirements**

- Required inputs: business name, website/domain, email, baseline monthly revenue
- Optional: industry selector (dropdown), zip
- Consent: Terms of Service + Privacy Policy acceptance required
- Optional: marketing opt-in checkbox

**Acceptance Criteria**

- Posting valid inputs calls submit endpoint and routes to progress page
- Invalid inputs produce actionable errors
- Consent enforced

---

## 4) ANT-643 (Todo) — Revenue estimate UX + disclosure

- Link: https://linear.app/anthrasite/issue/ANT-643/revenue-estimate-ux-disclosure-require-revenue-clarify-estimate
- Estimate: 3
- Label: Growth

**Goal**

- Implement revenue input UX with clear messaging that estimate is fine.

**Scope**

- Intake form: label + helper text: "Monthly revenue (estimate is fine)"
- Landing page / report: add disclosure near totals: "Impact estimates use your provided monthly revenue estimate."

**Acceptance Criteria**

- Revenue required.
- Copy clearly indicates estimate acceptable.
- Disclosure present in LP/report surfaces.

---

## 5) ANT-642 (Todo) — Self-serve homepage redesign + funnel entry

- Link: https://linear.app/anthrasite/issue/ANT-642/self-serve-homepage-redesign-funnel-entry-align-with-lp-route-to
- Estimate: 8
- Label: Growth

**Goal**

- Redesign the public homepage (or add a new top-level route) so general visitors can start the self-serve report flow.

**A/B testing recommendation**

- Prefer a new route (e.g. `/get-report`) initially rather than replacing the current homepage.

**Requirements**

- Visually/structurally align with the existing landing page (LP) style.
- Clear primary CTA to start the report flow.
- Capture only minimal info on the first step (website + email).
- After submission, route user into the progress UX (ANT-640).

**Acceptance Criteria**

- A cold visitor can start self-serve flow within 1 click.
- Funnel entry is production-ready and matches brand/UI standards.
- Mobile-responsive.

---

## Related (not frontend)

### ANT-372 — Add Trust Signals Above the Fold

- Link: https://linear.app/anthrasite/issue/ANT-372/add-trust-signals-above-the-fold
- Estimate: 5

### ANT-585 — SEO / performance / accessibility baseline pass

- Link: https://linear.app/anthrasite/issue/ANT-585/seo-performance-accessibility-baseline-pass
- Estimate: 3

---

# Homepage Redesign Spec

**Complete Homepage Layout**

---

## Navigation (dark, fixed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                                                     │
│  V A L U E ,  C R Y S T A L L I Z E D         How It Works   FAQ   About   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Hero Section (dark background: #232323)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                   Is your website costing you customers?                    │
│                   (48px mobile → 64px desktop, font-thin)                   │
│                                                                             │
│                   Find out in 2 minutes. We analyze your site               │
│                   and show you what's broken, what it's worth,              │
│                   and what to fix first.                                    │
│                   (20px mobile → 24px desktop, text-white/70)               │
│                                                                             │
│                   ┌─────────────────────────────────────────┐               │
│                   │                                         │               │
│                   │  Website URL                            │               │
│                   │  [____________________________________] │               │
│                   │                                         │               │
│                   │  Email                                  │               │
│                   │  [____________________________________] │               │
│                   │                                         │               │
│                   │  [Analyze My Website →]                 │               │
│                   │                                         │               │
│                   └─────────────────────────────────────────┘               │
│                   (bg-white/10 rounded-2xl p-6)                             │
│                                                                             │
│                   ✓ See your score and top issue free                       │
│                   ✓ Results in under 2 minutes                              │
│                   ✓ No credit card required                                 │
│                   (text-white/60, 14px)                                     │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## How It Works Section (light background: white) `#how-it-works`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            How It Works                                     │
│                            (32px, font-semibold, text-gray-900)             │
│                                                                             │
│                   We check your site against what actually                  │
│                   drives customers—then tell you what to fix first.         │
│                   (18px, text-gray-600)                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   ┌─────────┐                                                       │   │
│  │   │    1    │   Find                                                │   │
│  │   └─────────┘   Can customers discover your business?               │   │
│  │                 If you don't show up in search results              │   │
│  │                 or on maps, nothing else matters.                   │   │
│  │                                                                     │   │
│  │   ┌─────────┐                                                       │   │
│  │   │    2    │   Trust                                               │   │
│  │   └─────────┘   Does your site inspire confidence?                  │   │
│  │                 Visitors decide in seconds whether                  │   │
│  │                 your business feels legitimate.                     │   │
│  │                                                                     │   │
│  │   ┌─────────┐                                                       │   │
│  │   │    3    │   Understand                                          │   │
│  │   └─────────┘   Is it clear what you offer?                         │   │
│  │                 Confused visitors don't become customers.           │   │
│  │                                                                     │   │
│  │   ┌─────────┐                                                       │   │
│  │   │    4    │   Contact                                             │   │
│  │   └─────────┘   Can interested visitors take action?                │   │
│  │                 This is where browsers become buyers.               │   │
│  │                                                                     │   │
│  │   ┌─────────┐                                                       │   │
│  │   │    5    │   Your Business                                       │   │
│  │   └─────────┘   We calculate what these issues cost you.            │   │
│  │                 Not all problems matter equally—we show             │   │
│  │                 you which ones move the needle for your business.   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What You Get Section (light background continues)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            What You Get                                     │
│                            (32px, font-semibold, text-gray-900)             │
│                                                                             │
│   ┌─────────────────────────────────┐                                       │
│   │                             │     Your free analysis shows:             │
│   │                             │                                           │
│   │      [Report Page 1         │     • Your score (0–100)                  │
│   │       Preview Image         │     • Your top issue and why it matters  │
│   │       - Ketubah sample      │     • Estimated monthly revenue impact   │
│   │       - slightly rotated    │                                           │
│   │       - subtle shadow]      │     The full report ($199) adds:         │
│   │                             │                                           │
│   │                             │     • All issues prioritized by impact   │
│   │                             │     • Difficulty rating for each fix     │
│   │                             │     • The metrics behind every finding   │
│   │                             │     • Plain-language explanations        │
│   └─────────────────────────────┘                                           │
│                                                                             │
│                                                                             │
│                  ┌─────────────────────────────────────┐                    │
│                  │  THE REPORT PAYS FOR ITSELF OR      │                    │
│                  │  IT'S FREE                          │                    │
│                  │                                     │                    │
│                  │  Fix the issues we find. If you     │                    │
│                  │  don't see enough improvement to    │                    │
│                  │  cover the cost within 90 days,     │                    │
│                  │  we'll refund you in full.          │                    │
│                  └─────────────────────────────────────┘                    │
│                  (bg-gray-50, rounded-xl, border, centered)                 │
│                                                                             │
│                                                                             │
│                  Ready to see yours? [Analyze your website →]               │
│                  (text link, scrolls to top)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Testimonials Section (light background continues)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         What Our Customers Say                              │
│                         (32px, font-semibold, text-gray-900)                │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐│   │
│   │  │                   │  │                   │  │                   ││   │
│   │  │ "We thought we'd  │  │ "I was bracing    │  │ "It clearly       ││   │
│   │  │ nailed it—        │  │ for a laundry     │  │ connected         ││   │
│   │  │ professional      │  │ list of expensive │  │ performance       ││   │
│   │  │ photos, premium   │  │ fixes. Instead,   │  │ metrics to real   ││   │
│   │  │ look, clear calls │  │ I got two things  │  │ business impact—  ││   │
│   │  │ to action. Then I │  │ I could do this   │  │ showing not just  ││   │
│   │  │ saw how few       │  │ week—and suddenly │  │ what needed       ││   │
│   │  │ people were       │  │ all the branding  │  │ improvement, but  ││   │
│   │  │ actually finding  │  │ work we'd already │  │ how each issue    ││   │
│   │  │ us in local       │  │ done would        │  │ could be costing  ││   │
│   │  │ searches. That    │  │ actually get      │  │ us visibility,    ││   │
│   │  │ one insight       │  │ seen."            │  │ trust, and        ││   │
│   │  │ changed our whole │  │                   │  │ revenue."         ││   │
│   │  │ priority list."   │  │ Kelly             │  │                   ││   │
│   │  │                   │  │ Owner             │  │ Madeline          ││   │
│   │  │ Chelsea           │  │ Mandala           │  │ Owner             ││   │
│   │  │ Partner           │  │ Integrative       │  │ The Parlor Room   ││   │
│   │  │ Invest in Yakima  │  │ Veterinary Care   │  │ Virginia Beach    ││   │
│   │  │                   │  │                   │  │                   ││   │
│   │  └───────────────────┘  └───────────────────┘  └───────────────────┘│   │
│   │  (bg-white, rounded-xl, shadow-sm, border)                          │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                                             │
│                  [Analyze your website →]                                   │
│                  (text link, scrolls to top)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## FAQ Section (light background continues) `#faq`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              Questions?                                     │
│                              (32px, font-semibold, text-gray-900)           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │  What does Anthrasite do?                                      [+] │   │
│   │  ─────────────────────────────────────────────────────────────────  │   │
│   │  We analyze your website using industry-standard tools and         │   │
│   │  visual assessments. Then we convert the findings into a           │   │
│   │  prioritized list of what affects your business—not just           │   │
│   │  what's technically wrong.                                         │   │
│   │                                                                     │   │
│   │  Do you actually look at my website?                           [+] │   │
│   │  ─────────────────────────────────────────────────────────────────  │   │
│   │  Yes. We run automated scans for speed, security, and mobile       │   │
│   │  performance. We also do a visual review of what your customers    │   │
│   │  actually see. No login required—we only look at what's public.    │   │
│   │                                                                     │   │
│   │  How is this different from free tools?                        [+] │   │
│   │  ─────────────────────────────────────────────────────────────────  │   │
│   │  Free tools give you numbers. We tell you which numbers matter     │   │
│   │  for your business—and what they're costing you. Everything is     │   │
│   │  prioritized by business impact, not technical severity.           │   │
│   │                                                                     │   │
│   │  Where does the revenue impact number come from?               [+] │   │
│   │  ─────────────────────────────────────────────────────────────────  │   │
│   │  We combine what we find on your site with your industry,          │   │
│   │  location, and the revenue estimate you provide. The model         │   │
│   │  weights issues by where they fall in the customer journey         │   │
│   │  and how severely they deviate from benchmarks.                    │   │
│   │                                                                     │   │
│   │  What happens after I purchase?                                [+] │   │
│   │  ─────────────────────────────────────────────────────────────────  │   │
│   │  You'll receive your report as a PDF within a few minutes.         │   │
│   │  It includes everything: your score, all issues prioritized        │   │
│   │  by impact, difficulty ratings, and the metrics behind each        │   │
│   │  finding.                                                          │   │
│   │                                                                     │   │
│   │  What if it doesn't pay off?                                   [+] │   │
│   │  ─────────────────────────────────────────────────────────────────  │   │
│   │  The report pays for itself or it's free. Give it a real shot.     │   │
│   │  If you don't see enough improvement to cover the cost within      │   │
│   │  90 days, email us for a full refund.                              │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Footer (light background, subtle top border)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Privacy Policy   Terms of Service   Refund Policy   Do Not Sell   Contact │
│  (14px, text-gray-500, links separated by middot or spacing)               │
│                                                                             │
│                      © 2026 Anthrasite. All rights reserved.               │
│                      (14px, text-gray-400)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile Sticky CTA (appears after scrolling past hero)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Analyze My Website →]                                    (full width)     │
│  (bg-[#0066FF], text-white, py-4, fixed bottom-0)                           │
│  Tapping scrolls to top + focuses URL field                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Copy Summary (plain text for implementation)

**Hero headline:** Is your website costing you customers?

**Hero subhead:** Find out in 2 minutes. We analyze your site and show you what's broken, what it's worth, and what to fix first.

**Trust signals:**

- See your score and top issue free
- Results in under 2 minutes
- No credit card required

**How It Works intro:** We check your site against what actually drives customers—then tell you what to fix first.

**How It Works steps:**

| #   | Title         | Question                                 | Description                                                                               |
| --- | ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Find          | Can customers discover your business?    | If you don't show up in search results or on maps, nothing else matters.                  |
| 2   | Trust         | Does your site inspire confidence?       | Visitors decide in seconds whether your business feels legitimate.                        |
| 3   | Understand    | Is it clear what you offer?              | Confused visitors don't become customers.                                                 |
| 4   | Contact       | Can interested visitors take action?     | This is where browsers become buyers.                                                     |
| 5   | Your Business | We calculate what these issues cost you. | Not all problems matter equally—we show you which ones move the needle for your business. |

**What You Get - Free analysis:**

- Your score (0–100)
- Your top issue and why it matters
- Estimated monthly revenue impact

**What You Get - Full report ($199):**

- All issues prioritized by impact
- Difficulty rating for each fix
- The metrics behind every finding
- Plain-language explanations

**Guarantee box:** THE REPORT PAYS FOR ITSELF OR IT'S FREE / Fix the issues we find. If you don't see enough improvement to cover the cost within 90 days, we'll refund you in full.

**Section CTA:** Ready to see yours? Analyze your website →

**Testimonials:**

| Quote                                                                                                                                                                                                         | Name     | Title   | Company                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----------------------------------- |
| "We thought we'd nailed it—professional photos, premium look, clear calls to action. Then I saw how few people were actually finding us in local searches. That one insight changed our whole priority list." | Chelsea  | Partner | Invest in Yakima                    |
| "I was bracing for a laundry list of expensive fixes. Instead, I got two things I could do this week—and suddenly all the branding work we'd already done would actually get seen."                           | Kelly    | Owner   | Mandala Integrative Veterinary Care |
| "It clearly connected performance metrics to real business impact—showing not just what needed improvement, but how each issue could be costing us visibility, trust, and revenue."                           | Madeline | Owner   | The Parlor Room, Virginia Beach     |

**FAQ:**

| Question                                        | Answer                                                                                                                                                                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What does Anthrasite do?                        | We analyze your website using industry-standard tools and visual assessments. Then we convert the findings into a prioritized list of what affects your business—not just what's technically wrong.                         |
| Do you actually look at my website?             | Yes. We run automated scans for speed, security, and mobile performance. We also do a visual review of what your customers actually see. No login required—we only look at what's public.                                   |
| How is this different from free tools?          | Free tools give you numbers. We tell you which numbers matter for your business—and what they're costing you. Everything is prioritized by business impact, not technical severity.                                         |
| Where does the revenue impact number come from? | We combine what we find on your site with your industry, location, and the revenue estimate you provide. The model weights issues by where they fall in the customer journey and how severely they deviate from benchmarks. |
| What happens after I purchase?                  | You'll receive your report as a PDF within a few minutes. It includes everything: your score, all issues prioritized by impact, difficulty ratings, and the metrics behind each finding.                                    |
| What if it doesn't pay off?                     | The report pays for itself or it's free. Give it a real shot. If you don't see enough improvement to cover the cost within 90 days, email us for a full refund.                                                             |

---

# Frontend Implementation (Complete)

**Date:** 2026-01-10

## Overview

The self-serve frontend flow is now fully wired to the backend. Users can submit a website URL and email on the homepage, see the intake modal with LLM-prefilled data, and watch the progress view until their analysis is complete.

## Components Created

### 1. IntakeModal (`/components/self-serve/IntakeModal.tsx`)

Modal component that handles the intake flow after initial form submission.

**States:**

- `loading` - Spinner while calling validate endpoint (~4 seconds)
- `form` - Prefilled form with confidence indicators
- `submitting` - While submitting to create request
- `error` - Error display with retry option

**Features:**

- Calls `/api/self-serve/validate` on open
- Prefills company name, city, state, zip, industry from LLM extraction
- Confidence borders: green (≥0.7), yellow (<0.7) with "Please verify" hint
- Revenue range radio buttons with default selection
- Terms/Privacy acceptance (required) and marketing opt-in (optional)
- Submits to `/api/self-serve/submit`

### 2. ProgressView (`/components/self-serve/ProgressView.tsx`)

Full-screen progress view that shows while the backend processes the assessment.

**States:**

- `running` - Shows animated progress steps (Find, Trust, Understand, Contact, Impact)
- `ready` - Animated checkmark, then redirect
- `redirecting` - Spinner while redirecting to landing page
- `error` - Error display with retry option

**Features:**

- Polls `/api/self-serve/status/{requestId}` every 3 seconds
- Maps backend phases to visual step indicators
- Auto-advances steps for visual feedback (15-second intervals)
- Auto-redirects to `landing_url` when `status=ready_for_lp`
- "Close (analysis will continue)" option for users who want to leave

### 3. API Routes (Next.js App Router)

Proxy routes to forward requests to LeadShop backend:

| Route                                | Method | Backend Endpoint                  |
| ------------------------------------ | ------ | --------------------------------- |
| `/api/self-serve/validate`           | POST   | `/api/public/intake/validate`     |
| `/api/self-serve/submit`             | POST   | `/api/public/intake/submit`       |
| `/api/self-serve/status/[requestId]` | GET    | `/api/public/request/{id}/status` |

**Backend URL:** `LEADSHOP_API_URL` env var or `http://5.161.19.136:8000`

## Integration in OrganicHomepage

Modified `/components/homepage/OrganicHomepage.tsx`:

1. **New state variables:**

   - `showIntakeModal` - Controls modal visibility
   - `showProgress` - Controls progress view visibility
   - `requestId` - Request ID from submit response
   - `normalizedUrl` - URL with protocol added

2. **Updated handleSubmit:**

   - Validates URL format
   - Normalizes URL (adds `https://` if missing)
   - Opens IntakeModal instead of redirecting

3. **New handlers:**

   - `handleIntakeSubmitSuccess(requestId)` - Transitions to progress view
   - `handleCloseIntakeModal()` - Closes modal
   - `handleCloseProgress()` - Closes progress view
   - `getDomainFromUrl(url)` - Extracts domain for display

4. **Added components:**
   - `<IntakeModal />` with all required props
   - `<ProgressView />` conditionally rendered when `showProgress && requestId`

## E2E Flow Verified

Tested complete flow using Chrome DevTools:

1. ✅ Fill homepage form with URL + email
2. ✅ Click "Analyze Website" → Modal opens
3. ✅ Loading state shows "Analyzing your website..."
4. ✅ Form appears with prefilled data from LLM extraction
5. ✅ Company name: "Anthrasite" (extracted)
6. ✅ Industry: "Technology & Information" (auto-detected)
7. ✅ Click "Analyze Website" → Progress view opens
8. ✅ Progress view shows "Analyzing anthrasite.io..."
9. ✅ Step indicators animate through Find/Trust/Understand/Contact/Impact
10. ✅ Status polling every 3 seconds

## File List

| File                                              | Purpose                              |
| ------------------------------------------------- | ------------------------------------ |
| `/components/self-serve/IntakeModal.tsx`          | Modal with loading/form/error states |
| `/components/self-serve/ProgressView.tsx`         | Progress polling and display         |
| `/app/api/self-serve/validate/route.ts`           | Proxy to validate endpoint           |
| `/app/api/self-serve/submit/route.ts`             | Proxy to submit endpoint             |
| `/app/api/self-serve/status/[requestId]/route.ts` | Proxy to status endpoint             |
| `/components/homepage/OrganicHomepage.tsx`        | Homepage with modal integration      |

## Environment Variables

```bash
# .env.local or .env
LEADSHOP_API_URL=http://5.161.19.136:8000
```

## Next Steps

- [ ] Add error tracking/monitoring for frontend errors
- [ ] Add analytics events for funnel tracking
- [ ] Consider A/B testing different copy variations
- [ ] Mobile-specific testing and polish
