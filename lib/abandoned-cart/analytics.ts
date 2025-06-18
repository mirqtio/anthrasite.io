import { prisma } from '@/lib/db'

export interface AbandonmentMetrics {
  // Overall metrics
  totalCarts: number
  totalAbandoned: number
  totalRecovered: number
  abandonmentRate: number
  recoveryRate: number
  
  // Revenue metrics
  totalRevenueLost: number
  totalRevenueRecovered: number
  averageOrderValue: number
  
  // Email metrics
  totalEmailsSent: number
  emailOpenRate: number
  emailClickRate: number
  
  // Time-based metrics
  averageTimeToRecovery: number
  averageTimeToAbandonment: number
  
  // Trends (compared to previous period)
  abandonmentTrend: number
  recoveryTrend: number
  revenueTrend: number
}

export interface AbandonmentBreakdown {
  byHour: Array<{ hour: number; count: number }>
  byDay: Array<{ day: string; count: number }>
  byAmount: Array<{ range: string; count: number }>
  byRecoveryTime: Array<{ hours: string; count: number }>
}

/**
 * Get comprehensive abandonment metrics
 */
export async function getAbandonmentMetrics(days: number = 30): Promise<AbandonmentMetrics> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const previousStartDate = new Date()
  previousStartDate.setDate(previousStartDate.getDate() - (days * 2))
  
  try {
    // Current period metrics
    const [
      currentAbandoned,
      currentRecovered,
      currentEmailsSent,
      currentRevenueLost,
      currentRevenueRecovered,
      totalPurchases,
    ] = await Promise.all([
      prisma.abandonedCart.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.abandonedCart.count({
        where: { createdAt: { gte: startDate }, recovered: true },
      }),
      prisma.abandonedCart.count({
        where: { createdAt: { gte: startDate }, recoveryEmailSent: true },
      }),
      prisma.abandonedCart.aggregate({
        where: { createdAt: { gte: startDate }, recovered: false },
        _sum: { amount: true },
      }),
      prisma.abandonedCart.aggregate({
        where: { createdAt: { gte: startDate }, recovered: true },
        _sum: { amount: true },
      }),
      prisma.purchase.count({
        where: { createdAt: { gte: startDate }, status: 'completed' },
      }),
    ])
    
    // Previous period metrics for trends
    const [previousAbandoned, previousRecovered, previousRevenue] = await Promise.all([
      prisma.abandonedCart.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      prisma.abandonedCart.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          recovered: true,
        },
      }),
      prisma.abandonedCart.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          recovered: true,
        },
        _sum: { amount: true },
      }),
    ])
    
    // Calculate recovery times
    const recoveredCarts = await prisma.abandonedCart.findMany({
      where: {
        createdAt: { gte: startDate },
        recovered: true,
        recoveredAt: { not: null },
      },
      select: {
        createdAt: true,
        recoveredAt: true,
      },
    })
    
    const recoveryTimes = recoveredCarts
      .filter(cart => cart.recoveredAt)
      .map(cart => cart.recoveredAt!.getTime() - cart.createdAt.getTime())
    
    const averageTimeToRecovery = recoveryTimes.length > 0
      ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length / (1000 * 60 * 60) // hours
      : 0
    
    // Calculate metrics
    const totalCarts = currentAbandoned + totalPurchases
    const abandonmentRate = totalCarts > 0 ? (currentAbandoned / totalCarts) * 100 : 0
    const recoveryRate = currentEmailsSent > 0 ? (currentRecovered / currentEmailsSent) * 100 : 0
    const totalRevenueLost = (currentRevenueLost._sum.amount || 0) / 100
    const totalRevenueRecovered = (currentRevenueRecovered._sum.amount || 0) / 100
    const averageOrderValue = currentAbandoned > 0 
      ? (totalRevenueLost + totalRevenueRecovered) / currentAbandoned 
      : 0
    
    // Calculate trends
    const abandonmentTrend = previousAbandoned > 0 
      ? ((currentAbandoned - previousAbandoned) / previousAbandoned) * 100 
      : 0
    const recoveryTrend = previousRecovered > 0 
      ? ((currentRecovered - previousRecovered) / previousRecovered) * 100 
      : 0
    const revenueTrend = previousRevenue._sum.amount && previousRevenue._sum.amount > 0
      ? ((totalRevenueRecovered - (previousRevenue._sum.amount / 100)) / (previousRevenue._sum.amount / 100)) * 100
      : 0
    
    return {
      totalCarts,
      totalAbandoned: currentAbandoned,
      totalRecovered: currentRecovered,
      abandonmentRate: Math.round(abandonmentRate * 100) / 100,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
      totalRevenueLost,
      totalRevenueRecovered,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalEmailsSent: currentEmailsSent,
      emailOpenRate: 0, // Would need email provider integration
      emailClickRate: 0, // Would need email provider integration
      averageTimeToRecovery: Math.round(averageTimeToRecovery * 10) / 10,
      averageTimeToAbandonment: 3, // Based on our 3-hour threshold
      abandonmentTrend: Math.round(abandonmentTrend * 10) / 10,
      recoveryTrend: Math.round(recoveryTrend * 10) / 10,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
    }
  } catch (error) {
    console.error('Failed to get abandonment metrics:', error)
    throw error
  }
}

/**
 * Get abandonment breakdown by various dimensions
 */
export async function getAbandonmentBreakdown(days: number = 30): Promise<AbandonmentBreakdown> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  try {
    const abandonedCarts = await prisma.abandonedCart.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        amount: true,
        recovered: true,
        recoveredAt: true,
      },
    })
    
    // By hour of day
    const byHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    abandonedCarts.forEach(cart => {
      const hour = cart.createdAt.getHours()
      byHour[hour].count++
    })
    
    // By day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const byDay = Array.from({ length: 7 }, (_, i) => ({ day: dayNames[i], count: 0 }))
    abandonedCarts.forEach(cart => {
      const day = cart.createdAt.getDay()
      byDay[day].count++
    })
    
    // By amount range
    const amountRanges = [
      { range: '$0-50', min: 0, max: 5000, count: 0 },
      { range: '$50-100', min: 5000, max: 10000, count: 0 },
      { range: '$100-200', min: 10000, max: 20000, count: 0 },
      { range: '$200+', min: 20000, max: Infinity, count: 0 },
    ]
    abandonedCarts.forEach(cart => {
      const range = amountRanges.find(r => cart.amount >= r.min && cart.amount < r.max)
      if (range) range.count++
    })
    
    // By recovery time
    const recoveryTimeRanges = [
      { hours: '0-6h', count: 0 },
      { hours: '6-12h', count: 0 },
      { hours: '12-24h', count: 0 },
      { hours: '24h+', count: 0 },
    ]
    abandonedCarts
      .filter(cart => cart.recovered && cart.recoveredAt)
      .forEach(cart => {
        const hoursToRecovery = (cart.recoveredAt!.getTime() - cart.createdAt.getTime()) / (1000 * 60 * 60)
        if (hoursToRecovery < 6) recoveryTimeRanges[0].count++
        else if (hoursToRecovery < 12) recoveryTimeRanges[1].count++
        else if (hoursToRecovery < 24) recoveryTimeRanges[2].count++
        else recoveryTimeRanges[3].count++
      })
    
    return {
      byHour,
      byDay,
      byAmount: amountRanges.map(({ range, count }) => ({ range, count })),
      byRecoveryTime: recoveryTimeRanges,
    }
  } catch (error) {
    console.error('Failed to get abandonment breakdown:', error)
    throw error
  }
}

/**
 * Get top abandoned products/businesses
 */
export async function getTopAbandonedBusinesses(limit: number = 10) {
  try {
    const topAbandoned = await prisma.abandonedCart.groupBy({
      by: ['businessId'],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      where: {
        recovered: false,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    })
    
    // Get business details
    const businessIds = topAbandoned.map(item => item.businessId)
    const businesses = await prisma.business.findMany({
      where: { id: { in: businessIds } },
      select: { id: true, name: true, domain: true },
    })
    
    const businessMap = new Map(businesses.map(b => [b.id, b]))
    
    return topAbandoned.map(item => ({
      business: businessMap.get(item.businessId),
      abandonedCount: item._count.id,
      totalRevenueLost: (item._sum.amount || 0) / 100,
    }))
  } catch (error) {
    console.error('Failed to get top abandoned businesses:', error)
    throw error
  }
}