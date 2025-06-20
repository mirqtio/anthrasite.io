# Email Integration

This module provides SendGrid email integration for Anthrasite.io, handling transactional emails for orders, reports, and customer communications.

## Features

- **Email Templates**: Pre-built responsive HTML email templates
- **Automatic Retry**: Failed emails are queued and retried with exponential backoff
- **Event Tracking**: Track email delivery, opens, clicks, bounces, and complaints
- **Webhook Integration**: Process SendGrid events to update email status
- **Type Safety**: Full TypeScript support with comprehensive types

## Configuration

Set the following environment variables:

```env
# Required
SENDGRID_API_KEY=your-api-key

# Optional (with defaults)
SENDGRID_FROM_EMAIL=noreply@anthrasite.io
SENDGRID_FROM_NAME=Anthrasite
SENDGRID_REPLY_TO_EMAIL=support@anthrasite.io
SENDGRID_REPLY_TO_NAME=Anthrasite Support

# For webhook signature verification
SENDGRID_WEBHOOK_KEY=your-webhook-key
SENDGRID_WEBHOOK_PUBLIC_KEY=your-public-key

# Development mode
SENDGRID_SANDBOX_MODE=true  # Set to false to send real emails in dev
```

## Usage

### Sending Emails

```typescript
import {
  sendOrderConfirmation,
  sendReportReady,
  sendWelcomeEmail,
} from '@/lib/email'

// Send order confirmation
await sendOrderConfirmation({
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'order-123',
  businessDomain: 'example.com',
  amount: 9900,
  currency: 'usd',
  purchaseDate: new Date(),
})

// Send report ready notification
await sendReportReady({
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'order-123',
  businessDomain: 'example.com',
  reportUrl: 'https://anthrasite.io/reports/123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
})

// Send welcome email
await sendWelcomeEmail({
  to: 'customer@example.com',
  customerName: 'John Doe',
  businessDomain: 'example.com',
})
```

### Email Queue

Failed emails are automatically queued for retry:

```typescript
import { getEmailQueueStats, processRetryQueue } from '@/lib/email'

// Get queue statistics
const stats = getEmailQueueStats()
console.log(`Pending emails: ${stats.pending}`)
console.log(`Failed emails: ${stats.failed}`)

// Manually process retry queue (normally automatic)
await processRetryQueue()
```

## Email Templates

### Available Templates

1. **Order Confirmation** (`orderConfirmation`)

   - Sent immediately after successful payment
   - Includes order details and next steps

2. **Report Ready** (`reportReady`)

   - Sent when the business report is ready
   - Includes download link with expiration warning

3. **Welcome Email** (`welcomeEmail`)
   - Sent to first-time customers
   - Explains Anthrasite features and benefits

### Template Structure

All templates use a consistent base template with:

- Responsive design (mobile-friendly)
- Dark mode support
- Consistent header/footer
- Call-to-action buttons
- Proper email client compatibility

## Webhook Integration

### SendGrid Events

Configure SendGrid to send events to:

```
https://your-domain.com/api/sendgrid/webhook
```

The webhook processes these events:

- `delivered`: Email successfully delivered
- `bounce`: Email bounced (hard/soft)
- `complaint`: Spam complaint
- `unsubscribed`: User unsubscribed
- `open`: Email opened
- `click`: Link clicked

### Purchase Metadata

Email events update the purchase record metadata:

```typescript
{
  // Delivery status
  emailDelivered: boolean
  emailDeliveredAt: string

  // Bounce information
  emailBounced: boolean
  emailBouncedAt: string
  emailBounceReason: string
  emailBounceType: 'hard' | 'soft'

  // Engagement metrics
  emailOpened: boolean
  emailOpenCount: number
  emailLastOpenedAt: string
  emailClicked: boolean
  emailClicks: Array<{ url: string; timestamp: string }>
  emailLastClickedAt: string

  // Complaints
  emailComplaint: boolean
  emailComplaintAt: string
}
```

## Testing

Run the email tests:

```bash
npm test lib/email
```

### Mock SendGrid in Tests

```typescript
jest.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))
```

## Best Practices

1. **Always handle email failures gracefully** - Don't let email failures break the main flow
2. **Use sandbox mode in development** - Prevents accidental emails to real addresses
3. **Monitor the retry queue** - Check for persistent failures
4. **Keep templates simple** - Complex HTML may not render correctly in all clients
5. **Test with real email clients** - Use tools like Litmus or Email on Acid

## Troubleshooting

### Emails not sending

1. Check if `SENDGRID_API_KEY` is set
2. Verify sandbox mode is disabled in production
3. Check SendGrid account status and limits

### High bounce rate

1. Implement email validation before sending
2. Monitor bounce reasons in webhook events
3. Maintain a suppression list

### Templates not rendering correctly

1. Test in multiple email clients
2. Keep CSS inline
3. Avoid JavaScript (not supported)
4. Use table-based layouts for compatibility
