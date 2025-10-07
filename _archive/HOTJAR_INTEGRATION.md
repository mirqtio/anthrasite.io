# Hotjar Integration Guide

This guide explains how to set up Hotjar for heatmaps, session recordings, and user feedback on Anthrasite.io.

## 1. Create a Hotjar Account

1. Go to [Hotjar.com](https://www.hotjar.com) and sign up for an account
2. Choose a plan (they offer a free tier with 1,000 sessions/day)
3. Create a new site for `anthrasite.io`

## 2. Get Your Hotjar Site ID

1. In your Hotjar dashboard, go to Sites & Organizations
2. Find your site and click on it
3. Copy the Site ID (it's a numeric value like `3456789`)

## 3. Add Environment Variable

### Local Development (.env.local)
```
NEXT_PUBLIC_HOTJAR_SITE_ID=3456789
```

### Vercel Production
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - Name: `NEXT_PUBLIC_HOTJAR_SITE_ID`
   - Value: Your Hotjar Site ID
   - Environment: Production

## 4. How It Works

### Consent Management
- Hotjar is only loaded after users accept analytics cookies
- The integration respects user privacy choices
- If users reject analytics cookies, Hotjar won't load

### What Gets Tracked
- **Heatmaps**: Click, move, and scroll data
- **Session Recordings**: User sessions (with privacy masking)
- **Feedback**: Polls and surveys (if configured)
- **Funnels**: User journey analytics

### Privacy Features
- Automatically respects Do Not Track settings
- Sensitive data is masked by default
- IP addresses are anonymized
- No recording on sensitive pages (can be configured)

## 5. Verify Installation

After deploying with the Hotjar Site ID:

1. Visit your production site
2. Accept analytics cookies
3. Open browser DevTools
4. Check Network tab for requests to `static.hotjar.com`
5. In your Hotjar dashboard, check "Verify Installation"

## 6. Configure Hotjar Settings

In your Hotjar dashboard:

### Recommended Settings
1. **Data Privacy**:
   - Enable "Suppress text and numbers"
   - Enable "Suppress all form inputs"
   - Add sensitive CSS selectors to suppress

2. **Recording Settings**:
   - Set sample rate (start with 35%)
   - Configure page targeting
   - Set up event triggers

3. **Heatmap Settings**:
   - Select which pages to track
   - Configure mobile vs desktop tracking

## 7. Advanced Usage

### Trigger Custom Events
```javascript
// In your code, after user actions:
window.hj?.('event', 'waitlist_joined')
window.hj?.('event', 'purchase_completed')
```

### Virtual Page Views
For single-page app navigation:
```javascript
window.hj?.('vpv', '/new-page-path')
```

### Identify Users (with consent)
```javascript
window.hj?.('identify', userId, {
  plan: 'premium',
  role: 'admin'
})
```

## 8. Integration with Analytics

Hotjar is integrated with our analytics system and:
- Respects the same consent as GA4 and PostHog
- Loads asynchronously to not impact performance
- Only tracks when users have accepted analytics cookies

## 9. Troubleshooting

### Hotjar Not Loading
1. Check if `NEXT_PUBLIC_HOTJAR_SITE_ID` is set
2. Verify analytics consent is accepted
3. Check browser console for errors
4. Ensure Site ID is correct (numeric only)

### No Data in Dashboard
1. Wait 2-3 minutes for data to appear
2. Check if tracking is paused in Hotjar
3. Verify your site URL matches Hotjar settings
4. Check if ad blockers are interfering

### Performance Impact
- Hotjar adds ~30KB to page load
- Recording impacts performance slightly
- Consider lowering sample rate if needed

## 10. Best Practices

1. **Start with Low Sample Rate**: Begin with 10-20% and increase as needed
2. **Exclude Team Members**: Set up IP exclusions for your team
3. **Regular Review**: Check insights weekly, adjust tracking monthly
4. **Privacy First**: Always mask sensitive data
5. **Combine with GA4**: Use Hotjar for "why", GA4 for "what"

## 11. GDPR Compliance

Our implementation ensures:
- ✅ Explicit consent before loading
- ✅ Ability to opt-out anytime
- ✅ Data anonymization enabled
- ✅ Automatic suppression of sensitive data
- ✅ Respects Do Not Track headers

## 12. Remove Hotjar

To disable Hotjar:
1. Remove `NEXT_PUBLIC_HOTJAR_SITE_ID` from environment variables
2. Redeploy your application
3. Hotjar will no longer load