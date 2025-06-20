import { render, screen } from '@testing-library/react'
import RecoverPage from '../page'
import { getAbandonedCartByToken } from '@/lib/abandoned-cart/tracker'
import { AbandonedCartService } from '@/lib/abandoned-cart/service'
import { retrieveSession } from '@/lib/stripe/checkout'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/abandoned-cart/tracker')
jest.mock('@/lib/abandoned-cart/service')
jest.mock('@/lib/stripe/checkout')
jest.mock('next/navigation')

// Mock Suspense to render children immediately
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: { children: React.ReactNode }) => children,
}))

describe('RecoverPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to homepage if no token provided', async () => {
    const searchParams = Promise.resolve({})

    await RecoverPage({ searchParams })

    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('should show invalid recovery link message for invalid token', async () => {
    ;(getAbandonedCartByToken as jest.Mock).mockResolvedValue(null)

    const searchParams = Promise.resolve({ token: 'invalid-token' })

    const result = await RecoverPage({ searchParams })

    // Since we're testing the server component, we need to render the result
    const { container } = render(result as React.ReactElement)

    expect(screen.getByText('Invalid Recovery Link')).toBeInTheDocument()
    expect(
      screen.getByText(/This recovery link is invalid or has expired/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Go to Homepage' })
    ).toHaveAttribute('href', '/')
  })

  it('should show already recovered message for recovered carts', async () => {
    const mockCart = {
      id: 'cart-123',
      recovered: true,
      sessionExpiresAt: new Date(Date.now() + 86400000),
    }

    ;(getAbandonedCartByToken as jest.Mock).mockResolvedValue(mockCart)

    const searchParams = Promise.resolve({ token: 'recovery-token' })

    const result = await RecoverPage({ searchParams })
    const { container } = render(result as React.ReactElement)

    expect(screen.getByText('Already Recovered')).toBeInTheDocument()
    expect(
      screen.getByText(/This cart has already been recovered/)
    ).toBeInTheDocument()
  })

  it('should show session expired message for expired sessions', async () => {
    const mockCart = {
      id: 'cart-123',
      recovered: false,
      sessionExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      utmToken: 'utm-123',
    }

    ;(getAbandonedCartByToken as jest.Mock).mockResolvedValue(mockCart)

    const searchParams = Promise.resolve({ token: 'recovery-token' })

    const result = await RecoverPage({ searchParams })
    const { container } = render(result as React.ReactElement)

    expect(screen.getByText('Session Expired')).toBeInTheDocument()
    expect(
      screen.getByText(/Your checkout session has expired/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start New Purchase' })
    ).toHaveAttribute('href', '/purchase?utm=utm-123')
  })

  it('should show session not found message when Stripe session is missing', async () => {
    const mockCart = {
      id: 'cart-123',
      recovered: false,
      sessionExpiresAt: new Date(Date.now() + 86400000),
      stripeSessionId: 'cs_test_123',
      utmToken: 'utm-123',
    }

    ;(getAbandonedCartByToken as jest.Mock).mockResolvedValue(mockCart)
    ;(retrieveSession as jest.Mock).mockResolvedValue(null)

    const searchParams = Promise.resolve({ token: 'recovery-token' })

    const result = await RecoverPage({ searchParams })
    const { container } = render(result as React.ReactElement)

    expect(screen.getByText('Session Not Found')).toBeInTheDocument()
    expect(
      screen.getByText(/We couldn't find your checkout session/)
    ).toBeInTheDocument()
  })

  it('should redirect to Stripe checkout for valid recovery', async () => {
    const mockCart = {
      id: 'cart-123',
      recovered: false,
      sessionExpiresAt: new Date(Date.now() + 86400000),
      stripeSessionId: 'cs_test_123',
      utmToken: 'utm-123',
    }

    const mockStripeSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    }

    const mockMarkRecovered = jest.fn().mockResolvedValue({ success: true })

    ;(getAbandonedCartByToken as jest.Mock).mockResolvedValue(mockCart)
    ;(retrieveSession as jest.Mock).mockResolvedValue(mockStripeSession)
    ;(AbandonedCartService as jest.Mock).mockImplementation(() => ({
      markRecovered: mockMarkRecovered,
    }))

    const searchParams = Promise.resolve({ token: 'recovery-token' })

    await RecoverPage({ searchParams })

    expect(mockMarkRecovered).toHaveBeenCalledWith('recovery-token')
    expect(redirect).toHaveBeenCalledWith(
      'https://checkout.stripe.com/pay/cs_test_123'
    )
  })
})
