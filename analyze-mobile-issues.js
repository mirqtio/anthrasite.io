const { chromium } = require('@playwright/test');

async function analyzeMobileIssues() {
  const browser = await chromium.launch({ headless: true });
  
  console.log('🔍 Analyzing specific mobile issues...\n');

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await mobileContext.newPage();
  await page.goto('http://localhost:3333', { waitUntil: 'networkidle' });

  // Find elements causing horizontal scroll
  const overflowElements = await page.evaluate(() => {
    const elements = [];
    const bodyWidth = document.body.offsetWidth;
    
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > bodyWidth || rect.left < 0) {
        const styles = window.getComputedStyle(el);
        elements.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent.substring(0, 50),
          width: rect.width,
          left: rect.left,
          right: rect.right,
          position: styles.position,
          display: styles.display,
          overflow: styles.overflow
        });
      }
    });
    
    return elements;
  });

  console.log('Elements causing horizontal scroll:');
  overflowElements.forEach(el => {
    console.log(`  - ${el.tag}${el.id ? '#' + el.id : ''}${el.class ? '.' + el.class : ''}`);
    console.log(`    Width: ${el.width}px, Left: ${el.left}px, Right: ${el.right}px`);
  });

  // Analyze touch targets
  const touchTargetIssues = await page.evaluate(() => {
    const clickables = Array.from(document.querySelectorAll('a, button, [role="button"]'));
    return clickables.map(el => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      return {
        element: el.tagName + (el.className ? '.' + el.className : ''),
        text: el.textContent.trim().substring(0, 30),
        width: rect.width,
        height: rect.height,
        padding: styles.padding,
        tooSmall: rect.width < 44 || rect.height < 44
      };
    }).filter(el => el.tooSmall);
  });

  console.log('\n🎯 Touch targets that are too small:');
  touchTargetIssues.forEach(target => {
    console.log(`  - ${target.element}: "${target.text}"`);
    console.log(`    Size: ${target.width}x${target.height}px (min: 44x44px)`);
  });

  // Check font sizes
  const fontSizes = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const sizes = new Set();
    elements.forEach(el => {
      const fontSize = window.getComputedStyle(el).fontSize;
      if (fontSize && el.textContent.trim()) {
        sizes.add(fontSize);
      }
    });
    return Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b));
  });

  console.log('\n📝 Font sizes in use:', fontSizes.join(', '));

  // Check for fixed positioning issues
  const fixedElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => window.getComputedStyle(el).position === 'fixed')
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id
      }));
  });

  if (fixedElements.length > 0) {
    console.log('\n⚠️  Fixed position elements (can cause mobile issues):');
    fixedElements.forEach(el => {
      console.log(`  - ${el.tag}${el.id ? '#' + el.id : ''}${el.class ? '.' + el.class : ''}`);
    });
  }

  // Check image optimization
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loading: img.loading,
      srcset: img.srcset,
      alt: img.alt
    }));
  });

  console.log('\n🖼️  Image optimization:');
  images.forEach(img => {
    console.log(`  - ${img.src.split('/').pop()}`);
    if (!img.loading || img.loading !== 'lazy') {
      console.log('    ⚠️  No lazy loading');
    }
    if (!img.srcset) {
      console.log('    ⚠️  No responsive images (srcset)');
    }
    if (!img.alt) {
      console.log('    ⚠️  No alt text');
    }
  });

  await browser.close();
}

analyzeMobileIssues().catch(console.error);