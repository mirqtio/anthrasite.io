# Abandoned Cart Recovery Implementation

## Overview

Phase 4.4 of the Anthrasite.io project implements a comprehensive abandoned cart recovery system to help convert lost sales by sending automated recovery emails to users who start but don't complete their checkout process.

## Key Components Implemented

### 1. Database Schema (`/prisma/schema.prisma`)
Added `AbandonedCart` model to track:
- Stripe session ID and business information
- Customer email and purchase details
- Recovery token for secure recovery links
- Email sending status and timestamps
- Recovery status and timestamps

### 2. Tracking System (`/lib/abandoned-cart/tracker.ts`)
- `trackCheckoutSession`: Records new checkout sessions as potentially abandoned
- `markSessionCompleted`: Removes carts that complete purchase
- `isSessionRecoverable`: Validates if a cart can still be recovered
- `getAbandonedCartByToken`: Retrieves cart details for recovery
- `markCartRecovered`: Updates cart status when recovered

### 3. Service Layer (`/lib/abandoned-cart/service.ts`)
Main service class `AbandonedCartService` provides:
- `trackAbandonedSession`: Integration point for checkout creation
- `checkAbandoned`: Finds carts abandoned for 3+ hours and sends emails
- `sendRecoveryEmail`: Sends personalized recovery emails
- `markRecovered`: Handles recovery link clicks
- `handlePaymentSuccess`: Cleanup on successful payment
- `getMetrics`: Comprehensive analytics and reporting

### 4. Email Template (`/lib/email/templates/cartRecovery.ts`)
Professional recovery email featuring:
- Personalized greeting with business name
- Clear call-to-action button
- List of report benefits
- Urgency messaging with expiration time
- Support contact information

### 5. Cron Job Handler (`/app/api/cron/abandoned-cart/route.ts`)
- Runs hourly to check for abandoned carts
- Secured with bearer token authentication
- Sends recovery emails with rate limiting (1 per cart)
- Tracks execution metrics for monitoring

### 6. Recovery Page (`/app/purchase/recover/page.tsx`)
User-facing recovery flow:
- Validates recovery token
- Checks session hasn't expired
- Marks cart as recovered
- Redirects to Stripe checkout

### 7. Webhook Integration
Updated Stripe webhook to:
- Mark carts as completed on successful payment
- Clean up expired sessions
- Prevent duplicate recovery emails

### 8. Analytics (`/lib/abandoned-cart/analytics.ts`)
Comprehensive metrics tracking:
- Abandonment and recovery rates
- Revenue impact analysis
- Time-based breakdowns
- Top abandoned businesses

## Configuration

### Environment Variables
```env
CRON_SECRET=your-secure-cron-secret
NEXT_PUBLIC_BASE_URL=https://anthrasite.io
```

### Business Rules
- **Abandonment Threshold**: 3 hours after checkout creation
- **Recovery Emails**: Maximum 1 per abandoned cart
- **Session Expiry**: Respects Stripe's 24-hour limit
- **Recovery Token**: Cryptographically secure 32-byte hex string

## Testing

Comprehensive test suite includes:

### Unit Tests
- `tracker.test.ts`: Core tracking functionality
- `service.test.ts`: Service layer logic
- `cartRecovery.test.ts`: Email template generation

### Integration Tests
- `integration.test.ts`: Full recovery flow testing
- Mock database implementation for isolated testing

### Test Coverage
- ✅ Abandoned cart tracking
- ✅ Recovery email sending
- ✅ Rate limiting enforcement
- ✅ Recovery token validation
- ✅ Analytics tracking
- ✅ Error handling

## Deployment Considerations

### Cron Job Setup
Configure your hosting provider to call the cron endpoint hourly:
```bash
0 * * * * curl -H "Authorization: Bearer $CRON_SECRET" https://anthrasite.io/api/cron/abandoned-cart
```

### Database Migration
Run the migration to add the abandoned cart table:
```bash
npx prisma migrate deploy
```

### Monitoring
Key metrics to monitor:
- Cron job execution success rate
- Recovery email delivery rate
- Recovery conversion rate
- Average time to recovery

## Security Considerations

1. **Recovery Tokens**: Secure random generation prevents guessing
2. **Session Validation**: Always checks if session is still valid
3. **Rate Limiting**: Prevents spam and abuse
4. **CRON Authentication**: Bearer token prevents unauthorized access

## Future Enhancements

1. **Multi-stage Recovery**: Send follow-up emails at different intervals
2. **Discount Incentives**: Offer time-limited discounts in recovery emails
3. **A/B Testing**: Test different email templates and timings
4. **SMS Recovery**: Add SMS as an additional recovery channel
5. **Predictive Analytics**: Identify high-risk abandonment patterns

## Metrics and Success Criteria

Target metrics for abandoned cart recovery:
- **Recovery Rate**: 20-30% of abandoned carts
- **Email Open Rate**: 40-50%
- **Click-through Rate**: 15-20%
- **Conversion Rate**: 10-15% of emails sent

## Integration Points

The abandoned cart system integrates with:
- Stripe webhook for payment events
- SendGrid for email delivery
- Prisma ORM for database operations
- Next.js API routes for cron handling
- Analytics system for tracking