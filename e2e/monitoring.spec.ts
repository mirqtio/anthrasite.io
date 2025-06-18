import { test, expect } from '@playwright/test'

test.describe('Monitoring Integration', () => {
  test('health check endpoint should work', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('service', 'healthy')
    expect(data).toHaveProperty('database')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('version')
    
    // Check monitoring headers
    expect(response.headers()['x-route-name']).toBe('health_check')
    expect(response.headers()['x-response-time']).toBeDefined()
  })
  
  test('monitoring provider should load on page', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Check that page loads without errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Monitoring initialization shouldn't cause console errors
    const monitoringErrors = consoleErrors.filter(error => 
      error.includes('Datadog') || 
      error.includes('Sentry') ||
      error.includes('monitoring')
    )
    
    expect(monitoringErrors).toHaveLength(0)
  })
})