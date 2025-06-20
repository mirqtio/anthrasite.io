const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', error => console.log('Page error:', error.message));
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(3000); // Wait for React to hydrate
  
  // Get page content
  const content = await page.content();
  
  // Check for specific elements
  const h1Text = await page.textContent('h1').catch(() => 'No h1 found');
  const hasLogo = await page.locator('[data-testid="logo"]').count() > 0;
  
  console.log('H1 content:', h1Text);
  console.log('Has logo:', hasLogo);
  console.log('Page title:', await page.title());
  
  // Check if still showing loading state
  const hasLoadingState = await page.locator('.animate-fade-in').count() > 0;
  console.log('Still loading:', hasLoadingState);
  
  // Check for any error messages
  const bodyText = await page.textContent('body');
  if (bodyText.includes('error') || bodyText.includes('Error')) {
    console.log('Found error in page');
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'site-current-state.png' });
  console.log('Screenshot saved as site-current-state.png');
  
  await browser.close();
})();