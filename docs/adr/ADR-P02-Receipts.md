# ADR-P02: Receipts - Stripe Branded Receipts

**Status**: Decided

**Context**:
After a successful payment, customers expect a receipt for their records. The default Stripe receipts are functional but not brand-aligned.

**Decision**:
We will enable Stripe's automated receipts and configure a **custom sending domain**. This ensures that receipts are sent from an `@anthrasite.io` email address and carry our branding.

**Consequences**:

- **Pros**:
  - Professional, brand-aligned customer communication.
  - Offloads receipt generation and delivery to Stripe.
  - Requires DNS changes (SPF/DKIM) which also improve overall email deliverability.
- **Cons**:
  - Initial setup requires DNS configuration and verification with Stripe.
