import { prisma } from '@/lib/db'
import { monitorDbQuery } from '@/lib/monitoring'
import { generateNonce } from './crypto'

export interface StoredToken {
  nonce: string
  token: string
  businessId: string
  used: boolean
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

/**
 * Store a UTM token in the database
 */
export async function storeUTMToken(
  businessId: string,
  nonce: string,
  expiresAt: Date,
  token?: string
): Promise<StoredToken> {
  return monitorDbQuery('utm_token.create', async () => {
    // Generate token if not provided
    const tokenValue = token || generateNonce()

    return await prisma.utmToken.create({
      data: {
        nonce,
        token: tokenValue,
        businessId,
        expiresAt,
      },
    })
  })
}

/**
 * Retrieve a UTM token by nonce
 */
export async function getUTMToken(nonce: string): Promise<StoredToken | null> {
  return monitorDbQuery('utm_token.findUnique', async () => {
    const token = await prisma.utmToken.findUnique({
      where: { nonce },
    })
    return token as StoredToken | null
  })
}

/**
 * Mark a UTM token as used (one-time use enforcement)
 */
export async function markTokenUsed(nonce: string): Promise<boolean> {
  return monitorDbQuery('utm_token.markUsed', async () => {
    try {
      const result = await prisma.utmToken.update({
        where: {
          nonce,
          used: false, // Only update if not already used
        },
        data: {
          used: true,
          usedAt: new Date(),
        },
      })
      return true
    } catch (error) {
      // Token not found or already used
      return false
    }
  })
}

/**
 * Check if a token has been used
 */
export async function isTokenUsed(nonce: string): Promise<boolean> {
  return monitorDbQuery('utm_token.checkUsed', async () => {
    const token = await prisma.utmToken.findUnique({
      where: { nonce },
      select: { used: true },
    })
    return token?.used ?? false
  })
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  return monitorDbQuery('utm_token.cleanup', async () => {
    const result = await prisma.utmToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          // Also clean up tokens used more than 30 days ago
          {
            usedAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    })
    return result.count
  })
}

/**
 * Get token usage statistics for monitoring
 */
export interface TokenStats {
  total: number
  used: number
  expired: number
  active: number
}

export async function getTokenStats(): Promise<TokenStats> {
  return monitorDbQuery('utm_token.stats', async () => {
    const now = new Date()

    const [total, used, expired] = await Promise.all([
      prisma.utmToken.count(),
      prisma.utmToken.count({
        where: { usedAt: { not: null } },
      }),
      prisma.utmToken.count({
        where: { expiresAt: { lt: now } },
      }),
    ])

    const active = total - used - expired

    return { total, used, expired, active }
  })
}

/**
 * Create and store a new UTM token
 */
export async function createAndStoreToken(businessId: string): Promise<{
  token: StoredToken
  nonce: string
}> {
  const nonce = generateNonce()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const token = await storeUTMToken(businessId, nonce, expiresAt)

  return { token, nonce }
}
