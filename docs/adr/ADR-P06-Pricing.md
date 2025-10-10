# ADR-P06: Pricing - Server-Side Allow-List

**Status**: Decided (Updated 2025-10-09)

**Context**:
We need a way to offer different price points for different campaigns or customer segments. This pricing information needs to be securely communicated to the payment page.

**Decision**:
Pricing will be controlled by a **server-side allow-list**. The UTM token will carry a `tier` label (e.g., `basic`, `pro`). When creating the Stripe Payment Intent, the server will look up this tier in a predefined map (`PRICE_TIERS`) to determine the correct amount. If the tier is not in the allow-list, the transaction will be rejected.

### Locked Pricing Matrix (v1.0)

| Tier Key | Price | Amount (cents) | Product Name | Currency |
| -------- | ----- | -------------- | ------------ | -------- |
| `basic`  | $399  | 39900          | Basic Audit  | USD      |
| `pro`    | $699  | 69900          | Pro Audit    | USD      |

### Tier Source of Truth

- **Production**: Tier extracted from signed UTM token payload (JWT-based, validated server-side)
- **Development**: Query parameter `?tier=basic` fallback allowed (non-production environments only)
- **Admin Generator (EPIC B1)**: Will embed tier claim in UTM token; not required to ship EPIC A

**Implementation**:

```typescript
// lib/stripe/config.ts
export const PRICE_TIERS = {
  basic: { amount: 39900, currency: 'usd' as const, name: 'Basic Audit' },
  pro: { amount: 69900, currency: 'usd' as const, name: 'Pro Audit' },
} as const

export type TierKey = keyof typeof PRICE_TIERS
```

**Consequences**:

- **Pros**:
  - **Secure**: Prevents client-side price manipulation. The server is the single source of truth for pricing.
  - **Flexible**: Allows marketing to create new campaigns with different pricing tiers by simply updating the server-side configuration.
  - **Type-safe**: TypeScript enforces valid tier keys at compile time.
- **Cons**:
  - Requires a deployment to add or change pricing tiers.
  - New tiers require code + test updates (not just config change).
