-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "reportData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip_location" JSONB,
    "variant_data" JSONB,
    "position" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utm_tokens" (
    "nonce" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utm_tokens_pkey" PRIMARY KEY ("nonce")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "utmToken" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "customerEmail" TEXT,
    "confirmationEmailSentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "utmToken" TEXT,
    "customerEmail" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "recoveryToken" TEXT,
    "recoveryEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "recoveredAt" TIMESTAMP(3),
    "sessionExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_domain_key" ON "businesses"("domain");

-- CreateIndex
CREATE INDEX "waitlist_domain_idx" ON "waitlist"("domain");

-- CreateIndex
CREATE INDEX "waitlist_created_at_idx" ON "waitlist"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "utm_tokens_token_key" ON "utm_tokens"("token");

-- CreateIndex
CREATE INDEX "utm_tokens_token_idx" ON "utm_tokens"("token");

-- CreateIndex
CREATE INDEX "utm_tokens_expiresAt_idx" ON "utm_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_stripeSessionId_key" ON "purchases"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_stripePaymentIntentId_key" ON "purchases"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "purchases_stripeSessionId_idx" ON "purchases"("stripeSessionId");

-- CreateIndex
CREATE INDEX "purchases_stripePaymentIntentId_idx" ON "purchases"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "purchases_status_idx" ON "purchases"("status");

-- CreateIndex
CREATE INDEX "analytics_events_eventName_sessionId_idx" ON "analytics_events"("eventName", "sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_stripeSessionId_key" ON "abandoned_carts"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_recoveryToken_key" ON "abandoned_carts"("recoveryToken");

-- CreateIndex
CREATE INDEX "abandoned_carts_stripeSessionId_idx" ON "abandoned_carts"("stripeSessionId");

-- CreateIndex
CREATE INDEX "abandoned_carts_recoveryToken_idx" ON "abandoned_carts"("recoveryToken");

-- CreateIndex
CREATE INDEX "abandoned_carts_emailSentAt_idx" ON "abandoned_carts"("emailSentAt");

-- CreateIndex
CREATE INDEX "abandoned_carts_sessionExpiresAt_idx" ON "abandoned_carts"("sessionExpiresAt");

-- CreateIndex
CREATE INDEX "abandoned_carts_createdAt_idx" ON "abandoned_carts"("createdAt");

-- AddForeignKey
ALTER TABLE "utm_tokens" ADD CONSTRAINT "utm_tokens_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
