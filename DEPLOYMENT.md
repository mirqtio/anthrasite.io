# Anthrasite Web App Deployment

This guide details how to deploy the Anthrasite web application to Vercel.

## Prerequisites

- **Vercel Account**: You must have a Vercel account and be logged in.
- **Vercel CLI** (Optional): For deploying from the command line.
- **GitHub Repository**: The project should be pushed to a GitHub repository.

## 1. Project Setup (Vercel)

1.  **Import Project**:

    - Go to your Vercel Dashboard.
    - Click **"Add New..."** -> **"Project"**.
    - Import the `anthrasite` repository from GitHub.

2.  **Framework Preset**:

    - Vercel should automatically detect **Next.js**.

3.  **Root Directory**:
    - Ensure the root directory is set correctly (if `anthrasite-clean` is the root, leave as `./`).

## 2. Environment Variables

Configure the following environment variables in the Vercel Project Settings (**Settings** -> **Environment Variables**).

**Required Variables:**

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Temporal Cloud (for triggering workflows)
TEMPORAL_ADDRESS=leadshop.cfp1d.tmprl.cloud:7233
TEMPORAL_NAMESPACE=leadshop.cfp1d
# Note: For Vercel, you might need to handle certs via env vars or a secure file storage solution.
# A common pattern is to base64 encode the cert/key and load them in code.
TEMPORAL_CERT_BASE64=...
TEMPORAL_KEY_BASE64=...

# Feature Flags
NEXT_PUBLIC_FF_PURCHASE_ENABLED=true
```

> [!IMPORTANT] > **Temporal Certs on Vercel**: Since Vercel is serverless, you cannot easily mount file volumes. You should update your `TemporalClient` initialization to read certificates from environment variables (base64 encoded) if files are not present.

## 3. Deployment

### Via Git (Recommended)

1.  Push your changes to the `main` branch of your GitHub repository.
2.  Vercel will automatically trigger a new deployment.

### Via CLI

```bash
vercel deploy --prod
```

## 4. Verification

1.  Visit the production URL provided by Vercel.
2.  Navigate to `/purchase`.
3.  Complete a test purchase (using Stripe Test Mode card).
4.  Verify you are redirected to `/purchase/success`.
