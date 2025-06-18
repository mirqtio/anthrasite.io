# Monitoring Services Test Page

This page tests all monitoring services integrated into the Anthrasite application.

## Access the Test Page

Visit: http://localhost:3001/test-monitoring

## Services Tested

### 1. Sentry Error Tracking ✅
- **Status**: Configured and ready
- **DSN**: Configured in environment
- **Tests Available**:
  - Error capture
  - Message logging
  - Breadcrumb tracking
  - User context

### 2. Google Analytics 4 ✅
- **Status**: Configured and ready
- **Measurement ID**: G-G285FN4YDQ
- **Tests Available**:
  - Page view tracking
  - Custom events
  - Funnel steps
  - E-commerce tracking

### 3. PostHog Analytics ✅
- **Status**: Configured and ready
- **API Key**: Configured in environment
- **Tests Available**:
  - Event tracking
  - Feature flag evaluation

### 4. Datadog RUM & Logs ⚠️
- **Status**: Missing credentials
- **Required Configuration**:
  - `NEXT_PUBLIC_DATADOG_APPLICATION_ID`
  - `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`
- **Tests Available** (will work once configured):
  - Log levels (info/warning/error)
  - Custom actions
  - Performance metrics

## How to Use

1. Open the test page at http://localhost:3001/test-monitoring
2. Click individual test buttons to send test events to each service
3. Or click "Run All Tests" to test all services at once
4. Check the results section to see if events were sent successfully
5. Verify in each service's dashboard:
   - **Sentry**: https://sentry.io (check for test errors)
   - **Google Analytics**: https://analytics.google.com (real-time events)
   - **PostHog**: https://app.posthog.com (live events)
   - **Datadog**: https://app.datadoghq.com (requires configuration)

## Environment Status

The page shows the configuration status of each service:
- ✅ Green = Configured
- ❌ Red = Not configured

## Next Steps

1. **For Datadog**: Add the required Application ID and Client Token to your environment variables
2. **Verify Events**: Check each service's dashboard to confirm test events are being received
3. **Production Setup**: Ensure all production environment variables are properly configured

## Notes

- All test events are marked with `test: true` to distinguish them from real data
- The page includes error handling to show which services are not configured
- Web Vitals testing simulates performance metrics
- Critical alerts test cross-service integration