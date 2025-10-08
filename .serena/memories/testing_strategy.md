# Testing Strategy

## Test-Driven Development (TDD) & Behavior-Driven Development (BDD)

Per CLAUDE.md, all features must be validated with browser-based E2E tests before being considered complete.

## Testing Layers

### 1. Unit Tests (Jest + React Testing Library)

**Location**: `__tests__/` directories or co-located `.test.ts` files

**Purpose**:

- Test individual functions and components in isolation
- Validate business logic and utility functions
- Test React component rendering and interactions

**Commands**:

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # Generate coverage
```

**Example areas**:

- UTM token validation logic
- Analytics event schemas
- Cookie consent utilities
- Component rendering

### 2. End-to-End Tests (Playwright)

**Location**: `/e2e` directory

**Purpose**:

- Validate complete user journeys
- Test critical business flows
- Ensure cross-browser compatibility
- Verify mobile responsiveness

**Key Test Suites**:

- `smoke.spec.ts` / `smoke-marketing.spec.ts` - Critical path tests (tagged `@smoke`)
- `purchase-flow.spec.ts` - Complete purchase journey
- `waitlist.spec.ts` - Waitlist functionality
- `utm-validation.spec.ts` - UTM token flows
- `consent.spec.ts` - Cookie consent banner
- `css-loading.spec.ts` - Style loading validation

**Commands**:

```bash
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Interactive UI mode
pnpm test:e2e:ci       # CI configuration
```

**Configuration**:

- Timeout: 60s (CI stability)
- Retries: 3 in CI, 1 locally
- Workers: 1 in CI (sequential), parallel locally
- Base URL: `http://localhost:3333`
- Mock mode: `NEXT_PUBLIC_USE_MOCK_PURCHASE=true`

### 3. Visual Regression Tests

**Location**: `/e2e` with `playwright-visual.config.ts`

**Purpose**:

- Catch unintended UI changes
- Validate responsive design
- Ensure design consistency

**Commands**:

```bash
pnpm test:visual           # Run visual tests
pnpm test:visual:update    # Update baselines
pnpm test:visual:report    # View report
```

## CI/CD Integration

### GitHub Actions Pipeline

On every pull request:

1. **Type check**: `tsc --noEmit`
2. **Build**: `pnpm build`
3. **Lint**: `pnpm lint`
4. **Smoke tests**: Playwright tests tagged `@smoke`

### Pre-commit Hooks (Husky + lint-staged)

Automatically runs before commit:

- ESLint with auto-fix on `*.{js,jsx,ts,tsx}`
- Prettier formatting on all supported files

## Test Environment Parity

### Local Docker Environment

**Files**:

- `docker-compose.yml` - Standard local setup
- `docker-compose.test.yml` - Test environment
- `Dockerfile.ci` - CI container definition

**Principle**: Local Docker environment must match CI exactly. If tests pass locally but fail in CI, the environments are misaligned and must be reconciled.

### Mock vs. Real Data

- **Development**: Use `NEXT_PUBLIC_USE_MOCK_PURCHASE=true` for frontend testing
- **E2E Tests**: Mock mode enabled by default
- **Integration Tests**: Can use real Stripe test mode with webhook CLI

## Test Data Management

- UTM tokens generated via admin API or test utilities
- Stripe test cards: `4242 4242 4242 4242`
- Mock business data in `purchase-service-dev.ts`
- Prisma seed script for database setup

## When Tests Fail

### Local Failures

1. Check test output for specific error
2. Run with `--ui` mode for debugging
3. Review screenshots/videos in `test-results/`
4. Verify environment setup matches config

### CI Failures

Per CLAUDE.md requirements:

1. Download complete CI log archive to `/CI_logs`
2. Review every log file
3. Document every issue found
4. Create resolution plan
5. Implement fixes
6. Verify with local Docker test environment
7. Push fix and re-run CI

## Coverage Targets

- Unit tests: Focus on business logic and utilities
- E2E tests: Cover all critical user paths
- Visual tests: Cover main pages and responsive breakpoints
- **Smoke tests**: Must pass 100% before merge

## Test Organization Patterns

- Group tests by feature/flow
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and idempotent
- Use proper test isolation (beforeEach/afterEach)
