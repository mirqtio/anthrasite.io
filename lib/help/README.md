# Help Widget System

A comprehensive, accessible, and performant help widget for Anthrasite.io that provides context-aware FAQ support to users.

## Features

### Core Functionality

- **Floating Help Button**: Unobtrusive button in the bottom-right corner
- **Context-Aware FAQs**: Shows relevant FAQs based on the current page
- **Smart Search**: Full-text search with highlighting and scoring
- **Keyboard Shortcuts**:
  - `?` - Toggle help widget
  - `Escape` - Close widget
  - `/` - Focus search
- **Smooth Animations**: Framer Motion powered animations at 60fps
- **Lazy Loading**: Dynamic imports keep initial bundle size under 10KB

### Accessibility (WCAG AA Compliant)

- Full keyboard navigation support
- Screen reader announcements
- Proper ARIA labels and roles
- Focus management and restoration
- Sufficient color contrast
- Touch-friendly targets (minimum 44x44px)

### Performance Optimizations

- Debounced search (300ms default)
- Virtual scrolling for long FAQ lists
- Cached FAQ context to prevent re-fetching
- Minimal re-renders with optimized state management
- Search index for O(1) lookups

## Architecture

### Components

#### HelpWidget (`/components/help/HelpWidget.tsx`)

The main widget component that renders the floating button and help panel.

```tsx
import { HelpWidget } from '@/components/help'

// Automatically included in layout
;<HelpWidget />
```

#### HelpProvider (`/components/help/HelpProvider.tsx`)

Global state management for the help widget.

```tsx
import { HelpWidgetProvider } from '@/components/help'
;<HelpWidgetProvider config={{ position: 'bottom-right' }}>
  {children}
</HelpWidgetProvider>
```

### Services

#### FAQ Service (`/lib/help/faq-service.ts`)

Manages FAQ operations including search and context-aware loading.

```tsx
import { faqService } from '@/lib/help/faq-service'

// Get FAQs for current context
const faqs = faqService.getFAQsForContext({ page: PageContext.PURCHASE })

// Search FAQs
const results = await faqService.searchFAQs('pricing')

// Get related FAQs
const related = faqService.getRelatedFAQs('faq-id')
```

### Content

#### FAQ Content (`/lib/help/content.ts`)

Contains all FAQ data organized by category:

- General FAQs
- Purchase FAQs
- Technical FAQs
- Report FAQs
- Privacy FAQs

## Usage

### Basic Setup

The help widget is automatically included in the root layout:

```tsx
// app/layout.tsx
<HelpWidgetProvider>
  {children}
  <HelpWidget />
</HelpWidgetProvider>
```

### Configuration Options

```tsx
<HelpWidgetProvider config={{
  position: 'bottom-right',     // Widget position
  offset: { x: 24, y: 24 },     // Offset from edge
  enableKeyboardShortcuts: true, // Enable keyboard shortcuts
  enableSearch: true,            // Enable search functionality
  maxSearchResults: 10,          // Maximum search results
  animationDuration: 0.3,        // Animation duration in seconds
}}>
```

### Using the Help Context

```tsx
import { useHelpWidget } from '@/components/help'

function MyComponent() {
  const { isOpen, setIsOpen, config } = useHelpWidget()

  // Programmatically open help
  const openHelp = () => setIsOpen(true)
}
```

## Adding New FAQs

1. Add FAQ to `/lib/help/content.ts`:

```tsx
export const GENERAL_FAQS: FAQItem[] = [
  {
    id: 'unique-id',
    question: 'Your question here?',
    answer: 'Detailed answer here.',
    category: FAQCategory.GENERAL,
    tags: ['relevant', 'tags'],
    relatedQuestions: ['other-faq-id'], // Optional
  },
  // ...
]
```

2. FAQs are automatically indexed and searchable
3. Context-aware loading happens based on category and page

## Testing

### Unit Tests

```bash
npm test components/help/__tests__/HelpWidget.test.tsx
npm test components/help/__tests__/HelpProvider.test.tsx
npm test lib/help/__tests__/faq-service.test.ts
```

### Accessibility Tests

```bash
npm test components/help/__tests__/HelpWidget.accessibility.test.tsx
```

### Performance Tests

```bash
npm test components/help/__tests__/HelpWidget.performance.test.tsx
```

## Performance Metrics

- **Initial Load**: < 10KB (lazy loaded)
- **Time to Interactive**: < 100ms
- **Animation FPS**: 60fps target
- **Search Response**: < 50ms for 100+ FAQs
- **Memory Usage**: < 5MB with all FAQs loaded

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 14+, Chrome Android

## Future Enhancements

1. **Analytics Integration**: Track FAQ views and search queries
2. **AI-Powered Search**: Use embeddings for semantic search
3. **Live Chat Integration**: Escalate to human support
4. **Multi-language Support**: Internationalize FAQ content
5. **User Feedback**: Rate FAQ helpfulness
6. **Custom Themes**: Support dark mode and custom styling
