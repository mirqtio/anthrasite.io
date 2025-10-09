# Suggested Development Commands

## Development Server

```bash
pnpm dev                    # Start Next.js dev server on port 3333
```

## Building & Production

```bash
pnpm build                  # Build production bundle (includes Prisma generate)
pnpm start                  # Start production server on port 3333
```

## Code Quality

```bash
pnpm lint                   # Run ESLint
pnpm format                 # Format code with Prettier
pnpm format:check           # Check formatting without changes
pnpm typecheck              # Run TypeScript compiler check
```

## Testing

### Unit Tests (Jest)

```bash
pnpm test                   # Run Jest tests once
pnpm test:watch             # Run Jest in watch mode
pnpm test:coverage          # Generate coverage report
```

### E2E Tests (Playwright)

```bash
pnpm test:e2e               # Run Playwright tests
pnpm test:e2e:ci            # Run with CI configuration
pnpm test:e2e:ui            # Open Playwright UI mode
```

### Visual Regression Tests

```bash
pnpm test:visual            # Run visual regression tests
pnpm test:visual:ui         # Open visual tests in UI mode
pnpm test:visual:update     # Update snapshots
pnpm test:visual:report     # View visual test report
```

## Database (Prisma)

```bash
npx prisma generate         # Generate Prisma Client
npx prisma migrate dev      # Create and apply migrations
npx prisma migrate deploy   # Apply migrations (production)
npx prisma studio           # Open Prisma Studio GUI
npx prisma db seed          # Run seed script
```

## Git & Deployment

```bash
git checkout -b feature/X   # Create feature branch
git add . && git commit     # Stage and commit (pre-commit hooks run)
git push -u origin feature/X # Push feature branch
gh pr create                # Create pull request (after pushing)
```

## Utilities (Darwin/macOS)

```bash
# File operations
ls -la                      # List files with details
find . -name "*.ts"         # Find TypeScript files
grep -r "pattern" .         # Search recursively

# Process management
lsof -i :3333               # Check what's using port 3333
kill -9 <PID>               # Force kill process

# Docker (test environment)
docker-compose up           # Start test containers
docker-compose down         # Stop test containers
```

## CI/CD

The GitHub Actions pipeline runs automatically on PR:

- `typecheck` - TypeScript compilation check
- `build` - Production build verification
- `lint` - ESLint checks
- `test:e2e` with `@smoke` tag - Critical path tests

## Stripe Development

```bash
stripe listen --forward-to localhost:3333/api/webhooks/stripe
# Forward Stripe webhooks to local dev server
```

## Common Workflows

### Starting Development

```bash
pnpm install                # Install dependencies
pnpm dev                    # Start dev server
```

### Before Committing

```bash
pnpm typecheck              # Check types
pnpm lint                   # Check linting
pnpm format                 # Format code
pnpm test                   # Run unit tests
# Pre-commit hooks will run automatically
```

### Before Creating PR

```bash
pnpm build                  # Verify production build
pnpm test:e2e               # Run E2E tests
git push -u origin feature/X # Push branch
gh pr create                # Create PR
```
