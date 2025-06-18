import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PurchaseHomepage } from '../PurchaseHomepage'
import { trackEvent } from '@/lib/analytics/analytics-client'
import { createCheckoutSession } from '@/lib/stripe/checkout'
import { loadStripe } from '@stripe/stripe-js'

// Mock dependencies
jest.mock('@/lib/analytics/analytics-client', () => ({
  trackEvent: jest.fn(),
}))

jest.mock('@/lib/stripe/checkout', () => ({
  createCheckoutSession: jest.fn(),
}))

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}))

jest.mock('@/components/purchase/PurchaseHero', () => ({
  PurchaseHero: ({ businessName }: any) => (
    <div data-testid="purchase-hero">{businessName}</div>
  ),
}))

jest.mock('@/components/purchase/ReportPreview', () => ({
  ReportPreview: ({ domain }: any) => (
    <div data-testid="report-preview">Report for {domain}</div>
  ),
}))

jest.mock('@/components/purchase/PricingCard', () => ({
  PricingCard: ({ onPurchase, loading }: any) => (
    <div data-testid="pricing-card">
      <button onClick={onPurchase} disabled={loading}>
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  ),
}))

jest.mock('@/components/purchase/TrustSignals', () => ({
  TrustSignals: () => <div data-testid="trust-signals">Trust Signals</div>,
}))

describe('PurchaseHomepage', () => {
  const mockBusinessData = {
    businessId: 'biz_123',
    businessName: 'Test Business',
    domain: 'testbusiness.com',
    price: 9900,
    value: 49000,
    reportPreview: 'https://example.com/preview.pdf',
    utmHash: 'hash_123',
  }

  const mockStripe = {
    redirectToCheckout: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(loadStripe as jest.Mock).mockResolvedValue(mockStripe)
    ;(createCheckoutSession as jest.Mock).mockResolvedValue({
      sessionId: 'cs_test_123',
      error: null,
    })
  })

  it('should render all components with business data', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    expect(screen.getByTestId('purchase-hero')).toHaveTextContent(
      'Test Business'
    )
    expect(screen.getByTestId('report-preview')).toHaveTextContent(
      'Report for testbusiness.com'
    )
    expect(screen.getByTestId('pricing-card')).toBeInTheDocument()
    expect(screen.getByTestId('trust-signals')).toBeInTheDocument()
  })

  it('should track page view on mount', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    expect(trackEvent).toHaveBeenCalledWith('purchase_page_viewed', {
      business_id: 'biz_123',
      domain: 'testbusiness.com',
      price: 9900,
      value: 49000,
    })
  })

  it('should handle purchase click', async () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    const buyButton = screen.getByText('Buy Now')
    fireEvent.click(buyButton)

    expect(trackEvent).toHaveBeenCalledWith('checkout_initiated', {
      business_id: 'biz_123',
      price: 9900,
    })

    await waitFor(() => {
      expect(createCheckoutSession).toHaveBeenCalledWith({
        businessId: 'biz_123',
        businessName: 'Test Business',
        domain: 'testbusiness.com',
        price: 9900,
        utmHash: 'hash_123',
      })
    })

    expect(mockStripe.redirectToCheckout).toHaveBeenCalledWith({
      sessionId: 'cs_test_123',
    })
  })

  it('should show loading state during checkout', async () => {
    // Delay the checkout session creation
    ;(createCheckoutSession as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ sessionId: 'cs_test_123' }), 100)
        )
    )

    render(<PurchaseHomepage {...mockBusinessData} />)

    const buyButton = screen.getByText('Buy Now')
    fireEvent.click(buyButton)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(buyButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Buy Now')).toBeInTheDocument()
    })
  })

  it('should handle checkout session creation error', async () => {
    ;(createCheckoutSession as jest.Mock).mockResolvedValue({
      sessionId: null,
      error: 'Failed to create session',
    })

    const consoleError = jest.spyOn(console, 'error').mockImplementation()

    render(<PurchaseHomepage {...mockBusinessData} />)

    const buyButton = screen.getByText('Buy Now')
    fireEvent.click(buyButton)

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    expect(trackEvent).toHaveBeenCalledWith('checkout_error', {
      business_id: 'biz_123',
      error: 'Failed to create session',
    })

    consoleError.mockRestore()
  })

  it('should handle Stripe loading error', async () => {
    ;(loadStripe as jest.Mock).mockResolvedValue(null)

    render(<PurchaseHomepage {...mockBusinessData} />)

    const buyButton = screen.getByText('Buy Now')
    fireEvent.click(buyButton)

    await waitFor(() => {
      expect(
        screen.getByText(/payment system unavailable/i)
      ).toBeInTheDocument()
    })
  })

  it('should handle redirect error', async () => {
    mockStripe.redirectToCheckout.mockRejectedValue(
      new Error('Redirect failed')
    )

    render(<PurchaseHomepage {...mockBusinessData} />)

    const buyButton = screen.getByText('Buy Now')
    fireEvent.click(buyButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to redirect/i)).toBeInTheDocument()
    })
  })

  it('should show value proposition', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    expect(screen.getByText(/\$49,000/)).toBeInTheDocument()
    expect(screen.getByText(/identified value/i)).toBeInTheDocument()
  })

  it('should show urgency messaging', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    expect(screen.getByText(/limited time offer/i)).toBeInTheDocument()
    expect(screen.getByText(/price increases/i)).toBeInTheDocument()
  })

  it('should show guarantee information', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    expect(screen.getByText(/30-day money back guarantee/i)).toBeInTheDocument()
    expect(screen.getByText(/no questions asked/i)).toBeInTheDocument()
  })

  it('should handle missing optional props', () => {
    const minimalProps = {
      businessId: 'biz_123',
      businessName: 'Test Business',
      domain: 'testbusiness.com',
      price: 9900,
    }

    render(<PurchaseHomepage {...minimalProps} />)

    expect(screen.getByTestId('purchase-hero')).toBeInTheDocument()
  })

  it('should format price correctly', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    expect(screen.getByText('$99')).toBeInTheDocument()
  })

  it('should be responsive', () => {
    render(<PurchaseHomepage {...mockBusinessData} />)

    const container = screen.getByTestId('purchase-homepage')
    expect(container).toHaveClass('purchase-homepage-container')
  })
})
