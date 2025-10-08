# Code Style & Conventions

## TypeScript Configuration

- **Target**: ES2017
- **Strict mode**: Enabled
- **Module resolution**: Bundler
- **Path aliases**: `@/*` maps to project root
- **Force consistent casing**: Enabled

## Formatting (Prettier)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## Linting (ESLint)

- **Base configs**: Next.js core-web-vitals, ESLint recommended, TypeScript recommended
- **Key rules**:
  - `@typescript-eslint/no-unused-vars`: warn
  - `@typescript-eslint/no-explicit-any`: warn
  - `@typescript-eslint/explicit-function-return-type`: off
  - No React import required in JSX
  - No require imports allowed

## Naming Conventions

- **Components**: PascalCase (e.g., `PurchaseHero.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useStripe.ts`, `validateUTMToken.ts`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Files**: Match their primary export name
- **API routes**: `route.ts` in Next.js app directory structure

## File Organization

- **`/app`**: Next.js pages and API routes
- **`/components`**: Reusable React components
- **`/lib`**: Shared utilities, services, and business logic
- **`/prisma`**: Database schema and migrations
- **`/e2e`**: Playwright E2E tests
- **`/__tests__`**: Jest unit tests (co-located with source when possible)
- **`/docs`**: Documentation and ADRs
- **`/_archive`**: Historical code from pre-G1 cleanup

## Import Patterns

- Use `@/` alias for absolute imports
- Group imports: external packages → internal modules → components → types
- Prefer named exports over default exports for utilities
- Use default exports for page components and API routes

## Component Patterns

- **Server Components**: Default in Next.js 14 App Router
- **Client Components**: Mark with `'use client'` directive when using hooks/state
- **Server Actions**: Mark with `'use server'` for form handlers
- **Force Dynamic**: Add `export const dynamic = 'force-dynamic'` for pages with runtime deps

## Error Handling

- Comprehensive try-catch blocks for API routes
- Structured error logging (JSON format for monitoring)
- User-friendly error messages
- Proper HTTP status codes

## Security

- Server-side validation for all user inputs
- UTM token cryptographic verification
- Stripe webhook signature validation
- No client-side price manipulation (server-authoritative pricing)
