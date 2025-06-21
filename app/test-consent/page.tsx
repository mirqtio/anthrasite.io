'use client'

import { useEffect, useState } from 'react'
import { useConsent } from '@/lib/context/ConsentContext'

export default function TestConsentPage() {
  const { preferences, showBanner, hasConsented } = useConsent()
  const [localStorageData, setLocalStorageData] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage
    const data = localStorage.getItem('anthrasite_cookie_consent')
    setLocalStorageData(data)
  }, [preferences])

  const clearAllConsent = () => {
    localStorage.removeItem('anthrasite_cookie_consent')
    localStorage.removeItem('cookie-consent')
    // Clear any GA/PostHog cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    window.location.reload()
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <h1>Consent Debug Page</h1>
      
      <section>
        <h2>Consent Context State</h2>
        <pre style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
{JSON.stringify({
  showBanner,
  hasConsented,
  preferences
}, null, 2)}
        </pre>
      </section>

      <section>
        <h2>LocalStorage Data</h2>
        <pre style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
{localStorageData ? JSON.stringify(JSON.parse(localStorageData), null, 2) : 'No consent data stored'}
        </pre>
      </section>

      <section>
        <h2>Actions</h2>
        <button 
          onClick={clearAllConsent}
          style={{ 
            padding: '10px 20px', 
            background: '#ff0000', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear All Consent & Reload
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
          This will clear all consent data and cookies, then reload the page to show the banner
        </p>
      </section>

      <section>
        <h2>Expected Behavior</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>showBanner should be true for new users</li>
          <li>hasConsented should be false for new users</li>
          <li>After clicking "Accept all", preferences.analytics should be true</li>
          <li>The consent banner should appear at the bottom of the page</li>
        </ul>
      </section>
    </div>
  )
}