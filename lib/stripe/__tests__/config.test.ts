import { PRICE_TIERS, type TierKey } from '../config'

describe('PRICE_TIERS', () => {
  it('has correct amounts', () => {
    expect(PRICE_TIERS.basic.amount).toBe(39900)
    expect(PRICE_TIERS.pro.amount).toBe(69900)
  })

  it('has USD currency', () => {
    expect(PRICE_TIERS.basic.currency).toBe('usd')
    expect(PRICE_TIERS.pro.currency).toBe('usd')
  })

  it('has correct product names', () => {
    expect(PRICE_TIERS.basic.name).toBe('Basic Audit')
    expect(PRICE_TIERS.pro.name).toBe('Pro Audit')
  })

  it('rejects unknown tiers at runtime', () => {
    const unknownTier = 'premium' as any
    expect(PRICE_TIERS[unknownTier]).toBeUndefined()
  })

  it('has exactly 2 tiers', () => {
    const tiers = Object.keys(PRICE_TIERS)
    expect(tiers).toHaveLength(2)
    expect(tiers).toEqual(['basic', 'pro'])
  })

  it('type check: TierKey only allows valid tiers', () => {
    const validTier: TierKey = 'basic'
    expect(PRICE_TIERS[validTier]).toBeDefined()

    const anotherValidTier: TierKey = 'pro'
    expect(PRICE_TIERS[anotherValidTier]).toBeDefined()

    // TypeScript will error on this line at compile time:
    // const invalidTier: TierKey = 'premium'
  })
})
