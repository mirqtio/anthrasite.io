import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { SendGridWebhookEvent } from '@/lib/email/types'

// Verify SendGrid webhook signature
function verifyWebhookSignature(
  publicKey: string,
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  // In production, you would verify the signature using SendGrid's Event Webhook
  // https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features

  // For now, we'll check for the webhook key in env
  const webhookKey = process.env.SENDGRID_WEBHOOK_KEY
  if (!webhookKey) {
    console.warn('SENDGRID_WEBHOOK_KEY not configured')
    return true // Allow in development
  }

  // TODO: Implement proper signature verification
  return true
}

export async function POST(req: NextRequest) {
  try {
    // Get webhook signature headers
    const signature =
      req.headers.get('x-twilio-email-event-webhook-signature') || ''
    const timestamp =
      req.headers.get('x-twilio-email-event-webhook-timestamp') || ''

    // Parse body
    const events = (await req.json()) as SendGridWebhookEvent[]

    // Verify signature
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY || ''
    const isValid = verifyWebhookSignature(
      publicKey,
      JSON.stringify(events),
      signature,
      timestamp
    )

    if (!isValid) {
      console.error('Invalid SendGrid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Process events
    for (const event of events) {
      try {
        await processWebhookEvent(event)
      } catch (error) {
        console.error('Error processing SendGrid event:', error)
        // Continue processing other events
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('SendGrid webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function processWebhookEvent(event: SendGridWebhookEvent) {
  console.log(`Processing SendGrid event: ${event.event} for ${event.email}`)

  // Extract custom args
  const customArgs = (event as any).custom_args || {}
  const { purchaseId, businessId, template } = customArgs

  // Handle different event types
  switch (event.event) {
    case 'delivered':
      await handleDelivered(event, purchaseId)
      break

    case 'bounce':
      await handleBounce(event, purchaseId)
      break

    case 'complaint':
      await handleComplaint(event, purchaseId)
      break

    case 'unsubscribed':
      await handleUnsubscribe(event)
      break

    case 'open':
      await handleOpen(event, purchaseId)
      break

    case 'click':
      await handleClick(event, purchaseId)
      break

    default:
      console.log(`Unhandled SendGrid event type: ${event.event}`)
  }
}

async function handleDelivered(
  event: SendGridWebhookEvent,
  purchaseId?: string
) {
  // Update purchase metadata if purchaseId provided
  if (purchaseId) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      })

      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            metadata: {
              ...((purchase.metadata as object) || {}),
              emailDelivered: true,
              emailDeliveredAt: new Date(event.timestamp * 1000).toISOString(),
            },
          },
        })
      }
    } catch (error) {
      console.error('Error updating purchase for delivered event:', error)
    }
  }
}

async function handleBounce(event: SendGridWebhookEvent, purchaseId?: string) {
  console.error(`Email bounce: ${event.email}, reason: ${event.reason}`)

  // Update purchase metadata if purchaseId provided
  if (purchaseId) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      })

      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            metadata: {
              ...((purchase.metadata as object) || {}),
              emailBounced: true,
              emailBouncedAt: new Date(event.timestamp * 1000).toISOString(),
              emailBounceReason: event.reason,
              emailBounceType: event.type,
            },
          },
        })
      }
    } catch (error) {
      console.error('Error updating purchase for bounce event:', error)
    }
  }

  // TODO: Add email to suppression list to prevent future sends
}

async function handleComplaint(
  event: SendGridWebhookEvent,
  purchaseId?: string
) {
  console.error(`Email complaint: ${event.email}`)

  // Update purchase metadata if purchaseId provided
  if (purchaseId) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      })

      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            metadata: {
              ...((purchase.metadata as object) || {}),
              emailComplaint: true,
              emailComplaintAt: new Date(event.timestamp * 1000).toISOString(),
            },
          },
        })
      }
    } catch (error) {
      console.error('Error updating purchase for complaint event:', error)
    }
  }

  // TODO: Add email to suppression list to prevent future sends
}

async function handleUnsubscribe(event: SendGridWebhookEvent) {
  console.log(`Email unsubscribe: ${event.email}`)

  // TODO: Update user preferences to mark as unsubscribed
}

async function handleOpen(event: SendGridWebhookEvent, purchaseId?: string) {
  // Track email open
  if (purchaseId) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      })

      if (purchase) {
        const metadata = (purchase.metadata as any) || {}
        const openCount = (metadata.emailOpenCount || 0) + 1

        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            metadata: {
              ...metadata,
              emailOpened: true,
              emailOpenCount: openCount,
              emailLastOpenedAt: new Date(event.timestamp * 1000).toISOString(),
            },
          },
        })
      }
    } catch (error) {
      console.error('Error updating purchase for open event:', error)
    }
  }
}

async function handleClick(event: SendGridWebhookEvent, purchaseId?: string) {
  // Track email click
  if (purchaseId) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      })

      if (purchase) {
        const metadata = (purchase.metadata as any) || {}
        const clicks = metadata.emailClicks || []
        clicks.push({
          url: event.url,
          timestamp: new Date(event.timestamp * 1000).toISOString(),
        })

        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            metadata: {
              ...metadata,
              emailClicked: true,
              emailClicks: clicks,
              emailLastClickedAt: new Date(
                event.timestamp * 1000
              ).toISOString(),
            },
          },
        })
      }
    } catch (error) {
      console.error('Error updating purchase for click event:', error)
    }
  }
}
