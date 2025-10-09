# ADR-P06: Pricing - Server-Side Allow-List

**Status**: Decided

**Context**:
We need a way to offer different price points for different campaigns or customer segments. This pricing information needs to be securely communicated to the payment page.

**Decision**:
Pricing will be controlled by a **server-side allow-list**. The UTM token will carry a `tier` label (e.g., `standard`, `premium`). When creating the Stripe Payment Intent, the server will look up this tier in a predefined map (`PRICE_TIERS`) to determine the correct amount. If the tier is not in the allow-list, the transaction will be rejected.

**Consequences**:

- **Pros**:
  - **Secure**: Prevents client-side price manipulation. The server is the single source of truth for pricing.
  - **Flexible**: Allows marketing to create new campaigns with different pricing tiers by simply updating the server-side configuration.
- **Cons**:
  - Requires a deployment to add or change pricing tiers.
