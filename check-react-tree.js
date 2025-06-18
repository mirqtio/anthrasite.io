const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(5000); // Give React time to mount
  
  // Check what's actually rendered
  const diagnostics = await page.evaluate(() => {
    const results = {
      bodyChildrenCount: document.body.children.length,
      hasNextDiv: \!\!document.getElementById('__next'),
      firstChild: document.body.firstElementChild?.tagName,
      bodyClasses: document.body.className,
      scripts: Array.from(document.querySelectorAll('script')).length,
      visibleDivs: Array.from(document.querySelectorAll('div')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display \!== 'none' && style.visibility \!== 'hidden';
      }).length,
    };
    
    // Try to find any rendered React components
    const allElements = document.querySelectorAll('*');
    results.totalElements = allElements.length;
    
    // Look for common React attributes
    results.reactElements = Array.from(allElements).filter(el => {
      return Array.from(el.attributes).some(attr => 
        attr.name.startsWith('data-react') || 
        attr.name === 'data-testid'
      );
    }).length;
    
    return results;
  });
  
  console.log('Page Diagnostics:', diagnostics);
  
  // Take a screenshot to see what's visible
  await page.screenshot({ path: 'debug-screenshot.png' });
  console.log('Screenshot saved to debug-screenshot.png');
  
  await browser.close();
})();
