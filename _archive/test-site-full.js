const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3333');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Accept cookies
  const acceptButton = await page.locator('button:has-text("Accept all")');
  if (await acceptButton.isVisible()) {
    await acceptButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Get page content
  const h1Text = await page.textContent('h1').catch(() => 'No h1 found');
  const bodyText = await page.textContent('body');
  
  console.log('H1 content:', h1Text);
  
  // Check if homepage content is visible
  const hasGetStarted = bodyText.includes('Get Started');
  const hasAnalyze = bodyText.includes('What We Analyze');
  const hasQuestions = bodyText.includes('Questions');
  
  console.log('Has Get Started button:', hasGetStarted);
  console.log('Has What We Analyze section:', hasAnalyze);
  console.log('Has Questions section:', hasQuestions);
  
  // Take a screenshot
  await page.screenshot({ path: 'site-after-cookies.png', fullPage: true });
  console.log('Screenshot saved as site-after-cookies.png');
  
  await browser.close();
})();