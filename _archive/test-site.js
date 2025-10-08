const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', error => console.log('Page error:', error.message));
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(3000); // Wait for React to hydrate
  
  // Get page content
  const content = await page.content();
  
  // Check for specific elements
  const hasHero = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
  const hasLogo = await page.$eval('[data-testid="logo"]', el => true).catch(() => false);
  
  console.log('H1 content:', hasHero);
  console.log('Has logo:', hasLogo);
  console.log('Page title:', await page.title());
  
  // Check if still showing loading state
  const hasLoadingState = await page.$eval('.animate-fade-in', el => true).catch(() => false);
  console.log('Still loading:', hasLoadingState);
  
  await browser.close();
})();