# GDPR-Compliant Cookie Consent Implementation

## Overview

This implementation provides a comprehensive GDPR-compliant cookie consent system for Anthrasite.io. It includes:

- **Consent Banner**: Shown on first visit with clear options
- **Preferences Modal**: Detailed control over cookie categories
- **Dynamic Script Loading**: Analytics scripts only load after consent
- **Persistent Preferences**: Stored in localStorage with versioning
- **Full Accessibility**: WCAG AA compliant with keyboard navigation
- **Mobile Responsive**: Optimized for all screen sizes

## Architecture

### Components

1. **ConsentContext** (`/lib/context/ConsentContext.tsx`)
   - Central state management for consent preferences
   - Handles localStorage persistence
   - Emits events for consent changes

2. **ConsentBanner** (`/components/consent/ConsentBanner.tsx`)
   - Bottom-positioned banner with smooth animations
   - Three action buttons: Accept All, Reject All, Manage Preferences
   - Auto-hides when consent is given

3. **ConsentPreferences** (`/components/consent/ConsentPreferences.tsx`)
   - Modal dialog for granular cookie control
   - Toggle switches for each cookie category
   - Clear descriptions of cookie usage

4. **ConsentManager** (`/components/consent/ConsentManager.tsx`)
   - Wrapper component that combines banner and preferences
   - Initializes analytics based on consent

5. **CookieSettingsButton** (`/components/consent/CookieSettingsButton.tsx`)
   - Reusable button to open preferences later
   - Can be placed in footer or settings pages

### Analytics Integration

**consent-loader.ts** (`/lib/analytics/consent-loader.ts`)
- Dynamically loads GA4 and PostHog scripts
- Clears analytics cookies when consent is revoked
- Handles script loading errors gracefully

## Cookie Categories

1. **Essential Cookies** (Always enabled)
   - Required for basic site functionality
   - Security and authentication
   - User preferences (excluding analytics)

2. **Functional Cookies** (Optional)
   - Site preferences and settings
   - Enhanced user experience features
   - Language and theme preferences

3. **Analytics Cookies** (Optional)
   - Google Analytics 4 tracking
   - PostHog product analytics
   - Anonymous usage statistics

## Usage

### Basic Setup

The consent system is already integrated in the root layout:

```tsx
// app/layout.tsx
<ConsentProvider>
  <SiteModeProvider>
    {children}
    <ConsentManager />
  </SiteModeProvider>
</ConsentProvider>
```

### Adding Cookie Settings Button

Place in footer or settings page:

```tsx
import { CookieSettingsButton } from '@/components/consent'

<CookieSettingsButton variant="ghost" size="small" />
```

### Checking Consent in Components

Use the provided hooks:

```tsx
import { useAnalyticsConsent, useFunctionalConsent } from '@/lib/analytics/hooks'

function MyComponent() {
  const hasAnalytics = useAnalyticsConsent()
  const hasFunctional = useFunctionalConsent()
  
  // Conditionally render features based on consent
  return (
    <>
      {hasFunctional && <EnhancedFeature />}
    </>
  )
}
```

### Tracking Events with Consent

```tsx
import { useAnalyticsEvent } from '@/lib/analytics/hooks'

function MyComponent() {
  const trackEvent = useAnalyticsEvent()
  
  const handleClick = () => {
    // Only tracks if user consented to analytics
    trackEvent('button_clicked', {
      button_name: 'cta',
      page: 'home'
    })
  }
}
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Testing

### Unit Tests
```bash
npm test -- consent
```

### E2E Tests
```bash
npm run test:e2e -- consent.spec.ts
```

## Compliance Features

1. **Explicit Consent**: No cookies set before user action
2. **Granular Control**: Separate toggles for each category
3. **Easy Withdrawal**: Users can change preferences anytime
4. **Cookie Deletion**: Removes cookies when consent revoked
5. **Version Control**: Re-asks consent when policy changes
6. **Accessibility**: Full keyboard navigation and screen reader support

## Customization

### Styling

The components use the Anthracite design system tokens. To customize:

1. Update design tokens in `/lib/design-system/tokens.ts`
2. Components automatically use updated values

### Adding New Cookie Categories

1. Update `ConsentPreferences` interface in `ConsentContext.tsx`
2. Add new category to `categories` array in `ConsentPreferences.tsx`
3. Update `consent-loader.ts` to handle new category
4. Add tests for new functionality

### Changing Banner Position

Currently bottom-positioned. To change to top:

```tsx
// In ConsentBanner.tsx
className="fixed top-0 left-0 right-0 z-50"
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (including iOS)
- Mobile: Fully responsive design

## Performance Considerations

- Scripts load asynchronously after consent
- Minimal bundle size impact (~15KB gzipped)
- No render blocking
- Efficient localStorage usage

## Future Enhancements

1. **Cookie Policy Page**: Auto-generated from categories
2. **Consent Analytics**: Track acceptance rates
3. **A/B Testing**: Test different banner designs
4. **Regional Detection**: Auto-detect GDPR/CCPA requirements
5. **Cookie Audit**: Automatic detection of new cookies