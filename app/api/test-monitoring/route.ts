import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getAnalytics } from '@/lib/analytics/analytics-manager'
import { captureError, trackEvent } from '@/lib/monitoring'

export async function GET() {
  return NextResponse.json({
    message: 'Monitoring test endpoints',
    endpoints: [
      {
        method: 'POST',
        path: '/api/test-monitoring',
        description: 'Test monitoring tools with different error types',
        parameters: {
          type: 'error | warning | info | custom',
          data: 'optional custom data object',
        },
      },
    ],
  })
}

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 404 }
    )
  }

  try {
    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid test type. Use: error, warning, info, or custom' },
        { status: 400 }
      )
    }

    const { type, data } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Invalid test type. Use: error, warning, info, or custom' },
        { status: 400 }
      )
    }

    const responseData: any = { success: true }

    switch (type) {
      case 'error':
        try {
          Sentry.captureException(new Error('Test error'))
          console.error('Test error:', new Error('Test error'))
          responseData.message = 'Error captured and sent to monitoring'
        } catch (e) {
          console.error('Error monitoring test failed:', e)
          responseData.message = 'Error test completed with issues'
        }
        break

      case 'warning':
        try {
          Sentry.captureMessage('Test warning message', 'warning')
          console.log('Test warning logged')
          responseData.message = 'Warning sent to monitoring'
        } catch (e) {
          console.error('Warning monitoring test failed:', e)
          responseData.message = 'Warning test completed with issues'
        }
        break

      case 'info':
        try {
          Sentry.captureMessage('Test info event', 'info')
          console.log('Test info logged')
          responseData.message = 'Info event sent to monitoring'
        } catch (e) {
          console.error('Info monitoring test failed:', e)
          responseData.message = 'Info test completed with issues'
        }
        break

      case 'custom':
        try {
          const customData = body.customData || {}
          console.log('Custom monitoring event:', customData)
          responseData.message = 'Custom event sent to monitoring'
          responseData.customData = customData
        } catch (e) {
          console.error('Custom monitoring test failed:', e)
          responseData.message = 'Custom test completed with issues'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid test type. Use: error, warning, info, or custom' },
          { status: 400 }
        )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
