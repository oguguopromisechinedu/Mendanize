-- MES-017 Search & Discovery

CREATE TYPE "SearchFilterKind" AS ENUM (
  'CONTENT_TYPE',
  'CATEGORY',
  'TOPIC',
  'DIFFICULTY',
  'PUBLISH_DATE',
  'FEATURED',
  'RECENTLY_UPDATED'
);

CREATE TABLE "SearchConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "minQueryLength" INTEGER NOT NULL DEFAULT 2,
    "resultsPerPage" INTEGER NOT NULL DEFAULT 12,
    "rankingRulesNote" TEXT,
    "synonymsPlaceholder" TEXT,
    "stopWordsPlaceholder" TEXT,
    "analyticsPlaceholder" TEXT,
    "includeArticles" BOOLEAN NOT NULL DEFAULT true,
    "includeGuides" BOOLEAN NOT NULL DEFAULT true,
    "includeTools" BOOLEAN NOT NULL DEFAULT true,
    "includeCategories" BOOLEAN NOT NULL DEFAULT true,
    "includeTopics" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SearchConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SearchConfiguration_key_key" ON "SearchConfiguration"("key");

CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "userId" TEXT,
    "sessionKey" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

CREATE TABLE "TrendingSearch" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrendingSearch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrendingSearch_query_key" ON "TrendingSearch"("query");
CREATE INDEX "TrendingSearch_active_sortOrder_idx" ON "TrendingSearch"("active", "sortOrder");

CREATE TABLE "SearchSuggestion" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SearchSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SearchSuggestion_active_sortOrder_idx" ON "SearchSuggestion"("active", "sortOrder");

CREATE TABLE "SearchFilter" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "SearchFilterKind" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "optionsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SearchFilter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SearchFilter_key_key" ON "SearchFilter"("key");
CREATE INDEX "SearchFilter_enabled_sortOrder_idx" ON "SearchFilter"("enabled", "sortOrder");
