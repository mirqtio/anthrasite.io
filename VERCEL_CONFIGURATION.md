# Vercel Configuration Guide

This guide will help you configure all environment variables and integrations in Vercel for the Anthrasite.io production deployment.

## 1. Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables

### Required Environment Variables

Add the following environment variables for **Production** environment:

#### Analytics
```
NEXT_PUBLIC_GA4_MEASUREMENT_ID = [Your GA4 Measurement ID from .env.local]
NEXT_PUBLIC_POSTHOG_KEY = [Your PostHog API key from .env.local]
NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com
```

#### Monitoring - Sentry
```
NEXT_PUBLIC_SENTRY_DSN = [Your Sentry DSN from .env.local]
SENTRY_ORG = anthrasite
SENTRY_PROJECT = anthrasite-io
SENTRY_AUTH_TOKEN = [Your Sentry auth token from .env.local]
```

#### Monitoring - Datadog
```
NEXT_PUBLIC_DATADOG_APPLICATION_ID = [Your Datadog App ID from .env.local]
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = [Your Datadog client token from .env.local]
NEXT_PUBLIC_DATADOG_SITE = us5.datadoghq.com
```

#### Database (if using Vercel Postgres)
```
DATABASE_URL = [Your Vercel Postgres connection string]
```

#### Email - SendGrid
```
SENDGRID_API_KEY = [Your SendGrid API key from .env.local]
SENDGRID_FROM_EMAIL = hello@anthrasite.io
SENDGRID_FROM_NAME = Anthrasite
SENDGRID_REPLY_TO_EMAIL = hello@anthrasite.io
SENDGRID_REPLY_TO_NAME = Anthrasite
SENDGRID_SANDBOX_MODE = false
```

#### Environment & Feature Flags
```
NEXT_PUBLIC_ENVIRONMENT = production
NEXT_PUBLIC_RELEASE = 1.0.0
NEXT_PUBLIC_FF_WAITLIST_ENABLED = true
NEXT_PUBLIC_FF_PURCHASE_ENABLED = false
NEXT_PUBLIC_USE_MOCK_PURCHASE = false
```

## 2. Vercel Integrations

### Sentry Integration
1. Go to Vercel Dashboard → Integrations
2. Search for "Sentry" and click "Add Integration"
3. Select your Vercel scope and the Anthrasite project
4. Authenticate with Sentry using your account
5. Select organization: `anthrasite`
6. Select project: `anthrasite-io`
7. Enable "Upload Source Maps" for better error tracking
8. The integration will automatically set up webhooks and deployment tracking

### Datadog Integration (Optional)
1. Go to Vercel Dashboard → Integrations
2. Search for "Datadog" and click "Add Integration"
3. Configure with your Datadog API key
4. This will enable automatic deployment tracking and performance monitoring

## 3. Domain Configuration

If you haven't already:
1. Go to Project Settings → Domains
2. Add your production domain: `anthrasite.io`
3. Add www redirect: `www.anthrasite.io` → `anthrasite.io`
4. Vercel will automatically handle SSL certificates

## 4. Build & Development Settings

In Project Settings → General:

### Build Command
```
npm run build
```

### Output Directory
```
.next
```

### Install Command
```
pnpm install
```

### Development Command
```
npm run dev
```

### Node.js Version
Select: 20.x (or latest LTS)

### Environment Variables for Build
Ensure these are also available during build time:
- All `NEXT_PUBLIC_*` variables
- `SENTRY_AUTH_TOKEN` (for source map upload)
- `DATABASE_URL` (if using during build)

## 5. Function Configuration

In Project Settings → Functions:

### Function Region
Choose the region closest to your users (e.g., `iad1` for US East)

### Function Timeout
Set to 10 seconds (default) or adjust based on your needs

## 6. Security Headers

Add to your `next.config.js` (already configured):
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- Permissions Policy

## 7. Verify Configuration

After deploying with these settings:

1. **Check Environment Variables**: 
   - Visit your deployment URL + `/api/health` (if you have a health endpoint)
   - Check browser console for any missing environment variable errors

2. **Verify Analytics**:
   - Open browser DevTools on production site
   - Accept cookie consent
   - Check Network tab for:
     - GA4: requests to `googletagmanager.com`
     - PostHog: requests to `app.posthog.com`
     - Sentry: should initialize without errors

3. **Test Error Tracking**:
   - Sentry should capture any JavaScript errors
   - Check Sentry dashboard for proper source map upload

4. **Monitor Performance**:
   - Check Vercel Analytics dashboard
   - Verify Web Vitals are being tracked

## 8. Troubleshooting

### If Analytics Don't Work
- Ensure all `NEXT_PUBLIC_*` variables are set in Production environment
- Check browser console for initialization errors
- Verify consent banner is working properly

### If Sentry Isn't Capturing Errors
- Check `SENTRY_AUTH_TOKEN` is set correctly
- Verify source maps are being uploaded during build
- Check Sentry project settings match your configuration

### If Builds Fail
- Check build logs for missing environment variables
- Ensure `SENTRY_AUTH_TOKEN` has proper permissions
- Verify Node.js version compatibility

## 9. Recommended Monitoring Setup

1. **Set up Vercel Monitoring**:
   - Enable Web Analytics in project settings
   - Set up Speed Insights for performance monitoring

2. **Configure Alerts**:
   - In Sentry: Set up alerts for error rate spikes
   - In GA4: Create custom alerts for traffic drops
   - In Vercel: Enable deployment failure notifications

3. **Regular Checks**:
   - Weekly: Review GA4 for user behavior insights
   - Daily: Check Sentry for new errors
   - Per deployment: Verify all services initialize correctly

## Notes

- Keep `SENTRY_AUTH_TOKEN` and API keys secure
- Regularly rotate sensitive tokens
- Use Vercel's built-in secrets management
- Enable 2FA on all service accounts
- Review and update dependencies regularly