const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to design test page...');
  await page.goto('http://localhost:3333/design-test');
  await page.waitForTimeout(2000); // Wait for styles to load
  
  await page.screenshot({ path: 'design-test-screenshot.png', fullPage: true });
  console.log('Screenshot saved as design-test-screenshot.png');
  
  await browser.close();
})();