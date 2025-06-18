import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Logo from '../Logo'

describe('Logo', () => {
  it('should render the logo', () => {
    render(<Logo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
  })

  it('should have correct default size', () => {
    render(<Logo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveClass('h-8')
  })

  it('should accept custom size', () => {
    render(<Logo size="large" />)

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveClass('h-12')
  })

  it('should accept custom className', () => {
    render(<Logo className="custom-class" />)

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveClass('custom-class')
  })

  it('should render as a link when href is provided', () => {
    render(<Logo href="/" />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('should not render as a link when href is not provided', () => {
    render(<Logo />)

    const link = screen.queryByRole('link')
    expect(link).not.toBeInTheDocument()
  })

  it('should have proper alt text for accessibility', () => {
    render(<Logo />)

    const img = screen.getByAltText('Anthrasite')
    expect(img).toBeInTheDocument()
  })

  it('should render SVG logo', () => {
    render(<Logo />)

    const svg = screen.getByTestId('logo-svg')
    expect(svg).toBeInTheDocument()
  })

  it('should apply dark mode styles', () => {
    render(<Logo darkMode />)

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveClass('text-white')
  })

  it('should combine multiple classNames', () => {
    render(<Logo className="custom-1 custom-2" />)

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveClass('custom-1', 'custom-2')
  })

  it('should have correct viewBox for SVG', () => {
    render(<Logo />)

    const svg = screen.getByTestId('logo-svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 200 40')
  })

  it('should be focusable when used as a link', () => {
    render(<Logo href="/" />)

    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('tabindex', '-1')
  })

  it('should have correct aria-label', () => {
    render(<Logo href="/" />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Anthrasite homepage')
  })
})
