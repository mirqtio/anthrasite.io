# ADR-001: Email Service Provider for MVP

**Date**: 2025-10-08

**Status**: Accepted

## Context

The application needs to send transactional emails, specifically the final report, to customers after a successful purchase. We need a reliable and cost-effective email delivery solution for the Minimum Viable Product (MVP) phase.

## Decision

We will use the existing **Google Workspace (Gmail) SMTP service** as our initial email provider.

This will be implemented with a simple, switchable provider interface in the codebase to allow for a seamless transition to a more robust, dedicated email service provider (ESP) like Postmark or SendGrid in the future.

## Consequences

### Positive

- **Zero Additional Cost**: Leverages our existing Google Workspace subscription.
- **Fast Implementation**: Simple to configure using standard SMTP libraries, with no need to sign up for a new third-party service.
- **Sufficient for MVP**: The daily sending limits of Gmail SMTP (~500 emails/day) are well above our projected needs for the initial launch.

### Negative

- **Limited Scalability**: Not suitable for high-volume sending. We will need to migrate to a dedicated ESP as volume grows.
- **Basic Deliverability**: Lacks the advanced deliverability analytics, reputation management, and dedicated IP features of a commercial ESP.
- **Potential for Service Disruption**: Using a non-dedicated service for transactional mail carries a slightly higher risk of deliverability issues compared to a service designed for it.
