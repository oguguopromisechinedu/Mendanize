-- MES-011 Admin AI Studio generations

CREATE TYPE "AIGenerationType" AS ENUM ('ARTICLE', 'IMAGE', 'VIDEO');
CREATE TYPE "AIGenerationProvider" AS ENUM ('CLAUDE', 'OPENAI', 'GEMINI', 'GROK', 'DALLE', 'VIDEO_TBD', 'LOCAL_MOCK');
CREATE TYPE "AIGenerationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ACCEPTED');

CREATE TABLE "AIGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AIGenerationType" NOT NULL,
    "provider" "AIGenerationProvider" NOT NULL,
    "status" "AIGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "outputText" TEXT,
    "outputUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "model" TEXT,
    "tone" TEXT,
    "targetLength" TEXT,
    "aspectRatio" TEXT,
    "durationSec" INTEGER,
    "categoryId" TEXT,
    "topicId" TEXT,
    "articleId" TEXT,
    "mediaAssetId" TEXT,
    "errorMessage" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIGeneration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AIGeneration_userId_idx" ON "AIGeneration"("userId");
CREATE INDEX "AIGeneration_type_idx" ON "AIGeneration"("type");
CREATE INDEX "AIGeneration_status_idx" ON "AIGeneration"("status");
CREATE INDEX "AIGeneration_createdAt_idx" ON "AIGeneration"("createdAt");

ALTER TABLE "AIGeneration" ADD CONSTRAINT "AIGeneration_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
