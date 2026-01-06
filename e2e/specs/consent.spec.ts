import { test, expect } from '@playwright/test'

// SKIPPED: Cookie consent banner was removed from the application
test.describe.skip('Cookie consent basic behavior', () => {
  test('First visit shows banner; accepting hides it', async ({
    page,
    context,
  }) => {
    // Clear cookies to simulate first visit
    await context.clearCookies()

    // Given I visit "/"
    await page.goto('/')

    // Then I see the consent banner
    const consentBanner = page.getByTestId('consent-banner')
    await expect(consentBanner).toBeVisible()

    // When I click "Accept all"
    const acceptButton = page.getByTestId('accept-all-cookies-button')
    await acceptButton.click()

    // Then the consent banner is not visible
    await expect(consentBanner).not.toBeVisible()
  })
})
