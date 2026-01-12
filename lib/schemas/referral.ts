import { z } from 'zod'

/**
 * Referral Code Validation Schemas
 *
 * Used for validating admin form inputs when creating/updating referral codes.
 */

// Code format: 3-20 uppercase alphanumeric characters
const codeSchema = z
  .string()
  .min(3, 'Code must be at least 3 characters')
  .max(20, 'Code must be at most 20 characters')
  .regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only')
  .transform((val) => val.toUpperCase())

// Tier enum
const tierSchema = z.enum(['standard', 'friends_family', 'affiliate'], {
  errorMap: () => ({ message: 'Please select a valid tier' }),
})

// Discount type enum
const discountTypeSchema = z.enum(['fixed', 'percent'], {
  errorMap: () => ({ message: 'Please select discount type' }),
})

// Reward type enum
const rewardTypeSchema = z.enum(['fixed', 'percent', 'none'], {
  errorMap: () => ({ message: 'Please select reward type' }),
})

// Reward trigger enum
const rewardTriggerSchema = z.enum(['first', 'every'], {
  errorMap: () => ({ message: 'Please select reward trigger' }),
})

/**
 * Schema for creating a new referral code
 */
export const createCodeSchema = z
  .object({
    code: codeSchema,
    tier: tierSchema,

    // Discount configuration
    discount_type: discountTypeSchema,
    discount_amount_cents: z
      .number()
      .min(100, 'Minimum discount is $1.00')
      .max(19900, 'Maximum discount is $199.00')
      .optional(),
    discount_percent: z
      .number()
      .min(1, 'Minimum discount is 1%')
      .max(100, 'Maximum discount is 100%')
      .optional(),

    // Reward configuration
    reward_type: rewardTypeSchema,
    reward_amount_cents: z
      .number()
      .min(100, 'Minimum reward is $1.00')
      .max(50000, 'Maximum reward is $500.00')
      .optional(),
    reward_percent: z
      .number()
      .min(1, 'Minimum reward is 1%')
      .max(50, 'Maximum reward is 50%')
      .optional(),
    reward_trigger: rewardTriggerSchema.optional().default('first'),

    // Limits
    max_redemptions: z
      .number()
      .min(1, 'Minimum is 1 redemption')
      .max(10000, 'Maximum is 10,000 redemptions')
      .optional()
      .nullable(),
    max_reward_total_cents: z
      .number()
      .min(100, 'Minimum lifetime cap is $1.00')
      .max(10000000, 'Maximum lifetime cap is $100,000')
      .optional()
      .nullable(),
    max_reward_per_period_cents: z
      .number()
      .min(100, 'Minimum period cap is $1.00')
      .max(1000000, 'Maximum period cap is $10,000')
      .optional()
      .nullable(),
    reward_period_days: z
      .number()
      .min(1, 'Minimum period is 1 day')
      .max(365, 'Maximum period is 365 days')
      .optional()
      .nullable(),

    // Metadata
    expires_at: z.string().datetime().optional().nullable(),
    notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
  })
  .refine(
    (data) => {
      // Discount validation: must have amount if fixed, percent if percent
      if (data.discount_type === 'fixed') {
        return data.discount_amount_cents !== undefined
      }
      if (data.discount_type === 'percent') {
        return data.discount_percent !== undefined
      }
      return true
    },
    {
      message: 'Discount amount is required',
      path: ['discount_amount_cents'],
    }
  )
  .refine(
    (data) => {
      // Reward validation: must have amount if fixed, percent if percent
      if (data.reward_type === 'fixed') {
        return data.reward_amount_cents !== undefined
      }
      if (data.reward_type === 'percent') {
        return data.reward_percent !== undefined
      }
      return true // 'none' is valid without amounts
    },
    {
      message: 'Reward amount is required',
      path: ['reward_amount_cents'],
    }
  )
  .refine(
    (data) => {
      // Period cap requires period days
      if (data.max_reward_per_period_cents && !data.reward_period_days) {
        return false
      }
      return true
    },
    {
      message: 'Period days required when using period cap',
      path: ['reward_period_days'],
    }
  )

/**
 * Schema for updating an existing referral code
 */
export const updateCodeSchema = z.object({
  is_active: z.boolean().optional(),
  max_redemptions: z.number().min(1).max(10000).optional().nullable(),
  max_reward_total_cents: z
    .number()
    .min(100)
    .max(10000000)
    .optional()
    .nullable(),
  max_reward_per_period_cents: z
    .number()
    .min(100)
    .max(1000000)
    .optional()
    .nullable(),
  reward_period_days: z.number().min(1).max(365).optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
})

/**
 * Schema for updating global referral config
 */
export const updateConfigSchema = z.object({
  ff_enabled: z.boolean().optional(),
  default_standard_discount_cents: z.number().min(100).max(19900).optional(),
  default_standard_reward_cents: z.number().min(100).max(19900).optional(),
  default_ff_discount_cents: z.number().min(100).max(19900).optional(),
  default_affiliate_discount_cents: z.number().min(100).max(19900).optional(),
  default_affiliate_reward_percent: z.number().min(1).max(50).optional(),
})

// Type exports
export type CreateCodeFormData = z.infer<typeof createCodeSchema>
export type UpdateCodeFormData = z.infer<typeof updateCodeSchema>
export type UpdateConfigFormData = z.infer<typeof updateConfigSchema>
