'use client'

import { useEffect, useState } from 'react'

export default function TestHotjarPage() {
  const [hotjarStatus, setHotjarStatus] = useState<any>({})

  useEffect(() => {
    const checkHotjar = () => {
      setHotjarStatus({
        hjLoaded: typeof (window as any).hj !== 'undefined',
        hjSettings: (window as any)._hjSettings || null,
        hjSiteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || 'Not configured',
      })
    }

    // Check immediately and after a delay
    checkHotjar()
    const timer = setTimeout(checkHotjar, 3000)

    return () => clearTimeout(timer)
  }, [])

  const triggerEvent = () => {
    if ((window as any).hj) {
      (window as any).hj('event', 'test_button_clicked')
      alert('Hotjar event triggered!')
    } else {
      alert('Hotjar not loaded yet. Make sure you accepted analytics cookies.')
    }
  }

  const triggerVirtualPageView = () => {
    if ((window as any).hj) {
      (window as any).hj('vpv', '/virtual/test-page')
      alert('Virtual page view triggered!')
    } else {
      alert('Hotjar not loaded yet.')
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <h1>Hotjar Integration Test</h1>
      
      <section>
        <h2>Hotjar Status</h2>
        <pre style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
{JSON.stringify(hotjarStatus, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Test Actions</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={triggerEvent}
            style={{ 
              padding: '10px 20px', 
              background: '#0066ff', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Trigger Test Event
          </button>
          <button 
            onClick={triggerVirtualPageView}
            style={{ 
              padding: '10px 20px', 
              background: '#00aa00', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Trigger Virtual Page View
          </button>
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Setup Instructions</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Add NEXT_PUBLIC_HOTJAR_SITE_ID to your .env.local</li>
          <li>Accept analytics cookies via the consent banner</li>
          <li>Check if hjLoaded becomes true above</li>
          <li>Open Hotjar dashboard to verify tracking</li>
          <li>Test the buttons to trigger custom events</li>
        </ol>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>What Hotjar Tracks</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>🖱️ Mouse movements and clicks (heatmaps)</li>
          <li>📹 Session recordings (with privacy masking)</li>
          <li>📊 Scroll depth and engagement</li>
          <li>🎯 Custom events you trigger</li>
          <li>📱 Mobile touch interactions</li>
        </ul>
      </section>
    </div>
  )
}