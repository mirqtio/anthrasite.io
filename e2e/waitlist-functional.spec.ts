import { test, expect } from './base-test'
import { request } from '@playwright/test'
import {
  WaitlistFormIds,
  WaitlistA11y,
} from '@/lib/testing/waitlistFormContract'

test.describe('Waitlist API Validation', () => {
  test('rejects invalid email format', async () => {
    const api = await request.newContext()
    const res = await api.post('http://localhost:3333/api/waitlist', {
      data: { domain: 'example.com', email: 'not-an-email' },
    })
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/invalid/i)
  })

  test('rejects missing domain', async () => {
    const api = await request.newContext()
    const res = await api.post('http://localhost:3333/api/waitlist', {
      data: { email: 'test@example.com' },
    })
    expect(res.status()).toBe(400)
  })

  test('is idempotent on duplicate domain (different emails)', async () => {
    const api = await request.newContext()
    const domain = `test${Date.now()}.com`

    // First signup
    const first = await api.post('http://localhost:3333/api/waitlist', {
      data: { domain, email: 'first@test.com' },
    })
    expect([200, 201]).toContain(first.status())
    const firstJson = await first.json()
    expect(firstJson.ok).toBe(true)

    // Second signup with different email, same domain
    const second = await api.post('http://localhost:3333/api/waitlist', {
      data: { domain, email: 'second@test.com' },
    })
    expect(second.status()).toBe(200) // Idempotent OK
    const secondJson = await second.json()
    expect(secondJson.ok).toBe(true)
    expect(secondJson.message).toMatch(/on the waitlist/i)
  })

  test('normalizes domain case (case-insensitive uniqueness)', async () => {
    const api = await request.newContext()
    const baseDomain = `case${Date.now()}.com`

    // First with lowercase
    const first = await api.post('http://localhost:3333/api/waitlist', {
      data: { domain: baseDomain.toLowerCase(), email: 'test1@test.com' },
    })
    expect([200, 201]).toContain(first.status())

    // Second with uppercase (should be treated as duplicate)
    const second = await api.post('http://localhost:3333/api/waitlist', {
      data: { domain: baseDomain.toUpperCase(), email: 'test2@test.com' },
    })
    expect(second.status()).toBe(200) // Should return 200, not 201
  })
})

test.describe('Waitlist Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Force organic mode and dismiss consent banner
    await page.addInitScript(() => {
      // Clear any purchase mode cookies
      document.cookie = 'site_mode=; Max-Age=0; Path=/'
      document.cookie = 'business_id=; Max-Age=0; Path=/'
      // Set explicit E2E organic mode flag
      localStorage.setItem('E2E_MODE', 'organic')

      // Pre-accept all cookies to prevent banner from showing
      localStorage.setItem(
        'anthrasite_cookie_consent',
        JSON.stringify({
          version: '1.0',
          preferences: {
            analytics: true,
            marketing: true,
            performance: true,
            functional: true,
            timestamp: new Date().toISOString(),
          },
        })
      )
    })

    await page.goto('/')
  })

  test('should successfully submit waitlist form via modal', async ({
    page,
  }) => {
    // Open the modal
    await page.getByTestId(WaitlistFormIds.openButton).click()

    // Verify form is visible
    await expect(page.getByTestId(WaitlistFormIds.form)).toBeVisible()

    // Fill in the form using accessible selectors
    await page.getByLabel(WaitlistA11y.domainLabel).fill('mycompany.com')
    await page
      .getByLabel(WaitlistA11y.emailLabel)
      .fill(`test+${Date.now()}@mycompany.com`)

    // Submit the form
    await page.getByTestId(WaitlistFormIds.submitButton).click()

    // Wait for success state
    await expect(page.getByTestId(WaitlistFormIds.successBanner)).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText(WaitlistA11y.successText)).toBeVisible()
  })

  test('should show error for invalid email in modal', async ({ page }) => {
    // Open the modal
    await page.getByTestId(WaitlistFormIds.openButton).click()
    await expect(page.getByTestId(WaitlistFormIds.form)).toBeVisible()

    // Fill with invalid email
    await page.getByLabel(WaitlistA11y.domainLabel).fill('example.com')
    await page.getByLabel(WaitlistA11y.emailLabel).fill('bad@invalid')
    await page.getByTestId(WaitlistFormIds.submitButton).click()

    // Should show error (either from client or server validation)
    await expect(
      page
        .getByTestId(WaitlistFormIds.errorBanner)
        .or(page.getByText(WaitlistA11y.errorText))
    ).toBeVisible({ timeout: 5000 })
  })

  test('should handle duplicate signups (domain-based uniqueness)', async ({
    page,
  }) => {
    const testDomain = `test${Date.now()}.com`

    // First signup
    await page.getByTestId(WaitlistFormIds.openButton).click()
    await expect(page.getByTestId(WaitlistFormIds.form)).toBeVisible()

    await page.getByLabel(WaitlistA11y.domainLabel).fill(testDomain)
    await page.getByLabel(WaitlistA11y.emailLabel).fill('first@test.com')
    await page.getByTestId(WaitlistFormIds.submitButton).click()

    await expect(page.getByTestId(WaitlistFormIds.successBanner)).toBeVisible({
      timeout: 10000,
    })

    // Close modal and try again with same domain, different email
    await page.reload()

    await page.getByTestId(WaitlistFormIds.openButton).click()
    await expect(page.getByTestId(WaitlistFormIds.form)).toBeVisible()

    await page.getByLabel(WaitlistA11y.domainLabel).fill(testDomain)
    await page.getByLabel(WaitlistA11y.emailLabel).fill('second@test.com')
    await page.getByTestId(WaitlistFormIds.submitButton).click()

    // Should still succeed (idempotent - API returns 200)
    await expect(page.getByTestId(WaitlistFormIds.successBanner)).toBeVisible({
      timeout: 10000,
    })
  })
})
