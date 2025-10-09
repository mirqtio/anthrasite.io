import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConsentProvider } from '@/lib/context/ConsentContext'

interface ConsentPreferences {
  necessary?: boolean
  analytics?: boolean
  marketing?: boolean
  functional?: boolean
}

interface RenderWithConsentOptions extends Omit<RenderOptions, 'wrapper'> {
  consent?: ConsentPreferences
}

/**
 * Render a component with ConsentProvider wrapper for testing
 * @param ui - The React element to render
 * @param options - Optional consent preferences and render options
 */
export function renderWithConsent(
  ui: React.ReactElement,
  options?: RenderWithConsentOptions
) {
  const { consent, ...renderOptions } = options || {}

  const defaultConsent: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: true,
    ...consent,
  }

  // If custom consent is provided, set it in localStorage before rendering
  if (consent) {
    localStorage.setItem(
      'anthrasite_cookie_consent',
      JSON.stringify({
        version: '1.0',
        preferences: defaultConsent,
        timestamp: new Date().toISOString(),
      })
    )
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConsentProvider>{children}</ConsentProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
