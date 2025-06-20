const { chromium } = require('@playwright/test');
const fs = require('fs');

async function assessPerformance() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    performance: {},
    mobile: {},
    recommendations: []
  };

  console.log('🔍 Starting performance and mobile assessment...\n');

  // Desktop Performance Assessment
  console.log('📊 Desktop Performance Assessment:');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const desktopPage = await desktopContext.newPage();
  
  // Enable performance metrics
  await desktopPage.route('**/*', route => route.continue());
  
  // Measure page load performance
  const startTime = Date.now();
  await desktopPage.goto('http://localhost:3333', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  
  // Get performance metrics
  const performanceMetrics = await desktopPage.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      totalBlockingTime: 0 // Would need more complex calculation
    };
  });

  // Check resource sizes
  const resourceMetrics = await desktopPage.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    const jsSize = resources.filter(r => r.name.includes('.js')).reduce((sum, r) => sum + r.transferSize, 0);
    const cssSize = resources.filter(r => r.name.includes('.css')).reduce((sum, r) => sum + r.transferSize, 0);
    const imageSize = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|svg|webp)/)).reduce((sum, r) => sum + r.transferSize, 0);
    const totalSize = resources.reduce((sum, r) => sum + r.transferSize, 0);
    
    return {
      jsSize: (jsSize / 1024).toFixed(2) + ' KB',
      cssSize: (cssSize / 1024).toFixed(2) + ' KB',
      imageSize: (imageSize / 1024).toFixed(2) + ' KB',
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      requestCount: resources.length
    };
  });

  results.performance.desktop = {
    loadTime: loadTime + 'ms',
    metrics: performanceMetrics,
    resources: resourceMetrics
  };

  console.log(`✅ Page Load Time: ${loadTime}ms`);
  console.log(`✅ First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);
  console.log(`✅ Total Page Size: ${resourceMetrics.totalSize}`);
  console.log(`✅ Total Requests: ${resourceMetrics.requestCount}`);

  // Mobile Assessment
  console.log('\n📱 Mobile Compatibility Assessment:');
  
  // Test multiple mobile viewports
  const mobileDevices = [
    { name: 'iPhone 12', width: 390, height: 844, deviceScaleFactor: 3 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800, deviceScaleFactor: 3 },
    { name: 'iPad', width: 768, height: 1024, deviceScaleFactor: 2 }
  ];

  for (const device of mobileDevices) {
    console.log(`\n  Testing ${device.name}...`);
    const mobileContext = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: true,
      hasTouch: true
    });
    
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3333', { waitUntil: 'networkidle' });
    
    // Check viewport meta tag
    const hasViewportMeta = await mobilePage.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta && meta.content.includes('width=device-width');
    });

    // Check for horizontal scroll
    const hasHorizontalScroll = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Check touch targets
    const touchTargets = await mobilePage.evaluate(() => {
      const clickables = Array.from(document.querySelectorAll('a, button, [role="button"]'));
      const smallTargets = clickables.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44; // Apple's recommended minimum
      });
      return {
        total: clickables.length,
        tooSmall: smallTargets.length
      };
    });

    // Check text readability
    const textReadability = await mobilePage.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('p, span, div')).filter(el => el.innerText.trim());
      const smallText = texts.filter(el => {
        const fontSize = window.getComputedStyle(el).fontSize;
        return parseFloat(fontSize) < 12;
      });
      return {
        totalTextElements: texts.length,
        tooSmall: smallText.length
      };
    });

    // Check images
    const imageOptimization = await mobilePage.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const issues = images.filter(img => {
        return !img.loading || img.loading !== 'lazy' || !img.srcset;
      });
      return {
        total: images.length,
        notOptimized: issues.length
      };
    });

    // Take screenshot
    await mobilePage.screenshot({ 
      path: `mobile-${device.name.replace(' ', '-').toLowerCase()}.png`,
      fullPage: false 
    });

    results.mobile[device.name] = {
      hasViewportMeta,
      hasHorizontalScroll,
      touchTargets,
      textReadability,
      imageOptimization
    };

    console.log(`  ✅ Viewport meta tag: ${hasViewportMeta ? 'Yes' : 'No'}`);
    console.log(`  ${hasHorizontalScroll ? '❌' : '✅'} Horizontal scroll: ${hasHorizontalScroll ? 'Yes' : 'No'}`);
    console.log(`  ${touchTargets.tooSmall > 0 ? '⚠️' : '✅'} Touch targets: ${touchTargets.tooSmall}/${touchTargets.total} too small`);
    console.log(`  ${textReadability.tooSmall > 0 ? '⚠️' : '✅'} Text readability: ${textReadability.tooSmall}/${textReadability.totalTextElements} too small`);

    await mobileContext.close();
  }

  // Core Web Vitals Assessment
  console.log('\n📈 Core Web Vitals Assessment:');
  const vitalPage = await desktopContext.newPage();
  
  // Simulate CLS (Cumulative Layout Shift)
  await vitalPage.goto('http://localhost:3333');
  const cls = await vitalPage.evaluate(() => {
    return new Promise(resolve => {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 3000);
    });
  });

  console.log(`  CLS (Cumulative Layout Shift): ${cls.toFixed(3)} ${cls < 0.1 ? '✅ Good' : cls < 0.25 ? '⚠️ Needs improvement' : '❌ Poor'}`);

  // Generate recommendations
  console.log('\n💡 Recommendations:');
  
  if (performanceMetrics.firstContentfulPaint > 1800) {
    results.recommendations.push('⚡ Improve First Contentful Paint (currently > 1.8s)');
    console.log('  ⚡ Improve First Contentful Paint (currently > 1.8s)');
  }

  if (parseFloat(resourceMetrics.totalSize) > 3000) {
    results.recommendations.push('📦 Reduce total page size (currently > 3MB)');
    console.log('  📦 Reduce total page size (currently > 3MB)');
  }

  if (resourceMetrics.requestCount > 50) {
    results.recommendations.push('🔗 Reduce number of HTTP requests');
    console.log('  🔗 Reduce number of HTTP requests');
  }

  // Check for mobile issues
  Object.entries(results.mobile).forEach(([device, data]) => {
    if (data.hasHorizontalScroll) {
      const rec = `📱 Fix horizontal scroll on ${device}`;
      if (!results.recommendations.includes(rec)) {
        results.recommendations.push(rec);
        console.log(`  ${rec}`);
      }
    }
    if (data.touchTargets.tooSmall > 0) {
      const rec = '👆 Increase size of touch targets for mobile (min 44x44px)';
      if (!results.recommendations.includes(rec)) {
        results.recommendations.push(rec);
        console.log(`  ${rec}`);
      }
    }
  });

  if (cls > 0.1) {
    results.recommendations.push('📏 Reduce Cumulative Layout Shift');
    console.log('  📏 Reduce Cumulative Layout Shift');
  }

  // Save detailed report
  fs.writeFileSync('performance-mobile-report.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Detailed report saved to performance-mobile-report.json');

  await browser.close();
}

assessPerformance().catch(console.error);