import { test, expect } from '@playwright/test'

test.describe('Site health', () => {
  test('Health endpoint returns 200', async ({ request }) => {
    // When I call "GET /api/health"
    const response = await request.get('/api/health')

    // Then the response status is 200
    expect(response.status()).toBe(200)

    // Verify response structure
    const body = await response.json()
    expect(body).toHaveProperty('ok', true)
    expect(body).toHaveProperty('now')
  })

  test('Homepage has no severe console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    const pageErrors: Error[] = []

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Capture page errors (unhandled exceptions)
    page.on('pageerror', (error) => {
      pageErrors.push(error)
    })

    // When I open "/"
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Then there are no severe console errors
    // Allow-list: known acceptable errors (if any)
    const allowedErrors: RegExp[] = [
      // Add patterns here if needed, e.g.:
      // /ResizeObserver loop/,
    ]

    const severeConsoleErrors = consoleErrors.filter((error) => {
      return !allowedErrors.some((pattern) => pattern.test(error))
    })

    const severePageErrors = pageErrors.filter((error) => {
      return !allowedErrors.some((pattern) => pattern.test(error.message))
    })

    expect(
      severeConsoleErrors,
      `Console errors: ${severeConsoleErrors.join(', ')}`
    ).toEqual([])
    expect(
      severePageErrors,
      `Page errors: ${severePageErrors.map((e) => e.message).join(', ')}`
    ).toEqual([])
  })
})
