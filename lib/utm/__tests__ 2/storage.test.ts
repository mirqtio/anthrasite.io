import {
  storeUTMToken,
  getUTMToken,
  markTokenUsed,
  isTokenUsed,
  cleanupExpiredTokens,
  getTokenStats,
  createAndStoreToken,
} from '../storage'
import { prisma } from '@/lib/db'
import { generateNonce } from '../crypto'

// Mock the database
jest.mock('@/lib/db', () => ({
  prisma: {
    utmToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  monitorDbQuery: jest.fn((name, fn) => fn()),
}))

describe('UTM Token Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('storeUTMToken', () => {
    it('should store a token in the database', async () => {
      const mockToken = {
        id: 'token-123',
        nonce: 'test-nonce',
        businessId: 'business-123',
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      }

      ;(prisma.utmToken.create as jest.Mock).mockResolvedValue(mockToken)

      const result = await storeUTMToken(
        'business-123',
        'test-nonce',
        new Date()
      )

      expect(prisma.utmToken.create).toHaveBeenCalledWith({
        data: {
          nonce: 'test-nonce',
          businessId: 'business-123',
          expiresAt: expect.any(Date),
        },
      })
      expect(result).toEqual(mockToken)
    })
  })

  describe('getUTMToken', () => {
    it('should retrieve a token by nonce', async () => {
      const mockToken = {
        id: 'token-123',
        nonce: 'test-nonce',
        businessId: 'business-123',
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      }

      ;(prisma.utmToken.findUnique as jest.Mock).mockResolvedValue(mockToken)

      const result = await getUTMToken('test-nonce')

      expect(prisma.utmToken.findUnique).toHaveBeenCalledWith({
        where: { nonce: 'test-nonce' },
      })
      expect(result).toEqual(mockToken)
    })

    it('should return null for non-existent token', async () => {
      ;(prisma.utmToken.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getUTMToken('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('markTokenUsed', () => {
    it('should mark an unused token as used', async () => {
      const updatedToken = {
        id: 'token-123',
        nonce: 'test-nonce',
        usedAt: new Date(),
      }

      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue(updatedToken)

      const result = await markTokenUsed('test-nonce')

      expect(prisma.utmToken.update).toHaveBeenCalledWith({
        where: {
          nonce: 'test-nonce',
          usedAt: null,
        },
        data: {
          usedAt: expect.any(Date),
        },
      })
      expect(result).toBe(true)
    })

    it('should return false for already used token', async () => {
      ;(prisma.utmToken.update as jest.Mock).mockRejectedValue(
        new Error('Not found')
      )

      const result = await markTokenUsed('used-nonce')

      expect(result).toBe(false)
    })
  })

  describe('isTokenUsed', () => {
    it('should return true for used token', async () => {
      ;(prisma.utmToken.findUnique as jest.Mock).mockResolvedValue({
        usedAt: new Date(),
      })

      const result = await isTokenUsed('test-nonce')

      expect(result).toBe(true)
    })

    it('should return false for unused token', async () => {
      ;(prisma.utmToken.findUnique as jest.Mock).mockResolvedValue({
        usedAt: null,
      })

      const result = await isTokenUsed('test-nonce')

      expect(result).toBe(false)
    })
  })

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      ;(prisma.utmToken.deleteMany as jest.Mock).mockResolvedValue({ count: 5 })

      const result = await cleanupExpiredTokens()

      expect(prisma.utmToken.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lt: expect.any(Date) } },
            { usedAt: { lt: expect.any(Date) } },
          ],
        },
      })
      expect(result).toBe(5)
    })
  })

  describe('getTokenStats', () => {
    it('should return token statistics', async () => {
      ;(prisma.utmToken.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30) // used
        .mockResolvedValueOnce(20) // expired

      const result = await getTokenStats()

      expect(result).toEqual({
        total: 100,
        used: 30,
        expired: 20,
        active: 50, // 100 - 30 - 20
      })
    })
  })

  describe('createAndStoreToken', () => {
    it('should create and store a new token', async () => {
      const mockToken = {
        id: 'token-123',
        nonce: 'generated-nonce',
        businessId: 'business-123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      }

      ;(prisma.utmToken.create as jest.Mock).mockResolvedValue(mockToken)

      const result = await createAndStoreToken('business-123')

      expect(prisma.utmToken.create).toHaveBeenCalledWith({
        data: {
          nonce: expect.any(String),
          businessId: 'business-123',
          expiresAt: expect.any(Date),
        },
      })
      expect(result.token).toEqual(mockToken)
      expect(result.nonce).toBeTruthy()
    })
  })
})
