const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.text().includes('SiteMode') || msg.text().includes('isLoading')) {
      console.log('Context log:', msg.text());
    }
  });
  
  // Add console logs to track context
  await page.addInitScript(() => {
    // Override console.log to capture context updates
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
    };
  });
  
  await page.goto('http://localhost:3333');
  
  // Wait and check the React state
  await page.waitForTimeout(3000);
  
  // Try to access React state via window
  const hasReact = await page.evaluate(() => {
    // Check if React DevTools are available
    return !!(window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
  });
  
  console.log('React available:', hasReact);
  
  // Check DOM for clues
  const mainExists = await page.$('main');
  const heroExists = await page.$('.hero');
  
  console.log('Main exists:', !!mainExists);
  console.log('Hero exists:', !!heroExists);
  
  await browser.close();
})();