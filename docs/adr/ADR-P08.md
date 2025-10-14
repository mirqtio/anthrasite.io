# ADR-P08: Real-Time Worker Migration to Vultr VPC

**Date**: 2025-10-12
**Status**: Accepted

## Context

The original system architecture, as defined in `ADR-P03`, planned for a Mac mini to handle all background processing tasks, including both heavy, non-time-sensitive batch jobs (like bulk lead analysis) and critical, real-time user-facing tasks (like generating a report immediately after payment).

During the implementation and hardening of the CI/CD pipeline and E2E tests, it became clear that this approach mixed two very different types of workloads, creating a potential single point of failure and a performance bottleneck for the core user journey.

## Decision

We will migrate all real-time, user-facing background work to a lightweight, scalable worker running in a container on a Vultr VPC. The Mac mini will be retained exclusively for its original purpose of heavy, non-time-sensitive batch processing.

**New Real-Time Workflow:**

1. A Stripe payment event is received by a public webhook (on Vercel or Vultr).
2. The event is validated, deduplicated, and a job is enqueued into a durable queue (e.g., Redis, SQS).
3. The **Vultr worker** consumes the job from the queue.
4. The worker triggers a Temporal workflow to orchestrate report generation (DocRaptor) and delivery (Postmark/SMTP).

This decision explicitly **supersedes the worker location specified in ADR-P03**.

## Consequences

### Positive:

- **Improved Durability & Scalability**: The core payment-to-delivery pipeline is now hosted on scalable cloud infrastructure, independent of the physical Mac mini.
- **Clear Separation of Concerns**: Real-time, transactional jobs are isolated from long-running, resource-intensive batch jobs, preventing resource contention.
- **Simplified Maintenance**: The Vultr worker can be managed with standard container orchestration and IaC practices.

### Negative:

- **Increased Infrastructure Complexity**: We now manage an additional service in a Vultr VPC, which requires its own monitoring and maintenance.
- **Minor Cost Increase**: Incurs a small monthly cost for the Vultr instance and any associated services (e.g., managed queue).
