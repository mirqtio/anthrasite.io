# Anthrasite.io Implementation Plan

## Overview
This plan ensures coherent development through context limits by breaking the project into discrete, testable features. Each feature will be fully implemented, tested, and merged before proceeding to the next.

## Configuration Notes
- **Database**: Vercel Postgres for production, local PostgreSQL for development
- **Email**: SendGrid account available
- **Payments**: Stripe account available
- **Analytics**: DataDog and Sentry configured, GA4 and PostHog to be created
- **Domain Validation**: Use DNS-over-HTTPS API (e.g., Cloudflare DNS API) for reliability
- **Report Generation**: External system (out of scope) - triggered by Stripe webhook

## Critical Gap Additions
This plan addresses all gaps identified in the gap analysis:
- **SendGrid Integration**: Added in Phase 4.3
- **Cookie Consent**: Added in Phase 3.3
- **Monitoring/Alerting**: Added in Phase 1.5
- **Visual Design System**: Added in Phase 1.4
- **Abandoned Cart Recovery**: Added in Phase 4.4
- **A/B Testing UI**: Added in Phase 6.3
- **Visual Regression Testing**: Added in Phase 5.2
- **Load Testing**: Added in Phase 7.4
- **Enhanced Security**: Extended in Phase 7.3

## Phase 1: Foundation & Infrastructure

### 1.1 Project Setup
**Duration**: 1 day  
**Dependencies**: None

- Initialize Next.js 14 with App Router
- Configure TypeScript with strict mode
- Set up Prisma ORM with PostgreSQL
- Install and configure Tailwind CSS
- Set up ESLint, Prettier, and Husky

**Test Strategy**:
- Unit tests: Jest setup with React Testing Library
- E2E tests: Playwright configuration
- Coverage: Minimum 80% for all features

**Acceptance Criteria**:
- [ ] Project builds without errors
- [ ] Test frameworks execute sample tests
- [ ] Linting passes on pre-commit

### 1.2 CI/CD Pipeline & Environment Configuration
**Duration**: 1 day  
**Dependencies**: 1.1

- GitHub Actions workflow for PR checks
- Automated testing on push
- Vercel deployment integration
- Environment variable management
- Local development setup with Docker Compose
- Staging environment matching production
- Environment variable documentation template

**Test Strategy**:
- Pipeline runs all tests on PR
- Blocks merge if tests fail
- Automated deployment to preview
- Environment parity validation

**Acceptance Criteria**:
- [ ] PRs automatically run full test suite
- [ ] Failed tests block merge
- [ ] Successful merge deploys to staging
- [ ] Docker Compose runs full stack locally
- [ ] Environment variables documented
- [ ] Staging mirrors production config

### 1.3 Database Schema & Migrations
**Duration**: 1 day  
**Dependencies**: 1.1

```sql
-- Implement full schema from PRD
-- businesses, waitlist, utm_tokens, purchases, analytics_events
```

- Vercel Postgres connection limits configuration
- Prisma connection pool optimization
- Connection exhaustion monitoring
- Database performance baselines

**Test Strategy**:
- Migration rollback tests
- Seed data for testing
- Database constraint validation
- Connection pool stress testing

**Acceptance Criteria**:
- [ ] All tables created per PRD schema
- [ ] Indexes properly configured
- [ ] Migrations are reversible
- [ ] Connection pool sized correctly (min: 2, max: 10)
- [ ] Pool exhaustion alerts configured
- [ ] Query performance baselines established

### 1.4 Visual Design System
**Duration**: 1 day  
**Dependencies**: 1.1

- Implement Anthracite design tokens (colors, spacing, typography)
- Create core component library matching PRD designs
- Animation utilities for spring physics
- Loading states and skeleton screens

**Test Strategy**:
- Storybook for component documentation
- Visual regression tests for components
- Animation performance benchmarks

**Acceptance Criteria**:
- [ ] Design tokens match PRD specifications
- [ ] Core components built (Button, Input, Card, etc.)
- [ ] Animation utilities perform at 60fps
- [ ] Loading states for all async operations

### 1.5 Monitoring & Alerting Setup
**Duration**: 1 day  
**Dependencies**: 1.1

- Datadog APM configuration
- Sentry error tracking setup
- Alert rules for critical paths
- Performance monitoring baselines

**Test Strategy**:
- Test alert triggers
- Verify error capture
- Performance baseline validation

**Acceptance Criteria**:
- [ ] Datadog APM sending traces
- [ ] Sentry capturing errors
- [ ] Alert rules configured for payment/email failures
- [ ] Performance dashboards created

## Phase 2: Core Security - UTM Parameter System

### 2.1 Cryptographic UTM Implementation
**Duration**: 2 days  
**Dependencies**: Phase 1

**Backend Implementation**:
- HMAC-SHA256 signing service
- Base64URL encoding utilities
- Token generation with expiration
- Nonce generation for one-time use

**Test Strategy (TDD)**:
```typescript
// Write tests first:
describe('UTM Signing Service', () => {
  it('generates valid HMAC signature')
  it('includes timestamp in payload')
  it('encodes to URL-safe base64')
  it('validates correct signatures')
  it('rejects expired tokens')
  it('prevents replay attacks')
})
```

**Acceptance Criteria**:
- [ ] Generates cryptographically secure tokens
- [ ] Tokens expire after 24 hours
- [ ] One-time use enforcement works
- [ ] Rate limiting implemented (10/min/IP)

### 2.2 UTM Validation API & Middleware
**Duration**: 2 days  
**Dependencies**: 2.1

- `/api/validate-utm` endpoint
- Edge middleware for validation
- Rate limiting with Redis
- Comprehensive error handling

**Test Strategy (BDD)**:
```gherkin
Feature: UTM Parameter Validation
  Scenario: Valid UTM parameters
    Given a valid UTM hash
    When user visits purchase page
    Then purchase data is displayed
    
  Scenario: Expired UTM
    Given an expired UTM hash
    When user visits purchase page
    Then user sees friendly expiration message
```

**E2E Browser Tests**:
- Valid flow: Email link → Purchase page
- Invalid flow: Tampered URL → Error page
- Expiration flow: Old link → Expiration page

**Acceptance Criteria**:
- [ ] Valid tokens return purchase data
- [ ] Invalid tokens redirect appropriately
- [ ] Rate limiting prevents abuse
- [ ] All edge cases handled gracefully

## Phase 3: Dual-Mode Homepage

### 3.1 Mode Detection & Routing
**Duration**: 2 days  
**Dependencies**: Phase 2

- Edge middleware for mode detection
- Cookie-based mode persistence
- Server-side rendering setup
- Performance optimization

**Test Strategy**:
```typescript
describe('Homepage Mode Detection', () => {
  it('shows organic mode without UTM')
  it('shows purchase mode with valid UTM')
  it('persists mode in cookie')
  it('handles edge cases gracefully')
})
```

**E2E Tests**:
- Direct visit → Organic mode
- Email link → Purchase mode
- Mode persistence across refreshes

**Acceptance Criteria**:
- [ ] Correct mode detection 100% of time
- [ ] Page loads in < 2.5s (LCP)
- [ ] No layout shift between modes

### 3.2 Waitlist Implementation
**Duration**: 2 days  
**Dependencies**: 3.1

- Domain validation with DNS-over-HTTPS (Cloudflare/Google)
- DNS result caching strategy (TTL: 1 hour)
- Subdomain normalization (www handling)
- Email syntax validation
- Progressive form disclosure
- Success state animations
- Typo suggestions for common domains

**Test Strategy (BDD)**:
```gherkin
Feature: Waitlist Signup
  Scenario: Valid domain submission
    Given user enters valid domain
    When DNS lookup succeeds
    Then email field appears
    
  Scenario: Invalid domain
    Given user enters invalid domain
    When validation fails
    Then error message appears with suggestions
    
  Scenario: Subdomain handling
    Given user enters "www.example.com"
    When validation runs
    Then domain is normalized to "example.com"
```

**Acceptance Criteria**:
- [ ] DNS validation via Cloudflare DoH API
- [ ] Results cached for 1 hour
- [ ] Subdomain normalization working
- [ ] Typo suggestions for top 100 domains
- [ ] Progressive disclosure works
- [ ] Position tracking functional
- [ ] Analytics events fire correctly

### 3.3 Cookie Consent Implementation
**Duration**: 1 day  
**Dependencies**: 3.1

- GDPR-compliant consent banner
- Consent preference storage
- Conditional analytics loading
- Consent change handling

**Test Strategy**:
- E2E tests for consent flows
- Analytics blocking verification
- Preference persistence tests

**Acceptance Criteria**:
- [ ] Consent banner appears on first visit
- [ ] Analytics blocked until consent given
- [ ] Preferences persist across sessions
- [ ] Consent changes update analytics

### 3.4 A/B Testing Framework
**Duration**: 2 days  
**Dependencies**: 3.1, 3.2

- Deterministic variant assignment
- Vercel Edge Config integration
- Analytics tracking setup
- Statistical significance calculation

**Test Strategy**:
- Unit tests for assignment algorithm
- Integration tests for config updates
- E2E tests for variant persistence

**Acceptance Criteria**:
- [ ] Consistent variant assignment
- [ ] Real-time config updates work
- [ ] Analytics properly segmented
- [ ] No performance impact

## Phase 4: Purchase Flow

### 4.1 Purchase Page Implementation
**Duration**: 2 days  
**Dependencies**: Phase 2, Phase 3

- Dynamic content from UTM data
- Stripe session pre-creation
- Trust signals and social proof
- Mobile-optimized design

**Test Strategy (E2E)**:
```typescript
test('Complete purchase flow', async ({ page }) => {
  // Navigate with valid UTM
  // Verify personalized content
  // Click purchase button
  // Complete Stripe checkout
  // Verify success page
})
```

**Acceptance Criteria**:
- [ ] Personalized content displays correctly
- [ ] Stripe session creates successfully
- [ ] Page follows design specifications
- [ ] Mobile experience optimized

### 4.2 Stripe Integration & Webhooks
**Duration**: 2 days  
**Dependencies**: 4.1

- Checkout session creation
- Webhook signature verification
- Payment processing logic
- External report system trigger
- User-facing error messages
- Error boundary implementation
- Graceful degradation for Stripe outages
- Session data caching for recovery

**Test Strategy**:
- Mock Stripe API for unit tests
- Webhook replay tests
- Idempotency verification
- Error handling validation
- Fallback flow testing

**Acceptance Criteria**:
- [ ] Payments process successfully
- [ ] Webhooks handle all events
- [ ] Duplicate prevention works
- [ ] Error recovery implemented
- [ ] User-friendly error messages display
- [ ] Error boundaries catch failures
- [ ] Cached session data enables retry
- [ ] Graceful handling of Stripe downtime

### 4.3 SendGrid Email Integration
**Duration**: 2 days  
**Dependencies**: 4.2

- Transactional email templates (order confirmation, notifications)
- SendGrid API integration
- Email delivery tracking
- Bounce/complaint handling

**Test Strategy**:
- Mock SendGrid API for tests
- Template rendering validation
- Email delivery monitoring

**Acceptance Criteria**:
- [ ] Order confirmation emails send on purchase
- [ ] Email templates render correctly
- [ ] Delivery tracking implemented
- [ ] Bounce handling configured

### 4.4 Abandoned Cart Recovery
**Duration**: 1 day  
**Dependencies**: 4.2

- 3-hour abandonment timer
- Recovery email trigger via SendGrid
- Abandonment tracking in analytics
- Recovery success metrics

**Test Strategy**:
- Timer accuracy tests
- Recovery flow E2E tests
- Analytics event validation

**Acceptance Criteria**:
- [ ] Timer triggers after 3 hours
- [ ] Recovery emails send correctly
- [ ] Analytics tracks abandonment/recovery
- [ ] Recovery links work properly

## Phase 5: Help Widget

### 5.1 Floating Help Component
**Duration**: 2 days  
**Dependencies**: Phase 4

- Lazy-loaded implementation
- Context-aware FAQ loading
- Smooth animations
- Accessibility compliance

**Test Strategy**:
- Visual regression tests
- Interaction tests
- Performance benchmarks
- Accessibility audits

**Acceptance Criteria**:
- [ ] Widget loads < 10KB
- [ ] Animations smooth (60fps)
- [ ] Keyboard navigation works
- [ ] WCAG AA compliant

### 5.2 Visual Regression Testing Setup
**Duration**: 1 day  
**Dependencies**: 5.1

- Screenshot comparison setup
- Critical path visual tests
- Cross-browser validation
- Mobile responsive testing

**Test Strategy**:
- Playwright screenshot tests
- Percy or similar integration
- Viewport coverage tests

**Acceptance Criteria**:
- [ ] Visual tests for all key pages
- [ ] Cross-browser screenshots match
- [ ] Mobile layouts verified
- [ ] CI integration working

## Phase 6: Analytics Integration

### 6.1 Multi-Provider Setup
**Duration**: 2 days  
**Dependencies**: All previous phases

- GA4, PostHog, Datadog setup
- Consent management system
- Event standardization
- Privacy compliance

**Test Strategy**:
- Mock provider APIs
- Event validation tests
- Consent flow testing
- Data retention verification

**Acceptance Criteria**:
- [ ] All providers initialize correctly
- [ ] Consent management works
- [ ] Events fire to all providers
- [ ] GDPR compliance verified

### 6.2 Server-Side Tracking
**Duration**: 1 day  
**Dependencies**: 6.1

- Measurement Protocol implementation
- Webhook event tracking
- Funnel analysis setup
- Real-time dashboards

**Acceptance Criteria**:
- [ ] Server events track accurately
- [ ] Funnel visualization works
- [ ] A/B test results calculate
- [ ] Dashboards update real-time

### 6.3 A/B Testing Results UI
**Duration**: 1 day  
**Dependencies**: 6.2

- Statistical significance visualization
- Experiment performance dashboard
- Winner selection interface
- Historical test results

**Test Strategy**:
- Dashboard functionality tests
- Calculation accuracy verification
- UI interaction tests

**Acceptance Criteria**:
- [ ] Significance calculations accurate
- [ ] Dashboard displays results clearly
- [ ] Winner selection works
- [ ] Historical data accessible

## Phase 7: Final Integration & Validation

### 7.1 Complete E2E Test Suite
**Duration**: 2 days  
**Dependencies**: All phases

**Test Scenarios**:
1. Complete organic visitor flow
2. Email → Purchase → Success flow
3. A/B test variant flows
4. Help widget interactions
5. Analytics consent flows

### 7.2 Performance Optimization
**Duration**: 1 day  
**Dependencies**: 7.1

- Lighthouse audit fixes
- Bundle size optimization
- Image optimization
- CDN configuration

**Acceptance Criteria**:
- [ ] Lighthouse score > 95
- [ ] Bundle size < 200KB
- [ ] All images WebP optimized
- [ ] CDN caching configured

### 7.3 Security Audit
**Duration**: 1 day  
**Dependencies**: 7.1

- Penetration testing
- OWASP compliance check
- Data encryption verification
- Access control audit
- Security headers implementation
- API rate limiting verification
- Input sanitization audit
- Dependency vulnerability scanning

**Test Strategy**:
- Automated security scans
- Manual penetration testing
- Dependency audit tools

**Acceptance Criteria**:
- [ ] All security headers configured
- [ ] Rate limiting working on all endpoints
- [ ] No critical vulnerabilities found
- [ ] Dependencies up to date

### 7.4 Load Testing
**Duration**: 1 day  
**Dependencies**: 7.1

- Email campaign traffic simulation
- Database connection pool testing
- Edge function performance validation
- Concurrent purchase flow testing

**Test Strategy**:
- k6 or Artillery load tests
- Gradually increasing load patterns
- Spike testing scenarios

**Acceptance Criteria**:
- [ ] Handles 1000 concurrent users
- [ ] Database pool doesn't exhaust
- [ ] Edge functions respond < 200ms
- [ ] No errors under expected load

## Deliverables Checklist

**Before marking complete**:
- [ ] All features implemented per PRD
- [ ] 100% of E2E tests passing
- [ ] CI/CD pipeline fully operational
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation complete

## Development Guidelines

1. **Test-First Development**: Write tests before implementation
2. **Feature Branches**: One feature per branch, merge only when complete
3. **Code Review**: All PRs require review before merge
4. **Documentation**: Update as you code, not after
5. **Performance**: Monitor metrics continuously
6. **Security**: Consider security implications in every feature

## Risk Mitigation

1. **Context Limits**: Each phase is self-contained to prevent loss of context
2. **Dependencies**: Clear dependency chain prevents blocking
3. **Testing**: Comprehensive tests ensure requirements are met
4. **CI/CD**: Automated pipeline catches issues early
5. **Incremental Delivery**: Problems isolated to current phase

## Timeline Summary

- Phase 1: 5 days (Foundation + Design System + Monitoring)
- Phase 2: 4 days (UTM System)
- Phase 3: 7 days (Homepage + Waitlist + Consent)
- Phase 4: 7 days (Purchase Flow + Email + Abandonment)
- Phase 5: 3 days (Help Widget + Visual Testing)
- Phase 6: 4 days (Analytics + A/B UI)
- Phase 7: 6 days (Integration + Security + Load Testing)

**Total: 36 working days**

## Success Criteria

The project is considered complete when:
1. All acceptance criteria are met
2. All tests pass (unit, integration, E2E)
3. Performance targets achieved
4. Security audit passed
5. Production deployment successful
6. Monitoring and alerts configured

## Pre-Launch Checklist

- [ ] All environment variables documented
- [ ] Rollback procedures tested
- [ ] On-call rotation established
- [ ] Customer support FAQs prepared
- [ ] Legal review completed (Privacy Policy, Terms of Service)
- [ ] Data Processing Agreements signed
- [ ] GDPR compliance verified
- [ ] Load testing completed successfully
- [ ] CDN cache priming strategy ready
- [ ] Database connection pools optimized
- [ ] Error tracking configured
- [ ] Backup and recovery procedures tested

## Risk Mitigation Strategies

### Third-party Dependencies
- **SendGrid**: Queue emails locally for retry on failures
- **Stripe**: Cache session data for recovery flows
- **Analytics**: Batch and retry failed events

### Launch Day Surge
- Pre-warm edge functions before launch
- Increase database connection pool temporarily
- Enable CDN aggressive caching
- Have scaling runbook ready

### Compliance Requirements
- Cookie consent must be live before any tracking
- Privacy policy linked from all pages
- Terms of service accessible
- Data retention policies implemented