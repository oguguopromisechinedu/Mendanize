-- MES-018 Recommendations Engine
-- Personalization signal tables are written by MES-022 UI; read by this engine.

CREATE TYPE "RecommendationEntityKind" AS ENUM ('ARTICLE', 'GUIDE', 'AI_TOOL', 'CATEGORY', 'TOPIC');

CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "topicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");
CREATE INDEX "UserInterest_categoryId_idx" ON "UserInterest"("categoryId");
CREATE INDEX "UserInterest_topicId_idx" ON "UserInterest"("topicId");
CREATE UNIQUE INDEX "UserInterest_userId_categoryId_topicId_key" ON "UserInterest"("userId", "categoryId", "topicId");

CREATE TABLE "SavedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "RecommendationEntityKind" NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedContent_userId_entityType_entityId_key" ON "SavedContent"("userId", "entityType", "entityId");
CREATE INDEX "SavedContent_userId_createdAt_idx" ON "SavedContent"("userId", "createdAt");

CREATE TABLE "LearningHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "RecommendationEntityKind" NOT NULL,
    "entityId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LearningHistory_userId_viewedAt_idx" ON "LearningHistory"("userId", "viewedAt");
CREATE INDEX "LearningHistory_entityType_entityId_idx" ON "LearningHistory"("entityType", "entityId");

ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedContent" ADD CONSTRAINT "SavedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningHistory" ADD CONSTRAINT "LearningHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
