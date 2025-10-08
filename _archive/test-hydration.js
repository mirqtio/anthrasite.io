const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture errors
  page.on('pageerror', error => {
    consoleMessages.push({
      type: 'error',
      text: error.message
    });
  });
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(3000);
  
  // Filter for hydration or React errors
  const relevantMessages = consoleMessages.filter(msg => 
    msg.text.toLowerCase().includes('hydrat') ||
    msg.text.toLowerCase().includes('react') ||
    msg.text.includes('Warning') ||
    msg.type === 'error'
  );
  
  console.log('Console messages:');
  relevantMessages.forEach(msg => {
    console.log(`${msg.type}: ${msg.text}`);
  });
  
  await browser.close();
})();