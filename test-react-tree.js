const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3333');
  
  // Add a marker to track renders
  await page.evaluate(() => {
    window.renderCount = 0;
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      if (tagName === 'nav' || tagName === 'main' || tagName === 'footer') {
        window.renderCount++;
        console.log(`Creating ${tagName}, total renders: ${window.renderCount}`);
      }
      return originalCreateElement.call(this, tagName);
    };
  });
  
  // Force a re-render by navigating
  await page.reload();
  await page.waitForTimeout(3000);
  
  const renderInfo = await page.evaluate(() => ({
    renderCount: window.renderCount,
    navCount: document.querySelectorAll('nav').length,
    mainCount: document.querySelectorAll('main').length
  }));
  
  console.log('Render info:', renderInfo);
  
  await browser.close();
})();