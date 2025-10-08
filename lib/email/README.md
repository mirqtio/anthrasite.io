# Email Integration

This module provides Gmail SMTP email integration for Anthrasite.io, handling purchase confirmation emails.

## Features

- **Gmail SMTP**: Reliable email delivery via Gmail's SMTP server
- **Idempotent Sends**: Purchase confirmation emails sent exactly once per purchase
- **Feature Flags**: Enable/disable emails and dry-run mode via environment variables
- **Dry-Run Mode**: Test email flow without sending real emails
- **Safe Logging**: Only logs purchase IDs and event IDs (no PII)
- **Type Safety**: Full TypeScript support

## Configuration

Set the following environment variables:

```env
# Required for Gmail SMTP
GMAIL_USER=your-email@anthrasite.io
GMAIL_APP_PASSWORD=your-app-specific-password

# Feature flags
EMAIL_CONFIRMATION_ENABLED=false  # Set to 'true' to enable emails
EMAIL_DRY_RUN=true                # Set to 'false' for real sends
```

### Gmail App Password Setup

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app-specific password for "Mail"
4. Use this password (not your regular password) in `GMAIL_APP_PASSWORD`

See: https://support.google.com/accounts/answer/185833

## Usage

### Sending Purchase Confirmation Emails

The email facade is automatically called by the Stripe webhook handler:

```typescript
import { sendPurchaseConfirmationEmail } from '@/lib/email'

// Called automatically in webhook (app/api/webhooks/stripe/route.ts)
await sendPurchaseConfirmationEmail(purchase, { eventId: event.id })
```

### Idempotency

Emails are sent exactly once per purchase using the `Purchase.confirmationEmailSentAt` timestamp:

- If `confirmationEmailSentAt` is already set → email skipped (logged)
- If null → email sent and timestamp set
- Replaying the same Stripe event will not send duplicate emails

### Dry-Run Mode

When `EMAIL_DRY_RUN=true`, instead of sending emails, the system writes two files to `/tmp/mailbox/`:

1. `[timestamp]_[purchaseUid].meta.json` - Email metadata (to, from, subject)
2. `[timestamp]_[purchaseUid].eml` - Full email in EML format

This allows testing the entire email flow without actual SMTP calls.

## Email Template

Purchase confirmation emails include:

- **Subject**: "Your Anthrasite Website Audit - Order Confirmation"
- **Content**:
  - Order details (Order ID, amount, website domain)
  - Next steps (analysis timeline, report delivery)
  - Support contact information
- **Formats**: Both plain text and HTML versions

## Architecture

```
Stripe Webhook (checkout.session.completed)
  ↓
Extract customer email from session
  ↓
Create Purchase record (with customerEmail)
  ↓
sendPurchaseConfirmationEmail()
  ├─ Check EMAIL_CONFIRMATION_ENABLED flag
  ├─ Check confirmationEmailSentAt (idempotency)
  ├─ If EMAIL_DRY_RUN=true → Write to /tmp/mailbox/
  ├─ Else → Send via Gmail SMTP
  └─ Update Purchase.confirmationEmailSentAt
```

## Logging

All logs use structured JSON and exclude PII:

```json
{
  "event": "purchase_confirmation_sent",
  "purchaseUid": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "evt_1234567890abcdef"
}
```

Email addresses are **never** logged.

## Error Handling

Email send failures are caught and logged but do not crash the webhook:

```json
{
  "event": "email_send_error",
  "purchaseUid": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "evt_1234567890abcdef",
  "error": "SMTP connection failed"
}
```

The webhook returns `200 OK` to Stripe even if email fails (purchase is still recorded).

## Testing

### Test with Dry-Run Mode

```bash
# Set environment variables
export EMAIL_CONFIRMATION_ENABLED=true
export EMAIL_DRY_RUN=true
export GMAIL_USER=test@anthrasite.io

# Trigger webhook with Stripe CLI
stripe trigger checkout.session.completed

# Check dry-run output
ls -la /tmp/mailbox/
cat /tmp/mailbox/*.meta.json
```

### Test Idempotency

```bash
# Replay the same event
stripe events resend evt_1234567890abcdef

# Check logs - should show "email_already_sent"
```

## Migration from SendGrid

This module replaces the legacy SendGrid integration (archived in G3).

**Key differences:**

- SendGrid used API key → Gmail uses SMTP with app password
- SendGrid had template IDs → Gmail uses inline templates
- SendGrid had webhook events → Gmail confirmation is timestamp-based

**Migration path:**

- All SendGrid files archived to `_archive/lib/email/`
- Error stub at `lib/email/sendgrid.ts` catches legacy imports
- See `_archive/ARCHIVE_INDEX.md` for restoration instructions

## Future Enhancements

Planned for later epics:

- **Queue-based sending** (Epic C) - Move email to job queue for better reliability
- **Retry logic** (Epic F) - Automatic retries on transient failures
- **Report delivery emails** (Epic D) - Send PDF reports when ready
- **Template system** - Move email content to separate template files
- **Provider abstraction** - Switch between Gmail/Postmark/SendGrid via config

## Troubleshooting

### Emails not sending

1. Check `EMAIL_CONFIRMATION_ENABLED=true` is set
2. Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct
3. Check Gmail account has 2FA enabled and app password created
4. Review logs for `email_send_error` events

### Dry-run files not created

1. Check `/tmp/mailbox/` directory exists and is writable
2. Verify `EMAIL_DRY_RUN=true` is set
3. Check logs for `email_dry_run_written` events

### Duplicate emails

1. Check `Purchase.confirmationEmailSentAt` is being set correctly
2. Review logs for `email_already_sent` events
3. Verify Stripe event deduplication is working

## Best Practices

1. **Never log email addresses** - Use purchaseUid for correlation
2. **Always use dry-run in development** - Prevents accidental sends
3. **Monitor Gmail sending limits** - 500/day for free accounts, 2000/day for Google Workspace
4. **Test idempotency** - Replay Stripe events to verify no duplicates
5. **Handle failures gracefully** - Email errors shouldn't break purchases
