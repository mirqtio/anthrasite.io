import { test } from '@playwright/test'
import { preparePageForScreenshot, compareScreenshots } from './utils'

test.describe('Visual Test Setup Verification', () => {
  test('example visual test', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to be ready
    await preparePageForScreenshot(page)
    
    // Take and compare screenshot
    await compareScreenshots(page, 'example-homepage.png')
  })

  test('example component test', async ({ page }) => {
    // Create a simple test page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .test-card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
            }
            .test-card h1 {
              color: #333;
              margin: 0 0 16px 0;
            }
            .test-card p {
              color: #666;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="test-card">
            <h1>Visual Test Example</h1>
            <p>This is a test component for visual regression testing.</p>
          </div>
        </body>
      </html>
    `)
    
    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'example-component.png')
  })
})