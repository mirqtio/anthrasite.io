/**
 * Waitlist service for handling signups and position tracking
 */

import { prisma } from '@/lib/db'
import { captureError, trackEvent } from '@/lib/monitoring'
import { normalizeDomain } from './domain-validation'

export interface WaitlistSignupData {
  domain: string
  email: string
  referralSource?: string
}

export interface WaitlistPosition {
  position: number
  totalCount: number
  estimatedDate?: Date
}

export interface WaitlistSignupResult {
  success: boolean
  position?: WaitlistPosition
  error?: string
}

/**
 * Calculate estimated launch date based on position
 */
function calculateEstimatedDate(position: number): Date {
  // Assume we onboard 50 businesses per week
  const businessesPerWeek = 50
  const weeksToWait = Math.ceil(position / businessesPerWeek)
  
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + (weeksToWait * 7))
  
  return estimatedDate
}

/**
 * Get waitlist position for a domain
 */
export async function getWaitlistPosition(domain: string): Promise<WaitlistPosition | null> {
  try {
    const normalizedDomain = normalizeDomain(domain)
    
    const entry = await prisma.waitlistEntry.findFirst({
      where: { domain: normalizedDomain },
      orderBy: { createdAt: 'asc' },
    })
    
    if (!entry) {
      return null
    }
    
    // Count entries before this one
    const position = await prisma.waitlistEntry.count({
      where: {
        createdAt: {
          lt: entry.createdAt,
        },
      },
    }) + 1
    
    // Get total count
    const totalCount = await prisma.waitlistEntry.count()
    
    return {
      position,
      totalCount,
      estimatedDate: calculateEstimatedDate(position),
    }
  } catch (error) {
    captureError(error as Error, { domain })
    return null
  }
}

/**
 * Add domain to waitlist
 */
export async function addToWaitlist(data: WaitlistSignupData): Promise<WaitlistSignupResult> {
  try {
    const normalizedDomain = normalizeDomain(data.domain)
    
    // Check if already on waitlist
    const existing = await prisma.waitlistEntry.findFirst({
      where: { domain: normalizedDomain },
    })
    
    if (existing) {
      // Get position for existing entry
      const position = await getWaitlistPosition(normalizedDomain)
      
      trackEvent('waitlist.duplicate_signup', {
        domain: normalizedDomain,
        position: position?.position,
      })
      
      return {
        success: true,
        position: position || undefined,
      }
    }
    
    // Create new waitlist entry
    await prisma.waitlistEntry.create({
      data: {
        domain: normalizedDomain,
        email: data.email.toLowerCase(),
        variantData: data.referralSource ? { referralSource: data.referralSource } : undefined,
      },
    })
    
    // Get position for new entry
    const position = await getWaitlistPosition(normalizedDomain)
    
    trackEvent('waitlist.signup', {
      domain: normalizedDomain,
      position: position?.position,
      referralSource: data.referralSource,
    })
    
    return {
      success: true,
      position: position || undefined,
    }
  } catch (error) {
    captureError(error as Error, { data })
    
    return {
      success: false,
      error: 'Unable to add to waitlist. Please try again.',
    }
  }
}

/**
 * Check if domain is already on waitlist
 */
export async function isOnWaitlist(domain: string): Promise<boolean> {
  try {
    const normalizedDomain = normalizeDomain(domain)
    
    const count = await prisma.waitlistEntry.count({
      where: { domain: normalizedDomain },
    })
    
    return count > 0
  } catch (error) {
    captureError(error as Error, { domain })
    return false
  }
}

/**
 * Get waitlist stats for analytics
 */
export async function getWaitlistStats(): Promise<{
  totalCount: number
  todayCount: number
  weekCount: number
}> {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    
    const [totalCount, todayCount, weekCount] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.waitlistEntry.count({
        where: {
          createdAt: {
            gte: weekStart,
          },
        },
      }),
    ])
    
    return {
      totalCount,
      todayCount,
      weekCount,
    }
  } catch (error) {
    captureError(error as Error)
    
    return {
      totalCount: 0,
      todayCount: 0,
      weekCount: 0,
    }
  }
}