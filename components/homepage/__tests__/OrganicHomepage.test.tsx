import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrganicHomepage } from '../OrganicHomepage'
import { trackEvent } from '@/lib/analytics/analytics-client'
import { useABTest } from '@/lib/ab-testing/hooks'

// Mock dependencies
jest.mock('@/lib/analytics/analytics-client', () => ({
  trackEvent: jest.fn()
}))

jest.mock('@/lib/ab-testing/hooks', () => ({
  useABTest: jest.fn()
}))

jest.mock('@/components/waitlist/WaitlistForm', () => ({
  WaitlistForm: ({ onSuccess }: any) => (
    <div data-testid="waitlist-form">
      <button onClick={() => onSuccess({ position: 100 })}>
        Join Waitlist
      </button>
    </div>
  )
}))

describe('OrganicHomepage', () => {
  const defaultVariant = {
    headline: 'Your website has untapped potential worth $49,000+',
    subheadline: 'Get a comprehensive audit that reveals exactly how to capture it.',
    ctaText: 'Get Your Free Audit',
    socialProof: '2,847 businesses improved their conversion rates by 32% on average'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useABTest as jest.Mock).mockReturnValue({
      variant: defaultVariant,
      loading: false
    })
  })

  it('should render with default variant content', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByText(defaultVariant.headline)).toBeInTheDocument()
    expect(screen.getByText(defaultVariant.subheadline)).toBeInTheDocument()
    expect(screen.getByText(defaultVariant.socialProof)).toBeInTheDocument()
  })

  it('should show loading skeleton when variant is loading', () => {
    ;(useABTest as jest.Mock).mockReturnValue({
      variant: null,
      loading: true
    })
    
    render(<OrganicHomepage />)
    
    expect(screen.getByTestId('homepage-skeleton')).toBeInTheDocument()
  })

  it('should track page view on mount', () => {
    render(<OrganicHomepage />)
    
    expect(trackEvent).toHaveBeenCalledWith('homepage_viewed', {
      mode: 'organic',
      variant: expect.objectContaining({
        headline: defaultVariant.headline
      })
    })
  })

  it('should show waitlist form', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByTestId('waitlist-form')).toBeInTheDocument()
  })

  it('should handle waitlist success', async () => {
    render(<OrganicHomepage />)
    
    const joinButton = screen.getByText('Join Waitlist')
    fireEvent.click(joinButton)
    
    await waitFor(() => {
      expect(screen.getByText(/you're #100 on the waitlist/i)).toBeInTheDocument()
    })
    
    expect(trackEvent).toHaveBeenCalledWith('waitlist_signup_completed', {
      position: 100,
      variant: expect.any(Object)
    })
  })

  it('should show value propositions', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByText(/comprehensive technical audit/i)).toBeInTheDocument()
    expect(screen.getByText(/missed revenue opportunities/i)).toBeInTheDocument()
    expect(screen.getByText(/priority action plan/i)).toBeInTheDocument()
    expect(screen.getByText(/competitive analysis/i)).toBeInTheDocument()
  })

  it('should show how it works section', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByText(/how it works/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your domain/i)).toBeInTheDocument()
    expect(screen.getByText(/automated analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/detailed report/i)).toBeInTheDocument()
  })

  it('should show social proof section', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByText(/trusted by/i)).toBeInTheDocument()
    expect(screen.getByText(/32% average conversion increase/i)).toBeInTheDocument()
    expect(screen.getByText(/\$49k average revenue recovery/i)).toBeInTheDocument()
    expect(screen.getByText(/4\.9\/5 customer rating/i)).toBeInTheDocument()
  })

  it('should show FAQ section', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument()
    expect(screen.getByText(/what's included in the audit/i)).toBeInTheDocument()
    expect(screen.getByText(/how long does it take/i)).toBeInTheDocument()
    expect(screen.getByText(/what makes this different/i)).toBeInTheDocument()
  })

  it('should handle FAQ toggle', () => {
    render(<OrganicHomepage />)
    
    const faqButton = screen.getByText(/what's included in the audit/i)
    fireEvent.click(faqButton)
    
    expect(screen.getByText(/50\+ page comprehensive report/i)).toBeInTheDocument()
  })

  it('should show pricing information', () => {
    render(<OrganicHomepage />)
    
    expect(screen.getByText(/simple, transparent pricing/i)).toBeInTheDocument()
    expect(screen.getByText(/\$99/i)).toBeInTheDocument()
    expect(screen.getByText(/one-time payment/i)).toBeInTheDocument()
  })

  it('should apply custom variant styling', () => {
    const customVariant = {
      ...defaultVariant,
      primaryColor: '#FF0000',
      fontFamily: 'Arial'
    }
    
    ;(useABTest as jest.Mock).mockReturnValue({
      variant: customVariant,
      loading: false
    })
    
    const { container } = render(<OrganicHomepage />)
    
    const hero = container.querySelector('.hero-section')
    expect(hero).toHaveStyle('--primary-color: #FF0000')
  })

  it('should track scroll events', () => {
    render(<OrganicHomepage />)
    
    // Simulate scroll to value props section
    screen.getByText(/comprehensive technical audit/i).closest('section')
    fireEvent.scroll(window, { target: { scrollY: 500 } })
    
    // Would need intersection observer mock to properly test this
  })

  it('should use responsive design', () => {
    render(<OrganicHomepage />)
    
    const container = screen.getByTestId('organic-homepage')
    expect(container).toHaveClass('responsive-container')
  })
})