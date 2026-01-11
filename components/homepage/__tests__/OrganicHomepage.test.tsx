import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrganicHomepage } from '../OrganicHomepage'
// Mock dependencies

jest.mock('@/lib/monitoring/hooks', () => ({
  useRenderTracking: jest.fn(),
}))

// Mock the fetch function for form submissions
global.fetch = jest.fn()

// Mock IntersectionObserver (not available in jsdom)
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

describe('OrganicHomepage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('should render with hero content', () => {
    render(<OrganicHomepage />)

    // Check for main headline
    expect(
      screen.getByText(/Is your website costing you customers/i)
    ).toBeInTheDocument()
    // Check for subheadline
    expect(screen.getByText(/Find out in 2 minutes/i)).toBeInTheDocument()
  })

  it('should render form inputs', () => {
    render(<OrganicHomepage />)

    expect(screen.getByPlaceholderText('yourcompany.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
  })

  it('should render Analyze Website button', () => {
    render(<OrganicHomepage />)

    const buttons = screen.getAllByText('Analyze Website')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should show trust signals', () => {
    render(<OrganicHomepage />)

    expect(
      screen.getByText(/See your score and top issue free/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Results in under 2 minutes/i)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
  })

  it('should show How It Works section', () => {
    render(<OrganicHomepage />)

    // Multiple "How It Works" links in nav + section heading
    const howItWorksElements = screen.getAllByText('How It Works')
    expect(howItWorksElements.length).toBeGreaterThan(0)
    expect(screen.getByText('Find')).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
    expect(screen.getByText('Understand')).toBeInTheDocument()
    // Contact appears in steps and footer
    const contactElements = screen.getAllByText('Contact')
    expect(contactElements.length).toBeGreaterThan(0)
  })

  it('should show FAQ section', () => {
    render(<OrganicHomepage />)

    expect(screen.getByText(/What does Anthrasite do\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Do you actually look at my website\?/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/How is this different from free tools\?/i)
    ).toBeInTheDocument()
  })

  it('should handle FAQ toggle', () => {
    render(<OrganicHomepage />)

    const faqButton = screen.getByText(/What does Anthrasite do\?/i)
    fireEvent.click(faqButton)

    expect(
      screen.getByText(/We analyze your website using industry-standard tools/i)
    ).toBeInTheDocument()
  })

  it('should show footer information', () => {
    const { container } = render(<OrganicHomepage />)

    // Check for footer element and copyright text
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(
      /© \d{4} Anthrasite. All rights reserved./i
    )
    expect(footer).toHaveTextContent(/Privacy Policy/i)
    expect(footer).toHaveTextContent(/Terms of Service/i)
  })

  it('should validate URL input', async () => {
    render(<OrganicHomepage />)

    const urlInput = screen.getByPlaceholderText('yourcompany.com')

    // Enter invalid URL and blur
    fireEvent.change(urlInput, { target: { value: 'not a url' } })
    fireEvent.blur(urlInput)

    // Error should appear (matches actual message from component)
    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid website/i)
      ).toBeInTheDocument()
    })
  })

  it('should render navigation links', () => {
    render(<OrganicHomepage />)

    // Multiple About Us links exist (nav, mobile nav, potentially footer)
    const aboutLinks = screen.getAllByRole('link', { name: /About Us/i })
    expect(aboutLinks.length).toBeGreaterThan(0)

    // Footer links (Privacy, Terms)
    const privacyLinks = screen.getAllByRole('link', {
      name: /Privacy Policy/i,
    })
    expect(privacyLinks.length).toBeGreaterThan(0)
    const termsLinks = screen.getAllByRole('link', {
      name: /Terms of Service/i,
    })
    expect(termsLinks.length).toBeGreaterThan(0)
  })
})
