# ADR-P07: Deployment - Separate Projects

**Status**: Decided

**Context**:
We need to decide whether to merge the `anthrasite.io` and `LeadShop` codebases into a single monorepo or keep them as separate projects.

**Decision**:
`anthrasite.io` and `LeadShop` will remain **separate projects and deployments**. `anthrasite.io` will be hosted on Vercel, and `LeadShop` will continue to run on its dedicated Mac mini.

**Consequences**:
- **Pros**:
    - **Clear separation of concerns**: The public-facing marketing/sales site is fully isolated from the internal data processing engine.
    - **Independent deployment cycles**: Changes to the website do not require a deployment of the backend worker, and vice-versa.
    - **Optimized hosting**: Each project can use the hosting environment best suited to its needs (Vercel for frontend, dedicated hardware for long-running compute).
- **Cons**:
    - Requires a durable communication bridge between the two systems (addressed by ADR-P03).
