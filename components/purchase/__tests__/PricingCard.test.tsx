import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PricingCard } from '../PricingCard'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, whileInView, viewport, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
    
    expect(screen.getByText('$99')).toBeInTheDocument()
    expect(screen.getByText('one-time')).toBeInTheDocument()
    expect(screen.getByText('For Test Company')).toBeInTheDocument()
  })
  
  it('renders all features', () => {
    render(<PricingCard {...defaultProps} />)
    
    const expectedFeatures = [
      'Complete 50+ page website audit report',
      'Technical SEO analysis & recommendations',
      'Performance optimization roadmap',
      'Security vulnerability assessment',
      'Mobile responsiveness analysis',
      'Competitor comparison insights',
      'Priority-ranked action items',
      'ROI estimates for improvements',
      'Implementation guides included',
      '30-day money-back guarantee',
    ]
    
    expectedFeatures.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })
  
  it('renders CTA button', () => {
    render(<PricingCard {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /get your report now/i })
    expect(button).toBeInTheDocument()
  })
  
  it('handles checkout click', async () => {
    render(<PricingCard {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /get your report now/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockOnCheckout).toHaveBeenCalled()
    })
  })
  
  it('shows loading state during checkout', async () => {
    mockOnCheckout.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<PricingCard {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /get your report now/i })
    fireEvent.click(button)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(button).toBeDisabled()
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /get your report now/i })).toBeInTheDocument()
    })
  })
  
  it('handles checkout errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    mockOnCheckout.mockRejectedValue(new Error('Checkout failed'))
    
    render(<PricingCard {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /get your report now/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Checkout error:', expect.any(Error))
    })
    
    consoleError.mockRestore()
  })
  
  it('renders trust indicators', () => {
    render(<PricingCard {...defaultProps} />)
    
    expect(screen.getByText('Secure payment')).toBeInTheDocument()
    expect(screen.getByText('24hr delivery')).toBeInTheDocument()
    expect(screen.getByText('Instant access')).toBeInTheDocument()
  })
  
  it('renders support email link', () => {
    render(<PricingCard {...defaultProps} />)
    
    const emailLink = screen.getByRole('link', { name: /support@anthrasite.io/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:support@anthrasite.io')
  })
  
  it('renders money-back guarantee text', () => {
    render(<PricingCard {...defaultProps} />)
    
    // There are multiple instances of this text, so check for all
    const guaranteeTexts = screen.getAllByText(/30-day money-back guarantee/)
    expect(guaranteeTexts.length).toBeGreaterThan(0)
    
    // Check the specific text in the footer
    expect(screen.getByText('Your purchase is protected by our 30-day money-back guarantee')).toBeInTheDocument()
  })
})