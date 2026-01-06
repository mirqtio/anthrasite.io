import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe, webhookSecret } from '@/lib/stripe/config'
import { getAdminClient } from '@/lib/supabase/admin'
import { getTemporalClient } from '@/lib/temporal/client'

/**
 * ANT-88: Stripe Webhook Handler
 *
 * Handles checkout.session.completed events:
 * 1. Upserts sales row with status='paid'
 * 2. Triggers PostPurchaseWorkflow via Temporal
 *
 * Configured in Stripe Dashboard -> Webhooks -> checkout.session.completed
 */

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    )
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session, event.id)
      return NextResponse.json({ received: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Stripe Webhook] Error handling checkout:', message)
      // Return 500 so Stripe retries
      return NextResponse.json(
        { error: `Failed to process checkout: ${message}` },
        { status: 500 }
      )
    }
  }

  // Acknowledge other events we don't handle
  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<void> {
  const leadId = session.metadata?.leadId
  const customerEmail =
    session.customer_details?.email || session.customer_email
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

  console.log('[Stripe Webhook] Processing checkout.session.completed:', {
    sessionId: session.id,
    leadId,
    customerEmail,
    paymentIntentId,
    amountTotal: session.amount_total,
  })

  if (!leadId) {
    throw new Error('Missing leadId in session metadata')
  }

  if (!customerEmail) {
    throw new Error('Missing customer email in session')
  }

  if (!paymentIntentId) {
    throw new Error('Missing payment intent ID')
  }

  const supabase = getAdminClient()

  // 1. Find the most recent report for this lead
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, run_id')
    .eq('lead_id', parseInt(leadId, 10))
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (reportError || !report) {
    throw new Error(
      `No report found for lead ${leadId}: ${reportError?.message || 'not found'}`
    )
  }

  console.log('[Stripe Webhook] Found report:', {
    reportId: report.id,
    runId: report.run_id,
  })

  // 2. Upsert sales row with status='paid'
  // Use payment_intent_id as idempotency key
  const { error: salesError } = await supabase.from('sales').upsert(
    {
      report_id: report.id,
      stripe_payment_intent_id: paymentIntentId,
      amount_cents: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'paid',
      customer_email: customerEmail,
      metadata: {
        session_id: session.id,
        business_id: session.metadata?.businessId,
        utm_token: session.metadata?.utmToken,
      },
    },
    {
      onConflict: 'stripe_payment_intent_id',
      ignoreDuplicates: false,
    }
  )

  if (salesError) {
    throw new Error(`Failed to upsert sales row: ${salesError.message}`)
  }

  console.log('[Stripe Webhook] Sales row upserted successfully')

  // 3. Trigger PostPurchaseWorkflow via Temporal
  // Use event ID in workflow ID for idempotency - same event = same workflow
  const temporalClient = await getTemporalClient()
  const workflowId = `post-purchase-${eventId}`

  try {
    const handle = await temporalClient.workflow.start('PostPurchaseWorkflow', {
      workflowId,
      taskQueue: 'premium-reports',
      args: [
        {
          lead_id: parseInt(leadId, 10),
          run_id: report.run_id,
          customer_email: customerEmail,
        },
      ],
    })

    console.log('[Stripe Webhook] Started PostPurchaseWorkflow:', {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
    })
  } catch (err) {
    // Check if workflow already exists (idempotency - this is expected on retries)
    if (
      err instanceof Error &&
      err.message.includes('Workflow execution already started')
    ) {
      console.log(
        `[Stripe Webhook] Workflow ${workflowId} already exists (idempotent retry)`
      )
      return // Success - already processed
    }
    throw err // Re-throw other errors
  }
}
