import { NextResponse } from 'next/server'

export async function GET() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const apiSecret = process.env.GA4_API_SECRET
  
  // Test sending an event via Measurement Protocol
  if (measurementId && apiSecret) {
    try {
      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: 'test-client-' + Date.now(),
            events: [{
              name: 'test_api_event',
              params: {
                engagement_time_msec: '100',
                session_id: Date.now().toString(),
                debug_mode: true,
              }
            }]
          })
        }
      )
      
      const debugResponse = await fetch(
        `https://www.google-analytics.com/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: 'test-client-' + Date.now(),
            events: [{
              name: 'test_api_debug_event',
              params: {
                engagement_time_msec: '100',
                session_id: Date.now().toString(),
                debug_mode: true,
              }
            }]
          })
        }
      )
      
      const debugData = await debugResponse.json()
      
      return NextResponse.json({
        success: true,
        measurementId,
        apiSecretConfigured: !!apiSecret,
        measurementProtocolResponse: response.status,
        debugResponse: debugData,
        testPageUrl: '/test-ga4-events',
        note: 'Check Google Analytics DebugView for test_api_event'
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: String(error),
        measurementId,
        apiSecretConfigured: !!apiSecret,
      })
    }
  }
  
  return NextResponse.json({
    success: false,
    error: 'GA4 configuration missing',
    measurementId: measurementId || 'NOT_SET',
    apiSecretConfigured: !!apiSecret,
    note: 'Set NEXT_PUBLIC_GA4_MEASUREMENT_ID and GA4_API_SECRET environment variables'
  })
}