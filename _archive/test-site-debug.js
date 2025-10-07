const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  await page.goto('http://localhost:3333');
  
  // Wait a bit for React to load
  await page.waitForTimeout(2000);
  
  // Check for loading state
  const loadingElement = await page.$('.animate-fade-in');
  console.log('Loading element exists:', !!loadingElement);
  
  // Check what's in the main element
  const mainHTML = await page.$eval('main', el => el.innerHTML);
  console.log('Main content:', mainHTML.substring(0, 200) + '...');
  
  // Check if OrganicHomepage is rendered
  const hasOrganicHomepage = await page.$('[data-testid="organic-homepage"]');
  console.log('Has organic homepage:', !!hasOrganicHomepage);
  
  // Check for isClient state
  const bodyClass = await page.$eval('body', el => el.className);
  console.log('Body classes:', bodyClass);
  
  await browser.close();
})();