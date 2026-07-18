-- MES-023 Analytics & Insights Platform

CREATE TYPE "AnalyticsEventKind" AS ENUM (
  'PAGE_VIEW',
  'CONTENT_VIEW',
  'GUIDE_START',
  'TOOL_VIEW',
  'SEARCH_QUERY',
  'ASK_MESSAGE',
  'SESSION_START',
  'SESSION_END',
  'USER_SIGN_IN',
  'OTHER'
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "kind" "AnalyticsEventKind" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "userId" TEXT,
    "sessionKey" TEXT,
    "path" TEXT,
    "query" TEXT,
    "metadataJson" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_kind_occurredAt_idx" ON "AnalyticsEvent"("kind", "occurredAt");
CREATE INDEX "AnalyticsEvent_entityType_entityId_idx" ON "AnalyticsEvent"("entityType", "entityId");
CREATE INDEX "AnalyticsEvent_userId_occurredAt_idx" ON "AnalyticsEvent"("userId", "occurredAt");
CREATE INDEX "AnalyticsEvent_sessionKey_idx" ON "AnalyticsEvent"("sessionKey");

CREATE TABLE "ContentAnalytics" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "articleViews" INTEGER NOT NULL DEFAULT 0,
    "guideViews" INTEGER NOT NULL DEFAULT 0,
    "toolViews" INTEGER NOT NULL DEFAULT 0,
    "topContentJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentAnalytics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ContentAnalytics_periodKey_key" ON "ContentAnalytics"("periodKey");

CREATE TABLE "LearningAnalytics" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "guideStarts" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "activeLearners" INTEGER NOT NULL DEFAULT 0,
    "topGuidesJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningAnalytics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LearningAnalytics_periodKey_key" ON "LearningAnalytics"("periodKey");

CREATE TABLE "AIAnalytics" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "conversations" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "avgMessagesPerConvo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topTopicsJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIAnalytics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AIAnalytics_periodKey_key" ON "AIAnalytics"("periodKey");

CREATE TABLE "SearchAnalytics" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "queryCount" INTEGER NOT NULL DEFAULT 0,
    "zeroResultCount" INTEGER NOT NULL DEFAULT 0,
    "topQueriesJson" TEXT,
    "zeroResultJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchAnalytics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SearchAnalytics_periodKey_key" ON "SearchAnalytics"("periodKey");

CREATE TABLE "TrafficAnalytics" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "returningUsers" INTEGER NOT NULL DEFAULT 0,
    "avgSessionSec" INTEGER NOT NULL DEFAULT 0,
    "devicesJson" TEXT,
    "browsersJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrafficAnalytics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TrafficAnalytics_periodKey_key" ON "TrafficAnalytics"("periodKey");

CREATE TABLE "AnalyticsReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "filtersJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "exportNote" TEXT,
    "scheduleNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AnalyticsReport_createdAt_idx" ON "AnalyticsReport"("createdAt");

CREATE TABLE "AnalyticsConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "privacyMode" BOOLEAN NOT NULL DEFAULT true,
    "auditLoggingNote" TEXT,
    "allowedRolesJson" TEXT,
    "instrumentationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsConfiguration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AnalyticsConfiguration_key_key" ON "AnalyticsConfiguration"("key");
