## File System

```
* Frontend/
  * app/
    * (marketing)/
      * page.tsx              # Dual-mode homepage
      * layout.tsx            # Marketing layout with analytics
    * purchase/
      * [hash]/
        * page.tsx            # Dynamic purchase page
    * api/
      * validate-utm/         # UTM hash validation
      * waitlist/             # Waitlist submission
      * webhook/
        * stripe/             # Stripe webhook handler
    * _components/
      * HelpWidget/           # Floating help component
      * WaitlistForm/         # Domain + email capture
      * Analytics/            # GA4, PostHog, Datadog wrappers
  * lib/
    * crypto/                 # UTM signing/validation
    * stripe/                 # Checkout session creation
    * email/                  # SendGrid integration
  * middleware.ts             # Edge validation & A/B testing

* Backend/
  * prisma/
    * schema.prisma           # Database models
    * migrations/             # Version-controlled migrations
  * services/
    * utm-manager/            # UTM generation & validation
    * report-delivery/        # PDF generation & delivery
    * analytics-aggregator/   # Event processing
  * utils/
    * monitoring/             # Datadog, Sentry setup
```

## Feature Specifications

### Feature 1: Secure UTM Parameter System

**Goal**  
Cryptographically sign UTM parameters to prevent price tampering while enabling personalized purchase flows from email campaigns.

**API Relationships**

- `/api/validate-utm` - Validates hash and returns purchase data
- Stripe API - Passes validated price to checkout
- Analytics APIs - Tracks parameter usage

**Detailed Requirements**

**A. Parameter Structure**

- Standard UTMs: `utm_source`, `utm_medium`, `utm_campaign`
- Custom fields: `business_id`, `price`, `campaign_id`, `expires`
- Composite hash: HMAC-SHA256 of all parameters + timestamp

**B. Security Requirements**

- 24-hour expiration on all links
- One-time use tokens to prevent replay
- Rate limiting: 10 attempts per IP per minute
- Audit log of all validation attempts

**C. Hash Generation**

- Server-side only using environment secret
- Include timestamp in payload
- Base64URL encoding for URL safety

**Implementation Guide**

```pseudocode
// Hash Generation (server-side)
function generateSecureUTM(businessData):
  payload = {
    business_id: businessData.id,
    price: businessData.price,
    campaign_id: businessData.campaign,
    expires: now() + 24_hours,
    nonce: crypto.randomBytes(16)
  }

  signature = HMAC(
    secret: ENV.UTM_SECRET,
    data: JSON.stringify(payload)
  )

  return base64url({
    ...payload,
    signature: signature
  })

// Validation Middleware
async function validateUTM(hash):
  try:
    decoded = base64url.decode(hash)

    // Check expiration
    if decoded.expires < now():
      throw "Link expired"

    // Verify signature
    expected = HMAC(ENV.UTM_SECRET, decoded.payload)
    if decoded.signature !== expected:
      throw "Invalid signature"

    // Check if already used
    if await db.usedTokens.exists(decoded.nonce):
      throw "Link already used"

    return decoded

  catch error:
    log.security("UTM validation failed", { hash, error })
    return null
```

**Data Flow**

1. Marketing system requests signed URL from backend
2. Backend generates parameters with 24hr expiration
3. Email includes personalized link with hash
4. User clicks → Edge function validates hash
5. Valid hash → Show purchase page with price
6. Invalid hash → Redirect to homepage
7. After purchase → Mark token as used

**Key Edge Cases**

- Expired links show friendly "This offer has expired" page
- Multiple devices: Allow 3 uses per token for testing
- Clock skew: Allow ±5 minute tolerance
- Hash in localStorage for page refreshes

### Feature 2: Dual-Mode Homepage

**Goal**  
Single page that intelligently adapts content based on visitor type (organic vs email) while A/B testing variations.

**API Relationships**

- Vercel Edge Config - A/B test configuration
- `/api/waitlist` - Process waitlist signups
- PostHog - Track variant performance

**Detailed Requirements**

**A. Detection Logic**

- Check for valid UTM hash → Purchase mode
- No hash → Organic/waitlist mode
- Mode determined at edge for performance

**B. A/B Testing Framework**

- Test variations: Headlines, CTAs, form fields
- Consistent bucketing via hashed visitor ID
- Real-time config updates without deploys
- Minimum 1000 impressions before significance

**C. Waitlist Requirements**

- Domain validation with DNS lookup
- Email verification (syntax only for MVP)
- Geographic detection for launch priority
- Double opt-in flow post-MVP

**Implementation Guide**

```pseudocode
// Edge Middleware for Mode Detection
async function determinePageMode(request):
  urlParams = parseURL(request.url)

  // Check for purchase hash
  if urlParams.has('h'):
    validation = await validateUTM(urlParams.get('h'))
    if validation.success:
      return {
        mode: 'purchase',
        data: validation.data
      }

  // Default to organic mode
  visitorId = getOrCreateVisitorId(request)
  variant = await getABVariant(visitorId, 'homepage')

  return {
    mode: 'organic',
    variant: variant,
    experiments: ['headline_v2', 'cta_color']
  }

// Component Rendering Logic
function HomePage({ mode, data }):
  if mode === 'purchase':
    return <PurchaseFlow businessData={data} />

  // Organic mode with A/B testing
  return (
    <Layout>
      <Hero variant={data.variant.headline} />
      <HowItWorks />
      <WaitlistForm
        fields={data.variant.formFields}
        cta={data.variant.ctaText}
      />
      <FAQ />
    </Layout>
  )

// Waitlist Submission
async function submitWaitlist(formData):
  // Validate domain exists
  dnsLookup = await checkDNS(formData.domain)
  if !dnsLookup.valid:
    return { error: "Domain not found" }

  // Store in database
  lead = await db.waitlist.create({
    domain: formData.domain,
    email: formData.email,
    ip_location: getGeoIP(request.ip),
    variant: formData.variant,
    created_at: now()
  })

  // Track conversion
  analytics.track('waitlist_signup', {
    variant: formData.variant,
    domain_tld: extractTLD(formData.domain)
  })

  return { success: true, position: lead.position }
```

**Data Flow**

1. Visitor lands → Edge determines mode
2. Organic mode → Fetch A/B variant
3. Render appropriate content
4. Track impressions in PostHog
5. Form submission → Validate & store
6. Show success state with position
7. Analytics track conversion with variant

**Key Edge Cases**

- Invalid domains: Show suggestions for typos
- Duplicate submissions: Show existing position
- A/B variant consistency: Store in cookie
- Mobile keyboards: Auto-switch for email input

### Feature 3: Streamlined Purchase Flow

**Goal**  
Minimal-friction path from email click to completed purchase with immediate report delivery.

**API Relationships**

- Stripe Checkout API - Payment processing
- SendGrid API - Report delivery
- `/api/webhook/stripe` - Payment confirmation

**Detailed Requirements**

**A. Purchase Page Requirements**

- Personalized with business name
- Show exact price from UTM
- No account creation required
- Guest checkout with Link support

**B. Stripe Integration**

- Checkout session with metadata
- Webhook processing for fulfillment
- Automatic tax calculation
- Payment method memory via Link

**C. Report Delivery**

- Instant delivery on payment success
- PDF generation from template
- Backup delivery after 5 minutes
- Download link + email attachment

**Implementation Guide**

```pseudocode
// Purchase Page Rendering
async function PurchasePage({ businessData }):
  // Pre-create checkout session
  session = await createCheckoutSession({
    price: businessData.price,
    metadata: {
      business_id: businessData.id,
      campaign_id: businessData.campaign,
      report_type: 'website_audit'
    },
    success_url: '/success?session={CHECKOUT_SESSION_ID}',
    cancel_url: '/purchase/' + businessData.hash,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    allow_promotion_codes: false
  })

  return (
    <Layout minimal>
      <Header businessName={businessData.name} />
      <ValueProp amount={businessData.value} />
      <ReportPreview pages={businessData.preview} />
      <CheckoutButton
        sessionId={session.id}
        price={businessData.price}
      />
    </Layout>
  )

// Webhook Processing
async function handleStripeWebhook(event):
  switch event.type:
    case 'checkout.session.completed':
      session = event.data.object

      // Extract metadata
      businessId = session.metadata.business_id

      // Mark UTM token as used
      await db.usedTokens.create({
        nonce: session.client_reference_id,
        used_at: now()
      })

      // Generate and send report
      report = await generateReport(businessId)
      await sendReport({
        email: session.customer_email,
        reportUrl: report.url,
        businessName: session.metadata.business_name
      })

      // Track conversion
      analytics.track('purchase_completed', {
        value: session.amount_total / 100,
        campaign: session.metadata.campaign_id
      })

    case 'checkout.session.expired':
      // Track abandonment
      analytics.track('checkout_abandoned', {
        value: session.amount_total / 100,
        time_elapsed: now() - session.created
      })
```

**Data Flow**

1. Valid UTM → Show purchase page
2. Pre-create Stripe session on load
3. Click CTA → Redirect to Stripe
4. Complete payment → Success webhook
5. Process webhook → Generate report
6. Send via SendGrid → Confirmation page
7. Abandonment → Track & recovery email

**Key Edge Cases**

- Webhook failures: Retry with exponential backoff
- Duplicate webhooks: Idempotency via event ID
- Report generation fails: Queue for retry
- Email bounces: Provide download link

### Feature 4: Custom Help Widget

**Goal**  
Non-intrusive floating assistant that answers common questions without leaving the purchase flow.

**API Relationships**

- None - fully client-side for performance
- Analytics track interactions only

**Detailed Requirements**

**A. UI Requirements**

- Accessible via keyboard (Tab navigation)
- Mobile-optimized positioning
- Smooth animations under 300ms
- Persists state during navigation

**B. Content Structure**

- FAQ items with expand/collapse
- Rich content with formatting
- Contextual help based on page
- No external dependencies

**C. Interaction Patterns**

- Click outside to close
- ESC key to dismiss
- Remember open/closed state
- Smooth height transitions

**Implementation Guide**

```pseudocode
// Help Widget State Management
HelpWidgetState = {
  isOpen: false,
  expandedItems: Set(),
  position: 'bottom-right',
  hasInteracted: false
}

// Component Structure
function HelpWidget({ context }):
  // Get relevant FAQs for current page
  faqs = getFAQsForContext(context)

  // Trap focus when open
  useFocusTrap(isOpen)

  // Animate height changes
  useAutoAnimate(containerRef)

  return (
    <Portal>
      <Container position={position}>
        {!isOpen ? (
          <FloatingButton onClick={toggle} />
        ) : (
          <ExpandedPanel>
            <Header>
              <Title>Quick Help</Title>
              <CloseButton onClick={close} />
            </Header>
            <FAQList>
              {faqs.map(item => (
                <FAQItem
                  expanded={expandedItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </FAQList>
          </ExpandedPanel>
        )}
      </Container>
    </Portal>
  )

// Contextual FAQ Loading
function getFAQsForContext(context):
  baseFAQs = [
    {
      q: "What's included in my report?",
      a: "15-page PDF with: SEO audit, Core Web Vitals,
          competitor analysis, improvement roadmap..."
    },
    {
      q: "How are values calculated?",
      a: "Based on search volume, conversion impact,
          and industry benchmarks..."
    }
  ]

  if context.page === 'purchase':
    return [...baseFAQs, {
      q: "Is payment secure?",
      a: "Yes, processed by Stripe with PCI compliance..."
    }]

  return baseFAQs

// Animation Controller
function animateWidget(action):
  if action === 'open':
    // Scale button to panel
    animate({
      from: { scale: 1, borderRadius: '50%' },
      to: { scale: 20, borderRadius: '16px' },
      duration: 300,
      easing: 'ease-out'
    })

  if action === 'close':
    // Collapse with spring physics
    animate({
      from: { height: 'auto', opacity: 1 },
      to: { height: '56px', opacity: 0 },
      type: 'spring',
      stiffness: 200
    })
```

**Data Flow**

1. Widget renders in portal at root
2. User clicks → Expand animation
3. Load contextual FAQs
4. Track interaction in analytics
5. Click item → Expand with height animation
6. Click outside/ESC → Collapse
7. State persists in sessionStorage

**Key Edge Cases**

- Keyboard navigation: Proper focus management
- Screen readers: ARIA labels and regions
- Mobile: Adjust position above thumb reach
- Animation performance: Use transform only

### Feature 5: Comprehensive Analytics Setup

**Goal**  
Full-funnel tracking across client and server events with privacy-compliant implementation.

**API Relationships**

- GA4 Measurement Protocol - Server events
- Datadog API - Performance metrics
- PostHog API - Product analytics
- Sentry API - Error tracking

**Detailed Requirements**

**A. Event Architecture**

- Client events: Page views, interactions
- Server events: Purchases, webhooks
- Hybrid tracking for accuracy
- Event schemas with validation

**B. Privacy Compliance**

- Cookie consent management
- Data retention policies
- Right to deletion support
- Geographic compliance (GDPR/CCPA)

**C. Dashboard Requirements**

- Real-time funnel visualization
- A/B test performance
- Cohort analysis
- Custom alerts for anomalies

**Implementation Guide**

```pseudocode
// Analytics Manager
class AnalyticsManager:
  providers = {
    ga4: GoogleAnalytics4,
    posthog: PostHog,
    datadog: DatadogRUM
  }

  async initialize():
    // Check consent
    consent = await getConsentStatus()

    if consent.analytics:
      providers.ga4.init(ENV.GA4_ID)
      providers.posthog.init(ENV.POSTHOG_KEY)

    if consent.performance:
      providers.datadog.init({
        applicationId: ENV.DD_APP_ID,
        clientToken: ENV.DD_CLIENT_TOKEN
      })

  track(event, properties):
    // Validate event schema
    if !validateEventSchema(event, properties):
      console.error('Invalid event', event)
      return

    // Add common properties
    enriched = {
      ...properties,
      timestamp: now(),
      session_id: getSessionId(),
      experiment_variants: getActiveVariants()
    }

    // Send to each provider
    if consent.analytics:
      providers.ga4.track(event, enriched)
      providers.posthog.track(event, enriched)

    // Log performance events
    if event.startsWith('performance.'):
      providers.datadog.log(event, enriched)

// Server-Side Tracking
async function trackServerEvent(event, data):
  // GA4 Measurement Protocol
  ga4Payload = {
    client_id: data.client_id,
    events: [{
      name: event,
      params: {
        value: data.value,
        currency: 'USD',
        transaction_id: data.order_id
      }
    }]
  }

  await fetch('https://www.google-analytics.com/mp/collect', {
    method: 'POST',
    body: JSON.stringify(ga4Payload),
    headers: {
      'api_secret': ENV.GA4_API_SECRET
    }
  })

  // PostHog server-side
  await posthog.capture({
    distinctId: data.user_id,
    event: event,
    properties: data
  })

// Funnel Tracking
function trackFunnelStep(step):
  steps = {
    'homepage_view': { step: 1, name: 'Homepage' },
    'utm_validated': { step: 2, name: 'Purchase Page' },
    'checkout_started': { step: 3, name: 'Stripe Checkout' },
    'payment_completed': { step: 4, name: 'Success' }
  }

  currentStep = steps[step]

  analytics.track('funnel_step', {
    funnel_id: 'main_purchase',
    step_number: currentStep.step,
    step_name: currentStep.name,
    entry_point: getEntryPoint()
  })

// A/B Test Tracking
function trackVariantPerformance(test, variant, event):
  analytics.track('experiment_event', {
    experiment_id: test.id,
    variant_id: variant.id,
    event_type: event,
    statistical_significance: calculateSignificance({
      control: test.control.conversions,
      variant: variant.conversions,
      visitors: test.total_visitors
    })
  })
```

**Data Flow**

1. Page load → Initialize providers with consent
2. User interacts → Track client events
3. Events validated → Send to providers
4. Server events → Use measurement protocol
5. Funnel analysis → Track step progression
6. A/B tests → Calculate significance
7. Dashboards → Query aggregated data

**Key Edge Cases**

- Consent changes: Reinitialize providers
- Offline events: Queue and retry
- High-volume: Batch events per second
- Cross-domain: Use linker for GA4

## Database Schema

```sql
-- Core business entities
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  report_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Waitlist entries
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_location JSONB,
  variant_data JSONB,
  position INTEGER GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_domain (domain),
  INDEX idx_created (created_at)
);

-- UTM tracking
CREATE TABLE utm_tokens (
  nonce VARCHAR(255) PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_expires (expires_at)
);

-- Purchase records
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  stripe_session_id VARCHAR(255) UNIQUE,
  amount_cents INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_stripe_session (stripe_session_id)
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  properties JSONB NOT NULL,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_event_session (event_name, session_id),
  INDEX idx_created (created_at)
) PARTITION BY RANGE (created_at);
```

## Security Considerations

1. **UTM Parameter Security**

   - HMAC-SHA256 signing with rotating secrets
   - Rate limiting on validation endpoints
   - Audit logging of all attempts
   - One-time use enforcement

2. **Payment Security**

   - No card data storage (Stripe handles)
   - Webhook signature verification
   - Idempotent payment processing
   - PCI compliance via Stripe

3. **Data Protection**

   - Encryption at rest (Vercel/database)
   - TLS 1.3 for all connections
   - GDPR-compliant data retention
   - Right to deletion implementation

4. **Input Validation**

   - Domain validation with DNS lookup
   - Email syntax validation
   - XSS protection on all inputs
   - SQL injection prevention via Prisma

5. **Authentication (Post-MVP)**

   - JWT tokens with refresh rotation
   - OAuth2 social logins
   - 2FA support
   - Session management

   # Anthrasite Design Brief

## Design Philosophy

Anthracite represents carbon in its most refined form - this design system embodies radical minimalism with surgical precision. Every element serves a purpose, every pixel earns its place. We strip away the unnecessary to reveal what truly matters: clarity, action, and results.

## Visual Language Foundation

- **Color Palette**: Deep carbon black (#0A0A0A), pure white (#FFFFFF), Ignition Blue (#0066FF)
- **Typography**: Inter or Helvetica Now (mono-weight geometric sans)
- **Layout**: Swiss grid precision with extreme white space and asymmetric balance
- **Graphics**: Thin line diagrams, data visualizations as art, zero decoration
- **Motion**: Physics-based transitions for spatial continuity

---

## Dual-Mode Site Structure

### Homepage (Organic Traffic Mode)

#### Default State

- Clean, centered hero with massive negative space (70% viewport)
- Single headline in 64px Inter Light: "Your website has untapped potential"
- Subheadline in 18px Inter Regular: "Join the waitlist for automated website audits"
- Email input field with Ignition Blue CTA button
- No navigation menu - just logo mark in top left
- Footer appears only on scroll with minimal compliance links
- Background: Pure white with subtle grain texture at 2% opacity
- Micro-animation: Text fades in with 0.8s ease-out, staggered by 200ms

#### Waitlist Success State

- Email input morphs into success message with checkmark icon
- Message: "You're on the list. We'll reach out when we launch in [city]."
- Checkmark draws in with SVG path animation
- Background shifts to subtle blue tint (#0066FF at 3% opacity)
- Auto-dismisses after 5s with fade-out

### Purchase Flow (UTM-Gated Mode)

#### Landing State

- Personalized header pulls business name from UTM: "[Business Name], your audit is ready"
- Score visualization as minimalist circular progress indicator
- Value statement with specific dollar amount in Ignition Blue
- Report preview as edge-to-edge image with 20px rounded corners
- Single CTA button spanning 40% viewport width on mobile
- No header navigation - only compliance footer
- Background: Off-white (#FAFAFA) to create depth hierarchy

#### Loading State

- CTA button transforms to loading spinner (thin 2px stroke)
- Button text fades to 40% opacity
- Subtle pulse animation at 2s intervals
- Prevents multiple clicks with pointer-events: none

---

## Streamlined Purchase Page

### Initial Load

#### Header Section

- Business name in 32px Inter Medium
- "Website Audit" label in 14px Inter Regular, 60% opacity
- Thin 1px divider line at 20% opacity
- Total height: 120px with generous padding

#### Value Proposition

- Large number display for improvement value: "$[X]" in 48px Inter Light
- Supporting text: "in potential improvements identified" in 16px
- Background: Light gray card (#F5F5F5) with no border
- Padding: 40px all sides
- Subtle shadow: 0 2px 8px rgba(0,0,0,0.04)

#### Report Overview

- 3-4 bullet points in clean list
- Custom bullet: thin 2px Ignition Blue vertical line
- 24px line height for optimal readability
- Each item animates in with 0.3s slide-from-left on scroll

#### CTA Section

- Full-width button on mobile, 400px max on desktop
- Button height: 56px with 18px text
- Price dynamically inserted from UTM
- Hover state: Background darkens 10%, subtle scale(1.02)
- Active state: scale(0.98) with instant feedback

### Checkout Flow Integration

#### Stripe Transition

- Page content fades to 20% opacity
- Stripe modal slides up from bottom on mobile, fades in on desktop
- Custom loading skeleton matches our design language
- Error states appear inline with red accent (#FF3B30)

---

## In-Flow Help System

### Floating Help Button

#### Collapsed State

- Circular button, 56px diameter
- Thin "?" icon in 24px, 2px stroke weight
- Positioned bottom-right with 24px margin
- Subtle shadow for depth
- Scales to 1.1x on hover with spring physics

#### Expanded State

- Button morphs into rounded rectangle card
- Width expands to 340px on mobile, 400px on desktop
- FAQ items slide in from right with stagger
- Each item has hover state with blue left border
- Close "×" appears in top right
- Background blur effect on main content

### FAQ Content Display

#### Question State

- 16px Inter Medium for questions
- Thin chevron icon rotates on expand
- 16px padding around each item
- Bottom border at 10% opacity between items

#### Answer State

- 14px Inter Regular in 80% opacity
- Slides down with height animation
- Links in Ignition Blue with underline on hover
- Max height: 200px with internal scroll if needed
- Code snippets in monospace with light gray background

### Visual Report Preview

#### Thumbnail Grid

- 2×2 grid of report page previews
- Each thumbnail 150px with 8px gap
- Slight perspective transform on hover
- Click triggers lightbox with full preview
- Loading skeleton shows while images fetch

---

## Waitlist Capture

### Form Design

#### Input Fields

- Single-line inputs with no visible border
- Bottom border appears on focus (2px Ignition Blue)
- Floating labels that scale up on focus
- 48px height for touch-friendly interaction
- Error messages slide in below with red accent

#### Domain Validation

- Real-time validation with 500ms debounce
- Green checkmark appears for valid domains
- Suggestions appear for common typos
- Loading spinner during validation check

#### Progressive Disclosure

- Email field appears after valid domain
- Optional fields slide in after email
- Each step has subtle fade transition
- Progress indicator: thin line that fills

### Thank You Page

#### Success Animation

- Circular progress completes to checkmark
- Confetti burst using CSS transforms (no libraries)
- Message fades in: "We'll analyze [domain] and reach out within 48 hours"
- Background shifts to subtle blue gradient
- Auto-redirect to homepage after 10s

---

## Comprehensive Analytics

### Dashboard Layout

#### Navigation Structure

- Left sidebar on desktop, bottom tabs on mobile
- Icons with labels, active state in Ignition Blue
- Sections: Overview, Funnels, Traffic, A/B Tests
- Breadcrumb navigation for deep pages
- Dark mode toggle in top right

#### Data Visualization

- Charts use monochromatic blue palette
- Thin 1px lines for all graphs
- Hover states show precise values
- Loading states use skeleton screens
- Error states show inline with retry button

#### Key Metrics Display

- Large number displays with trend indicators
- Red/green arrows for changes (subtle, not harsh)
- Time period selector as segmented control
- Export button for each chart section
- Real-time updates with subtle pulse animation

### Funnel Visualization

#### Funnel Design

- Minimalist trapezoid shapes
- Percentage drops between stages
- Hover reveals detailed breakdown
- Click drills into cohort analysis
- Smooth transitions between views

### A/B Test Results

#### Test Cards

- Clean cards with test name and status
- Visual confidence intervals
- Winner highlighted with blue border
- Statistical significance badge
- One-click deployment for winners

---

## Animation Principles

- **Timing**: 200-400ms for micro-interactions, 600-800ms for page transitions
- **Easing**: Ease-out for entrances, ease-in-out for state changes
- **Performance**: Use transform and opacity only, no layout shifts
- **Feedback**: Every interaction has immediate visual response
- **Continuity**: Elements morph rather than disappear/reappear

## Accessibility Standards

- WCAG AA compliance minimum
- Focus indicators: 2px blue outline with 2px offset
- Skip links for keyboard navigation
- ARIA labels for all interactive elements
- Color contrast ratios: 7:1 for normal text, 4.5:1 for large text
- Reduced motion preferences respected

## Responsive Breakpoints

- Mobile: 320px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px+
- Max content width: 1200px
- Fluid typography scaling between breakpoints

## Performance Targets

- First Paint: <1s
- Interactive: <3s
- Lighthouse score: 95+
- Bundle size: <200KB initial
- Image optimization: WebP with fallbacks
