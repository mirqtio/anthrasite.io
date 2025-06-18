import { render, screen } from '@testing-library/react'
import { ReportPreview } from '../ReportPreview'
import { ReportPreviewData } from '@/lib/purchase/purchase-service'

// Mock framer-motion
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
  },
}))

describe('ReportPreview', () => {
  const mockPreview: ReportPreviewData = {
    domain: 'example.com',
    metrics: {
      performanceScore: 75,
      seoScore: 82,
      securityScore: 90,
      accessibilityScore: 68,
    },
    improvements: [
      'Optimize image loading for faster performance',
      'Fix SEO meta tags',
      'Improve accessibility compliance',
    ],
    estimatedValue: '$2,500 - $5,000 per month',
  }

  it('renders all metric scores', () => {
    render(<ReportPreview preview={mockPreview} />)

    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('82')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText('68')).toBeInTheDocument()
  })

  it('renders metric labels', () => {
    render(<ReportPreview preview={mockPreview} />)

    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('SEO')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Accessibility')).toBeInTheDocument()
  })

  it('renders improvements list', () => {
    render(<ReportPreview preview={mockPreview} />)

    mockPreview.improvements.forEach((improvement) => {
      expect(screen.getByText(improvement)).toBeInTheDocument()
    })
  })

  it('renders estimated value', () => {
    render(<ReportPreview preview={mockPreview} />)

    expect(screen.getByText(mockPreview.estimatedValue)).toBeInTheDocument()
  })

  it('applies correct color classes based on scores', () => {
    render(<ReportPreview preview={mockPreview} />)

    // Performance score (75) should be yellow
    const performanceScore = screen.getByText('75')
    expect(performanceScore).toHaveClass('text-yellow-500')

    // Security score (90) should be accent (green)
    const securityScore = screen.getByText('90')
    expect(securityScore).toHaveClass('text-accent')

    // Accessibility score (68) should be red
    const accessibilityScore = screen.getByText('68')
    expect(accessibilityScore).toHaveClass('text-red-500')
  })

  it("renders what's included sections", () => {
    render(<ReportPreview preview={mockPreview} />)

    expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
    expect(screen.getByText('Actionable Insights')).toBeInTheDocument()

    expect(
      screen.getByText(/50\+ page comprehensive report/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Priority-ranked improvements/)).toBeInTheDocument()
  })

  it('references the domain in the header', () => {
    render(<ReportPreview preview={mockPreview} />)

    expect(
      screen.getByText(
        /Here's a preview of what we discovered about example.com/
      )
    ).toBeInTheDocument()
  })
  
  it('renders the main header', () => {
    render(<ReportPreview preview={mockPreview} />)

    expect(
      screen.getByText("Your Website's Current Performance")
    ).toBeInTheDocument()
  })
})
