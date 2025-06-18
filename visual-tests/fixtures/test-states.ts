import { Page } from '@playwright/test'
import { mockUTMParams, mockConsentData } from './mock-data'

/**
 * Set up different application states for visual testing
 */

export async function setupOrganicMode(page: Page) {
  // Clear any UTM parameters
  await page.goto('/', { waitUntil: 'networkidle' })

  // Ensure we're in organic mode
  await page.evaluate(() => {
    localStorage.removeItem('utm_params')
    sessionStorage.clear()
  })
}

export async function setupPurchaseMode(page: Page) {
  // Use mock service UTM token for purchase mode
  await page.goto('/?utm=dev-utm-valid', { waitUntil: 'networkidle' })

  // Verify purchase mode is active by checking for business name in heading
  await page.waitForSelector('h1:has-text("Acme Corporation, your audit is ready")', { timeout: 10000 })
}

export async function setupExpiredUTM(page: Page) {
  // Use invalid UTM token to trigger expired/invalid state
  await page.goto('/?utm=invalid-token', { waitUntil: 'networkidle' })
}

export async function setupUsedUTM(page: Page) {
  // Use mock service used UTM token
  await page.goto('/?utm=dev-utm-used', { waitUntil: 'networkidle' })
}

export async function setupConsentAccepted(page: Page) {
  // Set consent preferences
  await page.evaluate((consent) => {
    localStorage.setItem(
      'consent-preferences',
      JSON.stringify({
        ...consent,
        timestamp: new Date('2025-01-01T12:00:00Z').toISOString(),
      })
    )
  }, mockConsentData)
}

export async function setupConsentBanner(page: Page) {
  // Clear consent to show banner
  await page.evaluate(() => {
    localStorage.removeItem('consent-preferences')
    localStorage.removeItem('consent-banner-dismissed')
  })

  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="consent-banner"]', {
    timeout: 5000,
  })
}

export async function setupHelpWidgetOpen(page: Page) {
  // Open help widget
  await page.click('[data-testid="help-widget-trigger"]')
  await page.waitForSelector('[data-testid="help-widget-content"]', {
    state: 'visible',
    timeout: 5000,
  })
}

export async function setupDarkMode(page: Page) {
  // Set dark mode preference
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
  })
}

export async function setupMobileViewport(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 })
}

export async function setupTabletViewport(page: Page) {
  await page.setViewportSize({ width: 768, height: 1024 })
}

export async function setupDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 })
}

export async function setupLoadingState(page: Page) {
  // Intercept API calls to simulate loading
  await page.route('**/api/**', async (route) => {
    await page.waitForTimeout(2000) // Simulate delay
    await route.continue()
  })
}

export async function setupErrorState(page: Page) {
  // Intercept API calls to simulate errors
  await page.route('**/api/**', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  })
}

export async function setupNetworkOffline(page: Page) {
  // Simulate offline mode
  await page.context().setOffline(true)
}

export async function setupSlowNetwork(page: Page) {
  // Simulate slow 3G
  await page.context().route('**/*', async (route) => {
    await page.waitForTimeout(1000) // Add 1s delay
    await route.continue()
  })
}

/**
 * Restore default state
 */
export async function resetState(page: Page) {
  // Clear all storage with error handling for CI environments
  await page.evaluate(() => {
    try {
      localStorage.clear()
    } catch (e) {
      // localStorage access denied in CI - ignore
    }
    try {
      sessionStorage.clear()
    } catch (e) {
      // sessionStorage access denied in CI - ignore
    }
  })

  // Clear cookies
  await page.context().clearCookies()

  // Reset viewport
  await page.setViewportSize({ width: 1920, height: 1080 })

  // Reset network conditions
  await page.context().setOffline(false)

  // Clear route handlers
  await page.unroute('**/*')
}
