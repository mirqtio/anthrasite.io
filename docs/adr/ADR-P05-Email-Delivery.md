# ADR-P05: Email Delivery Provider for MVP

**Status**: Accepted
**Date**: 2025-10-08

## Context

The application needs to send transactional emails with PDF attachments to customers after a successful purchase. We need a reliable and cost-effective email delivery solution for the MVP phase.

## Decision

We will use the existing **Google Workspace (Gmail) SMTP service** as our initial email provider.

The implementation will include a **switchable provider interface** to make it easy to migrate to a dedicated transactional email service (like Postmark or SendGrid) in the future.

## Consequences

### Positive

-   **Zero Additional Cost**: Leverages our existing Google Workspace subscription.
-   **Fast Implementation**: Simple to configure using `nodemailer`.
-   **Sufficient for MVP**: The daily sending limits (~500-2000 emails/day) are well above our projected needs.

### Negative

-   **Limited Scalability**: Not suitable for high-volume sending.
-   **Basic Deliverability Analytics**: Lacks the advanced analytics and reputation management of a commercial ESP.

## Implementation Notes

**G3 Archive (2025-10-07):**
-   All legacy SendGrid files archived to `_archive/lib/email/`.
-   Implemented Gmail SMTP provider in `lib/email/gmail.ts`.
-   Created error stub at `lib/email/sendgrid.ts` to catch legacy imports.

**Active Implementation:**
-   **Provider**: `lib/email/gmail.ts`
-   **Transport**: Gmail SMTP via `nodemailer` (smtp.gmail.com:587)
-   **Required environment variables**: `GMAIL_USER`, `GMAIL_APP_PASSWORD`