const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3333');
  await page.waitForTimeout(2000);
  
  // Get the body structure
  const structure = await page.evaluate(() => {
    const getElementInfo = (el) => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      testId: el.getAttribute('data-testid'),
      childCount: el.children.length
    });
    
    // Get direct children of body
    const bodyChildren = Array.from(document.body.children).map(getElementInfo);
    
    // Find all OrganicHomepage components
    const homepages = document.querySelectorAll('[data-testid="organic-homepage"]');
    const homepageInfo = Array.from(homepages).map(hp => {
      let ancestors = [];
      let current = hp.parentElement;
      while (current && current !== document.body) {
        ancestors.push(getElementInfo(current));
        current = current.parentElement;
      }
      return { ancestors };
    });
    
    return {
      bodyChildren,
      homepageInfo
    };
  });
  
  console.log('DOM Structure:', JSON.stringify(structure, null, 2));
  
  await browser.close();
})();