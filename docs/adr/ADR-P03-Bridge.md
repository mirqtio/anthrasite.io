# ADR-P03: Website to LeadShop Bridge - Managed Queue

**Status**: Decided

**Context**:
We need a reliable way to trigger the internal `LeadShop` report generation workflow after a successful payment on the public `anthrasite.io` website. The `LeadShop` worker runs on a Mac mini and may not always be online.

**Decision**:
We will implement a **managed queue** (e.g., AWS SQS, Upstash) to act as a durable bridge. The `anthrasite.io` webhook listener will enqueue a job, and the `LeadShop` worker will consume from that queue.

**Consequences**:
- **Pros**:
    - **Durability**: If the `LeadShop` worker is offline, the job persists in the queue and will be processed when the worker comes back online.
    - **Decoupling**: The public website and internal worker are not directly dependent on each other's immediate availability.
    - **Scalability**: A queue-based system is a standard pattern for handling asynchronous tasks and can scale if needed.
- **Cons**:
    - Introduces an additional piece of infrastructure to manage and monitor.
