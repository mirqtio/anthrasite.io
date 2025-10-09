# Project Structure

## Root Directory

```
anthrasite.io/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable React components
├── lib/              # Shared utilities and business logic
├── prisma/           # Database schema and migrations
├── e2e/              # Playwright end-to-end tests
├── __tests__/        # Jest unit tests
├── docs/             # Documentation and ADRs
├── public/           # Static assets
├── scripts/          # Build and deployment scripts
├── types/            # TypeScript type definitions
├── _archive/         # Historical code from pre-G1 cleanup
└── [config files]    # Various configuration files
```

## Key Directories

### `/app` - Next.js Application

```
app/
├── api/                    # API routes
│   ├── checkout/
│   │   └── session/       # Stripe Checkout Session creation
│   ├── webhooks/
│   │   └── stripe/        # Stripe webhook handler
│   ├── admin/
│   │   └── generate-utm/  # UTM token generation
│   ├── waitlist/          # Waitlist endpoints
│   └── health/            # Health check endpoint
├── purchase/              # Purchase flow pages
│   ├── success/           # Post-purchase success page
│   └── page.tsx           # Main purchase page
├── _components/           # App-specific components
│   ├── Analytics/         # Analytics wrapper components
│   └── WaitlistForm/      # Waitlist form
├── layout.tsx             # Root layout
├── page.tsx               # Homepage
└── globals.css            # Global styles
```

### `/lib` - Shared Libraries

```
lib/
├── stripe/                # Stripe integration
│   ├── checkout.ts        # Checkout session creation
│   ├── client.tsx         # Client-side Stripe loader
│   └── config.ts          # Stripe configuration
├── email/                 # Email services
│   ├── gmail.ts           # Gmail SMTP implementation
│   ├── index.ts           # Email facade with idempotency
│   └── templates/         # Email templates
├── analytics/             # Analytics integration
│   ├── providers/         # GA4, PostHog, Hotjar
│   ├── analytics-client.ts
│   └── analytics-server.ts
├── utm/                   # UTM token handling
│   ├── crypto.ts          # Token validation/generation
│   └── hooks.ts           # React hooks
├── purchase/              # Purchase business logic
│   ├── purchase-service.ts     # Main service
│   └── purchase-service-dev.ts # Dev/mock service
├── db/                    # Database utilities
│   ├── db.ts              # Prisma client
│   └── queries.ts         # Reusable queries
├── monitoring/            # Monitoring setup
│   ├── sentry-lazy.ts     # Lazy-loaded Sentry
│   └── datadog.ts         # Datadog RUM
└── context/               # React contexts
    ├── SiteModeContext.tsx
    └── ConsentContext.tsx
```

### `/components` - Reusable Components

```
components/
├── purchase/              # Purchase-specific components
│   ├── PurchaseHero.tsx
│   ├── PricingCard.tsx
│   ├── ReportPreview.tsx
│   ├── TrustSignals.tsx
│   └── CheckoutForm.tsx   # (To be created in A1)
├── ErrorBoundary.tsx
├── Skeleton.tsx
└── [other UI components]
```

### `/prisma` - Database

```
prisma/
├── schema.prisma          # Database schema definition
├── migrations/            # Migration history
└── seed.ts                # Database seeding script
```

### `/e2e` - End-to-End Tests

```
e2e/
├── smoke.spec.ts          # Critical path smoke tests (@smoke tag)
├── purchase-flow.spec.ts  # Complete purchase journey
├── waitlist.spec.ts       # Waitlist functionality
├── utm-validation.spec.ts # UTM token validation
├── consent.spec.ts        # Cookie consent
└── [other test suites]
```

### `/docs` - Documentation

```
docs/
├── adr/                   # Architectural Decision Records
│   ├── ADR-P01-Payment-UX.md
│   ├── ADR-P02-Receipts.md
│   ├── ADR-P03-Bridge.md
│   ├── ADR-P04-PDF-Engine.md
│   ├── ADR-P05-Email-Delivery.md
│   ├── ADR-P06-Pricing.md
│   ├── ADR-P07-Deployment.md
│   └── ADR-P08-build-time-rendering-strategy.md
├── TESTING.md             # Testing guidelines
├── D3_IMPLEMENTATION_COMPLETE.md
└── [other documentation]
```

## Configuration Files

### Core Configs

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `prisma/schema.prisma` - Database schema

### Quality Tools

- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `.lintstagedrc.json` - Pre-commit lint-staged config
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright E2E config
- `playwright-visual.config.ts` - Visual regression config

### CI/CD

- `.github/workflows/` - GitHub Actions workflows
- `docker-compose.yml` - Local Docker setup
- `docker-compose.test.yml` - Test environment
- `Dockerfile.ci` - CI container definition

### Monitoring

- `sentry.client.config.ts` - Client-side Sentry
- `sentry.server.config.ts` - Server-side Sentry
- `sentry.edge.config.ts` - Edge runtime Sentry

## Method & Process Files

- `METHOD.md` - Collaborative process definition
- `SYSTEM.md` - Architectural ground truth
- `ISSUES.md` - Issue tracking and history
- `SCRATCHPAD.md` - Active task communication
- `CLAUDE.md` - Claude-specific instructions

## Data Models (Prisma Schema)

### Core Entities

- `Business` - Customer business information
- `Purchase` - Payment transaction records
- `UtmToken` - Tokenized tracking links
- `WaitlistEntry` - Waitlist signups
- `AbandonedCart` - Cart abandonment tracking
- `AnalyticsEvent` - Event tracking

## Feature Flag Pattern

Environment variables control feature rollout:

- `NEXT_PUBLIC_FF_WAITLIST_ENABLED`
- `NEXT_PUBLIC_FF_PURCHASE_ENABLED`
- `NEXT_PUBLIC_USE_PAYMENT_ELEMENT` (A1)
- `NEXT_PUBLIC_USE_MOCK_PURCHASE` (dev mode)

## Archive Strategy

The `/_archive` directory contains all code from before the G1 cleanup (October 2025). This provides:

- Historical reference
- Easy restoration if needed
- Clear separation from active codebase
