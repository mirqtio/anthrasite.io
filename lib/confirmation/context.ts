/**
 * Confirmation Page Context Functions
 * Handles Stripe session retrieval and lead data lookup for /purchase/success
 */

import {
  retrieveSessionWithLineItems,
  isSessionPaid,
  getCustomerEmail,
} from '@/lib/stripe/checkout'
import { extractUtmToken } from '@/lib/stripe/utils'
import { validatePurchaseToken } from '@/lib/purchase'
import getSql from '@/lib/db'
import type { ConfirmationContext } from './types'

/**
 * Looks up confirmation page context from Stripe session ID.
 * Retrieves session metadata, validates JWT token, and fetches lead data.
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

    // 7. Lookup lead data (optional - graceful fallback)
    let company: string | null = null
    let domain: string | null = null

    try {
      const leadIdInt = parseInt(leadId, 10)
      if (!isNaN(leadIdInt)) {
        const sql = getSql()
        const leadRows = await sql`
          SELECT company, domain
          FROM leads
          WHERE id = ${leadIdInt}
        `
        if (leadRows.length > 0) {
          company = leadRows[0].company || null
          domain = leadRows[0].domain || null
        }
      }
    } catch (dbError) {
      // Log but don't fail - lead data is optional
      console.error('Failed to lookup lead data:', dbError)
    }

    // 8. Build and return context
    return {
      sessionId,
      orderRef: sessionId.slice(-8),
      leadId,
      runId,
      company,
      domain,
      purchaseEmail,
      price,
    }
  } catch (error) {
    console.error('Error looking up confirmation context:', error)
    return null
  }
}
