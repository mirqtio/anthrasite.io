# Email to Purchase Flow

## Direct Checkout Flow

When customers click the CTA button in their email, they are taken directly to Stripe Checkout for the fastest possible purchase experience.

### Flow:

1. **Email CTA** → Customer clicks "Get Your Report for $99"
2. **Purchase URL** → `https://anthrasite.io/purchase?utm=SIGNED_HASH`
3. **Server Processing**:
   - Validates UTM hash
   - Fetches business data
   - Creates Stripe session
   - Redirects to Stripe (~1-2 seconds)
4. **Stripe Checkout** → Customer completes payment
5. **Success Page** → Report delivery confirmation

### URL Parameters:

- `utm` (required): Signed hash containing business data
- `preview=true` (optional): Shows interstitial page instead of direct redirect

### Example Email CTA:

```html
<a
  href="https://anthrasite.io/purchase?utm=eyJidXNpbmVzc19pZCI6MTIzLCJwcmljZSI6OTkwMCwiZXhwaXJlcyI6MTcwMDAwMDAwMH0..."
  style="background: #0066FF; color: white; padding: 16px 32px; 
          text-decoration: none; border-radius: 8px; 
          font-size: 18px; display: inline-block;"
>
  Get Your Report for $99 →
</a>
```

### Benefits:

1. **Fewer Clicks**: Direct to payment (1 click vs 2-3)
2. **Higher Conversion**: Reduces drop-off between pages
3. **Faster Experience**: ~2 seconds to checkout
4. **Mobile Optimized**: Single tap to purchase

### Fallback Behavior:

If the direct redirect fails or the UTM token is invalid/expired, customers see the interstitial page with:

- Personalized message
- Report preview
- Manual checkout button
- Error messaging

### Testing:

To test the interstitial page without going to Stripe:

```
https://anthrasite.io/purchase?utm=HASH&preview=true
```
