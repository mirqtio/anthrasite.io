import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Clear any persistent state before tests
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to the site to clear localStorage
    await page.goto(baseURL!)
    await page.evaluate(() => {
      // Clear all localStorage
      localStorage.clear()
      // Clear all sessionStorage
      sessionStorage.clear()
    })
  } catch (error) {
    console.log('Failed to clear storage:', error)
  } finally {
    await browser.close()
  }
}

export default globalSetup
