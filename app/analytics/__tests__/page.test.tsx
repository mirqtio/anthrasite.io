import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnalyticsPage from '../page'

// Mock the analytics components
jest.mock('@/components/analytics/FunnelVisualization', () => ({
  FunnelVisualization: ({ title, steps }: any) => (
    <div data-testid="funnel-visualization">
      <h3>{title}</h3>
      {steps.map((step: any) => (
        <div key={step.name} data-testid={`funnel-step-${step.name}`}>
          {step.name}: {step.count} ({step.percentage}%)
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/analytics/ABTestResults', () => ({
  ABTestResults: ({ test, onDeploy }: any) => (
    <div data-testid="ab-test-results">
      <h3>{test.name}</h3>
      <div>Status: {test.status}</div>
      {test.variants.map((variant: any) => (
        <div key={variant.id} data-testid={`variant-${variant.id}`}>
          {variant.name}: {variant.conversionRate}%
          {variant.isWinner && (
            <button onClick={() => onDeploy(variant.id)}>Deploy</button>
          )}
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/Card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}))

describe('AnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render the analytics dashboard', () => {
    render(<AnalyticsPage />)

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Track performance, conversions, and A/B test results')
    ).toBeInTheDocument()
  })

  it('should display key metrics cards', () => {
    render(<AnalyticsPage />)

    // Check metrics
    expect(screen.getByText('Total Visitors')).toBeInTheDocument()
    expect(screen.getByText('45,678')).toBeInTheDocument()
    expect(screen.getByText('+12.5% from last week')).toBeInTheDocument()

    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
    expect(screen.getByText('15.2%')).toBeInTheDocument()
    expect(screen.getByText('+2.1% from last week')).toBeInTheDocument()

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$148,500')).toBeInTheDocument()
    expect(screen.getByText('+18.3% from last week')).toBeInTheDocument()

    expect(screen.getByText('Active Tests')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2 nearing significance')).toBeInTheDocument()
  })

  it('should render funnel visualization with correct data', () => {
    render(<AnalyticsPage />)

    const funnel = screen.getByTestId('funnel-visualization')
    expect(funnel).toBeInTheDocument()
    expect(screen.getByText('Main Purchase Funnel')).toBeInTheDocument()

    // Check funnel steps
    expect(screen.getByTestId('funnel-step-Homepage Visit')).toHaveTextContent(
      'Homepage Visit: 10000 (100%)'
    )
    expect(screen.getByTestId('funnel-step-UTM Validated')).toHaveTextContent(
      'UTM Validated: 7500 (75%)'
    )
    expect(screen.getByTestId('funnel-step-Purchase Page')).toHaveTextContent(
      'Purchase Page: 6000 (60%)'
    )
    expect(
      screen.getByTestId('funnel-step-Checkout Started')
    ).toHaveTextContent('Checkout Started: 3000 (30%)')
    expect(
      screen.getByTestId('funnel-step-Payment Completed')
    ).toHaveTextContent('Payment Completed: 1500 (15%)')
  })

  it('should render A/B test results', () => {
    render(<AnalyticsPage />)

    expect(screen.getByText('A/B Test Results')).toBeInTheDocument()

    const abTestResults = screen.getByTestId('ab-test-results')
    expect(abTestResults).toBeInTheDocument()
    expect(screen.getByText('Homepage CTA Button Test')).toBeInTheDocument()
    expect(screen.getByText('Status: completed')).toBeInTheDocument()

    // Check variants
    expect(screen.getByTestId('variant-control')).toHaveTextContent(
      'Get Started (Control): 3%'
    )
    expect(screen.getByTestId('variant-variant-a')).toHaveTextContent(
      'Start Free Trial: 3.6%'
    )
    expect(screen.getByTestId('variant-variant-b')).toHaveTextContent(
      'Get Your Audit: 3.2%'
    )
  })

  it('should handle deploy variant action', () => {
    render(<AnalyticsPage />)

    const deployButton = screen.getByText('Deploy')
    fireEvent.click(deployButton)

    expect(console.log).toHaveBeenCalledWith('Deploying variant:', 'variant-a')
  })

  it('should have proper layout structure', () => {
    const { container } = render(<AnalyticsPage />)

    expect(container.querySelector('main')).toHaveClass(
      'min-h-screen',
      'bg-gray-50',
      'py-12'
    )
    expect(container.querySelector('.container')).toHaveClass('mx-auto', 'px-4')
    expect(container.querySelector('.max-w-7xl')).toHaveClass('mx-auto')
  })

  it('should display metrics in a grid layout', () => {
    const { container } = render(<AnalyticsPage />)

    const metricsGrid = container.querySelector('.grid')
    expect(metricsGrid).toHaveClass(
      'grid-cols-1',
      'md:grid-cols-4',
      'gap-6',
      'mb-8'
    )

    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(4)
  })

  it('should apply correct styling to headers', () => {
    render(<AnalyticsPage />)

    const mainHeader = screen.getByText('Analytics Dashboard')
    expect(mainHeader).toHaveClass(
      'text-3xl',
      'font-bold',
      'text-anthracite-black'
    )

    const subHeader = screen.getByText('A/B Test Results')
    expect(subHeader).toHaveClass(
      'text-2xl',
      'font-semibold',
      'text-anthracite-black',
      'mb-6'
    )
  })

  it('should render metric values with proper formatting', () => {
    const { container } = render(<AnalyticsPage />)

    const metricValues = container.querySelectorAll('.text-3xl.font-bold')
    expect(metricValues).toHaveLength(4)

    metricValues.forEach((value) => {
      expect(value).toHaveClass('text-anthracite-black', 'mt-2')
    })
  })
})
