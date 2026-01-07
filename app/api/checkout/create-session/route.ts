import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe/checkout'
import { validatePurchaseToken } from '@/lib/landing/context'
import { getAdminClient } from '@/lib/supabase/admin'

// Soft-gate window: 30 minutes
const SOFT_GATE_WINDOW_MS = 30 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, leadId, contactId, purchaseAttemptId, token } = body

    // Validate required fields
    if (!businessId || !leadId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate token
    const payload = await validatePurchaseToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Soft-gate check: look for recent purchase by this contact
    if (contactId) {
      const supabase = getAdminClient()

      // Find the report for this lead
      const { data: report } = await supabase
        .from('reports')
        .select('id')
        .eq('lead_id', parseInt(leadId, 10))
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (report) {
        // Check for recent purchase by this contact for this report
        const windowStart = new Date(
          Date.now() - SOFT_GATE_WINDOW_MS
        ).toISOString()

        const { data: recentSale } = await supabase
          .from('sales')
          .select('id, created_at, customer_email')
          .eq('report_id', report.id)
          .eq('contact_id', parseInt(contactId, 10))
          .gte('created_at', windowStart)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (recentSale) {
          // Return soft-gate info - UI will show options
          console.log(
            `[create-session] Soft-gate: contact ${contactId} has recent purchase (sale ${recentSale.id})`
          )
          return NextResponse.json({
            recentPurchase: {
              saleId: recentSale.id,
              purchasedAt: recentSale.created_at,
              email: recentSale.customer_email,
            },
          })
        }
      }
    }

    // Get base URL for redirect URLs
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    // Create Stripe checkout session with idempotency key
    const session = await createCheckoutSession({
      businessId,
      utmToken: token,
      leadId,
      contactId,
      purchaseAttemptId,
      baseUrl,
    })

    // Return the checkout URL for redirect
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('[checkout/create-session] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
