'use server'

import { revalidatePath } from 'next/cache'
import { getSql } from '@/lib/db'
import {
  getOrCreateCoupon,
  createPromotionCode,
  deactivatePromotionCode,
  reactivatePromotionCode,
} from '@/lib/stripe/referral'
import {
  createCodeSchema,
  updateCodeSchema,
  updateConfigSchema,
  type CreateCodeFormData,
  type UpdateCodeFormData,
  type UpdateConfigFormData,
} from '@/lib/schemas/referral'
import type {
  ReferralCodeRow,
  ConversionRow,
  ReferralConfigKey,
} from '@/types/referral-admin'

// ---------------------------------------------------------------------------
// Code Management
// ---------------------------------------------------------------------------

/**
 * Create a new referral code
 */
export async function createReferralCode(data: CreateCodeFormData): Promise<{
  success: boolean
  id?: string
  error?: string
}> {
  // 1. Validate with Zod
  const result = createCodeSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const validated = result.data
  const sql = getSql()

  // 2. Check code uniqueness
  const [existing] = await sql`
    SELECT id FROM referral_codes WHERE code = ${validated.code}
  `
  if (existing) {
    return { success: false, error: 'Code already exists' }
  }

  try {
    // 3. Create Stripe coupon
    const discountAmount =
      validated.discount_type === 'fixed'
        ? validated.discount_amount_cents!
        : validated.discount_percent!

    const couponId = await getOrCreateCoupon(
      validated.discount_type,
      discountAmount
    )

    // 4. Create Stripe promotion code
    const { promotionCodeId } = await createPromotionCode(
      validated.code,
      couponId,
      validated.max_redemptions ?? undefined
    )

    // 5. Insert into database
    const [created] = await sql`
      INSERT INTO referral_codes (
        code,
        tier,
        is_active,
        discount_type,
        discount_amount_cents,
        discount_percent,
        reward_type,
        reward_amount_cents,
        reward_percent,
        reward_trigger,
        max_redemptions,
        max_reward_total_cents,
        max_reward_per_period_cents,
        reward_period_days,
        period_start_at,
        stripe_coupon_id,
        stripe_promotion_code_id,
        expires_at,
        notes
      ) VALUES (
        ${validated.code},
        ${validated.tier},
        true,
        ${validated.discount_type},
        ${validated.discount_type === 'fixed' ? validated.discount_amount_cents! : null},
        ${validated.discount_type === 'percent' ? validated.discount_percent! : null},
        ${validated.reward_type},
        ${validated.reward_type === 'fixed' ? validated.reward_amount_cents! : null},
        ${validated.reward_type === 'percent' ? validated.reward_percent! : null},
        ${validated.reward_trigger || 'first'},
        ${validated.max_redemptions ?? null},
        ${validated.max_reward_total_cents ?? null},
        ${validated.max_reward_per_period_cents ?? null},
        ${validated.reward_period_days ?? null},
        ${validated.reward_period_days ? new Date().toISOString() : null},
        ${couponId},
        ${promotionCodeId},
        ${validated.expires_at ?? null},
        ${validated.notes ?? null}
      )
      RETURNING id
    `

    revalidatePath('/admin/referrals')
    return { success: true, id: created.id }
  } catch (error: any) {
    console.error('[referrals] Failed to create code:', error)
    return { success: false, error: error.message || 'Failed to create code' }
  }
}

/**
 * Update an existing referral code
 */
export async function updateReferralCode(
  codeId: string,
  data: UpdateCodeFormData
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate with Zod
  const result = updateCodeSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const validated = result.data
  const sql = getSql()

  try {
    // 2. Get current values
    const [current] = await sql<ReferralCodeRow[]>`
      SELECT * FROM referral_codes WHERE id = ${codeId}
    `
    if (!current) {
      return { success: false, error: 'Code not found' }
    }

    // 3. Merge with provided values (undefined means keep current)
    const maxRedemptions =
      validated.max_redemptions !== undefined
        ? validated.max_redemptions
        : current.max_redemptions
    const maxRewardTotalCents =
      validated.max_reward_total_cents !== undefined
        ? validated.max_reward_total_cents
        : current.max_reward_total_cents
    const maxRewardPerPeriodCents =
      validated.max_reward_per_period_cents !== undefined
        ? validated.max_reward_per_period_cents
        : current.max_reward_per_period_cents
    const rewardPeriodDays =
      validated.reward_period_days !== undefined
        ? validated.reward_period_days
        : current.reward_period_days
    const expiresAt =
      validated.expires_at !== undefined
        ? validated.expires_at
        : current.expires_at
    const notes =
      validated.notes !== undefined ? validated.notes : current.notes

    // 4. Execute update with resolved values
    await sql`
      UPDATE referral_codes
      SET
        max_redemptions = ${maxRedemptions},
        max_reward_total_cents = ${maxRewardTotalCents},
        max_reward_per_period_cents = ${maxRewardPerPeriodCents},
        reward_period_days = ${rewardPeriodDays},
        expires_at = ${expiresAt},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${codeId}
    `

    revalidatePath('/admin/referrals')
    return { success: true }
  } catch (error: any) {
    console.error('[referrals] Failed to update code:', error)
    return { success: false, error: error.message || 'Failed to update code' }
  }
}

/**
 * Toggle a referral code's active status
 */
export async function toggleCodeStatus(
  codeId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string; warning?: string }> {
  const sql = getSql()

  try {
    // 1. Get the Stripe promotion code ID
    const [code] = await sql<{ stripe_promotion_code_id: string | null }[]>`
      SELECT stripe_promotion_code_id FROM referral_codes WHERE id = ${codeId}
    `

    if (!code) {
      return { success: false, error: 'Code not found' }
    }

    let warning: string | undefined

    // 2. Update Stripe promotion code status (if we have one)
    if (code.stripe_promotion_code_id) {
      const result = isActive
        ? await reactivatePromotionCode(code.stripe_promotion_code_id)
        : await deactivatePromotionCode(code.stripe_promotion_code_id)

      if (!result.success) {
        // If the promo code doesn't exist in Stripe, proceed but warn
        if (result.notFound) {
          warning = 'Promotion code not found in Stripe (may have been deleted)'
          // Clear the invalid Stripe ID from our database
          await sql`
            UPDATE referral_codes
            SET stripe_promotion_code_id = NULL
            WHERE id = ${codeId}
          `
        } else {
          return {
            success: false,
            error: result.error || 'Stripe update failed',
          }
        }
      }
    }

    // 3. Update database
    await sql`
      UPDATE referral_codes
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${codeId}
    `

    revalidatePath('/admin/referrals')
    return { success: true, warning }
  } catch (error: any) {
    console.error('[referrals] Failed to toggle code status:', error)
    return { success: false, error: error.message || 'Failed to toggle status' }
  }
}

/**
 * Delete (soft) a referral code - just sets is_active = false
 */
export async function deleteReferralCode(
  codeId: string
): Promise<{ success: boolean; error?: string }> {
  // Soft delete: just disable the code
  return toggleCodeStatus(codeId, false)
}

// ---------------------------------------------------------------------------
// Data Fetching (for server components, not actions)
// ---------------------------------------------------------------------------

/**
 * Fetch referral codes with filtering
 */
export async function fetchReferralCodes(params: {
  tier?: string
  status?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  limit?: number
}): Promise<ReferralCodeRow[]> {
  const sql = getSql()

  const tier = params.tier || null
  const status = params.status || null
  const search = params.search || ''
  const limit = params.limit || 50
  const sortField = params.sort || 'created_at'
  const sortOrder = params.order === 'asc' ? 'ASC' : 'DESC'

  // Whitelist sort columns
  const validSorts: Record<string, any> = {
    created_at: sql`created_at`,
    code: sql`code`,
    redemption_count: sql`redemption_count`,
    total_reward_paid_cents: sql`total_reward_paid_cents`,
  }
  const orderBy = validSorts[sortField] || validSorts.created_at

  const codes = await sql<ReferralCodeRow[]>`
    SELECT *
    FROM referral_codes
    WHERE
      (${tier}::text IS NULL OR tier = ${tier})
      AND (
        ${status}::text IS NULL OR
        (${status} = 'active' AND is_active = true) OR
        (${status} = 'inactive' AND is_active = false)
      )
      AND (${search} = '' OR code ILIKE ${'%' + search + '%'} OR company_name ILIKE ${'%' + search + '%'})
    ORDER BY ${orderBy} ${sql.unsafe(sortOrder)}
    LIMIT ${limit}
  `

  return codes
}

/**
 * Fetch a single referral code by ID
 */
export async function fetchReferralCode(
  codeId: string
): Promise<ReferralCodeRow | null> {
  const sql = getSql()
  const [code] = await sql<ReferralCodeRow[]>`
    SELECT * FROM referral_codes WHERE id = ${codeId}
  `
  return code || null
}

/**
 * Fetch conversions for a referral code
 */
export async function fetchConversions(params: {
  codeId?: string
  status?: string
  limit?: number
}): Promise<ConversionRow[]> {
  const sql = getSql()

  const codeId = params.codeId || null
  const status = params.status || null
  const limit = params.limit || 50

  const conversions = await sql<ConversionRow[]>`
    SELECT
      c.*,
      rc.code as referrer_code,
      l.company as referee_company,
      s.customer_email as referee_email
    FROM referral_conversions c
    LEFT JOIN referral_codes rc ON rc.id = c.referrer_code_id
    LEFT JOIN sales s ON s.id = c.referee_sale_id
    LEFT JOIN leads l ON l.id = c.referee_lead_id
    WHERE
      (${codeId}::text IS NULL OR c.referrer_code_id = ${codeId})
      AND (${status}::text IS NULL OR c.payout_status = ${status})
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `

  return conversions
}

// ---------------------------------------------------------------------------
// Config Management
// ---------------------------------------------------------------------------

/**
 * Fetch all referral config values
 */
export async function fetchReferralConfig(): Promise<
  Record<ReferralConfigKey, any>
> {
  const sql = getSql()

  const rows = await sql<{ key: string; value: any }[]>`
    SELECT key, value FROM referral_config
  `

  // Build config object with defaults
  const config: Record<string, any> = {
    ff_enabled: true,
    default_standard_discount_cents: 10000,
    default_standard_reward_cents: 10000,
    default_ff_discount_cents: 10000,
    default_affiliate_discount_cents: 10000,
    default_affiliate_reward_percent: 10,
  }

  for (const row of rows) {
    // Values are stored as JSON strings, need to parse them
    try {
      config[row.key] =
        typeof row.value === 'string' ? JSON.parse(row.value) : row.value
    } catch {
      config[row.key] = row.value
    }
  }

  return config as Record<ReferralConfigKey, any>
}

/**
 * Update referral config values
 */
export async function updateReferralConfig(
  data: UpdateConfigFormData
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate with Zod
  const result = updateConfigSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const validated = result.data
  const sql = getSql()

  try {
    // 2. Upsert each config value
    const entries = Object.entries(validated).filter(
      ([_, value]) => value !== undefined
    )

    for (const [key, value] of entries) {
      await sql`
        INSERT INTO referral_config (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = ${JSON.stringify(value)},
          updated_at = NOW()
      `
    }

    revalidatePath('/admin/referrals')
    revalidatePath('/admin/referrals/settings')
    return { success: true }
  } catch (error: any) {
    console.error('[referrals] Failed to update config:', error)
    return { success: false, error: error.message || 'Failed to update config' }
  }
}
