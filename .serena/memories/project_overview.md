# Anthrasite.io - Project Overview

## Purpose

Anthrasite.io is a B2B payment and report delivery platform for website performance audits. It handles customer payments via Stripe and coordinates with an internal report generation system (LeadShop) to deliver comprehensive PDF audit reports.

## Tech Stack

### Core Framework

- **Next.js 14**: App Router with Server Components and Server Actions
- **React 18**: UI library with Framer Motion for animations
- **TypeScript 5.8**: Strongly typed development

### Backend & Data

- **PostgreSQL + Prisma**: Database ORM for Business, Purchase, UtmToken models
- **Stripe**: Payment processing (Payment Element for embedded checkout)
- **Gmail SMTP (nodemailer)**: Email delivery for purchase confirmations

### Styling & UI

- **Tailwind CSS 4**: Utility-first styling with custom design tokens
- **Lucide React**: Icon library
- **class-variance-authority + clsx**: Conditional styling utilities

### Testing & Quality

- **Playwright**: E2E browser testing (including visual regression)
- **Jest + React Testing Library**: Unit/integration testing
- **ESLint + Prettier**: Code quality and formatting
- **Husky + lint-staged**: Pre-commit hooks

### Monitoring & Analytics

- **Sentry**: Error tracking
- **Datadog**: RUM and logging
- **PostHog + GA4**: Product analytics

### Infrastructure

- **Vercel**: Hosting and deployment
- **GitHub Actions**: CI/CD pipeline
- **Docker**: Local test environment matching CI

## System Architecture

The system is split into two environments:

1. **anthrasite.io (Vercel)**: Public-facing payment processing

   - UTM-tokenized purchase pages
   - Stripe Payment Element integration
   - Webhook processing for payment events
   - Job enqueuing for report generation

2. **LeadShop (Mac Mini)**: Internal report generation
   - Queue consumer worker
   - Temporal workflow orchestration
   - Playwright PDF generation
   - S3 storage for reports
   - Gmail SMTP for delivery

Communication between systems happens via a managed queue (SQS/Upstash).
