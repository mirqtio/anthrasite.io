import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConsentPreferences } from '../ConsentPreferences'
import { ConsentProvider, useConsent } from '@/lib/context/ConsentContext'
import { ReactNode } from 'react'

// Mock the analytics module
jest.mock('@/lib/analytics/consent-loader')

// Test component to control modal visibility
function TestComponent() {
  const { openPreferences } = useConsent()
  
  return (
    <>
      <button onClick={openPreferences}>Open Preferences</button>
      <ConsentPreferences />
    </>
  )
}

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ConsentProvider>{children}</ConsentProvider>
)

describe('ConsentPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should not render when closed', async () => {
    render(<ConsentPreferences />, { wrapper: TestWrapper })
    
    // Wait a bit for the context to initialize
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should render when opened', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Cookie Preferences')).toBeInTheDocument()
    })
  })

  it('should display all cookie categories', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      expect(screen.getByText('Essential Cookies')).toBeInTheDocument()
      expect(screen.getByText('Functional Cookies')).toBeInTheDocument()
      expect(screen.getByText('Analytics Cookies')).toBeInTheDocument()
    })
  })

  it('should show essential cookies as always on', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      const essentialSection = screen.getByText('Essential Cookies').closest('div')?.parentElement
      expect(essentialSection).toHaveTextContent('Always on')
    })
  })

  it('should toggle cookie preferences', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      const analyticsToggle = screen.getByRole('switch', { name: /Analytics Cookies/ })
      expect(analyticsToggle).toHaveAttribute('aria-checked', 'false')
      
      fireEvent.click(analyticsToggle)
      
      expect(analyticsToggle).toHaveAttribute('aria-checked', 'true')
    })
  })

  it('should save preferences when save button is clicked', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      const analyticsToggle = screen.getByRole('switch', { name: /Analytics Cookies/ })
      fireEvent.click(analyticsToggle)
      
      const saveButton = screen.getByRole('button', { name: 'Save preferences' })
      fireEvent.click(saveButton)
    })
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    
    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('anthrasite_cookie_consent') || '{}')
    expect(stored.preferences.analytics).toBe(true)
  })

  it('should close when backdrop is clicked', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
      
      fireEvent.click(backdrop!)
    })
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('should have accept all and reject all buttons', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reject all' })).toBeInTheDocument()
    })
  })

  it('should be accessible', async () => {
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'preferences-title')
    })
  })

  it('should load existing preferences', async () => {
    localStorage.setItem('anthrasite_cookie_consent', JSON.stringify({
      version: '1.0',
      preferences: {
        analytics: true,
        functional: false,
        timestamp: new Date().toISOString()
      }
    }))
    
    render(<TestComponent />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Open Preferences'))
    
    await waitFor(() => {
      const analyticsToggle = screen.getByRole('switch', { name: /Analytics Cookies/ })
      const functionalToggle = screen.getByRole('switch', { name: /Functional Cookies/ })
      
      expect(analyticsToggle).toHaveAttribute('aria-checked', 'true')
      expect(functionalToggle).toHaveAttribute('aria-checked', 'false')
    })
  })
})