import { prisma } from '@/lib/db'
import type { Stripe } from 'stripe'
import { randomBytes } from 'crypto'

/**
 * Tracks a new checkout session for abandoned cart recovery
 */
export async function trackCheckoutSession({
  session,
  businessId,
  utmToken,
}: {
  session: Stripe.Checkout.Session
  businessId: string
  utmToken?: string
}) {
  try {
    // Generate a unique recovery token
    const recoveryToken = randomBytes(32).toString('hex')
    
    // Extract session expiration time
    const sessionExpiresAt = new Date(session.expires_at * 1000)
    
    // Create abandoned cart record
    await prisma.abandonedCart.create({
      data: {
        stripeSessionId: session.id,
        businessId,
        utmToken,
        customerEmail: session.customer_email || undefined,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        recoveryToken,
        sessionExpiresAt,
      },
    })
    
    return { success: true, recoveryToken }
  } catch (error) {
    console.error('Failed to track checkout session:', error)
    return { success: false, error }
  }
}

/**
 * Marks a checkout session as completed (not abandoned)
 */
export async function markSessionCompleted(stripeSessionId: string) {
  try {
    // Delete the abandoned cart record since it's no longer abandoned
    await prisma.abandonedCart.deleteMany({
      where: {
        stripeSessionId,
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to mark session as completed:', error)
    return { success: false, error }
  }
}

/**
 * Checks if a session is recoverable (not expired, not completed)
 */
export async function isSessionRecoverable(stripeSessionId: string): Promise<boolean> {
  try {
    const abandonedCart = await prisma.abandonedCart.findUnique({
      where: {
        stripeSessionId,
      },
    })
    
    if (!abandonedCart) {
      return false
    }
    
    // Check if session hasn't expired
    const now = new Date()
    if (abandonedCart.sessionExpiresAt < now) {
      return false
    }
    
    // Check if not already recovered
    if (abandonedCart.recovered) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to check session recoverability:', error)
    return false
  }
}

/**
 * Gets abandoned cart by recovery token
 */
export async function getAbandonedCartByToken(recoveryToken: string) {
  try {
    const abandonedCart = await prisma.abandonedCart.findUnique({
      where: {
        recoveryToken,
      },
      include: {
        business: true,
      },
    })
    
    return abandonedCart
  } catch (error) {
    console.error('Failed to get abandoned cart by token:', error)
    return null
  }
}

/**
 * Marks an abandoned cart as recovered
 */
export async function markCartRecovered(id: string) {
  try {
    await prisma.abandonedCart.update({
      where: { id },
      data: {
        recovered: true,
        recoveredAt: new Date(),
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to mark cart as recovered:', error)
    return { success: false, error }
  }
}