import { NextRequest, NextResponse } from 'next/server'
import { AbandonedCartService } from '@/lib/abandoned-cart/service'
import { prisma } from '@/lib/db'

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Initialize service
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://anthrasite.io'
    const service = new AbandonedCartService({ baseUrl })
    
    // Check for abandoned carts
    console.log('Starting abandoned cart check...')
    const result = await service.checkAbandoned()
    
    // Log results
    console.log(`Processed ${result.processed} abandoned carts`)
    console.log('Results:', JSON.stringify(result.results, null, 2))
    
    // Track cron execution
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'abandoned_cart_cron_executed',
        properties: {
          processed: result.processed,
          successful: result.results.filter(r => r.success).length,
          failed: result.results.filter(r => !r.success).length,
        },
      },
    })
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      results: result.results,
    })
  } catch (error) {
    console.error('Abandoned cart cron job failed:', error)
    
    // Track error
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'abandoned_cart_cron_error',
        properties: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    }).catch(console.error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility with cron services
export async function POST(request: NextRequest) {
  return GET(request)
}