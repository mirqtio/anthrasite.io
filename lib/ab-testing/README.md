# A/B Testing Framework for Anthrasite.io

A deterministic, edge-based A/B testing framework with real-time configuration updates via Vercel Edge Config.

## Features

- **Deterministic Assignment**: Same user always gets the same variant
- **Edge-Based**: Variant assignment happens at the edge for optimal performance
- **Real-Time Updates**: Experiment configurations update without deploys via Edge Config
- **Automatic Exposure Tracking**: Tracks when users see variants
- **TypeScript Support**: Fully typed for better developer experience
- **React Integration**: Hooks and context for easy component integration

## Setup

### 1. Configure Vercel Edge Config

Create an Edge Config store in your Vercel dashboard and add your experiments:

```json
{
  "ab-experiments": {
    "experiments": {
      "experiment-id": {
        "id": "experiment-id",
        "name": "Experiment Name",
        "status": "active",
        "variants": [
          { "id": "control", "name": "Control", "weight": 50 },
          { "id": "variant-a", "name": "Variant A", "weight": 50 }
        ]
      }
    },
    "lastUpdated": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Add Environment Variables

```bash
# .env.local
EDGE_CONFIG=https://edge-config.vercel.com/your-config-id
POSTHOG_API_KEY=your-posthog-key # Optional
```

### 3. Update Middleware

The A/B testing middleware is already integrated into the main middleware.

### 4. Wrap Your App

```tsx
// app/layout.tsx or pages/_app.tsx
import { ABTestProvider } from '@/lib/context/ABTestingContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ABTestProvider>
          {children}
        </ABTestProvider>
      </body>
    </html>
  )
}
```

## Usage

### Basic Variant Testing

```tsx
import { useExperiment } from '@/lib/ab-testing/hooks'

function MyComponent() {
  const variant = useExperiment('homepage-headline')
  
  if (variant === 'variant-a') {
    return <h1>New Headline</h1>
  }
  
  return <h1>Original Headline</h1>
}
```

### Checking Specific Variants

```tsx
import { useVariant } from '@/lib/ab-testing/hooks'

function FeatureComponent() {
  const showNewFeature = useVariant('feature-test', 'enabled')
  
  if (!showNewFeature) {
    return null
  }
  
  return <NewFeature />
}
```

### Tracking Custom Events

```tsx
import { useExperimentTracking } from '@/lib/ab-testing/hooks'

function CTAButton() {
  const { trackEvent, trackConversion } = useExperimentTracking('cta-test')
  
  const handleClick = () => {
    trackEvent('button_clicked', { location: 'hero' })
  }
  
  const handlePurchase = (amount: number) => {
    trackConversion(amount, { product: 'premium' })
  }
  
  return <button onClick={handleClick}>Get Started</button>
}
```

### Multi-Variant Testing

```tsx
import { useMultiVariant } from '@/lib/ab-testing/hooks'

function ContentSection() {
  const content = useMultiVariant(
    'content-style',
    {
      cards: () => <CardLayout />,
      list: () => <ListLayout />,
      grid: () => <GridLayout />
    },
    () => <DefaultLayout /> // Fallback
  )
  
  return content
}
```

### Server-Side Usage

```tsx
// In server components
import { headers } from 'next/headers'
import { getAssignmentsFromHeaders } from '@/lib/ab-testing/middleware'

export default function ServerComponent() {
  const assignments = getAssignmentsFromHeaders(headers())
  const variant = assignments['experiment-id']
  
  return <div>Variant: {variant}</div>
}
```

## Experiment Configuration

### Variant Weights

Weights must sum to 100:

```json
"variants": [
  { "id": "control", "weight": 60 },
  { "id": "variant-a", "weight": 20 },
  { "id": "variant-b", "weight": 20 }
]
```

### Targeting Rules

Target experiments to specific conditions:

```json
"targetingRules": [
  {
    "type": "url",
    "operator": "equals",
    "value": "/pricing"
  }
]
```

Supported operators: `equals`, `contains`, `startsWith`, `endsWith`, `regex`

### Date Constraints

Schedule experiments:

```json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

## Analytics Integration

The framework automatically tracks:

- **Exposure Events**: When users first see a variant
- **Custom Events**: Via `trackEvent()`
- **Conversions**: Via `trackConversion()`

Events are sent to:
- PostHog (if configured)
- Google Analytics (if `window.analytics` exists)
- Any custom handler via `onExposure` prop

## Testing

Run tests:

```bash
npm test lib/ab-testing
```

## Best Practices

1. **Meaningful Test Names**: Use descriptive IDs like `homepage-headline` not `test-1`
2. **Sufficient Sample Size**: Wait for statistical significance before making decisions
3. **One Change at a Time**: Test single elements to understand impact
4. **Track Meaningful Metrics**: Focus on business metrics, not just clicks
5. **Document Tests**: Keep notes on what you're testing and why

## Troubleshooting

### Variant Assignment Issues

1. Check experiment status is "active"
2. Verify variant weights sum to 100
3. Check date constraints haven't expired
4. Ensure Edge Config is properly connected

### Tracking Issues

1. Verify analytics providers are initialized
2. Check browser console for errors
3. Ensure exposure tracking isn't disabled
4. Verify events are being sent to analytics

### Performance

- Experiments are cached for 1 minute at the edge
- User assignments are stored in cookies to avoid recalculation
- React context prevents unnecessary re-renders

## Architecture

```
┌─────────────────┐
│  Edge Config    │  ← Real-time experiment configuration
└────────┬────────┘
         │
┌────────▼────────┐
│   Middleware    │  ← Assigns variants at edge
└────────┬────────┘
         │
┌────────▼────────┐
│  React Context  │  ← Provides variants to components
└────────┬────────┘
         │
┌────────▼────────┐
│     Hooks       │  ← Easy component integration
└─────────────────┘
```