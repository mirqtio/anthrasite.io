import { prisma } from '@/lib/db'
import { Business } from '@prisma/client'
import { validateUTMToken } from '@/lib/utm/crypto'
import { createCheckoutSession as createStripeSession } from '@/lib/stripe/checkout'
import { headers } from 'next/headers'
import { AbandonedCartService } from '@/lib/abandoned-cart/service'
import { 
  fetchBusinessByUTMDev, 
  createCheckoutSessionDev, 
  markUTMAsUsedDev,
  getReportPreviewDev 
} from './purchase-service-dev'

// Check if we're in development mode and should use mock data
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' && 
         process.env.NEXT_PUBLIC_USE_MOCK_PURCHASE === 'true'
}

export interface PurchasePageData {
  business: Business
  utm: string
  isValid: boolean
}

export interface CheckoutSession {
  id: string
  url: string
  amountCents: number
}

/**
 * Fetches business data based on UTM token
 */
export async function fetchBusinessByUTM(utm: string): Promise<PurchasePageData | null> {
  // Use mock data in development mode
  if (isDevelopmentMode()) {
    return fetchBusinessByUTMDev(utm)
  }
  
  try {
    // Validate the UTM token
    const validation = await validateUTMToken(utm)
    
    if (!validation.valid || !validation.payload) {
      return null
    }
    
    // Fetch business data
    const business = await prisma.business.findUnique({
      where: {
        id: validation.payload.businessId,
      },
    })
    
    if (!business) {
      return null
    }
    
    // Check if UTM token has been used
    const utmToken = await prisma.utmToken.findUnique({
      where: {
        nonce: validation.payload.nonce,
      },
    })
    
    // If token exists and has been used, still allow viewing but don't allow purchase
    const isValid = !utmToken?.usedAt
    
    return {
      business,
      utm,
      isValid,
    }
  } catch (error) {
    console.error('Error fetching business by UTM:', error)
    return null
  }
}

/**
 * Creates a Stripe checkout session
 */
export async function createCheckoutSession(
  businessId: string,
  utm: string
): Promise<CheckoutSession | null> {
  // Use mock session in development mode
  if (isDevelopmentMode()) {
    return createCheckoutSessionDev(businessId, utm)
  }
  
  try {
    // Get the request headers to build the base URL
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    // Validate UTM token first
    const validation = await validateUTMToken(utm)
    if (!validation.valid || !validation.payload) {
      throw new Error('Invalid UTM token')
    }
    
    // Get business details for customer email
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })
    
    if (!business) {
      throw new Error('Business not found')
    }
    
    // Create Stripe checkout session
    const session = await createStripeSession({
      businessId,
      utmToken: utm,
      customerEmail: business.email || undefined,
      baseUrl,
    })
    
    // Track abandoned cart
    const abandonedCartService = new AbandonedCartService({ baseUrl })
    await abandonedCartService.trackAbandonedSession({
      session,
      businessId,
      utmToken: utm,
    })
    
    return {
      id: session.id,
      url: session.url!,
      amountCents: session.amount_total || 9900,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return null
  }
}

/**
 * Marks a UTM token as used
 */
export async function markUTMAsUsed(utm: string): Promise<boolean> {
  // Use mock implementation in development mode
  if (isDevelopmentMode()) {
    return markUTMAsUsedDev(utm)
  }
  
  try {
    const validation = await validateUTMToken(utm)
    
    if (!validation.valid || !validation.payload) {
      return false
    }
    
    await prisma.utmToken.update({
      where: {
        nonce: validation.payload.nonce,
      },
      data: {
        usedAt: new Date(),
      },
    })
    
    return true
  } catch (error) {
    console.error('Error marking UTM as used:', error)
    return false
  }
}

/**
 * Get report preview data for a business
 */
export interface ReportPreviewData {
  domain: string
  metrics: {
    performanceScore: number
    seoScore: number
    securityScore: number
    accessibilityScore: number
  }
  improvements: string[]
  estimatedValue: string
}

export function getReportPreview(business: Business): ReportPreviewData {
  // Use mock preview in development mode
  if (isDevelopmentMode()) {
    return getReportPreviewDev(business)
  }
  
  // Generate preview data based on business domain
  // In production, this would use actual analysis data
  
  const domain = business.domain
  
  // Mock scores for now
  const scores = {
    performanceScore: Math.floor(Math.random() * 30) + 60, // 60-90
    seoScore: Math.floor(Math.random() * 25) + 70, // 70-95
    securityScore: Math.floor(Math.random() * 20) + 75, // 75-95
    accessibilityScore: Math.floor(Math.random() * 30) + 65, // 65-95
  }
  
  const improvements = [
    'Optimize image loading for 40% faster page speed',
    'Fix 15 critical SEO issues affecting search rankings',
    'Implement security headers to protect user data',
    'Improve accessibility for 20% more potential customers',
    'Reduce JavaScript bundle size by 35%',
  ]
  
  // Shuffle and take 3 improvements
  const selectedImprovements = improvements
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  return {
    domain,
    metrics: scores,
    improvements: selectedImprovements,
    estimatedValue: '$2,500 - $5,000 per month',
  }
}