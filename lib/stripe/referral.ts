import { stripe } from './config'
import type Stripe from 'stripe'

/**
 * Referral Program - Stripe Integration
 *
 * Handles coupon creation, promotion code management, and refunds for referral payouts.
 */

// Coupon naming convention: REFERRAL_{amount}c_OFF for cents, REFERRAL_{percent}pct_OFF for percent
function getCouponId(
  discountType: 'fixed' | 'percent',
  amount: number
): string {
  return discountType === 'fixed'
    ? `REFERRAL_${amount}c_OFF`
    : `REFERRAL_${amount}pct_OFF`
}

/**
 * Gets or creates a Stripe Coupon for the given discount configuration.
 * Uses deterministic IDs to ensure idempotency.
 */
export async function getOrCreateCoupon(
  discountType: 'fixed' | 'percent',
  amount: number
): Promise<string> {
  const couponId = getCouponId(discountType, amount)

  try {
    // Try to retrieve existing coupon
    const existing = await stripe.coupons.retrieve(couponId)

    // Verify it matches expected config
    if (discountType === 'fixed' && existing.amount_off !== amount) {
      throw new Error(
        `Coupon ${couponId} exists with different amount: expected ${amount}, got ${existing.amount_off}`
      )
    }
    if (discountType === 'percent' && existing.percent_off !== amount) {
      throw new Error(
        `Coupon ${couponId} exists with different percent: expected ${amount}, got ${existing.percent_off}`
      )
    }

    console.log(`[referral] Using existing coupon: ${couponId}`)
    return couponId
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError
    if (stripeError.code === 'resource_missing') {
      // Create new coupon
      const couponParams: Stripe.CouponCreateParams = {
        id: couponId,
        name:
          discountType === 'fixed'
            ? `Referral $${(amount / 100).toFixed(0)} Off`
            : `Referral ${amount}% Off`,
        duration: 'once',
        ...(discountType === 'fixed'
          ? { amount_off: amount, currency: 'usd' }
          : { percent_off: amount }),
      }

      await stripe.coupons.create(couponParams)
      console.log(`[referral] Created new coupon: ${couponId}`)
      return couponId
    }
    throw error
  }
}

/**
 * Creates a Stripe Promotion Code for a referral code.
 * Returns the promotion code ID or throws if code already exists.
 */
export async function createPromotionCode(
  code: string,
  couponId: string,
  maxRedemptions?: number
): Promise<{ promotionCodeId: string; stripeCode: string }> {
  try {
    const promoParams: Stripe.PromotionCodeCreateParams = {
      coupon: couponId,
      code: code,
      active: true,
      ...(maxRedemptions && { max_redemptions: maxRedemptions }),
    }

    const promotionCode = await stripe.promotionCodes.create(promoParams, {
      idempotencyKey: `stripe-promo:${code}`,
    })

    console.log(
      `[referral] Created promotion code: ${code} -> ${promotionCode.id}`
    )
    return {
      promotionCodeId: promotionCode.id,
      stripeCode: promotionCode.code,
    }
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError
    if (stripeError.code === 'resource_already_exists') {
      throw new Error(`Promotion code ${code} already exists in Stripe`)
    }
    throw error
  }
}

/**
 * Retrieves a promotion code by its code string.
 */
export async function getPromotionCodeByCode(
  code: string
): Promise<Stripe.PromotionCode | null> {
  try {
    const list = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      limit: 1,
    })
    return list.data[0] || null
  } catch (error) {
    console.error('[referral] Failed to retrieve promotion code:', error)
    return null
  }
}

/**
 * Issues a refund to the original payment as a referral reward payout.
 * Uses idempotency key to prevent duplicate refunds.
 */
export async function issueRefundPayout(
  paymentIntentId: string,
  amountCents: number,
  conversionId: string,
  reason: string
): Promise<{ refundId: string; amountRefunded: number } | null> {
  try {
    const refund = await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount: amountCents,
        reason: 'requested_by_customer',
        metadata: {
          type: 'referral_payout',
          conversion_id: conversionId,
          reason: reason,
        },
      },
      {
        idempotencyKey: `payout:${conversionId}`,
      }
    )

    console.log(
      `[referral] Issued refund payout: ${refund.id} for $${(amountCents / 100).toFixed(2)}`
    )
    return {
      refundId: refund.id,
      amountRefunded: refund.amount,
    }
  } catch (error) {
    console.error('[referral] Failed to issue refund payout:', error)
    return null
  }
}

/**
 * Gets the refundable amount remaining on a payment intent.
 * Used to check if we can issue a refund payout.
 */
export async function getRefundCapacity(
  paymentIntentId: string
): Promise<number> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Get total amount charged
    const chargeAmount =
      typeof paymentIntent.latest_charge === 'string'
        ? (await stripe.charges.retrieve(paymentIntent.latest_charge)).amount
        : (paymentIntent.latest_charge as Stripe.Charge)?.amount || 0

    // Get total already refunded
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    })
    const totalRefunded = refunds.data.reduce(
      (sum, r) => sum + (r.status === 'succeeded' ? r.amount : 0),
      0
    )

    return Math.max(0, chargeAmount - totalRefunded)
  } catch (error) {
    console.error('[referral] Failed to get refund capacity:', error)
    return 0
  }
}

/**
 * Deactivates a promotion code in Stripe.
 * Returns { success: true } or { success: false, error: string, notFound: boolean }
 */
export async function deactivatePromotionCode(
  promotionCodeId: string
): Promise<{ success: boolean; error?: string; notFound?: boolean }> {
  try {
    await stripe.promotionCodes.update(promotionCodeId, { active: false })
    console.log(`[referral] Deactivated promotion code: ${promotionCodeId}`)
    return { success: true }
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError
    console.error(
      '[referral] Failed to deactivate promotion code:',
      stripeError.message
    )

    // If the promotion code doesn't exist in Stripe, treat as "not found" (non-fatal)
    if (stripeError.code === 'resource_missing') {
      return {
        success: false,
        error: 'Promotion code not found in Stripe',
        notFound: true,
      }
    }

    return {
      success: false,
      error: stripeError.message || 'Unknown Stripe error',
    }
  }
}

/**
 * Reactivates a promotion code in Stripe.
 * Returns { success: true } or { success: false, error: string, notFound: boolean }
 */
export async function reactivatePromotionCode(
  promotionCodeId: string
): Promise<{ success: boolean; error?: string; notFound?: boolean }> {
  try {
    await stripe.promotionCodes.update(promotionCodeId, { active: true })
    console.log(`[referral] Reactivated promotion code: ${promotionCodeId}`)
    return { success: true }
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError
    console.error(
      '[referral] Failed to reactivate promotion code:',
      stripeError.message
    )

    // If the promotion code doesn't exist in Stripe, treat as "not found" (non-fatal)
    if (stripeError.code === 'resource_missing') {
      return {
        success: false,
        error: 'Promotion code not found in Stripe',
        notFound: true,
      }
    }

    return {
      success: false,
      error: stripeError.message || 'Unknown Stripe error',
    }
  }
}
