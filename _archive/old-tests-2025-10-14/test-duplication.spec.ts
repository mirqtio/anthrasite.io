import { test, expect } from '@playwright/test';

test('check for content duplication', async ({ page }) => {
  await page.goto('http://localhost:3333');
  
  // Wait for content to load
  await page.waitForSelector('nav', { timeout: 10000 });
  
  // Count nav elements
  const navCount = await page.locator('nav').count();
  console.log(`Number of nav elements: ${navCount}`);
  
  // Count main elements
  const mainCount = await page.locator('main').count();
  console.log(`Number of main elements: ${mainCount}`);
  
  // Count footer elements
  const footerCount = await page.locator('footer').count();
  console.log(`Number of footer elements: ${footerCount}`);
  
  // Count OrganicHomepage data-testid
  const homepageCount = await page.locator('[data-testid="organic-homepage"]').count();
  console.log(`Number of organic-homepage elements: ${homepageCount}`);
  
  // Get the HTML structure
  const html = await page.content();
  console.log('\n--- HTML Structure ---');
  console.log(html.substring(0, 500));
  
  expect(navCount).toBe(1);
  expect(mainCount).toBe(1);
  expect(footerCount).toBe(1);
});