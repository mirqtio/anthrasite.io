/**
 * Confirmation Page Context Functions
 * Handles Stripe session retrieval and leverages LP context for lead data
 */

import {
  retrieveSessionWithLineItems,
  isSessionPaid,
  getCustomerEmail,
} from '@/lib/stripe/checkout'
import { extractUtmToken } from '@/lib/stripe/utils'
import { validatePurchaseToken } from '@/lib/purchase'
import { lookupLandingContext } from '@/lib/landing/context'
import type { ConfirmationContext } from './types'

/**
 * Looks up confirmation page context from Stripe session ID.
 * Retrieves session metadata, validates JWT token, and fetches lead data
 * by reusing the landing page context lookup.
 *
 * @param sessionId - Stripe checkout session ID
 * @returns ConfirmationContext or null if validation fails
 */
export async function lookupConfirmationContext(
  sessionId: string
): Promise<ConfirmationContext | null> {
  try {
    // 1. Retrieve Stripe session with expanded data
    const session = await retrieveSessionWithLineItems(sessionId)
    if (!session) {
      console.error('[Confirmation] Stripe session not found:', sessionId)
      return null
    }

    // 2. Verify payment was successful
    if (!isSessionPaid(session)) {
      console.error('[Confirmation] Session not paid:', sessionId)
      return null
    }

    // 3. Extract JWT token from session metadata
    const utmToken = extractUtmToken(session.metadata)

    // 4. Get leadId/runId from JWT token, or fall back to metadata.leadId (legacy sessions)
    let leadId: string | undefined
    let runId: string | undefined

    if (utmToken) {
      const payload = await validatePurchaseToken(utmToken)
      if (payload?.leadId) {
        leadId = payload.leadId
        runId = payload.runId
      }
    }

    // Fallback: use leadId directly from session metadata (legacy sessions)
    if (!leadId && session.metadata?.leadId) {
      leadId = session.metadata.leadId
    }

    if (!leadId) {
      console.error('[Confirmation] No leadId found in token or metadata')
      return null
    }

    // 5. Get customer email from Stripe session
    const purchaseEmail = getCustomerEmail(session)

    // 6. Get price from session (in cents, convert to dollars)
    const price = session.amount_total ? session.amount_total / 100 : 199

    // 7. Reuse landing page context for lead/run data (company, domain, issues, impact)
    const landingContext = await lookupLandingContext(leadId, runId)

    // 8. Build and return context
    return {
      sessionId,
      orderRef: sessionId.slice(-8),
      leadId,
      runId,
      company: landingContext?.company ?? null,
      domain: landingContext?.domainUrl ?? null,
      purchaseEmail,
      price,
      issueCount: landingContext?.issueCount ?? 0,
      impactLow: landingContext?.impactLow ?? '$0',
      impactHigh: landingContext?.impactHigh ?? '$0',
    }
  } catch (error) {
    console.error('Error looking up confirmation context:', error)
    return null
  }
}
