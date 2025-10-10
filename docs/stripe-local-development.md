# Stripe Local Development Setup

This guide explains how to set up Stripe Test Mode for local development with the Payment Element flow.

## Philosophy

We use **real Stripe Test Mode** (not mocks) for testing the payment flow because:

- ✅ Tests the actual Stripe.js Payment Element integration
- ✅ Validates webhook handlers with real events
- ✅ Exercises the full payment lifecycle
- ✅ Catches integration issues before production

We **DO mock** application-level data (UTM tokens, business records) but **NOT** Stripe infrastructure.

## Prerequisites

1. **Stripe Account** - Sign up at https://dashboard.stripe.com/register
2. **Stripe CLI** - Install from https://stripe.com/docs/stripe-cli

### Install Stripe CLI

**macOS (Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**

```bash
curl -s https://packages.stripe.com/api/v1/keys/gpg | sudo apt-key add -
echo "deb https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

**Windows:**

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

## Setup Steps

### 1. Get Your Stripe Test Keys

1. Log in to https://dashboard.stripe.com
2. Switch to **Test Mode** (toggle in sidebar)
3. Go to **Developers → API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 2. Configure Environment Variables

Create or update `.env.local`:

```bash
# Stripe Test Mode Keys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Mock mode for UTM/business data (keep this)
USE_MOCK_PURCHASE=true
NEXT_PUBLIC_USE_MOCK_PURCHASE=true

# Payment Element feature flag
NEXT_PUBLIC_FF_PURCHASE_ENABLED=true

# Webhook secret (will be provided by Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 3. Start Stripe CLI for Webhook Forwarding

The Stripe CLI listens for webhook events from Stripe and forwards them to your local dev server.

#### Option A: Using Stripe CLI Directly

```bash
# Login to Stripe CLI (one-time setup)
stripe login

# Start webhook forwarding to your local server
stripe listen --forward-to http://localhost:3333/api/stripe/webhook

# This will output a webhook signing secret like: whsec_...
# Copy this secret to your .env.local as STRIPE_WEBHOOK_SECRET
```

Keep this terminal window open while developing.

#### Option B: Using Docker Compose (Recommended)

Add Stripe CLI as a service to `docker-compose.dev.yml`:

```yaml
stripe-cli:
  image: stripe/stripe-cli:latest
  command: listen --api-key ${STRIPE_SECRET_KEY} --forward-to http://app:3333/api/stripe/webhook
  depends_on:
    - app
  environment:
    - STRIPE_API_KEY=${STRIPE_SECRET_KEY}
```

Then start all services:

```bash
docker-compose -f docker-compose.dev.yml up
```

### 4. Test the Integration

#### Test Payment Intent Creation

1. Start your dev server (if not using Docker):

   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3333/purchase

   - The page should load with mock business data (Acme Corporation)
   - You should see the Stripe Payment Element form

3. Open browser console and check for errors
   - If you see authentication errors, check your `STRIPE_SECRET_KEY`

#### Test Payment Flow with Test Cards

Use Stripe's test card numbers:

| Card Number         | Scenario                          |
| ------------------- | --------------------------------- |
| 4242 4242 4242 4242 | Successful payment                |
| 4000 0027 6000 3184 | 3D Secure authentication required |
| 4000 0000 0000 9995 | Insufficient funds (declined)     |
| 4000 0000 0000 0002 | Generic decline                   |

**To test a successful payment:**

1. Fill in the payment form:

   - **Card number:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)

2. Click "Pay Now"

3. Check your terminal with `stripe listen` - you should see:

   ```
   2025-01-15 10:30:45  --> payment_intent.created
   2025-01-15 10:30:46  --> payment_intent.succeeded
   ```

4. Check your database - the purchase should be marked as `completed`:
   ```sql
   SELECT id, status, amount, stripePaymentIntentId
   FROM purchases
   ORDER BY createdAt DESC
   LIMIT 1;
   ```

#### Test 3D Secure Flow

1. Use card: 4000 0027 6000 3184
2. Click "Pay Now"
3. A 3D Secure modal will appear
4. Click "Complete authentication"
5. Payment should succeed after authentication

#### Trigger Webhook Events Manually

Test webhook handling without going through the UI:

```bash
# Trigger a successful payment
stripe trigger payment_intent.succeeded

# Trigger a failed payment
stripe trigger payment_intent.payment_failed

# Check your database to confirm purchases were updated
```

## Debugging

### Check Webhook Logs

View all webhook events received by your app:

```bash
stripe listen --forward-to http://localhost:3333/api/stripe/webhook --log-level debug
```

### Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/payments
2. View all payment intents created from your local environment
3. Click on a payment to see full event history

### Check Application Logs

In your dev server terminal, look for:

```
[Webhook] Received event: payment_intent.succeeded (evt_1234...)
[Webhook] Payment succeeded: pi_1234...
[Webhook] Purchase clxxx... marked as completed
```

## Troubleshooting

### "Invalid API Key" Error

- ✅ Check that `STRIPE_SECRET_KEY` starts with `sk_test_` (not `sk_live_`)
- ✅ Check that you're in Test Mode in Stripe Dashboard
- ✅ Verify the key has no extra spaces or quotes

### "Webhook signature verification failed"

- ✅ Ensure `STRIPE_WEBHOOK_SECRET` matches the output from `stripe listen`
- ✅ Check that you're using `await request.text()` (not `.json()`) for raw body
- ✅ Restart your dev server after updating the webhook secret

### "Purchase not found" in Webhook

- ✅ Check that payment intent was created with correct `purchaseId` in metadata
- ✅ Verify `stripePaymentIntentId` was saved to database after creation
- ✅ Check database connection in webhook handler

### Payment Element Not Loading

- ✅ Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set (client-side)
- ✅ Verify `NEXT_PUBLIC_FF_PURCHASE_ENABLED=true` (feature flag)
- ✅ Check browser console for Stripe.js load errors

## CI/CD Integration

For preview deployments and CI testing:

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Stripe CLI
        run: |
          curl -s https://packages.stripe.com/api/v1/keys/gpg | sudo apt-key add -
          echo "deb https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
          sudo apt update
          sudo apt install stripe

      - name: Start Stripe webhook forwarding
        run: |
          stripe listen --api-key ${{ secrets.STRIPE_SECRET_KEY }} \
            --forward-to https://preview-${{ github.sha }}.vercel.app/api/stripe/webhook &

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}
```

## Production Considerations

When deploying to production:

1. **Switch to Live Mode Keys**:

   - Use `sk_live_...` and `pk_live_...`
   - These are separate from test keys

2. **Configure Production Webhook Endpoint**:

   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret to production environment

3. **Disable Mock Mode**:

   ```bash
   USE_MOCK_PURCHASE=false
   NEXT_PUBLIC_USE_MOCK_PURCHASE=false
   ```

4. **Enable Real UTM Validation**:
   - Ensure `UTM_SIGNING_SECRET` is set
   - Verify cryptographic token generation is working

## Additional Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Payment Element Documentation](https://stripe.com/docs/payments/payment-element)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
