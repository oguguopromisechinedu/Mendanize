-- MES-031 / MES-032 / MES-035 schema additions

ALTER TYPE "ArticleStatus" ADD VALUE IF NOT EXISTS 'AI_DRAFT';

ALTER TABLE "PublicUser" ADD COLUMN IF NOT EXISTS "cookieConsentAt" TIMESTAMP(3);
ALTER TABLE "PublicUser" ADD COLUMN IF NOT EXISTS "analyticsConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PublicUser" ADD COLUMN IF NOT EXISTS "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "AIGenerationJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'MERGED');

CREATE TABLE IF NOT EXISTS "AIGenerationJob" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sourceFingerprint" TEXT,
    "status" "AIGenerationJobStatus" NOT NULL DEFAULT 'QUEUED',
    "articleId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIGenerationJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DuplicateCandidate" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "existingArticleId" TEXT NOT NULL,
    "similarityNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DuplicateCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "module" TEXT,
    "requestId" TEXT,
    "stack" TEXT,
    "contextJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AIGenerationJob_status_createdAt_idx" ON "AIGenerationJob"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "DuplicateCandidate_jobId_idx" ON "DuplicateCandidate"("jobId");
CREATE INDEX IF NOT EXISTS "DuplicateCandidate_existingArticleId_idx" ON "DuplicateCandidate"("existingArticleId");
CREATE INDEX IF NOT EXISTS "ApplicationLog_level_createdAt_idx" ON "ApplicationLog"("level", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationLog_requestId_idx" ON "ApplicationLog"("requestId");
CREATE INDEX IF NOT EXISTS "ApplicationLog_createdAt_idx" ON "ApplicationLog"("createdAt");

DO $$ BEGIN
  ALTER TABLE "AIGenerationJob" ADD CONSTRAINT "AIGenerationJob_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DuplicateCandidate" ADD CONSTRAINT "DuplicateCandidate_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "AIGenerationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DuplicateCandidate" ADD CONSTRAINT "DuplicateCandidate_existingArticleId_fkey"
    FOREIGN KEY ("existingArticleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
