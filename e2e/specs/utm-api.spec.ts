import { test, expect } from '@playwright/test'
import { makeValid, makeExpired, makeTampered } from '../utils/utmTestData'

const UTM_SECRET =
  process.env.UTM_SECRET_KEY || 'development-secret-key-replace-in-production'

test.describe('UTM validation API returns expected statuses', () => {
  test('Valid token returns 200 with price + business context', async ({
    request,
  }) => {
    // When I call "GET /api/validate-utm?utm=<valid>"
    const validToken = makeValid(UTM_SECRET)
    const response = await request.get(`/api/validate-utm?utm=${validToken}`)

    // Then the response status is 200
    expect(response.status()).toBe(200)

    // And the JSON includes valid response with business data
    const body = await response.json()
    expect(body).toHaveProperty('valid', true)
    expect(body).toHaveProperty('businessId')
    expect(body).toHaveProperty('reportData')
    expect(body.reportData).toHaveProperty('price')
    expect(body.reportData).toHaveProperty('business_id')
  })

  test('Tampered token returns 4xx', async ({ request }) => {
    // When I call "GET /api/validate-utm?utm=<tampered>"
    const tamperedToken = makeTampered(UTM_SECRET)
    const response = await request.get(`/api/validate-utm?utm=${tamperedToken}`)

    // Then the response status is 400 or 401
    expect([400, 401]).toContain(response.status())
  })

  test('Expired token returns 4xx', async ({ request }) => {
    // When I call "GET /api/validate-utm?utm=<expired>"
    const expiredToken = makeExpired(UTM_SECRET)
    const response = await request.get(`/api/validate-utm?utm=${expiredToken}`)

    // Then the response status is 400 or 401
    expect([400, 401]).toContain(response.status())
  })
})
