# Contributing to Anthrasite.io

Thank you for contributing to the Anthrasite.io payment platform!

## Prerequisites

- **Node.js**: LTS version (22.x recommended - check `.nvmrc` if available)
- **npm**: Comes with Node.js
- **PostgreSQL**: For local database (or use Docker)
- **Git**: For version control

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/mirqtio/anthrasite.io.git
cd anthrasite.io
npm ci
```

### 2. Set Up Environment

Create a `.env.local` file with required environment variables:

```env
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# See .env.example for full list
```

**⚠️ NEVER commit `.env.local` or any file containing real secrets!**

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: seed test data
```

### 4. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

## Development Workflow

### Start Development Server

```bash
npm run dev
# App runs at http://localhost:3333
```

### Before You Commit

Our pre-commit hooks automatically run:

- **Secret scanning**: Custom regex patterns for common secrets
- **Linting**: ESLint with Next.js config
- **Type checking**: TypeScript compiler
- **Unit tests**: Jest test suite

If any check fails, the commit will be blocked. Fix the issues and try again.

### Before You Push

Our pre-push hook runs:

- TypeScript type checking
- ESLint (errors only, warnings allowed)
- Production build verification

This prevents broken builds from reaching CI.

## Testing

### Unit Tests

```bash
npm run test              # Run once
npm run test:unit         # Run in CI mode
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
```

### End-to-End Tests

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
```

### Visual Regression Tests

```bash
npm run test:visual                # Run visual tests
npm run test:visual:update         # Update snapshots
npm run test:visual:report         # View HTML report
```

## Code Quality

### Linting

```bash
npm run lint              # Check for issues
npm run lint -- --fix     # Auto-fix issues
```

### Formatting

```bash
npm run format:check      # Check formatting
npm run format            # Auto-format all files
```

### Type Checking

```bash
npm run typecheck
```

## Secret Security

### What We Scan For

- Stripe API keys (`sk_live_*`, `sk_test_*`)
- SendGrid keys (`SG.*`)
- AWS credentials (`AKIA*`)
- GitHub tokens (`ghp_*`, `gho_*`)
- Private keys (PEM format)
- Generic API keys and secrets

### Local Secret Scanning

Our custom `scripts/check-secrets.sh` runs automatically on pre-commit. It uses regex patterns to detect common secret formats in your code.

### CI Secret Scanning

GitHub Actions runs **GitGuardian** on every push and pull request to scan for secrets across:

- Current changes
- Historical commits (nightly scan)

If GitGuardian detects a secret:

1. **DO NOT** force-push to hide it (Git history is permanent)
2. **IMMEDIATELY** rotate the exposed credential
3. Remove the secret from your code
4. Commit the fix

### Best Practices

1. **Use Environment Variables**: Never hardcode secrets

   ```typescript
   // ✅ Good
   const apiKey = process.env.STRIPE_SECRET_KEY

   // ❌ Bad
   const apiKey = 'sk_live_abc123...'
   ```

2. **Use `.env.example`**: Template file without real values

   ```env
   STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
   ```

3. **gitignore sensitive files**:

   - `.env.local`
   - `.env.production`
   - `credentials.json`

4. **Test Mode Keys**: Use Stripe test keys (`sk_test_*`) for development

## Pull Requests

### Workflow

1. **Create Feature Branch**: `feature/ISSUE_NUMBER-brief-description`

   ```bash
   git checkout -b feature/A1-payment-element
   ```

2. **Make Changes**: Follow our coding standards

3. **Run Local Validation**:

   ```bash
   npm run typecheck
   npm run lint
   npm run test:unit
   npm run build
   ```

4. **Commit**: Use conventional commits

   ```
   feat(scope): add payment element integration
   fix(auth): resolve token expiration bug
   docs: update API documentation
   ```

5. **Push**: Pre-push hook will verify builds

   ```bash
   git push -u origin feature/A1-payment-element
   ```

6. **Create PR**: Use GitHub UI or `gh pr create`

### PR Requirements

- ✅ All CI checks passing (typecheck, lint, build, unit, e2e, gate)
- ✅ No secrets detected by GitGuardian
- ✅ Code reviewed and approved
- ✅ Related issue linked in PR description

### PR Template

```markdown
## Summary

Brief description of changes

## Changes

- Added X feature
- Fixed Y bug

## Test Plan

- [x] Unit tests pass
- [x] E2E tests pass
- [x] Manual testing completed

## Related Issues

Closes #123
```

## Architecture

For detailed system architecture, see:

- `SYSTEM.md` - Ground truth about the codebase
- `docs/adr/` - Architectural Decision Records
- `METHOD.md` - Our development process

## Support

- **Issues**: Use GitHub Issues for bugs and features
- **Slack**: #anthrasite-dev (if applicable)
- **Documentation**: Check `docs/` folder

## License

See LICENSE file for details.
