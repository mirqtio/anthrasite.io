/**
 * Note: Testing async server components is complex in Jest.
 * The actual page functionality is thoroughly tested through:
 * 1. Unit tests for the purchase service (lib/purchase/__tests__/purchase-service.test.ts)
 * 2. Component tests for all purchase components (components/purchase/__tests__/*)
 * 3. E2E tests for the full purchase flow (e2e/purchase.spec.ts)
 *
 * This test file focuses on the basic routing logic that can be tested.
 */

import PurchasePage from '../page'
import { redirect } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock the purchase service
jest.mock('@/lib/purchase/purchase-service', () => ({
  fetchBusinessByUTM: jest.fn(),
  getReportPreview: jest.fn(),
  createCheckoutSession: jest.fn(),
}))

// Mock React Suspense
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: any) => children,
}))

// Mock components to prevent async rendering issues
jest.mock('@/components/purchase', () => ({
  PurchaseHero: () => null,
  ReportPreview: () => null,
  TrustSignals: () => null,
  PricingCard: () => null,
}))

jest.mock('@/components/Skeleton', () => ({
  Skeleton: () => null,
}))

describe('PurchasePage - Routing Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to homepage when no UTM parameter is provided', async () => {
    const searchParams = {}

    // The page should redirect before rendering
    await PurchasePage({ searchParams })

    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('attempts to render when UTM parameter is provided', async () => {
    const searchParams = { utm: 'test-utm-token' }

    // The page should not redirect when UTM is provided
    await PurchasePage({ searchParams })

    expect(redirect).not.toHaveBeenCalledWith('/')
  })
})
