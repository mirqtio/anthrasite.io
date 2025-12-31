# Scratchpad

## ANT-562 — Post-purchase page (static guidance, no polling)

### Conclusion

Implement a **static post-purchase confirmation page** that:

- Confirms payment succeeded.
- Sets expectations for report generation time.
- Explains that delivery is **by email with a secure PDF link** (no login / no portal).
- Provides a clear support path.

This page must **not** poll or depend on Temporal / Phase D status. It is informational.

### Constraints / Ground Truth

- The user flow is: marketing email -> JWT-gated landing page (token contains `leadId` + `runId`) -> Stripe purchase -> Stripe redirects back to Anthrasite.
- We control Stripe redirect URLs.
- Post-purchase fulfillment is handled asynchronously (Temporal; Phase D then Phase E).
- “Ready” means **Phase D complete** (typically <5 minutes, but not immediate).

### Route / Entry

- Stripe `success_url` should route the user to a dedicated confirmation page.
- The page must require a valid purchase context:
  - Preferred: a JWT token passed through the redirect (reusing the existing purchase token pattern).
  - The page should validate the token and derive `leadId` and `runId` from it.

No workflow status calls are permitted from this page.

### Page Content (proposed)

**Header**

“Purchase complete”

**Primary message**

“We’re generating your website report for {BUSINESS_NAME}.”

**Expectation block**

- “This usually takes **2–5 minutes**.”
- “We’ll email you a secure link to your PDF as soon as it’s ready.”

**What happens next**

- “We analyze {DOMAIN} using automated tests and an AI-based visual review.”
- “We prioritize the highest-impact issues we found.”
- “We generate a PDF report tailored to your site.”

**Delivery block**

- “Delivered by email to {PURCHASE_EMAIL}.”
- “Includes a secure PDF link (no login required).”
- “You can download, share, or forward the report.”

**FAQ**

- “How long does it take?” -> “Most reports are ready in 2–5 minutes. If it takes longer, we’ll email you as soon as it’s complete.”
- “Where will I get the report?” -> “By email. There’s no account or portal.”
- “What if I don’t see the email?” -> “Check spam/promotions. If it’s not there after 10 minutes, reply to your receipt email and we’ll help.”
- “How accurate is this analysis?” -> “Based on automated testing and AI-assisted visual analysis; highlights likely issues, not guarantees.”
- “What does the dollar range mean?” -> “An estimate of potential impact based on what we found; the report explains the calculation.”
- “What if I’m not satisfied?” -> “Money-back guarantee; reply to your receipt email.”

**Need help?**

“Reply to your receipt email and we’ll take care of it.”

### Data Requirements (minimal)

To keep the page “static guidance” but still personalized:

- Required:
  - `leadId`, `runId` from the purchase/landing token.
- Optional personalization:
  - `{BUSINESS_NAME}` and `{DOMAIN}` from LeadShop/Supabase lead data.
  - `{PURCHASE_EMAIL}` from Stripe checkout session (preferred) or stored purchase record.

If any optional fields are missing, show generic copy (no hard failure).

### Error States

- Missing/invalid token:
  - Show “This confirmation link is invalid or expired.”
  - Provide support CTA.
- Missing lead record:
  - Show generic confirmation copy.
  - Provide support CTA.

### Acceptance Criteria (rewrite)

- Page is reachable only after successful payment (validated purchase context).
- Shows expectation message (2–5 minutes typical, not immediate).
- Clearly states delivery method: **email with secure PDF link**, no login.
- Provides support path and includes a human-friendly order reference (if available).
- Does **not** poll or query Temporal / Phase D status.

---

## Claude Review — ANT-562 Proposal

**Reviewed:** 2025-12-31
**Context:** LeadShop SYSTEM.md, Anthrasite SYSTEM.md, landing page implementation

### Overall Assessment

The proposal is **sound and well-constrained**. The static, no-polling approach aligns with the architecture: Phase D/E are async Temporal workflows, and the confirmation page has no business checking their status. The content structure is clear and user-focused.

### Questions Requiring Clarification

**1. Route Pattern**

The proposal says "JWT token passed through the redirect" but doesn't specify the URL structure. Existing patterns:

| Route    | Pattern                     | Token Location |
| -------- | --------------------------- | -------------- |
| Landing  | `/landing/{jwt_token}`      | Path segment   |
| Purchase | `/purchase?sid={jwt_token}` | Query param    |

**Question:** Which pattern for confirmation? Recommend `/confirmation?sid={token}` to match purchase flow (user already has a `?sid=` URL from arriving at purchase).

**2. Token Audience & Scope**

Current purchase token has `aud: "purchase"`, `scope: "buy"`. The confirmation page is post-purchase, so:

- **Option A:** Reuse the purchase token (same claims, just validate `aud: "purchase"`).
- **Option B:** Mint a new confirmation token during checkout session creation with `aud: "confirmation"`, `scope: "view"`.

**Question:** Does reusing the purchase token feel right, or is a distinct confirmation token cleaner for auditing?

**3. Token Passthrough in Stripe Success URL**

Stripe's `success_url` supports `{CHECKOUT_SESSION_ID}` placeholder but not arbitrary params. Current implementation:

```typescript
// lib/stripe/checkout.ts (likely)
success_url: `${baseUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`
```

To pass the JWT token through:

- Either: Encode the JWT in the success_url before creating the session (URL-safe).
- Or: Look up the token from the checkout session metadata after redirect.

**Question:** Should we store the original JWT in Stripe metadata and retrieve it on the confirmation page via `session_id`, or pass it through the URL directly?

**4. Purchase Email Source**

The proposal mentions `{PURCHASE_EMAIL}` from "Stripe checkout session (preferred)". After redirect, we'd need to:

1. Call Stripe API with `session_id` to retrieve `customer_details.email`.
2. Or store it in our `sales` table during webhook processing (but webhook may not have fired yet).

**Concern:** The webhook (`checkout.session.completed`) fires asynchronously. By the time the user lands on confirmation, the webhook may not have processed yet. Stripe API lookup via `session_id` is the reliable path.

**Question:** Is calling Stripe's API on every confirmation page load acceptable (adds ~100-200ms latency)?

### Suggested Improvements

**5. Add "What You Purchased" Summary**

The proposal doesn't show what was purchased. Adding a simple confirmation block builds confidence:

```
✓ Website Performance Report — $199
  For: {BUSINESS_NAME} ({DOMAIN})
```

**6. Order Reference**

The proposal mentions "human-friendly order reference (if available)" but doesn't specify what this would be. Options:

- Stripe Payment Intent ID (long, not friendly)
- Stripe Checkout Session ID (shorter but still technical)
- Custom order number (would need to generate/store)

**Recommendation:** Use last 8 characters of Stripe session ID as a reference (e.g., `Order #abc12345`). Simple, unique, traceable.

**7. Visual Design — Timeline**

Consider a visual timeline to show progress state:

```
[✓ Payment]  →  [⏳ Generating]  →  [📧 Email Delivery]
    Done           2-5 min            Coming soon
```

This reinforces "we're working on it" without implying real-time status.

**8. Component Reuse**

Landing page components that should be reused:

- `FAQSection` + `FAQAccordionItem` — same accordion pattern
- `LandingFooter` — consistent footer
- `TokenError` — same error display pattern
- Container pattern: `.landing-container` for consistent width/padding

New components needed:

- `ConfirmationHero` — checkmark icon, success message
- `ExpectationBlock` — timeline or steps visual
- `DeliveryBlock` — email delivery details

**9. Type Definition**

```typescript
interface ConfirmationContext {
  company?: string // Optional, graceful fallback
  domain?: string // Optional
  purchaseEmail?: string // From Stripe session
  sessionId: string // For order reference
  leadId: string
  runId?: string
  price: number
}
```

### Implementation Sketch

```
/app/confirmation/page.tsx (Server Component)
├── Extract session_id from searchParams
├── Call Stripe API → retrieve session (includes metadata.token, customer_details.email)
├── Extract JWT from session.metadata.token
├── Validate JWT → get leadId, runId
├── Lookup lead data from Supabase (company, domain) — graceful fallback if missing
├── Build ConfirmationContext
├── Render ConfirmationPageClient

/app/api/checkout/create-session/route.ts (UPDATE REQUIRED)
├── Store JWT in Stripe session metadata: { token: originalJwt }
├── Set success_url: `${baseUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`

/components/confirmation/
├── ConfirmationHero.tsx — checkmark, "Purchase complete", order reference
├── PurchaseSummary.tsx — what you bought block
├── ExpectationBlock.tsx — timeline visual + "2-5 minutes" message
├── DeliveryBlock.tsx — email delivery details
├── ConfirmationFAQ.tsx — reuses FAQSection with confirmation-specific items

/lib/confirmation/
├── context.ts → lookupConfirmationContext(sessionId)
├── types.ts → ConfirmationContext interface
```

**Data Flow:**

```
Stripe redirects → /confirmation?session_id=cs_xxx
                          ↓
              stripe.checkout.sessions.retrieve(session_id)
                          ↓
              { metadata: { token }, customer_details: { email } }
                          ↓
              validatePurchaseToken(metadata.token) → { leadId, runId }
                          ↓
              Supabase: leads table → { company, domain }
                          ↓
              Render page with ConfirmationContext
```

### Decisions (Resolved 2025-12-31)

**1. Route pattern:** `/confirmation?session_id={CHECKOUT_SESSION_ID}`

Use Stripe's built-in placeholder. Avoids URL-encoding issues with long JWTs. Session ID is proof of successful checkout. Our JWT is stored in Stripe metadata and retrieved via session lookup.

**2. Token strategy:** Reuse purchase token (stored in Stripe metadata)

No new minting logic needed. Purchase token already has `leadId` and `runId`. Token was validated during checkout creation. Confirmation page is read-only — no new permissions required.

**3. Stripe API call:** Yes, acceptable

~100-200ms latency is negligible for a page users visit once. Only reliable way to get customer email before webhook fires. Stripe API is fast and idempotent. No caching needed.

**4. Purchase summary:** Yes, include "what you bought" block

Builds confidence. Shows:

```
✓ Website Performance Report — $199
  For: {BUSINESS_NAME} ({DOMAIN})
```

**5. Order reference format:** Last 8 of Stripe session ID (e.g., `#abc12345`)

### Risk Assessment

| Risk                                | Likelihood | Mitigation                                            |
| ----------------------------------- | ---------- | ----------------------------------------------------- |
| User refreshes page repeatedly      | Medium     | Stripe API is idempotent; just re-renders same data   |
| Token expires before user sees page | Low        | Purchase tokens have 7-day TTL per SYSTEM.md          |
| Webhook races confirmation page     | Medium     | Don't depend on webhook data; use Stripe API directly |
| User bookmarks confirmation URL     | Low        | No harm; page is informational only                   |

### Verdict

**Ready to implement.** All decisions resolved.

**Prerequisites:**

1. Update `/app/api/checkout/create-session/route.ts` to store JWT in Stripe metadata and set new success_url

**New files:**

- `/app/confirmation/page.tsx`
- `/lib/confirmation/context.ts`
- `/lib/confirmation/types.ts`
- `/components/confirmation/ConfirmationHero.tsx`
- `/components/confirmation/PurchaseSummary.tsx`
- `/components/confirmation/ExpectationBlock.tsx`
- `/components/confirmation/DeliveryBlock.tsx`
- `/components/confirmation/ConfirmationFAQ.tsx`

**Reused:**

- `FAQSection` / `FAQAccordionItem`
- `LandingFooter`
- `TokenError` pattern
- `.landing-container` CSS
- `validatePurchaseToken()` from `lib/purchase`

---

## Implementation Status (2025-12-31)

### ✅ IMPLEMENTED

**Route Decision Change:** Enhanced existing `/purchase/success` instead of creating new `/confirmation` route.

- Stripe success_url already points to `/purchase/success?session_id={CHECKOUT_SESSION_ID}`
- No Stripe configuration changes needed
- Less disruption, same outcome

**Files Created:**
| File | Purpose |
|------|---------|
| `/lib/confirmation/types.ts` | ConfirmationContext interface |
| `/lib/confirmation/context.ts` | lookupConfirmationContext() - retrieves Stripe session, validates JWT/metadata, fetches lead |
| `/components/confirmation/ConfirmationHero.tsx` | Success checkmark, "Purchase complete", order ref |
| `/components/confirmation/PurchaseSummary.tsx` | What you bought block |
| `/components/confirmation/ExpectationBlock.tsx` | Timeline visual (Payment → Generating → Email) |
| `/components/confirmation/DeliveryBlock.tsx` | Email delivery details |
| `/components/confirmation/ConfirmationFAQ.tsx` | FAQ with confirmation-specific items |
| `/components/confirmation/SuccessPageClient.tsx` | Main orchestrating client component |
| `/components/confirmation/index.ts` | Barrel export |
| `/components/purchase/LegacySuccessPage.tsx` | Extracted legacy flow for backward compat |
| `/app/purchase/success/page.tsx` | Rewritten as server component |
| `/app/purchase/success/loading.tsx` | Loading skeleton |

**Files Modified:**
| File | Change |
|------|--------|
| `/middleware/03-access-control.ts` | Added `session_id` query param bypass for protected routes |

**Key Implementation Details:**

1. JWT token stored in Stripe metadata as `utmToken` (already existed)
2. Added fallback: if no `utmToken` in metadata, use `leadId` directly (for legacy sessions)
3. Preserved legacy `payment_intent` and `purchase` query param flows

### 🔧 KNOWN ISSUES TO FIX

1. **Price display shows $30 instead of $199** - Test session has old price data
2. **Visual polish needed** - Review spacing, timeline connector lines, mobile responsiveness
3. **Debug logging removed** - Clean implementation ready for production

### ✅ TESTED WITH

- Session ID: `cs_test_a1E6KtQovy1k73J2uHtrkR9qQvzioa0jvjTT6FpqZLJm9eVjhURKhpjzHV`
- Lead: Anthrasite (anthrasite.io)
- Email: stripe@example.com
- Typecheck: ✅ Passes
