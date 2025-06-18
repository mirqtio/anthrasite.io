import React from 'react'
import { render } from '@testing-library/react'
import Analytics from '../Analytics'
import { usePageTracking, useWebVitals } from '@/lib/analytics/hooks'

// Mock analytics hooks
jest.mock('@/lib/analytics/hooks', () => ({
  usePageTracking: jest.fn(),
  useWebVitals: jest.fn()
}))

// Mock next/script
jest.mock('next/script', () => {
  // eslint-disable-next-line react/display-name
  return function({ id, src, strategy, onLoad, children }: any) {
    // Simulate script loading
    React.useEffect(() => {
      if (onLoad) {
        onLoad()
      }
    }, [onLoad])
    
    if (children) {
      // eslint-disable-next-line @next/next/no-sync-scripts
      return <script data-testid={`script-${id}`} dangerouslySetInnerHTML={{ __html: children }} />
    }
    // eslint-disable-next-line @next/next/no-sync-scripts
    return <script data-testid={`script-${id}`} src={src} data-strategy={strategy} />
  }
})

describe('Analytics Component', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    
    // Reset window.gtag
    delete (window as any).gtag
    delete (window as any).dataLayer
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should render GA4 scripts when measurement ID is provided', () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123'
    
    const { container } = render(<Analytics />)
    
    const scripts = container.querySelectorAll('script')
    expect(scripts).toHaveLength(2)
    
    // Check GA4 script
    const ga4Script = container.querySelector('[data-testid="google-analytics"]')
    expect(ga4Script).toHaveAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=G-TESTID123')
    
    // Check inline config script
    const configScript = container.querySelector('[data-testid="google-analytics-config"]')
    expect(configScript?.textContent).toContain('gtag')
    expect(configScript?.textContent).toContain('G-TESTID123')
  })

  it('should not render GA4 scripts when measurement ID is not provided', () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    
    const { container } = render(<Analytics />)
    
    const ga4Script = container.querySelector('[data-testid="google-analytics"]')
    const configScript = container.querySelector('[data-testid="google-analytics-config"]')
    
    expect(ga4Script).not.toBeInTheDocument()
    expect(configScript).not.toBeInTheDocument()
  })

  it('should render PostHog script when API key is provided', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'
    
    const { container } = render(<Analytics />)
    
    const posthogScript = container.querySelector('[data-testid="posthog-config"]')
    expect(posthogScript).toBeInTheDocument()
    expect(posthogScript?.textContent).toContain('phc_test123')
    expect(posthogScript?.textContent).toContain('https://app.posthog.com')
  })

  it('should use default PostHog host when not provided', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST
    
    const { container } = render(<Analytics />)
    
    const posthogScript = container.querySelector('[data-testid="posthog-config"]')
    expect(posthogScript?.textContent).toContain('https://app.posthog.com')
  })

  it('should not render PostHog script when API key is not provided', () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    
    const { container } = render(<Analytics />)
    
    const posthogScript = container.querySelector('[data-testid="posthog-config"]')
    expect(posthogScript).not.toBeInTheDocument()
  })

  it('should call analytics hooks', () => {
    render(<Analytics />)
    
    expect(usePageTracking).toHaveBeenCalled()
    expect(useWebVitals).toHaveBeenCalled()
  })

  it('should initialize window.dataLayer for GA4', () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123'
    
    render(<Analytics />)
    
    expect(window.dataLayer).toBeDefined()
    expect(Array.isArray(window.dataLayer)).toBe(true)
  })

  it('should initialize gtag function', () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123'
    
    render(<Analytics />)
    
    expect(window.gtag).toBeDefined()
    expect(typeof window.gtag).toBe('function')
    
    // Test gtag function
    window.gtag('test', 'value')
    expect(window.dataLayer).toContainEqual(['test', 'value'])
  })

  it('should configure GA4 with correct parameters', () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123'
    
    render(<Analytics />)
    
    // Check if gtag config was called
    const configCall = window.dataLayer?.find(
      args => args[0] === 'config' && args[1] === 'G-TESTID123'
    )
    
    expect(configCall).toBeDefined()
    expect(configCall?.[2]).toEqual({
      page_path: expect.any(String)
    })
  })

  it('should handle PostHog initialization in script', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
    
    const { container } = render(<Analytics />)
    
    const posthogScript = container.querySelector('[data-testid="posthog-config"]')
    const scriptContent = posthogScript?.textContent || ''
    
    // Check for PostHog initialization code
    expect(scriptContent).toContain('!function(t,e){')
    expect(scriptContent).toContain('posthog.init')
    expect(scriptContent).toContain('api_host')
  })
})