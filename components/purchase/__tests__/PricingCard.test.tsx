import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PricingCard } from '../PricingCard'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      transition,
      whileInView,
      viewport,
      ...props
    }: any) => <div {...props}>{children}</div>,
    p: ({
      children,
      initial,
      animate,
      transition,
      whileInView,
      viewport,
      ...props
    }: any) => <p {...props}>{children}</p>,
    button: ({
      children,
      initial,
      animate,
      transition,
      whileInView,
      whileTap,
      whileHover,
      viewport,
      onClick,
      ...props
    }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/analytics/analytics-client', () => ({
  trackEvent: jest.fn(),
}))

describe('PricingCard', () => {
  const mockOnCheckout = jest.fn()
  const mockRouter = { push: jest.fn() }

  const defaultProps = {
    businessName: 'Test Company',
    utm: 'test-utm-token',
    onCheckout: mockOnCheckout,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders pricing information', () => {
    render(<PricingCard {...defaultProps} />)

    expect(screen.getByText('$2,400')).toBeInTheDocument()
    expect(
      screen.getByText('in potential improvements identified')
    ).toBeInTheDocument()
  })

  it('renders all features', () => {
    render(<PricingCard {...defaultProps} />)

    const expectedFeatures = [
      'Complete 50+ page website audit report',
      'Technical SEO analysis & recommendations',
      'Performance optimization roadmap',
      'Priority-ranked action items with ROI estimates',
    ]

    expectedFeatures.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })

  it('renders CTA button', () => {
    render(<PricingCard {...defaultProps} />)

    const button = screen.getByTestId('checkout-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Get Your Report for $99')
  })

  it('handles checkout click', async () => {
    render(<PricingCard {...defaultProps} />)

    const button = screen.getByTestId('checkout-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnCheckout).toHaveBeenCalled()
    })
  })

  it('shows loading state during checkout', async () => {
    mockOnCheckout.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<PricingCard {...defaultProps} />)

    const button = screen.getByTestId('checkout-button')
    fireEvent.click(button)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(button).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByTestId('checkout-button')).toBeInTheDocument()
    })
  })

  it('handles checkout errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    mockOnCheckout.mockRejectedValue(new Error('Checkout failed'))

    render(<PricingCard {...defaultProps} />)

    const button = screen.getByTestId('checkout-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Checkout error:',
        expect.any(Error)
      )
    })

    consoleError.mockRestore()
  })

  it('renders trust indicators', () => {
    render(<PricingCard {...defaultProps} />)

    expect(
      screen.getByText('Secure payment · Instant delivery · 30-day guarantee')
    ).toBeInTheDocument()
  })
})
