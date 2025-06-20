import { test } from '@playwright/test'
import {
  preparePageForScreenshot,
  compareScreenshots,
  setupVisualTestContext,
} from './utils'
import { setupDarkMode, resetState } from './fixtures/test-states'

test.beforeEach(async ({ page, context }) => {
  await setupVisualTestContext(context)
  await resetState(page)
})

// Create a test page with isolated components
async function createComponentTestPage(page: any, componentHTML: string) {
  await page.setContent(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="/globals.css" rel="stylesheet">
        <style>
          body {
            padding: 40px;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
            min-height: 100vh;
          }
          .component-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
          }
          .dark body {
            background: #1a1a1a;
          }
          .dark .component-container {
            background: #2a2a2a;
          }
        </style>
      </head>
      <body>
        <div class="component-container">
          ${componentHTML}
        </div>
      </body>
    </html>
  `,
    { waitUntil: 'networkidle' }
  )
}

test.describe('Button Component Visual Tests', () => {
  test('all button variants', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2>Button Variants</h2>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary">Primary Button</button>
          <button class="btn btn-secondary">Secondary Button</button>
          <button class="btn btn-outline">Outline Button</button>
          <button class="btn btn-ghost">Ghost Button</button>
          <button class="btn btn-danger">Danger Button</button>
        </div>
        
        <h3>Button Sizes</h3>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm">Small</button>
          <button class="btn btn-primary">Default</button>
          <button class="btn btn-primary btn-lg">Large</button>
        </div>
        
        <h3>Button States</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" disabled>Disabled</button>
          <button class="btn btn-primary btn-loading">Loading...</button>
          <button class="btn btn-primary" data-state="active">Active</button>
        </div>
        
        <h3>Icon Buttons</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L13 7L8 12"/>
            </svg>
            With Icon
          </button>
          <button class="btn btn-primary btn-icon-only" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="2"/>
            </svg>
          </button>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-buttons-all.png')
  })

  test('button hover states', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="hover-primary">Primary Hover</button>
        <button class="btn btn-secondary" id="hover-secondary">Secondary Hover</button>
        <button class="btn btn-outline" id="hover-outline">Outline Hover</button>
      </div>
    `
    )

    // Capture hover states
    await page.hover('#hover-primary')
    await page.waitForTimeout(100)

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-buttons-hover.png')
  })

  test('button focus states', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="focus-primary">Primary Focus</button>
        <button class="btn btn-secondary" id="focus-secondary">Secondary Focus</button>
        <button class="btn btn-outline" id="focus-outline">Outline Focus</button>
      </div>
    `
    )

    // Focus first button
    await page.focus('#focus-primary')

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-buttons-focus.png')
  })

  test('buttons dark mode', async ({ page }) => {
    await setupDarkMode(page)
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-outline">Outline</button>
          <button class="btn btn-ghost">Ghost</button>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-buttons-dark.png')
  })
})

test.describe('Card Component Visual Tests', () => {
  test('all card variants', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2>Card Variants</h2>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Basic Card</h3>
          </div>
          <div class="card-body">
            <p>This is a basic card with header and body content.</p>
          </div>
        </div>
        
        <div class="card card-bordered">
          <div class="card-body">
            <h3 class="card-title">Bordered Card</h3>
            <p>This card has a visible border.</p>
          </div>
        </div>
        
        <div class="card card-elevated">
          <div class="card-body">
            <h3 class="card-title">Elevated Card</h3>
            <p>This card has enhanced shadow for elevation.</p>
          </div>
        </div>
        
        <div class="card card-interactive">
          <div class="card-body">
            <h3 class="card-title">Interactive Card</h3>
            <p>This card responds to hover and click interactions.</p>
          </div>
        </div>
        
        <div class="card">
          <img src="data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='%23E5E5E5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage Placeholder%3C/text%3E%3C/svg%3E" alt="Placeholder" class="card-image">
          <div class="card-body">
            <h3 class="card-title">Card with Image</h3>
            <p>This card includes an image at the top.</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm">Action</button>
          </div>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-cards-all.png')
  })

  test('card hover states', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div class="card card-interactive" id="hover-card">
        <div class="card-body">
          <h3 class="card-title">Hover Card</h3>
          <p>Hover over this card to see the effect.</p>
        </div>
      </div>
    `
    )

    await page.hover('#hover-card')
    await page.waitForTimeout(100)

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-card-hover.png')
  })

  test('cards dark mode', async ({ page }) => {
    await setupDarkMode(page)
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title">Dark Mode Card</h3>
            <p>This card adapts to dark mode.</p>
          </div>
        </div>
        
        <div class="card card-bordered">
          <div class="card-body">
            <h3 class="card-title">Bordered Dark Card</h3>
            <p>Border color adjusts for dark mode.</p>
          </div>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-cards-dark.png')
  })
})

test.describe('Input Component Visual Tests', () => {
  test('all input variants', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2>Input Variants</h2>
        
        <div>
          <label for="input-default" class="label">Default Input</label>
          <input type="text" id="input-default" class="input" placeholder="Enter text...">
        </div>
        
        <div>
          <label for="input-filled" class="label">Filled Input</label>
          <input type="text" id="input-filled" class="input" value="Filled value">
        </div>
        
        <div>
          <label for="input-disabled" class="label">Disabled Input</label>
          <input type="text" id="input-disabled" class="input" disabled placeholder="Disabled">
        </div>
        
        <div>
          <label for="input-error" class="label">Error State</label>
          <input type="text" id="input-error" class="input input-error" value="Invalid input">
          <p class="input-error-message">This field is required</p>
        </div>
        
        <div>
          <label for="input-success" class="label">Success State</label>
          <input type="text" id="input-success" class="input input-success" value="Valid input">
          <p class="input-success-message">Looking good!</p>
        </div>
        
        <div>
          <label for="input-icon" class="label">Input with Icon</label>
          <div class="input-group">
            <span class="input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="7" stroke="currentColor" fill="none"/>
                <path d="M8 4v4l3 3"/>
              </svg>
            </span>
            <input type="text" id="input-icon" class="input" placeholder="Search...">
          </div>
        </div>
        
        <div>
          <label for="textarea" class="label">Textarea</label>
          <textarea id="textarea" class="input" rows="3" placeholder="Enter multiple lines..."></textarea>
        </div>
        
        <div>
          <label for="select" class="label">Select</label>
          <select id="select" class="input">
            <option>Choose an option</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-inputs-all.png')
  })

  test('input focus states', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <input type="text" id="focus-input" class="input" placeholder="Click to focus">
        <textarea id="focus-textarea" class="input" placeholder="Click to focus"></textarea>
      </div>
    `
    )

    await page.focus('#focus-input')

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-inputs-focus.png')
  })

  test('inputs dark mode', async ({ page }) => {
    await setupDarkMode(page)
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <input type="text" class="input" placeholder="Dark mode input">
        <input type="text" class="input input-error" value="Error in dark mode">
        <textarea class="input" placeholder="Dark mode textarea"></textarea>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-inputs-dark.png')
  })
})

test.describe('Skeleton Component Visual Tests', () => {
  test('all skeleton variants', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2>Skeleton Variants</h2>
        
        <div>
          <h3>Text Skeleton</h3>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 80%"></div>
          <div class="skeleton skeleton-text" style="width: 60%"></div>
        </div>
        
        <div>
          <h3>Card Skeleton</h3>
          <div class="card">
            <div class="card-body">
              <div class="skeleton skeleton-heading"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text" style="width: 90%"></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3>Avatar Skeleton</h3>
          <div style="display: flex; gap: 10px;">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton skeleton-avatar skeleton-avatar-lg"></div>
          </div>
        </div>
        
        <div>
          <h3>Image Skeleton</h3>
          <div class="skeleton skeleton-image" style="width: 300px; height: 200px;"></div>
        </div>
        
        <div>
          <h3>Button Skeleton</h3>
          <div class="skeleton skeleton-button"></div>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-skeletons-all.png')
  })

  test('skeletons dark mode', async ({ page }) => {
    await setupDarkMode(page)
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-heading"></div>
        <div class="skeleton skeleton-avatar"></div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-skeletons-dark.png')
  })
})

test.describe('Badge Component Visual Tests', () => {
  test('all badge variants', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2>Badge Variants</h2>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <span class="badge">Default</span>
          <span class="badge badge-primary">Primary</span>
          <span class="badge badge-secondary">Secondary</span>
          <span class="badge badge-success">Success</span>
          <span class="badge badge-warning">Warning</span>
          <span class="badge badge-danger">Danger</span>
          <span class="badge badge-info">Info</span>
        </div>
        
        <h3>Badge Sizes</h3>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span class="badge badge-primary badge-sm">Small</span>
          <span class="badge badge-primary">Default</span>
          <span class="badge badge-primary badge-lg">Large</span>
        </div>
        
        <h3>Badge with Icons</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <span class="badge badge-success">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="margin-right: 4px;">
              <path d="M10 3L4.5 8.5L2 6"/>
            </svg>
            Active
          </span>
          <span class="badge badge-danger">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="margin-right: 4px;">
              <path d="M3 3L9 9M9 3L3 9"/>
            </svg>
            Inactive
          </span>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-badges-all.png')
  })
})

test.describe('Alert Component Visual Tests', () => {
  test('all alert variants', async ({ page }) => {
    await createComponentTestPage(
      page,
      `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2>Alert Variants</h2>
        
        <div class="alert">
          <strong>Default Alert</strong> - This is a default alert message.
        </div>
        
        <div class="alert alert-info">
          <strong>Info!</strong> This is an informational alert.
        </div>
        
        <div class="alert alert-success">
          <strong>Success!</strong> Your action was completed successfully.
        </div>
        
        <div class="alert alert-warning">
          <strong>Warning!</strong> Please review before proceeding.
        </div>
        
        <div class="alert alert-danger">
          <strong>Error!</strong> Something went wrong.
        </div>
        
        <div class="alert alert-info alert-dismissible">
          <strong>Dismissible Alert</strong> - Click the X to dismiss.
          <button class="alert-close" aria-label="Close">×</button>
        </div>
      </div>
    `
    )

    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'components-alerts-all.png')
  })
})
