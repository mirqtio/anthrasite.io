const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Add console listener
  page.on('console', msg => {
    if (msg.text().includes('component.unmount')) {
      console.log('Component unmount:', msg.text());
    }
  });
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(2000);
  
  // Look for specific patterns
  const analysis = await page.evaluate(() => {
    // Find all elements with organic-homepage
    const organicElements = document.querySelectorAll('[data-testid="organic-homepage"]');
    
    // Check parent structure
    const parents = Array.from(organicElements).map(el => {
      let parent = el.parentElement;
      let path = [];
      while (parent && parent !== document.body) {
        path.push({
          tag: parent.tagName,
          className: parent.className
        });
        parent = parent.parentElement;
      }
      return path;
    });
    
    return {
      organicCount: organicElements.length,
      parentPaths: parents
    };
  });
  
  console.log('Analysis:', JSON.stringify(analysis, null, 2));
  
  await browser.close();
})();