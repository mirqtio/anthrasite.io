# Anthrasite.io

Automated website audits that uncover untapped potential.

## Environment Setup

### Prerequisites
- Node.js 18.x or 20.x
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (for local development)

### Local Development

1. Clone the repository
```bash
git clone https://github.com/mirqtio/anthrasite.io.git
cd anthrasite.io
```

2. Install dependencies
```bash
npm install
```

3. Copy environment variables
```bash
cp .env.example .env
```

4. Start local services
```bash
docker-compose up -d
```

5. Initialize the database
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server
```bash
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `DATABASE_URL`: PostgreSQL connection string
- `UTM_SECRET`: Secret key for UTM parameter signing
- `STRIPE_*`: Stripe API keys and webhook secret
- `SENDGRID_*`: SendGrid API configuration
- Analytics keys for GA4, PostHog, Datadog, and Sentry

## Testing

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Deployment

The application automatically deploys to Vercel:
- Pull requests create preview deployments
- Merges to `main` deploy to production

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Public marketing pages
│   ├── api/              # API routes
│   ├── purchase/         # Purchase flow pages
│   └── _components/      # Shared components
├── lib/                   # Utility libraries
├── prisma/               # Database schema
├── e2e/                  # E2E tests
└── public/               # Static assets
```

## License

Proprietary