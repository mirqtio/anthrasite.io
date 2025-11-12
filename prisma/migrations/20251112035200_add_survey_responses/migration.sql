-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "runId" TEXT,
    "jtiHash" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "batchId" TEXT,
    "beforeAnswers" JSONB,
    "afterAnswers" JSONB,
    "metrics" JSONB,
    "reportAccessedAt" TIMESTAMP(3),
    "beforeCompletedAt" TIMESTAMP(3),
    "afterCompletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_jtiHash_key" ON "survey_responses"("jtiHash");

-- CreateIndex
CREATE INDEX "survey_responses_leadId_completedAt_idx" ON "survey_responses"("leadId", "completedAt");

-- CreateIndex
CREATE INDEX "survey_responses_createdAt_idx" ON "survey_responses"("createdAt");
