# Key Architectural Decisions

## Overview

This project follows a documented ADR (Architectural Decision Record) process. All major decisions are recorded in `/docs/adr/` with rationale and tradeoffs.

## Core ADRs Summary

### ADR-P01: Payment UX

**Decision**: Use Stripe's embedded **Payment Element** instead of redirect-based Checkout  
**Rationale**:

- Seamless on-page experience
- Users stay on our domain
- Better conversion rates
- Modern, customizable UI

**Implementation**: Payment Element renders in purchase page, integrated with Stripe.js

### ADR-P02: Receipts

**Decision**: Enable Stripe's automated receipts with custom sending domain  
**Rationale**:

- Offload receipt generation to Stripe
- Maintain brand consistency
- Reduce development overhead

**Implementation**: Configure Stripe to send receipts from `@anthrasite.io`

### ADR-P03: Website ↔ LeadShop Bridge

**Decision**: Use managed queue (SQS/Upstash) for communication  
**Rationale**:

- Durable message delivery
- Decouples web app from report generation
- Worker can be offline temporarily
- Reliable retry mechanism

**Implementation**:

- Vercel webhook enqueues `payment_completed` jobs
- Mac mini worker polls queue
- Temporal handles workflow orchestration

### ADR-P04: PDF Engine

**Decision**: Use **Playwright's print-to-PDF** for MVP  
**Rationale**:

- Leverages existing infrastructure
- No additional service costs
- Can upgrade to DocRaptor later
- Full HTML/CSS rendering capabilities

**Implementation**: Playwright generates PDF from HTML template in Temporal workflow

### ADR-P05: Email Delivery

**Decision**: Use **Gmail SMTP** with nodemailer (replaced SendGrid in G3)  
**Rationale**:

- Simple, reliable delivery
- No vendor lock-in
- Easy migration path to Postmark/SES
- Gmail app passwords for authentication

**Implementation**:

- Provider interface in `lib/email/`
- Gmail SMTP via nodemailer
- Idempotency via database timestamp
- Feature flag for dry-run mode

### ADR-P06: Pricing

**Decision**: **Server-side allowlist** for pricing control  
**Rationale**:

- Prevent client-side price manipulation
- UTM token carries tier label only
- Server validates tier → amount mapping
- Security through validation

**Implementation**:

- UTM metadata includes `tier` field
- Server maintains `tier → amount` map
- Client never sends price amount
- Validation in checkout endpoint

### ADR-P07: Deployment

**Decision**: Separate deployments for `anthrasite.io` and `LeadShop`  
**Rationale**:

- Different infrastructure needs
- Independent scaling
- Security isolation
- Clear separation of concerns

**Implementation**:

- `anthrasite.io` → Vercel (public-facing)
- `LeadShop` → Mac mini (internal, secure)
- Managed queue bridges communication

### ADR-P08: Build-Time Rendering Strategy

**Decision**: Force dynamic rendering for pages with runtime dependencies  
**Rationale**:

- Prevent build hangs with hooks
- Explicit control over rendering strategy
- Client-only imports for dynamic components

**Implementation**:

- `export const dynamic = 'force-dynamic'` on pages
- `dynamic(() => import(), { ssr: false })` for client components
- Careful hook dependency management

## Design Patterns

### Idempotency Pattern

All critical operations are idempotent:

- **Webhook processing**: Event ID deduplication
- **Email sending**: Database timestamp check
- **Workflow kickoff**: Temporal's built-in deduplication

### Progressive Enhancement

Start with simple, proven solutions that can be upgraded:

- ✅ Playwright PDF → 📈 DocRaptor
- ✅ Gmail SMTP → 📈 Postmark/SES
- ✅ Basic queue → 📈 Advanced message routing

### Feature Flags

Safe rollout of new features:

```typescript
if (process.env.NEXT_PUBLIC_USE_PAYMENT_ELEMENT === 'true') {
  // New Payment Element flow
} else {
  // Legacy redirect flow
}
```

### Separation of Concerns

Clear boundaries between systems:

- **Public layer** (Vercel): Payment, UTM validation, job enqueuing
- **Private layer** (Mac mini): Report generation, business logic
- **Communication**: Asynchronous via managed queue

### Error Handling Strategy

- **API Routes**: Try-catch with structured logging
- **Webhooks**: Return 200 even on processing errors (log for monitoring)
- **Client**: Error boundaries and graceful fallbacks
- **Email**: Silent failure with monitoring alerts

## Technology Choices

### Why Next.js 14 App Router?

- Server Components for optimal performance
- Server Actions for form handling
- Built-in API routes
- Vercel deployment synergy

### Why PostgreSQL + Prisma?

- Relational data model fits business entities
- Type-safe database access
- Migration management
- Easy local development

### Why Stripe Payment Element?

- Modern, customizable UI
- PCI compliance handled
- Strong TypeScript support
- On-page checkout UX

### Why Playwright for E2E?

- Cross-browser testing
- Visual regression capabilities
- Modern API with auto-waiting
- Great debugging tools

## Evolution History

### Phase G1 (October 2025): Codebase Cleanup

- Archived legacy code to `_archive/`
- Removed unused dependencies
- Fixed build hangs
- Established clean baseline

### Phase D3 (Completed): Email Confirmation

- Implemented Gmail SMTP delivery
- Built idempotency layer
- Added dry-run mode for testing
- Replaced SendGrid provider

### Phase A1 (In Progress): Payment Element Migration

- Migrating from Checkout redirect
- Implementing embedded Payment Element
- Dual webhook support during transition
- Feature flag for safe rollout

## Future Considerations

### Scalability Upgrades

- **PDF Generation**: Move to DocRaptor for parallel processing
- **Email**: Migrate to Postmark for better deliverability
- **Queue**: Add advanced routing and priority handling
- **Monitoring**: Enhanced alerting and dashboards

### Feature Additions

- Price tiers (A2)
- Abandoned cart recovery (D4)
- Advanced analytics
- Report customization

## Reference

For detailed rationale and tradeoffs, see individual ADR files in `/docs/adr/`
