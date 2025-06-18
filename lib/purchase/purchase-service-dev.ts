/**
 * Development-only mock purchase service for testing the purchase flow
 * WITHOUT any backend dependencies or valid UTM tokens
 */

import { Business } from '@prisma/client'
import {
  PurchasePageData,
  CheckoutSession,
  ReportPreviewData,
} from './purchase-service'

// Mock business data for development
const MOCK_BUSINESSES: Record<string, Business> = {
  'dev-business-1': {
    id: 'dev-business-1',
    domain: 'acmecorp.com',
    name: 'Acme Corporation',
    email: 'test@acmecorp.com',
    reportData: {
      scores: {
        performance: 75,
        seo: 82,
        security: 88,
        accessibility: 71,
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  'dev-business-2': {
    id: 'dev-business-2',
    domain: 'testcompany.io',
    name: 'Test Company',
    email: 'hello@testcompany.io',
    reportData: {
      scores: {
        performance: 68,
        seo: 91,
        security: 79,
        accessibility: 85,
      },
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  'dev-business-3': {
    id: 'dev-business-3',
    domain: 'acmecorp.com',
    name: 'ACME Corporation',
    email: 'contact@acmecorp.com',
    reportData: {
      scores: {
        performance: 82,
        seo: 77,
        security: 93,
        accessibility: 88,
      },
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  'mock-business-1': {
    id: 'mock-business-1',
    domain: 'acmecorp.com',
    name: 'Acme Corp',
    email: 'info@acmecorp.com',
    reportData: {
      scores: {
        performance: 85,
        seo: 78,
        security: 92,
        accessibility: 88,
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  'mock-business-2': {
    id: 'mock-business-2',
    domain: 'techstartup.io',
    name: 'TechStartup Inc',
    email: 'hello@techstartup.io',
    reportData: {
      scores: {
        performance: 72,
        seo: 88,
        security: 81,
        accessibility: 79,
      },
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
}

// Mock UTM tokens for development
const MOCK_UTM_TOKENS: Record<string, { businessId: string; used: boolean }> = {
  'dev-utm-valid': { businessId: 'dev-business-1', used: false },
  'dev-utm-used': { businessId: 'dev-business-2', used: true },
  'dev-utm-test': { businessId: 'dev-business-3', used: false },
  'mock-hash-123': { businessId: 'mock-business-1', used: false },
  'mock-hash-456': { businessId: 'mock-business-2', used: false },
}

/**
 * Mock implementation of fetchBusinessByUTM for development
 */
export async function fetchBusinessByUTMDev(
  utm: string
): Promise<PurchasePageData | null> {
  // Simulate async behavior
  await new Promise((resolve) => setTimeout(resolve, 500))

  const tokenData = MOCK_UTM_TOKENS[utm]
  if (!tokenData) {
    return null
  }

  const business = MOCK_BUSINESSES[tokenData.businessId]
  if (!business) {
    return null
  }

  return {
    business,
    utm,
    isValid: !tokenData.used,
  }
}

/**
 * Mock implementation of createCheckoutSession for development
 */
export async function createCheckoutSessionDev(
  businessId: string,
  utm: string
): Promise<CheckoutSession | null> {
  // Simulate async behavior
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const business = MOCK_BUSINESSES[businessId]
  if (!business) {
    return null
  }

  // Generate mock session data
  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id: sessionId,
    url: `/test-purchase/checkout-simulator?session=${sessionId}&business=${businessId}`,
    amountCents: 9900, // $99.00
  }
}

/**
 * Mock implementation of markUTMAsUsed for development
 */
export async function markUTMAsUsedDev(utm: string): Promise<boolean> {
  // Simulate async behavior
  await new Promise((resolve) => setTimeout(resolve, 200))

  const tokenData = MOCK_UTM_TOKENS[utm]
  if (tokenData) {
    tokenData.used = true
    return true
  }

  return false
}

/**
 * Enhanced report preview for development testing
 */
export function getReportPreviewDev(business: Business): ReportPreviewData {
  const reportData = (business.reportData as any) || {}
  const scores = reportData.scores || {}

  const domain = business.domain

  // Different improvement sets based on business
  const improvementSets: Record<string, string[]> = {
    'example.com': [
      'Optimize image loading for 40% faster page speed',
      'Fix 15 critical SEO issues affecting search rankings',
      'Implement security headers to protect user data',
    ],
    'testcompany.io': [
      'Reduce JavaScript bundle size by 35%',
      'Improve Core Web Vitals scores by 25%',
      'Add structured data for better search results',
    ],
    'acmecorp.com': [
      'Enable browser caching for static assets',
      'Compress images to save 2.3MB of bandwidth',
      'Fix broken links affecting user experience',
    ],
  }

  const improvements = improvementSets[domain] || [
    'Improve page load time by 30%',
    'Fix accessibility issues for better compliance',
    'Optimize mobile experience for higher conversions',
  ]

  return {
    domain,
    metrics: {
      performanceScore: scores.performance || 75,
      seoScore: scores.seo || 82,
      securityScore: scores.security || 88,
      accessibilityScore: scores.accessibility || 71,
    },
    improvements,
    estimatedValue: '$2,500 - $5,000 per month',
  }
}

/**
 * Get all available mock businesses for development
 */
export function getMockBusinesses() {
  return Object.values(MOCK_BUSINESSES)
}

/**
 * Get all available mock UTM tokens for development
 */
export function getMockUTMTokens() {
  return Object.entries(MOCK_UTM_TOKENS).map(([token, data]) => ({
    token,
    businessId: data.businessId,
    businessName: MOCK_BUSINESSES[data.businessId]?.name || 'Unknown',
    used: data.used,
  }))
}
