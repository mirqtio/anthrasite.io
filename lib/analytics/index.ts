/**
 * Centralized analytics initialization
 * Single entry point for all analytics - guarded and safe
 */

export async function startAnalytics() {
  // Never in E2E/testing environments
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') {
    console.log('[Analytics] Disabled (NEXT_PUBLIC_ANALYTICS_ENABLED !== true)')
    return
  }

  // Only if PostHog key is valid (starts with phc_)
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
  if (!/^phc_[A-Za-z0-9]+/.test(key)) {
    console.log('[Analytics] PostHog key invalid or missing')
    return
  }

  // Never on localhost (additional safety)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    console.log('[Analytics] Disabled on localhost')
    return
  }

  try {
    // Dynamic import - PostHog code only loads if we reach here
    const { default: posthog } = await import('posthog-js')

    // Initialize with safe config
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      autocapture: false, // More privacy-friendly
      capture_pageview: true,
      disable_session_recording: true, // GDPR compliance
      respect_dnt: true,
      secure_cookie: true,
      persistence: 'localStorage',
    })

    // Expose to window for external use
    ;(window as any).posthog = posthog

    console.log('[Analytics] PostHog initialized successfully')
  } catch (err) {
    // Swallow analytics errors - never break the app
    console.error('[Analytics] Failed to initialize:', err)
  }
}
