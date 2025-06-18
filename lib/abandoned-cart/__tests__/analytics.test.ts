import { 
  getAbandonmentMetrics, 
  getAbandonmentBreakdown,
  getTopAbandonedBusinesses
} from '../analytics'
import { prisma } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    abandonedCart: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn()
    },
    purchase: {
      count: jest.fn()
    },
    business: {
      findMany: jest.fn()
    }
  }
}))

describe('Abandonment Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAbandonmentMetrics', () => {
    it('should calculate abandonment metrics correctly', async () => {
      const mockDate = new Date('2024-01-15')
      jest.useFakeTimers().setSystemTime(mockDate)

      // Mock current period data
      ;(prisma.abandonedCart.count as jest.Mock)
        .mockResolvedValueOnce(100) // total abandoned
        .mockResolvedValueOnce(20)  // recovered
        .mockResolvedValueOnce(80)  // emails sent
      
      ;(prisma.abandonedCart.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 800000 } }) // revenue lost
        .mockResolvedValueOnce({ _sum: { amount: 200000 } }) // revenue recovered
      
      ;(prisma.purchase.count as jest.Mock).mockResolvedValue(150) // completed purchases

      // Mock previous period data for trends
      ;(prisma.abandonedCart.count as jest.Mock)
        .mockResolvedValueOnce(90)  // previous abandoned
        .mockResolvedValueOnce(15)  // previous recovered
      
      ;(prisma.abandonedCart.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 150000 } }) // previous revenue

      // Mock recovery times
      ;(prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date('2024-01-14T10:00:00'),
          recoveredAt: new Date('2024-01-14T16:00:00') // 6 hours
        },
        {
          createdAt: new Date('2024-01-13T10:00:00'),
          recoveredAt: new Date('2024-01-13T22:00:00') // 12 hours
        }
      ])

      const metrics = await getAbandonmentMetrics(30)

      expect(metrics).toMatchObject({
        totalCarts: 250, // 100 abandoned + 150 purchases
        totalAbandoned: 100,
        totalRecovered: 20,
        abandonmentRate: 40, // 100/250 * 100
        recoveryRate: 25, // 20/80 * 100
        totalRevenueLost: 8000, // 800000/100
        totalRevenueRecovered: 2000, // 200000/100
        averageOrderValue: 100, // (8000+2000)/100
        totalEmailsSent: 80,
        averageTimeToRecovery: 9, // (6+12)/2
        abandonmentTrend: 11.1, // (100-90)/90 * 100
        recoveryTrend: 33.3, // (20-15)/15 * 100
        revenueTrend: 33.3 // (2000-1500)/1500 * 100
      })

      jest.useRealTimers()
    })

    it('should handle zero values gracefully', async () => {
      // Mock all zeros
      ;(prisma.abandonedCart.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.abandonedCart.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: null } })
      ;(prisma.purchase.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue([])

      const metrics = await getAbandonmentMetrics(30)

      expect(metrics.abandonmentRate).toBe(0)
      expect(metrics.recoveryRate).toBe(0)
      expect(metrics.averageOrderValue).toBe(0)
      expect(metrics.averageTimeToRecovery).toBe(0)
    })

    it('should handle errors', async () => {
      ;(prisma.abandonedCart.count as jest.Mock).mockRejectedValue(new Error('DB error'))
      
      await expect(getAbandonmentMetrics(30)).rejects.toThrow('DB error')
    })
  })

  describe('getAbandonmentBreakdown', () => {
    it('should calculate breakdown by dimensions', async () => {
      const mockCarts = [
        {
          createdAt: new Date('2024-01-15T10:00:00'), // Tuesday, 10am
          amount: 5500,
          recovered: true,
          recoveredAt: new Date('2024-01-15T14:00:00') // 4 hours later
        },
        {
          createdAt: new Date('2024-01-15T10:00:00'), // Tuesday, 10am
          amount: 15000,
          recovered: false,
          recoveredAt: null
        },
        {
          createdAt: new Date('2024-01-14T20:00:00'), // Monday, 8pm
          amount: 25000,
          recovered: true,
          recoveredAt: new Date('2024-01-16T08:00:00') // 36 hours later
        }
      ]

      ;(prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue(mockCarts)

      const breakdown = await getAbandonmentBreakdown(30)

      // Check hourly breakdown
      expect(breakdown.byHour[10].count).toBe(2) // 2 carts at 10am
      expect(breakdown.byHour[20].count).toBe(1) // 1 cart at 8pm

      // Check daily breakdown
      expect(breakdown.byDay[1].count).toBe(1) // Monday
      expect(breakdown.byDay[2].count).toBe(2) // Tuesday

      // Check amount breakdown
      expect(breakdown.byAmount).toContainEqual({ range: '$50-100', count: 1 })
      expect(breakdown.byAmount).toContainEqual({ range: '$100-200', count: 1 })
      expect(breakdown.byAmount).toContainEqual({ range: '$200+', count: 1 })

      // Check recovery time breakdown
      expect(breakdown.byRecoveryTime).toContainEqual({ hours: '0-6h', count: 1 })
      expect(breakdown.byRecoveryTime).toContainEqual({ hours: '24h+', count: 1 })
    })

    it('should handle empty data', async () => {
      ;(prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue([])

      const breakdown = await getAbandonmentBreakdown(30)

      expect(breakdown.byHour.every(h => h.count === 0)).toBe(true)
      expect(breakdown.byDay.every(d => d.count === 0)).toBe(true)
      expect(breakdown.byAmount.every(a => a.count === 0)).toBe(true)
      expect(breakdown.byRecoveryTime.every(r => r.count === 0)).toBe(true)
    })
  })

  describe('getTopAbandonedBusinesses', () => {
    it('should return top abandoned businesses', async () => {
      const mockGroupBy = [
        { businessId: 'biz1', _count: { id: 10 }, _sum: { amount: 100000 } },
        { businessId: 'biz2', _count: { id: 5 }, _sum: { amount: 50000 } },
        { businessId: 'biz3', _count: { id: 3 }, _sum: { amount: 30000 } }
      ]

      const mockBusinesses = [
        { id: 'biz1', name: 'Business 1', domain: 'biz1.com' },
        { id: 'biz2', name: 'Business 2', domain: 'biz2.com' },
        { id: 'biz3', name: 'Business 3', domain: 'biz3.com' }
      ]

      ;(prisma.abandonedCart.groupBy as jest.Mock).mockResolvedValue(mockGroupBy)
      ;(prisma.business.findMany as jest.Mock).mockResolvedValue(mockBusinesses)

      const result = await getTopAbandonedBusinesses(10)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        business: { id: 'biz1', name: 'Business 1', domain: 'biz1.com' },
        abandonedCount: 10,
        totalRevenueLost: 1000 // 100000/100
      })
      
      expect(prisma.abandonedCart.groupBy).toHaveBeenCalledWith({
        by: ['businessId'],
        _count: { id: true },
        _sum: { amount: true },
        where: {
          recovered: false,
          createdAt: { gte: expect.any(Date) }
        },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    })

    it('should handle missing business data', async () => {
      ;(prisma.abandonedCart.groupBy as jest.Mock).mockResolvedValue([
        { businessId: 'biz1', _count: { id: 5 }, _sum: { amount: 50000 } }
      ])
      ;(prisma.business.findMany as jest.Mock).mockResolvedValue([])

      const result = await getTopAbandonedBusinesses(5)

      expect(result[0].business).toBeUndefined()
    })
  })
})