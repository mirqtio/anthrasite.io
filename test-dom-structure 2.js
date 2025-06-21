const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(2000);
  
  // Get the structure of the main content
  const structure = await page.evaluate(() => {
    const main = document.querySelector('main');
    const body = document.querySelector('body');
    
    // Get all direct children of body
    const bodyChildren = Array.from(body.children).map(el => ({
      tag: el.tagName,
      className: el.className,
      hasAnimateFadeIn: el.querySelector('.animate-fade-in') !== null,
      innerHTMLPreview: el.innerHTML.substring(0, 100)
    }));
    
    return {
      bodyChildren,
      mainExists: !!main,
      mainContent: main ? main.innerHTML.substring(0, 200) : null
    };
  });
  
  console.log('Body structure:', JSON.stringify(structure, null, 2));
  
  await browser.close();
})();