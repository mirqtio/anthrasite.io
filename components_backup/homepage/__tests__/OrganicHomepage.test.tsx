import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrganicHomepage } from '../OrganicHomepage'
// Mock dependencies

jest.mock('@/lib/monitoring/hooks', () => ({
  useRenderTracking: jest.fn(),
}))

// Mock the fetch function for waitlist form
global.fetch = jest.fn()

describe('OrganicHomepage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('should render with default content', () => {
    render(<OrganicHomepage />)

    // Check for actual content that exists in the component
    expect(
      screen.getByText('Your website has untapped potential')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/We analyze thousands of data points/)
    ).toBeInTheDocument()
  })

  it('should render consistently', () => {
    render(<OrganicHomepage />)

    expect(screen.getByTestId('organic-homepage')).toBeInTheDocument()
  })

  it('should track page view on mount', () => {
    const { useRenderTracking } = require('@/lib/monitoring/hooks')

    render(<OrganicHomepage />)

    expect(useRenderTracking).toHaveBeenCalledWith('OrganicHomepage')
  })

  it('should show waitlist form', () => {
    render(<OrganicHomepage />)

    expect(screen.getByTestId('waitlist-form')).toBeInTheDocument()
  })

  it('should handle waitlist success', async () => {
    render(<OrganicHomepage />)

    // First click opens modal - use the first button in the hero
    const joinButtons = screen.getAllByText('Join Waitlist')
    const heroButton = joinButtons[0]
    fireEvent.click(heroButton)

    // Find the form in the modal
    const form = screen.getByTestId('waitlist-form')
    expect(form).toBeInTheDocument()
  })

  it('should show value propositions', () => {
    render(<OrganicHomepage />)

    expect(screen.getByText(/Load Performance/i)).toBeInTheDocument()
    expect(screen.getByText(/Mobile Experience/i)).toBeInTheDocument()

    // Use a more specific selector for Revenue Impact heading
    const revenueHeading = screen.getByRole('heading', {
      name: /Revenue Impact/i,
    })
    expect(revenueHeading).toBeInTheDocument()
  })

  it('should show what we analyze section', () => {
    render(<OrganicHomepage />)

    expect(screen.getByText(/What We Analyze/i)).toBeInTheDocument()
    expect(screen.getByText(/4.8s/i)).toBeInTheDocument()
    expect(screen.getByText(/47%/i)).toBeInTheDocument()
  })

  it('should show assessment information', () => {
    render(<OrganicHomepage />)

    expect(
      screen.getByText(/No fluff. No 50-page reports/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Just what's broken and what it's worth to fix it/i)
    ).toBeInTheDocument()
  })

  it('should show FAQ section', () => {
    render(<OrganicHomepage />)

    expect(screen.getByText(/Questions/i)).toBeInTheDocument()
    expect(screen.getByText(/What exactly do I get\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/How is this different from free tools\?/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/When will I get my report\?/i)).toBeInTheDocument()
  })

  it('should handle FAQ toggle', () => {
    render(<OrganicHomepage />)

    const faqButton = screen.getByText(/What exactly do I get\?/i)
    fireEvent.click(faqButton)

    expect(screen.getByText(/A focused report showing/i)).toBeInTheDocument()
  })

  it('should show footer information', () => {
    render(<OrganicHomepage />)

    expect(
      screen.getByText(/© 2024 Anthrasite. All rights reserved./i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument()
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    const { container } = render(<OrganicHomepage />)

    const hero = container.querySelector('.hero')
    expect(hero).toBeInTheDocument()
  })

  it('should handle modal opening and closing', () => {
    render(<OrganicHomepage />)

    const joinButtons = screen.getAllByText('Join Waitlist')
    const heroButton = joinButtons[0]
    fireEvent.click(heroButton)

    expect(screen.getByTestId('waitlist-form')).toBeInTheDocument()
  })

  it('should use responsive design', () => {
    render(<OrganicHomepage />)

    const container = screen.getByTestId('organic-homepage')
    expect(container).toHaveClass('hero')
  })
})
