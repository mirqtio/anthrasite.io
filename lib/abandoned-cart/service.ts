import { prisma } from '@/lib/db'
import { sendCartRecoveryEmail } from '@/lib/email/email-service'
import {
  trackCheckoutSession,
  markSessionCompleted,
  markCartRecovered,
} from './tracker'
import type { Stripe } from 'stripe'

// Configuration
const ABANDONMENT_THRESHOLD_HOURS = 3
const RECOVERY_EMAIL_DELAY_HOURS = 3
const MAX_RECOVERY_EMAILS_PER_CART = 1

export interface AbandonedCartServiceConfig {
  baseUrl: string
}

/**
 * Main service for handling abandoned cart recovery
 */
export class AbandonedCartService {
  constructor(private config: AbandonedCartServiceConfig) {}

  /**
   * Tracks a new abandoned session
   */
  async trackAbandonedSession({
    session,
    businessId,
    utmToken,
  }: {
    session: Stripe.Checkout.Session
    businessId: string
    utmToken?: string
  }) {
    return trackCheckoutSession({ session, businessId, utmToken })
  }

  /**
   * Checks for abandoned carts and sends recovery emails
   */
  async checkAbandoned() {
    const thresholdTime = new Date()
    thresholdTime.setHours(
      thresholdTime.getHours() - ABANDONMENT_THRESHOLD_HOURS
    )

    try {
      // Find abandoned carts that:
      // 1. Were created more than 3 hours ago
      // 2. Haven't received a recovery email
      // 3. Haven't been recovered
      // 4. Haven't expired
      const abandonedCarts = await prisma.abandonedCart.findMany({
        where: {
          createdAt: {
            lte: thresholdTime,
          },
          recoveryEmailSent: false,
          recovered: false,
          sessionExpiresAt: {
            gt: new Date(),
          },
        },
        include: {
          business: true,
        },
      })

      const results = []

      for (const cart of abandonedCarts) {
        try {
          if (cart.customerEmail) {
            await this.sendRecoveryEmail(cart)
            results.push({ cartId: cart.id, success: true })
          } else {
            console.log(`Skipping cart ${cart.id} - no customer email`)
            results.push({
              cartId: cart.id,
              success: false,
              reason: 'no_email',
            })
          }
        } catch (error) {
          console.error(
            `Failed to send recovery email for cart ${cart.id}:`,
            error
          )
          results.push({ cartId: cart.id, success: false, error })
        }
      }

      return {
        processed: abandonedCarts.length,
        results,
      }
    } catch (error) {
      console.error('Failed to check abandoned carts:', error)
      throw error
    }
  }

  /**
   * Sends a recovery email for an abandoned cart
   */
  async sendRecoveryEmail(cart: any) {
    // Check rate limiting
    if (cart.recoveryEmailSent && MAX_RECOVERY_EMAILS_PER_CART <= 1) {
      throw new Error('Recovery email already sent for this cart')
    }

    // Generate recovery URL
    const recoveryUrl = `${this.config.baseUrl}/purchase/recover?token=${cart.recoveryToken}`

    // Send recovery email
    await sendCartRecoveryEmail({
      to: cart.customerEmail,
      businessName: cart.business.name,
      amount: (cart.amount / 100).toFixed(2),
      recoveryUrl,
    })

    // Mark email as sent
    await prisma.abandonedCart.update({
      where: { id: cart.id },
      data: {
        recoveryEmailSent: true,
        emailSentAt: new Date(),
      },
    })

    // Track analytics
    await this.trackRecoveryEmailSent(cart)
  }

  /**
   * Marks a cart as recovered when user returns via recovery link
   */
  async markRecovered(recoveryToken: string) {
    const cart = await prisma.abandonedCart.findUnique({
      where: { recoveryToken },
    })

    if (!cart) {
      throw new Error('Invalid recovery token')
    }

    if (cart.recovered) {
      return { alreadyRecovered: true }
    }

    await markCartRecovered(cart.id)
    await this.trackRecoverySuccess(cart)

    return { success: true, stripeSessionId: cart.stripeSessionId }
  }

  /**
   * Handles successful payment completion
   */
  async handlePaymentSuccess(stripeSessionId: string) {
    await markSessionCompleted(stripeSessionId)
  }

  /**
   * Track analytics for recovery email sent
   */
  private async trackRecoveryEmailSent(cart: any) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'abandoned_cart_recovery_email_sent',
          properties: {
            cartId: cart.id,
            businessId: cart.businessId,
            amount: cart.amount,
            currency: cart.currency,
            hoursAbandoned: Math.floor(
              (new Date().getTime() - cart.createdAt.getTime()) /
                (1000 * 60 * 60)
            ),
          },
        },
      })
    } catch (error) {
      console.error('Failed to track recovery email analytics:', error)
    }
  }

  /**
   * Track analytics for successful recovery
   */
  private async trackRecoverySuccess(cart: any) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'abandoned_cart_recovered',
          properties: {
            cartId: cart.id,
            businessId: cart.businessId,
            amount: cart.amount,
            currency: cart.currency,
            timeToRecovery: new Date().getTime() - cart.emailSentAt.getTime(),
          },
        },
      })
    } catch (error) {
      console.error('Failed to track recovery success analytics:', error)
    }
  }

  /**
   * Get abandoned cart metrics
   */
  async getMetrics(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      const [
        totalAbandoned,
        totalRecovered,
        totalEmailsSent,
        totalRevenueLost,
        totalRevenueRecovered,
      ] = await Promise.all([
        // Total abandoned carts
        prisma.abandonedCart.count({
          where: {
            createdAt: { gte: startDate },
          },
        }),
        // Total recovered carts
        prisma.abandonedCart.count({
          where: {
            createdAt: { gte: startDate },
            recovered: true,
          },
        }),
        // Total recovery emails sent
        prisma.abandonedCart.count({
          where: {
            createdAt: { gte: startDate },
            recoveryEmailSent: true,
          },
        }),
        // Total revenue lost (not recovered)
        prisma.abandonedCart.aggregate({
          where: {
            createdAt: { gte: startDate },
            recovered: false,
          },
          _sum: {
            amount: true,
          },
        }),
        // Total revenue recovered
        prisma.abandonedCart.aggregate({
          where: {
            createdAt: { gte: startDate },
            recovered: true,
          },
          _sum: {
            amount: true,
          },
        }),
      ])

      const recoveryRate =
        totalEmailsSent > 0 ? (totalRecovered / totalEmailsSent) * 100 : 0

      return {
        totalAbandoned,
        totalRecovered,
        totalEmailsSent,
        totalRevenueLost: (totalRevenueLost._sum.amount || 0) / 100,
        totalRevenueRecovered: (totalRevenueRecovered._sum.amount || 0) / 100,
        recoveryRate: Math.round(recoveryRate * 100) / 100,
        period: `${days} days`,
      }
    } catch (error) {
      console.error('Failed to get abandoned cart metrics:', error)
      throw error
    }
  }
}
