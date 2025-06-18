# Visual Regression Testing Guide

## Overview

Visual regression testing helps catch unintended visual changes in the UI by comparing screenshots of the current state against baseline images. This guide covers how to work with visual tests in the Anthrasite.io project.

## Table of Contents

- [Running Visual Tests](#running-visual-tests)
- [Updating Baselines](#updating-baselines)
- [Writing Visual Tests](#writing-visual-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Running Visual Tests

### Local Development

Run all visual tests:
```bash
npm run test:visual
```

Run visual tests with UI mode (recommended for debugging):
```bash
npm run test:visual:ui
```

Run specific test file:
```bash
npm run test:visual -- visual-tests/homepage.spec.ts
```

Run tests for specific browser:
```bash
npm run test:visual -- --project=chromium
```

View test report:
```bash
npm run test:visual:report
```

### Updating Baselines

When you make intentional visual changes, you'll need to update the baseline screenshots:

```bash
# Update all baselines
npm run test:visual:update

# Update baselines for specific test
npm run test:visual:update -- visual-tests/homepage.spec.ts

# Update baselines for specific browser
npm run test:visual:update -- --project=chromium
```

**Important**: Always review the changes before committing updated baselines to ensure they're intentional.

## Writing Visual Tests

### Basic Structure

```typescript
import { test } from '@playwright/test'
import { preparePageForScreenshot, compareScreenshots } from './utils'

test('component visual test', async ({ page }) => {
  // Navigate to the page
  await page.goto('/path')
  
  // Prepare page (wait for animations, hide dynamic content)
  await preparePageForScreenshot(page)
  
  // Take and compare screenshot
  await compareScreenshots(page, 'component-name.png')
})
```

### Testing Different States

```typescript
test.describe('Button States', () => {
  test('default state', async ({ page }) => {
    await createComponentTestPage(page, '<button>Click me</button>')
    await compareScreenshots(page, 'button-default.png')
  })

  test('hover state', async ({ page }) => {
    await createComponentTestPage(page, '<button id="btn">Click me</button>')
    await page.hover('#btn')
    await compareScreenshots(page, 'button-hover.png')
  })

  test('focus state', async ({ page }) => {
    await createComponentTestPage(page, '<button id="btn">Click me</button>')
    await page.focus('#btn')
    await compareScreenshots(page, 'button-focus.png')
  })
})
```

### Testing Responsive Layouts

```typescript
import { testResponsiveViewports } from './utils'

test('responsive layout', async ({ page }) => {
  await page.goto('/page')
  
  await testResponsiveViewports(page, async (viewport) => {
    await preparePageForScreenshot(page)
    await compareScreenshots(page, `layout-${viewport}.png`)
  })
})
```

### Testing Dark Mode

```typescript
import { setupDarkMode } from './fixtures/test-states'

test('dark mode', async ({ page }) => {
  await setupDarkMode(page)
  await page.goto('/page')
  await preparePageForScreenshot(page)
  await compareScreenshots(page, 'page-dark-mode.png')
})
```

## CI/CD Integration

### GitHub Actions

Visual tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Manual workflow dispatch

The workflow:
1. Runs tests in parallel across 4 shards
2. Uploads test results and failed screenshots
3. Comments on PRs with test results
4. Automatically updates baselines on `main` branch

### Reviewing PR Changes

When visual changes are detected in a PR:

1. Check the PR comment for a summary of failures
2. Download the artifact containing diff images
3. Review each diff to verify changes are intentional
4. If changes are correct, merge the PR and baselines will auto-update

### Storage Optimization

- Test results are retained for 30 days
- Only failed screenshots are uploaded to save space
- Baselines are stored in the repository

## Best Practices

### 1. Consistent Test Environment

- Always use `preparePageForScreenshot()` before taking screenshots
- Use `setupVisualTestContext()` for consistent browser context
- Mock dates and dynamic content

### 2. Meaningful Names

Use descriptive names for screenshots:
```typescript
// Good
await compareScreenshots(page, 'homepage-hero-mobile-dark.png')

// Bad
await compareScreenshots(page, 'test1.png')
```

### 3. Test Organization

Group related tests:
```typescript
test.describe('Purchase Page', () => {
  test.describe('Valid UTM State', () => {
    test('full page', async ({ page }) => { /* ... */ })
    test('pricing section', async ({ page }) => { /* ... */ })
  })
  
  test.describe('Error States', () => {
    test('expired UTM', async ({ page }) => { /* ... */ })
    test('invalid UTM', async ({ page }) => { /* ... */ })
  })
})
```

### 4. Selective Screenshots

Don't screenshot everything. Focus on:
- Critical UI components
- Complex layouts
- Interactive states
- Error states
- Responsive breakpoints

### 5. Handle Dynamic Content

Hide or mock dynamic content:
```typescript
// Hide timestamps
await page.addStyleTag({
  content: '[data-testid*="timestamp"] { visibility: hidden !important; }'
})

// Mock API responses
await page.route('**/api/data', route => {
  route.fulfill({ body: JSON.stringify(mockData) })
})
```

### 6. Cross-Browser Testing

Test critical paths across browsers:
```typescript
const browsers = ['chromium', 'firefox', 'webkit']
browsers.forEach(browser => {
  test(`critical flow - ${browser}`, async ({ page }) => {
    // Test implementation
  })
})
```

## Troubleshooting

### Common Issues

#### 1. Flaky Tests

**Problem**: Tests pass/fail inconsistently
**Solution**: 
- Ensure all animations are disabled
- Wait for network idle state
- Use `waitForAnimations()` helper
- Add explicit waits for dynamic content

#### 2. Font Rendering Differences

**Problem**: Fonts render differently across environments
**Solution**:
- Use `waitForFonts()` helper
- Consider increasing threshold for text-heavy screenshots
- Use web fonts with consistent rendering

#### 3. Screenshot Size

**Problem**: Screenshots are too large
**Solution**:
- Use `fullPage: false` for component tests
- Clip to specific regions
- Compress images in CI

#### 4. Baseline Conflicts

**Problem**: Merge conflicts in baseline images
**Solution**:
- Always pull latest changes before updating baselines
- Use `--update-snapshots` flag locally
- Let CI update baselines on main branch

### Debug Commands

```bash
# Run with debug output
DEBUG=pw:api npm run test:visual

# Run headed (see browser)
npm run test:visual -- --headed

# Slow down execution
npm run test:visual -- --slow-mo=500

# Record video of failures
npm run test:visual -- --video=retain-on-failure
```

### Analyzing Failures

1. Check the diff image to understand what changed
2. Look at the actual vs expected images
3. Review the error message for details
4. Use UI mode to step through the test
5. Check if the failure is environment-specific

## Performance Optimization

### Parallel Execution

Tests run in parallel by default. Control with:
```bash
# Run with specific number of workers
npm run test:visual -- --workers=2

# Run serially (useful for debugging)
npm run test:visual -- --workers=1
```

### Selective Testing

Run only changed tests:
```bash
# Run tests related to changed files
npm run test:visual -- --only-changed
```

### Screenshot Optimization

```typescript
// Take smaller screenshots when possible
await compareScreenshots(element, 'component.png', {
  fullPage: false,
  clip: { x: 0, y: 0, width: 300, height: 200 }
})

// Increase threshold for non-critical elements
await compareScreenshots(page, 'page.png', {
  threshold: 0.3, // 30% difference allowed
  maxDiffPixels: 1000
})
```

## Maintenance

### Regular Tasks

1. **Weekly**: Review and clean up unused baseline images
2. **Monthly**: Analyze test execution times and optimize slow tests
3. **Quarterly**: Review screenshot storage and compress if needed

### Adding New Tests

1. Identify the component/page to test
2. Determine critical visual states
3. Write tests following the patterns above
4. Run tests locally to generate baselines
5. Review baselines before committing
6. Add to appropriate test suite

### Removing Tests

1. Delete the test from the spec file
2. Remove corresponding baseline images
3. Update any related documentation
4. Commit changes with clear message

## Resources

- [Playwright Documentation](https://playwright.dev/docs/test-snapshots)
- [Visual Testing Best Practices](https://playwright.dev/docs/test-snapshots#best-practices)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)