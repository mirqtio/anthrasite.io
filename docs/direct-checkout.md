# Direct to Stripe Checkout Flow

## Overview

The purchase flow has been optimized to take customers directly to Stripe Checkout when they click the CTA in their email, reducing friction and improving conversion rates.

## Flow Behavior

### Production Flow
1. Customer clicks email CTA → `https://anthrasite.io/purchase?utm=HASH`
2. Server validates UTM token
3. If valid → Immediate redirect to Stripe Checkout
4. If invalid → Show interstitial page with error

### Development Flow
1. Customer clicks test link → `http://localhost:3333/purchase?utm=mock-hash-123`
2. Server validates mock UTM token
3. If valid → Redirect to checkout simulator at `/test-purchase/checkout-simulator`
4. If invalid → Show interstitial page

## Query Parameters

- `utm` (required): Signed hash containing business data
- `preview=true` (optional): Forces showing the interstitial page even with valid token

## Examples

### Direct to Checkout (Default)
```
https://anthrasite.io/purchase?utm=eyJidXNpbmVzc19pZCI6MTIzLCJwcmljZSI6OTkwMH0...
```

### Preview Mode (Shows Interstitial)
```
https://anthrasite.io/purchase?utm=eyJidXNpbmVzc19pZCI6MTIzLCJwcmljZSI6OTkwMH0...&preview=true
```

## Testing

### Local Development
```bash
# Direct to checkout simulator (default)
http://localhost:3333/purchase?utm=mock-hash-123

# Force interstitial page
http://localhost:3333/purchase?utm=mock-hash-123&preview=true

# Invalid token (always shows interstitial)
http://localhost:3333/purchase?utm=invalid-token
```

### Mock UTM Tokens
- `mock-hash-123` - Valid token for Acme Corp
- `mock-hash-456` - Valid token for TechStartup Inc
- `dev-utm-used` - Already used token (shows error)

## Benefits

1. **Reduced Friction**: One click from email to payment
2. **Higher Conversion**: Fewer steps = less drop-off
3. **Faster Experience**: ~2 second redirect time
4. **Mobile Optimized**: Single tap purchase flow
5. **Fallback Support**: Graceful handling of errors

## Implementation Details

The purchase page checks:
1. Is the UTM token valid?
2. Is `preview=true` set?

If token is valid AND preview is not true → Direct to Stripe
Otherwise → Show interstitial page

## Analytics Events

- `direct_checkout_attempt` - Fired when attempting direct redirect
- `checkout_session_created` - Includes `flow_type: 'direct'`
- `manual_checkout_attempt` - When using interstitial page button
- `checkout_session_failed` - If redirect fails