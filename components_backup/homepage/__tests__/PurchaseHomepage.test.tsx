import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PurchaseHomepage } from '../PurchaseHomepage'
// Import removed - component doesn't use analytics-client directly

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

// Mock dependencies that the component actually uses

// Mock custom hooks
jest.mock('@/lib/utm/hooks', () => ({
  useUTMValidation: jest.fn(() => ({
    loading: false,
    valid: true,
    error: null,
    businessName: 'Test Business',
    reportData: { preview: 'test-preview' },
  })),
}))

jest.mock('@/lib/context/SiteModeContext', () => ({
  useSiteMode: jest.fn(() => ({
    businessId: 'test-business-id',
    mode: 'purchase',
  })),
}))

jest.mock('@/lib/monitoring/hooks', () => ({
  usePurchaseFunnelTracking: jest.fn(() => ({
    trackStep: jest.fn(),
  })),
  useRenderTracking: jest.fn(),
}))

jest.mock('@/lib/monitoring', () => ({
  trackEvent: jest.fn(),
}))

describe('PurchaseHomepage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render purchase homepage content', () => {
    render(<PurchaseHomepage />)

    expect(screen.getByTestId('purchase-homepage')).toBeInTheDocument()
    expect(
      screen.getByText(/Test Business, your audit is ready/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Get Your Report/i)).toBeInTheDocument()
  })

  it('should use render tracking hook', () => {
    const { useRenderTracking } = require('@/lib/monitoring/hooks')

    render(<PurchaseHomepage />)

    expect(useRenderTracking).toHaveBeenCalledWith('PurchaseHomepage')
  })

  it('should show main CTA button', () => {
    render(<PurchaseHomepage />)

    expect(screen.getByText(/Get Your Report - \$199/i)).toBeInTheDocument()
  })

  it('should show value proposition', () => {
    render(<PurchaseHomepage />)

    expect(screen.getByText(/\$12,450/)).toBeInTheDocument()
    expect(screen.getByText(/Monthly Impact/i)).toBeInTheDocument()
  })

  it('should show key findings preview', () => {
    render(<PurchaseHomepage />)

    expect(screen.getByText(/Your Top 3 Issues/i)).toBeInTheDocument()
    expect(screen.getByText(/Security Headers Missing/i)).toBeInTheDocument()
    expect(screen.getByText(/4.2s Load Time/i)).toBeInTheDocument()
  })

  it('should show FAQ section', () => {
    render(<PurchaseHomepage />)

    expect(screen.getByText(/Questions/i)).toBeInTheDocument()
    expect(
      screen.getByText(/What's in the full report\\?/i)
    ).toBeInTheDocument()
  })

  it('should show guarantee information', () => {
    render(<PurchaseHomepage />)

    expect(screen.getByText(/30-day money-back guarantee/i)).toBeInTheDocument()
  })

  it('should be responsive', () => {
    render(<PurchaseHomepage />)

    const container = screen.getByTestId('purchase-homepage')
    expect(container).toHaveClass('hero')
  })
})
