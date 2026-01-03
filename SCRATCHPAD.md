# Scratchpad

## ANT-481 — FAQ & Report Onboarding Update

### Overview

This ticket covers a full review of customer-facing questions/answers across the journey, plus adding an onboarding page to the report PDF.

**Source document:** `/Users/charlieirwin/Downloads/export.md`

---

### Task 1: Homepage FAQ Updates

**Location:** `components/homepage/OrganicHomepage.tsx` (lines 392-455)

**Current questions (4):**

1. What exactly do I get?
2. How is this different from free tools?
3. How do I get my report? ← waitlist-focused, needs replacement
4. How do you calculate revenue impact?

**New questions from export.md (5):**

1. **What does Anthrasite do?** → "Our goal is to help small businesses. We analyze your website using industry-standard tools and visual assessments. Then we convert the findings into a prioritized list of what affects your business."
2. **How do you analyze my site?** → "We use public scanning tools to check speed, security, and mobile performance. We also do a visual review of the customer experience. No login or access required—we only look at what your visitors see."
3. **What exactly do I get in the full report?** → "A detailed analysis of your site, organized by what matters most to your bottom line. A score and estimated revenue impact. Specific issues prioritized by impact with non-technical explanations. And detailed metrics for everything we measure."
4. **What if it doesn't pay off?** → "The report pays for itself or it's free. Give it a real shot. If you don't see the value after 90 days, email us for a full refund."
5. **How can I contact you?** → "Email us at hello@anthrasite.io."

**Style change:** Homepage currently uses custom `.faq-item` inline styling. Should adopt the LP's `FAQSection` component style (bordered accordion with ChevronDown icon).

---

### Task 2: Landing Page FAQ Updates

**Location:** `app/landing/[token]/LandingPageClient.tsx` (lines 18-39)

**Current questions (4):**

1. Who is Anthrasite?
2. Is this legitimate?
3. How accurate is the revenue estimate?
4. What happens after I purchase?

**New questions from export.md (6):**

1. **What does Anthrasite do?** → (same as homepage)
2. **Do you actually look at my website?** → "Yes! We analyzed your specific site before reaching out. The score and issues you see are real findings from your site. We only contact you after confirming that we can help."
3. **How is this different from free tools?** → "Free scans list metrics without context or interpretation. And they don't do a visual review. We help you understand what is actually important to your business and what the metrics mean. We focus on customer experience—how to help more people find and engage with you."
4. **Where does the "Monthly Revenue Impact" number come from?** → "We estimate your baseline revenue using industry benchmarks. Then we calculate how much friction each issue typically costs businesses like yours. The range shows uncertainty. It helps you prioritize but doesn't predict exact outcomes."
5. **What happens after I purchase?** → "We compile the data into your personalized report and send you a secure link to download it. You should get it in under five minutes."
6. **What if it doesn't pay off?** → (same as homepage)

---

### Task 3: Remove Post-Purchase FAQs

**Location:** `components/confirmation/ConfirmationFAQ.tsx`

**Action:** Remove the FAQ section from the confirmation/post-purchase page entirely. Per export.md: "No FAQs; questions are covered in the copy."

**Files to modify:**

- Delete or deprecate `components/confirmation/ConfirmationFAQ.tsx`
- Remove `<ConfirmationFAQ />` from `components/confirmation/SuccessPageClient.tsx`

---

### Task 4: Report PDF — Add "How to Read This Report" Page

**Location:** `LeadShop-v3-clean/report_template/audit_report_template_v2.html`

**Action:** Add a new page (likely page 2, after the hero/summary page) with the following content from export.md:

#### Page Content: "How to Read This Report"

**Your Score**

> Think of this like a credit score for your website. Below 60 means basic problems are likely turning away customers. Above 80 means your site works well—focus on small improvements, not major fixes.

**Your Revenue Impact**

> This is our estimate of the money left on the table. We look at your business type and size to estimate what your site should bring in. Then we calculate how much the issues we found are holding you back. This helps you prioritize—it's not a prediction.

**How We Ordered Your Issues**

> We rank by revenue impact—the issues likely costing you the most money come first. Each issue also shows a difficulty rating, so you can decide what to tackle:
>
> - **Easy** — You can likely do this yourself or with basic admin access
> - **Moderate** — You may need someone with web skills
> - **Significant** — You will likely need a developer or agency
>
> Sometimes an easy fix appears lower on the list. That's okay. Use the ratings to find quick wins if you want early momentum, but the order shows you where the real money is.

**The Four Stages**

> We group issues by where they hurt your customer's path to purchase:
>
> - **Find.** Can people discover your business?
> - **Trust.** Does your website inspire trust?
> - **Understand.** Is it clear what your business offers?
> - **Contact.** Is it easy for an interested person to take action?

**What We Measured**

> We ran six assessments on your site, each measuring several metrics:
>
> - **PageSpeed Insights:** Google's tool for measuring load time, responsiveness, and mobile performance.
> - **Security Scan.** HTTPS enforcement, security headers, TLS configuration.
> - **DNS Audit.** Domain health and reliability.
> - **Google Business Profile.** Local search presence and completeness.
> - **Accessibility Check.** Whether your site works for all visitors.
> - **Visual Assessment.** Our review of what visitors actually see: layout, trust signals, clarity, and calls-to-action.

**What's Next**

> Start with your top priorities. You can tackle them yourself or hand this report to a developer or agency—it's designed to work either way. Let us know if you want help finding an agency.
>
> After you've made fixes, run a new audit to confirm the improvements. Or check back in 3–6 months to catch anything new.

---

### Task 5: Contact Email Consolidation

**Decision:** All contact emails should be `hello@anthrasite.io` except `privacy@anthrasite.io` (intentionally separate for legal compliance).

| Location              | Current                 | Target                  | Action                 |
| --------------------- | ----------------------- | ----------------------- | ---------------------- |
| Homepage footer       | `hello@anthrasite.io`   | `hello@anthrasite.io`   | ✅ OK                  |
| Homepage FAQ (new)    | N/A                     | `hello@anthrasite.io`   | ✅ New content correct |
| LP footer             | `hello@anthrasite.io`   | `hello@anthrasite.io`   | ✅ OK                  |
| LP error page         | `reports@anthrasite.io` | `hello@anthrasite.io`   | 🔄 Change              |
| Confirmation page     | `reports@anthrasite.io` | `hello@anthrasite.io`   | 🔄 Change              |
| Purchase success      | `reports@anthrasite.io` | `hello@anthrasite.io`   | 🔄 Change              |
| Help widget           | `support@anthrasite.io` | `hello@anthrasite.io`   | 🔄 Change              |
| Legal pages (privacy) | `privacy@anthrasite.io` | `privacy@anthrasite.io` | ✅ Keep (legal)        |
| Legal pages (terms)   | `support@anthrasite.io` | `hello@anthrasite.io`   | 🔄 Change              |

**Files to update (`reports@` → `hello@`):**

- `components/confirmation/SuccessPageClient.tsx:166`
- `app/purchase/success/page.tsx:47`
- `app/landing/[token]/page.tsx:48`
- `app/purchase/page.tsx:49`

**Files to update (`support@` → `hello@`):**

- Help widget component (location TBD)
- Legal terms page (location TBD)

---

### Implementation Checklist

#### Homepage

- [x] Replace FAQ content with 5 new questions from export.md
- [x] Refactor to use `FAQSection` component (match LP accordion style)
- [x] Verify contact email is `hello@anthrasite.io`

#### Landing Page

- [x] Replace FAQ content with 6 new questions from export.md
- [x] No style changes needed (already uses `FAQSection`)

#### Post-Purchase Page

- [x] Remove `<ConfirmationFAQ />` from `SuccessPageClient.tsx`
- [x] Delete `components/confirmation/ConfirmationFAQ.tsx`

#### Report PDF

- [x] Design "How to Read This Report" page in template
- [x] Add as page 2 (after hero, before priority details)
- [x] Match existing template typography and layout

#### Contact Email Consolidation

- [x] Change `reports@anthrasite.io` → `hello@anthrasite.io` in 4 files
- [x] Change `support@anthrasite.io` → `hello@anthrasite.io` (help widget, terms page)
- [x] Keep `privacy@anthrasite.io` as-is (legal compliance)

---

### Implementation Summary

**Completed: 2026-01-03**

#### Changes Made (anthrasite-clean)

1. **Homepage FAQs** (`components/homepage/OrganicHomepage.tsx`)

   - Replaced 4 custom FAQ items with 5 new questions
   - Imported and used `FAQSection` component from `@/components/landing/FAQSection`
   - Removed inline FAQ styling, `activeFaq` state, and `toggleFaq` function

2. **Landing Page FAQs** (`app/landing/[token]/LandingPageClient.tsx`)

   - Replaced `FAQ_ITEMS` array with 6 new questions from export.md
   - No structural changes needed (already used FAQSection)

3. **Confirmation Page FAQs**

   - Deleted `components/confirmation/ConfirmationFAQ.tsx`
   - Removed import and usage from `SuccessPageClient.tsx`
   - Removed export from `components/confirmation/index.ts`

4. **Email Consolidation**
   - Updated 6 files: `reports@` → `hello@anthrasite.io`
   - Updated 3 files: `support@` → `hello@anthrasite.io`
   - Kept `privacy@anthrasite.io` for legal compliance

#### Changes Made (LeadShop-v3-clean)

5. **Report PDF** (`report_template/audit_report_template_v2.html`)
   - Added "How to Read This Report" page as Page 2
   - Two-column flexbox layout (CSS Grid incompatible with Prince XML)
   - Sections: Your Score, Revenue Impact, Issue Ordering, Four Stages, What We Measured, What's Next

---

### Production Validation

**Date: 2026-01-03**

#### Homepage FAQs (anthrasite.io)

✅ Verified 5 new FAQs deployed:

1. What does Anthrasite do?
2. How do you analyze my site?
3. What exactly do I get in the full report?
4. What if it doesn't pay off?
5. How can I contact you? → hello@anthrasite.io

#### Landing Page FAQs (anthrasite.io/landing/{token})

✅ Verified 6 new FAQs deployed via Chrome DevTools snapshot:

- uid=32_102: What does Anthrasite do?
- uid=32_105: Do you actually look at my website?
- uid=32_108: How is this different from free tools?
- uid=32_111: Where does the "Monthly Revenue Impact" number come from?
- uid=32_114: What happens after I purchase?
- uid=32_117: What if it doesn't pay off?

#### Confirmation Page FAQs

✅ Verified NO FAQs present:

- `ConfirmationFAQ.tsx` deleted (Glob: no file found)
- `SuccessPageClient.tsx` has no FAQ references (Grep: no matches)
- `index.ts` does not export ConfirmationFAQ

#### Report PDF "How to Read This Report"

✅ Verified via PDF download from S3:

- PDF S3 key: `reports/3093/lead_3093_batch_20260102_202035_09738bcc/report_9c3cf36e...pdf`
- Page 2 contains onboarding content
- Two-column flexbox layout renders correctly in Prince XML/DocRaptor
- All sections present: Score, Revenue Impact, Issue Ordering, Four Stages, Measurements, What's Next

#### Contact Email Consolidation

✅ Verified `hello@anthrasite.io` in footer (uid=32_128 on landing page snapshot)

---

_Created: 2026-01-02_
_Completed: 2026-01-03_
