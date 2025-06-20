const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(2000);
  
  // Count how many times key elements appear
  const counts = await page.evaluate(() => {
    return {
      navCount: document.querySelectorAll('nav').length,
      heroH1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main').length,
      footerCount: document.querySelectorAll('footer').length,
      organicHomepageCount: document.querySelectorAll('[data-testid="organic-homepage"]').length,
      bodyHTML: document.body.innerHTML.length
    };
  });
  
  console.log('Element counts:', counts);
  
  // Check if React is double rendering
  const reactRoots = await page.evaluate(() => {
    const roots = document.querySelectorAll('[data-reactroot], #__next, #root');
    return roots.length;
  });
  
  console.log('React roots found:', reactRoots);
  
  await browser.close();
})();