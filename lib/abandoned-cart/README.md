# Abandoned Cart Recovery System

This system tracks and recovers abandoned checkout sessions to help convert lost sales.

## Overview

The abandoned cart recovery system consists of:

1. **Tracking**: Monitors when users create checkout sessions but don't complete purchase
2. **Recovery**: Sends automated emails to recover abandoned carts after 3 hours
3. **Analytics**: Provides detailed metrics on abandonment and recovery rates

## Architecture

### Components

- **Tracker** (`tracker.ts`): Core functionality for tracking checkout sessions
- **Service** (`service.ts`): Main service for recovery email logic and orchestration
- **Analytics** (`analytics.ts`): Metrics and reporting functionality
- **Email Template** (`lib/email/templates/cartRecovery.ts`): Recovery email template

### Database Schema

```prisma
model AbandonedCart {
  id                String    @id @default(uuid())
  stripeSessionId   String    @unique
  businessId        String
  business          Business  @relation(fields: [businessId], references: [id])
  utmToken          String?
  customerEmail     String?
  amount            Int       // Amount in cents
  currency          String    @default("usd")
  recoveryToken     String?   @unique
  recoveryEmailSent Boolean   @default(false)
  emailSentAt       DateTime?
  recovered         Boolean   @default(false)
  recoveredAt       DateTime?
  sessionExpiresAt  DateTime
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

## Implementation Flow

### 1. Tracking Abandoned Carts

When a checkout session is created:

```typescript
// In purchase-service.ts
const session = await createStripeSession(...)
await abandonedCartService.trackAbandonedSession({
  session,
  businessId,
  utmToken,
})
```

### 2. Webhook Integration

The Stripe webhook handles two key events:

- `checkout.session.completed`: Marks cart as no longer abandoned
- `checkout.session.expired`: Removes expired abandoned cart records

### 3. Recovery Process

A cron job runs hourly to:

1. Find carts abandoned for 3+ hours
2. Send recovery emails (max 1 per cart)
3. Track analytics

```bash
# Example cron configuration
0 * * * * curl -H "Authorization: Bearer $CRON_SECRET" https://anthrasite.io/api/cron/abandoned-cart
```

### 4. Recovery Flow

When users click the recovery link:

1. Validate recovery token
2. Check if session is still valid
3. Mark cart as recovered
4. Redirect to Stripe checkout

## Configuration

### Environment Variables

```env
# Required
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_BASE_URL=https://anthrasite.io

# Email configuration (via lib/email)
SENDGRID_API_KEY=your-sendgrid-key
```

### Business Rules

- **Abandonment Threshold**: 3 hours after checkout creation
- **Recovery Emails**: Maximum 1 per abandoned cart
- **Session Expiry**: Respects Stripe's 24-hour session expiry

## API Endpoints

### Cron Job Handler

```
GET/POST /api/cron/abandoned-cart
Authorization: Bearer {CRON_SECRET}
```

Processes abandoned carts and sends recovery emails.

### Recovery Page

```
GET /purchase/recover?token={recoveryToken}
```

Validates recovery token and redirects to Stripe checkout.

## Analytics

The system tracks:

- Abandonment rate
- Recovery rate
- Revenue recovered
- Time to recovery
- Email effectiveness

### Key Metrics

```typescript
const metrics = await getAbandonmentMetrics(30) // Last 30 days
// Returns:
// - totalAbandoned
// - totalRecovered
// - recoveryRate
// - totalRevenueRecovered
// - averageTimeToRecovery
```

### Breakdowns

```typescript
const breakdown = await getAbandonmentBreakdown(30)
// Returns abandonment patterns by:
// - Hour of day
// - Day of week
// - Price range
// - Recovery time
```

## Testing

The system includes comprehensive tests:

```bash
# Unit tests
npm test lib/abandoned-cart/__tests__/tracker.test.ts
npm test lib/abandoned-cart/__tests__/service.test.ts

# Integration tests
npm test lib/abandoned-cart/__tests__/integration.test.ts

# API tests
npm test app/api/cron/abandoned-cart/__tests__/route.test.ts

# UI tests
npm test app/purchase/recover/__tests__/page.test.tsx
```

## Monitoring

Track these key indicators:

1. **Cron Job Health**: Monitor successful executions
2. **Recovery Rate**: Target 20-30% recovery rate
3. **Email Delivery**: Monitor SendGrid metrics
4. **Error Rate**: Track failed recovery attempts

## Best Practices

1. **Rate Limiting**: Only one recovery email per cart
2. **Timing**: 3-hour delay balances urgency with annoyance
3. **Personalization**: Include business name and exact amount
4. **Expiry Warnings**: Show remaining time clearly
5. **Mobile Optimization**: Ensure emails work on all devices

## Security Considerations

1. **Recovery Tokens**: Cryptographically secure random tokens
2. **Expiry Checks**: Always validate session hasn't expired
3. **Rate Limiting**: Prevent abuse of recovery system
4. **CRON Authentication**: Secure cron endpoints with secret

## Future Enhancements

1. **Multi-stage Recovery**: Send follow-up emails at different intervals
2. **Discount Codes**: Offer incentives in recovery emails
3. **A/B Testing**: Test different email templates and timing
4. **SMS Recovery**: Add SMS as recovery channel
5. **Predictive Analytics**: Identify high-risk abandonment patterns