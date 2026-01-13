/**
 * Slack alerting for critical webhook failures
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

interface WebhookAlertPayload {
  eventId?: string
  eventType?: string
  error: string
  customerEmail?: string
  leadId?: string
  paymentIntentId?: string
}

/**
 * Send a critical alert to Slack when a Stripe webhook fails
 */
export async function sendWebhookFailureAlert(
  payload: WebhookAlertPayload
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[Slack] SLACK_WEBHOOK_URL not configured, skipping alert')
    return
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 Stripe Webhook Failed',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Error:* ${payload.error}`,
      },
    },
  ]

  // Add details section if we have any
  const details: string[] = []
  if (payload.eventId) details.push(`*Event ID:* ${payload.eventId}`)
  if (payload.eventType) details.push(`*Event Type:* ${payload.eventType}`)
  if (payload.customerEmail)
    details.push(`*Customer:* ${payload.customerEmail}`)
  if (payload.leadId) details.push(`*Lead ID:* ${payload.leadId}`)
  if (payload.paymentIntentId)
    details.push(`*Payment Intent:* ${payload.paymentIntentId}`)

  if (details.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: details.join('\n'),
      },
    })
  }

  // Add action hint
  blocks.push({
    type: 'context',
    // @ts-expect-error - Slack block type
    elements: [
      {
        type: 'mrkdwn',
        text: '👉 Check Stripe Dashboard → Webhooks to retry, or manually process the sale',
      },
    ],
  })

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })

    if (!response.ok) {
      console.error('[Slack] Failed to send alert:', response.statusText)
    }
  } catch (err) {
    console.error('[Slack] Error sending alert:', err)
  }
}
