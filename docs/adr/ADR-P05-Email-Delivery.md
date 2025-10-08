# ADR-P05: Email Delivery - Google Workspace SMTP

**Status**: Decided

**Context**:
Once the PDF report is generated, it must be delivered to the customer via email. We need a reliable way to send transactional emails with attachments.

**Decision**:
We will use our existing **Google Workspace account's SMTP server** for sending reports. The implementation will include a **switchable provider interface** to make it easy to migrate to a dedicated transactional email service (like Postmark or SendGrid) in the future.

**Consequences**:

- **Pros**:
  - **Low cost**: Uses our existing Google Workspace subscription.
  - **Good initial deliverability**: Emails come from our trusted domain.
  - The provider abstraction makes future upgrades straightforward.
- **Cons**:
  - **Sending limits**: Google Workspace has daily sending limits (e.g., 2000 emails/day) that we may eventually exceed.
  - **Limited analytics**: Lacks the detailed delivery tracking and analytics of a dedicated transactional email service.

---

## Implementation Notes

**G3 Archive (2025-10-07):**

- All legacy SendGrid files archived to `_archive/lib/email/` (10 files)
- Implemented Gmail SMTP provider using `nodemailer` in `lib/email/gmail.ts`
- Created error stub at `lib/email/sendgrid.ts` to catch legacy imports
- Webhook email integration deferred to D3 (pending Gmail credentials)

**Active Implementation:**

- Provider: `lib/email/gmail.ts`
- Functions: `sendEmail()`, `sendPurchaseConfirmation()`
- Transport: Gmail SMTP via `nodemailer` (smtp.gmail.com:587)
- Required environment variables: `GMAIL_USER`, `GMAIL_APP_PASSWORD`

**Future Migration Path:**
If switching to a dedicated transactional email service (e.g., Postmark), update `lib/email/gmail.ts` or create a new provider module and update the webhook imports. The simple function signature (`sendEmail()`, `sendPurchaseConfirmation()`) makes this migration straightforward.
