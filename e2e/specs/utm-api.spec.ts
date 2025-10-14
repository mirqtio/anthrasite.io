import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import {
  generateUTMToken,
  createUTMParameter,
  encodePayload,
  createSignature,
} from '@/lib/utm/crypto'
import { storeUTMToken } from '@/lib/utm/storage'

const prisma = new PrismaClient()

// Helper to create test business
async function createTestBusiness() {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  return await prisma.business.create({
    data: {
      domain: `test-business-${uniqueId}.com`,
      name: `Test Business ${uniqueId}`,
      reportData: {
        price: 49900,
        score: 85,
        issues: ['Performance', 'SEO'],
        business_id: '',
      },
    },
  })
}

// Helper to cleanup test data
async function cleanup(businessId?: string) {
  if (businessId) {
    try {
      await prisma.utmToken.deleteMany({ where: { businessId } })
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      })
      if (business) {
        await prisma.business.delete({ where: { id: businessId } })
      }
    } catch (error) {
      if (!process.env.CI) {
        console.error('Cleanup error:', error)
      }
    }
  }
}

test.describe('UTM validation API returns expected statuses', () => {
  test('Valid token returns 200 with price + business context', async ({
    request,
  }) => {
    const business = await createTestBusiness()
    // Set business_id in reportData
    await prisma.business.update({
      where: { id: business.id },
      data: {
        reportData: {
          ...(business.reportData as any),
          business_id: business.id,
        },
      },
    })

    try {
      // Generate a real UTM token using the actual crypto logic
      const utmToken = await generateUTMToken(business.id)
      const utmString = createUTMParameter(utmToken)

      // Parse the payload to get the nonce
      const payloadData = JSON.parse(
        Buffer.from(
          utmToken.payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(
              utmToken.payload.length +
                ((4 - (utmToken.payload.length % 4)) % 4),
              '='
            ),
          'base64'
        ).toString()
      )

      // Store the token in the database (complete the flow)
      await storeUTMToken(
        business.id,
        payloadData.nonce,
        new Date(payloadData.expires),
        utmString
      )

      // When I call "GET /api/validate-utm?utm=<valid>"
      const response = await request.get(`/api/validate-utm?utm=${utmString}`)

      // Then the response status is 200
      expect(response.status()).toBe(200)

      // And the JSON includes valid response with business data
      const body = await response.json()
      expect(body).toHaveProperty('valid', true)
      expect(body).toHaveProperty('businessId', business.id)
      expect(body).toHaveProperty('reportData')
      expect(body.reportData).toHaveProperty('price', 49900)
      expect(body.reportData).toHaveProperty('business_id', business.id)
    } finally {
      await cleanup(business.id)
    }
  })

  test('Tampered token returns 4xx', async ({ request }) => {
    const business = await createTestBusiness()
    try {
      // Generate a real UTM token, then tamper with it
      const utmToken = await generateUTMToken(business.id)
      const utmString = createUTMParameter(utmToken)

      // Tamper with the token by changing the last character
      const tamperedToken =
        utmString.slice(0, -1) + (utmString.slice(-1) === 'A' ? 'B' : 'A')

      // When I call "GET /api/validate-utm?utm=<tampered>"
      const response = await request.get(
        `/api/validate-utm?utm=${tamperedToken}`
      )

      // Then the response status is 400 or 401
      expect([400, 401]).toContain(response.status())
    } finally {
      await cleanup(business.id)
    }
  })

  test('Expired token returns 4xx', async ({ request }) => {
    const business = await createTestBusiness()
    try {
      // Create an expired token (manual construction with past expiry)
      const now = Date.now()
      const payload = {
        businessId: business.id,
        timestamp: now,
        nonce: Math.random().toString(36).substring(2, 15),
        expires: now - 48 * 60 * 60 * 1000, // Expired 48 hours ago
      }

      const encodedPayload = encodePayload(payload)
      const signature = await createSignature(encodedPayload)
      const expiredToken = `${encodedPayload}.${signature}`

      // When I call "GET /api/validate-utm?utm=<expired>"
      const response = await request.get(
        `/api/validate-utm?utm=${expiredToken}`
      )

      // Then the response status is 400 or 401
      expect([400, 401]).toContain(response.status())
    } finally {
      await cleanup(business.id)
    }
  })
})
