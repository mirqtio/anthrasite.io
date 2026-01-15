/**
 * Unit tests for referral payout calculation logic
 *
 * Tests calculateReward() with all scenarios:
 * - Tier-based (F&F, standard, affiliate)
 * - Reward types (fixed, percent, none)
 * - Reward triggers (first, every)
 * - Cap enforcement (lifetime, period)
 */

import type { ReferralCode } from '../validation'

// Mock Supabase before importing module under test
jest.mock('@/lib/supabase/admin', () => ({
  getAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))

// Import after mocking
import { calculateReward } from '../payout'

/**
 * Create a mock ReferralCode with sensible defaults
 */
function createMockCode(overrides: Partial<ReferralCode> = {}): ReferralCode {
  return {
    id: 'test-code-id',
    code: 'TESTCODE',
    stripe_promotion_code_id: 'promo_test',
    stripe_coupon_id: 'coupon_test',
    tier: 'standard',
    is_active: true,
    discount_type: 'fixed',
    discount_amount_cents: 10000,
    discount_percent: null,
    reward_type: 'fixed',
    reward_amount_cents: 10000,
    reward_percent: null,
    reward_trigger: 'first',
    max_redemptions: null,
    redemption_count: 0,
    max_reward_total_cents: null,
    max_reward_per_period_cents: null,
    reward_period_days: null,
    total_reward_paid_cents: 0,
    period_reward_paid_cents: 0,
    pending_payout_cents: 0,
    period_start_at: null,
    sale_id: 1,
    lead_id: 1,
    company_name: 'Test Company',
    expires_at: null,
    ...overrides,
  }
}

describe('calculateReward', () => {
  const SALE_PRICE = 19900 // $199

  describe('No reward scenarios', () => {
    it('returns zero for Friends & Family tier', async () => {
      const code = createMockCode({ tier: 'friends_family' })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result).toEqual({
        earnedCents: 0,
        payableCents: 0,
        reason: 'no_reward_configured',
        skipPayout: true,
      })
    })

    it('returns zero when reward_type is none', async () => {
      const code = createMockCode({ reward_type: 'none' })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result).toEqual({
        earnedCents: 0,
        payableCents: 0,
        reason: 'no_reward_configured',
        skipPayout: true,
      })
    })

    it('returns zero for first-only trigger when not first conversion', async () => {
      const code = createMockCode({
        reward_trigger: 'first',
        reward_amount_cents: 10000,
      })

      const result = await calculateReward(code, SALE_PRICE, false) // NOT first conversion

      expect(result).toEqual({
        earnedCents: 0,
        payableCents: 0,
        reason: 'first_only_already_paid',
        skipPayout: true,
      })
    })
  })

  describe('Fixed reward calculation', () => {
    it('calculates full fixed reward on first conversion', async () => {
      const code = createMockCode({
        reward_type: 'fixed',
        reward_amount_cents: 10000, // $100
        reward_trigger: 'first',
      })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result).toEqual({
        earnedCents: 10000,
        payableCents: 10000,
        reason: 'full_reward',
        skipPayout: false,
      })
    })

    it('calculates full fixed reward for every trigger', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000, // $50
        reward_trigger: 'every',
      })

      const result = await calculateReward(code, SALE_PRICE, false) // Not first, but trigger=every

      expect(result).toEqual({
        earnedCents: 5000,
        payableCents: 5000,
        reason: 'full_reward',
        skipPayout: false,
      })
    })
  })

  describe('Percent reward calculation', () => {
    it('calculates percent-based reward correctly', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'percent',
        reward_amount_cents: null,
        reward_percent: 10, // 10%
        reward_trigger: 'every',
      })

      const result = await calculateReward(code, SALE_PRICE, true)

      // 10% of $199 = $19.90 = 1990 cents
      expect(result.earnedCents).toBe(1990)
      expect(result.payableCents).toBe(1990)
      expect(result.reason).toBe('full_reward')
      expect(result.skipPayout).toBe(false)
    })

    it('rounds percent reward to nearest cent', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'percent',
        reward_amount_cents: null,
        reward_percent: 7, // 7%
        reward_trigger: 'every',
      })

      // 7% of $199 = $13.93 = 1393 cents
      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result.earnedCents).toBe(1393)
    })
  })

  describe('Lifetime cap enforcement', () => {
    it('returns zero when lifetime cap already reached', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000,
        reward_trigger: 'every',
        max_reward_total_cents: 10000, // $100 lifetime cap
        total_reward_paid_cents: 10000, // Already at cap
      })

      const result = await calculateReward(code, SALE_PRICE, false)

      expect(result).toEqual({
        earnedCents: 5000, // Still "earned" but not payable
        payableCents: 0,
        reason: 'lifetime_cap_reached',
        skipPayout: true,
      })
    })

    it('caps payout when nearing lifetime limit', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000, // $50 per conversion
        reward_trigger: 'every',
        max_reward_total_cents: 10000, // $100 lifetime cap
        total_reward_paid_cents: 7000, // $70 already paid, $30 remaining
      })

      const result = await calculateReward(code, SALE_PRICE, false)

      expect(result.earnedCents).toBe(5000) // Would earn $50
      expect(result.payableCents).toBe(3000) // But only $30 payable
      expect(result.reason).toBe('capped')
      expect(result.skipPayout).toBe(false)
    })
  })

  describe('Period cap enforcement', () => {
    it('returns zero when period cap already reached', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000,
        reward_trigger: 'every',
        max_reward_per_period_cents: 10000, // $100 per period
        reward_period_days: 30,
        period_reward_paid_cents: 10000, // Already at cap for this period
        period_start_at: new Date().toISOString(), // Current period
      })

      const result = await calculateReward(code, SALE_PRICE, false)

      expect(result).toEqual({
        earnedCents: 5000,
        payableCents: 0,
        reason: 'period_cap_reached',
        skipPayout: true,
      })
    })

    it('caps payout when nearing period limit', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000, // $50 per conversion
        reward_trigger: 'every',
        max_reward_per_period_cents: 10000, // $100 per period
        reward_period_days: 30,
        period_reward_paid_cents: 8000, // $80 paid, $20 remaining
        period_start_at: new Date().toISOString(),
      })

      const result = await calculateReward(code, SALE_PRICE, false)

      expect(result.earnedCents).toBe(5000)
      expect(result.payableCents).toBe(2000) // Only $20 payable
      expect(result.reason).toBe('capped')
    })
  })

  describe('Combined caps', () => {
    it('applies more restrictive cap (lifetime)', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000, // $50 per conversion
        reward_trigger: 'every',
        max_reward_total_cents: 10000, // $100 lifetime
        total_reward_paid_cents: 9000, // $10 remaining lifetime
        max_reward_per_period_cents: 20000, // $200 per period (more generous)
        reward_period_days: 30,
        period_reward_paid_cents: 0, // Full period remaining
        period_start_at: new Date().toISOString(),
      })

      const result = await calculateReward(code, SALE_PRICE, false)

      // Lifetime cap ($10) is more restrictive than period ($200)
      expect(result.earnedCents).toBe(5000)
      expect(result.payableCents).toBe(1000) // Only $10 payable (lifetime cap)
      expect(result.reason).toBe('capped')
    })

    it('applies more restrictive cap (period)', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'fixed',
        reward_amount_cents: 5000, // $50 per conversion
        reward_trigger: 'every',
        max_reward_total_cents: 100000, // $1000 lifetime (generous)
        total_reward_paid_cents: 0, // Full lifetime remaining
        max_reward_per_period_cents: 10000, // $100 per period
        reward_period_days: 30,
        period_reward_paid_cents: 9000, // $10 remaining this period
        period_start_at: new Date().toISOString(),
      })

      const result = await calculateReward(code, SALE_PRICE, false)

      // Period cap ($10) is more restrictive than lifetime ($1000)
      expect(result.earnedCents).toBe(5000)
      expect(result.payableCents).toBe(1000) // Only $10 payable (period cap)
      expect(result.reason).toBe('capped')
    })
  })

  describe('Edge cases', () => {
    it('handles zero reward amount gracefully', async () => {
      const code = createMockCode({
        reward_type: 'fixed',
        reward_amount_cents: 0,
      })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result).toEqual({
        earnedCents: 0,
        payableCents: 0,
        reason: 'zero_reward',
        skipPayout: true,
      })
    })

    it('handles null reward amount with fixed type', async () => {
      const code = createMockCode({
        reward_type: 'fixed',
        reward_amount_cents: null,
      })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result).toEqual({
        earnedCents: 0,
        payableCents: 0,
        reason: 'zero_reward',
        skipPayout: true,
      })
    })

    it('handles 0% reward', async () => {
      const code = createMockCode({
        reward_type: 'percent',
        reward_amount_cents: null,
        reward_percent: 0,
      })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result).toEqual({
        earnedCents: 0,
        payableCents: 0,
        reason: 'zero_reward',
        skipPayout: true,
      })
    })

    it('handles 100% reward', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'percent',
        reward_amount_cents: null,
        reward_percent: 100,
        reward_trigger: 'every',
      })

      const result = await calculateReward(code, SALE_PRICE, true)

      expect(result.earnedCents).toBe(19900) // Full sale price
      expect(result.payableCents).toBe(19900)
    })

    it('handles very small sale amounts', async () => {
      const code = createMockCode({
        tier: 'affiliate',
        reward_type: 'percent',
        reward_amount_cents: null,
        reward_percent: 10,
        reward_trigger: 'every',
      })

      // 10% of $1 = 10 cents
      const result = await calculateReward(code, 100, true)

      expect(result.earnedCents).toBe(10)
    })
  })
})
