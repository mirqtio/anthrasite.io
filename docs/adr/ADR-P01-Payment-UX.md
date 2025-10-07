# ADR-P01: Payment UX - Stripe Payment Element

**Status**: Decided

**Context**:
The previous payment flow involved a redirect to a Stripe-hosted checkout page. This creates a disjointed user experience and removes the user from our site, making it harder to control the branding and post-payment transition.

**Decision**:
We will use Stripe's embedded **Payment Element**. This allows for a seamless, on-page checkout experience where the user never leaves `anthrasite.io`.

**Consequences**:
- **Pros**:
    - Tightly integrated and branded user experience.
    - More control over the UI and success/failure states.
    - Reduces user drop-off by keeping them on-site.
- **Cons**:
    - Requires more frontend and backend work to implement compared to a simple redirect.
