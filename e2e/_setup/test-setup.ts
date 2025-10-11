import { test as base } from '@playwright/test'

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
        'anthrasite_cookie_consent',
        JSON.stringify({
          version: 1,
          preferences: {
            analytics: true,
            marketing: true,
            performance: true,
            functional: true,
            timestamp: new Date().toISOString(),
          },
        })
      )
      document.cookie =
        'anthrasite_cookie_consent=accepted; path=/; max-age=31536000'
    })

    // Route blocking: Allow-list only same-origin, block all third-party
    await page.route('**/*', async (route) => {
      try {
        const req = route.request()
        const url = new URL(req.url())

        // Allow only same-origin app traffic (covers Next.js chunks, images, fonts, etc.)
        if (url.origin === 'http://localhost:3333') {
          return route.continue()
        }

        // Block everything else (3P) with a harmless 204
        // Log once per host to avoid spam
        if (!(globalThis as any).__blockedHosts)
          (globalThis as any).__blockedHosts = new Set<string>()
        const seen = (globalThis as any).__blockedHosts as Set<string>
        if (!seen.has(url.hostname)) {
          seen.add(url.hostname)
          console.warn(
            `[route-block] blocking host: ${url.hostname} (${req.method()} ${url.pathname})`
          )
        }

        return route.fulfill({ status: 204, body: '' })
      } catch (e) {
        // Fall back to continue so we don't accidentally starve the app
        console.warn(
          `[route-block] parse fail, continuing: ${(e as Error).message}`
        )
        return route.continue()
      }
    })

    // Add error instrumentation to surface crashes in CI logs
    page.on('pageerror', (err) => {
      console.error(
        `[pageerror] ${err?.name}: ${err?.message}\n${err?.stack ?? ''}`
      )
    })
    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        console.log(`[console.${msg.type()}]`, msg.text())
      }
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'
