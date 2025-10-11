import { test as base } from '@playwright/test'

/**
 * Blocked third-party hosts to prevent external analytics/monitoring calls
 * that slow tests and cause rate limiting
 */
const BLOCKED_HOSTS = new Set([
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'cdn.segment.com',
  'o444.ingest.sentry.io',
  'static.hotjar.com',
  'rum.browser-intake-datadoghq.com',
  'js.posthogcdn.com',
  'app.posthog.com',
])

/**
 * Extended test with E2E-specific setup
 * - Blocks third-party analytics/monitoring hosts
 * - Pre-accepts consent to avoid banner in most tests
 * - Marks environment as E2E for client-side short-circuits
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Mark as E2E early for client-side code
    await page.addInitScript(() => {
      ;(window as any).__E2E__ = true
    })

    // Pre-accept consent to avoid banner races (opt-out in consent-specific tests)
    await page.addInitScript(() => {
      localStorage.setItem(
        'cookie_consent',
        JSON.stringify({
          accepted: true,
          ts: Date.now(),
          version: 1,
          preferences: {
            necessary: true,
            analytics: true,
            marketing: true,
          },
        })
      )
      document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000'
    })

    // Route blocking: Allow same-origin (including /_next/ chunks), block known 3P hosts
    await page.route('**/*', (route) => {
      try {
        const url = new URL(route.request().url())

        // Always allow same-origin requests (including Next.js chunks)
        if (
          url.origin === 'http://localhost:3333' ||
          url.pathname.startsWith('/_next/')
        ) {
          return route.continue()
        }

        // Block known third-party hosts
        if (BLOCKED_HOSTS.has(url.hostname)) {
          return route.fulfill({ status: 204, body: '' })
        }
      } catch {
        // If URL parsing fails, continue
      }

      return route.continue()
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'
