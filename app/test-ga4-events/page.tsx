'use client'

import { useEffect, useState } from 'react'

export default function TestGA4Events() {
  const [events, setEvents] = useState<string[]>([])
  const [dataLayer, setDataLayer] = useState<any[]>([])

  useEffect(() => {
    // Check if GA4 is loaded
    const checkGA4 = () => {
      const status = {
        gtag: typeof window.gtag,
        dataLayer: window.dataLayer?.length || 0,
        measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      }
      console.log('GA4 Status:', status)
      setDataLayer(window.dataLayer || [])
    }

    // Check immediately and after a delay
    checkGA4()
    const timer = setTimeout(checkGA4, 2000)

    return () => clearTimeout(timer)
  }, [])

  const sendTestEvent = (eventName: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: 'Test',
        event_label: 'Manual Test Event',
        value: Date.now(),
        debug_mode: true,
      })
      setEvents([...events, `${eventName} sent at ${new Date().toLocaleTimeString()}`])
      console.log(`Event sent: ${eventName}`)
      
      // Update dataLayer display
      setTimeout(() => {
        setDataLayer([...window.dataLayer])
      }, 100)
    } else {
      console.error('gtag not available')
      setEvents([...events, `ERROR: gtag not available for ${eventName}`])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GA4 Event Testing</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">GA4 Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify({
              gtag: typeof window !== 'undefined' ? typeof window.gtag : 'SSR',
              dataLayerLength: typeof window !== 'undefined' ? window.dataLayer?.length || 0 : 'SSR',
              measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Events</h2>
          <div className="space-x-4">
            <button
              onClick={() => sendTestEvent('test_button_click')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send Click Event
            </button>
            <button
              onClick={() => sendTestEvent('test_page_view')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Page View
            </button>
            <button
              onClick={() => sendTestEvent('test_conversion')}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Send Conversion
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Event Log</h2>
          <ul className="space-y-2">
            {events.length === 0 ? (
              <li className="text-gray-500">No events sent yet</li>
            ) : (
              events.map((event, i) => (
                <li key={i} className="text-sm font-mono">{event}</li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">DataLayer Contents (Last {dataLayer.length} items)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(dataLayer.slice(-10), null, 2)}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            <strong>To verify events are being received:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
            <li>Go to Google Analytics</li>
            <li>Navigate to Admin → DebugView</li>
            <li>Click the test buttons above</li>
            <li>Events should appear in real-time in DebugView</li>
          </ol>
        </div>
      </div>
    </div>
  )
}