-- Public Platform Phase 1

ALTER TABLE "Subscriber" ADD COLUMN "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Subscriber" ADD COLUMN "verifyToken" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN "unsubscribeToken" TEXT;
CREATE UNIQUE INDEX "Subscriber_verifyToken_key" ON "Subscriber"("verifyToken");
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

ALTER TABLE "PromptPack" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PromptPack" ADD COLUMN "premium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PromptPack" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "PromptPack" ADD COLUMN "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "PromptPack" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "PromptPack_featured_idx" ON "PromptPack"("featured");
CREATE INDEX "PromptPack_premium_idx" ON "PromptPack"("premium");

ALTER TABLE "PromptPackItem" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "PromptPackReview" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromptPackReview_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PromptPackReview_packId_publicUserId_key" ON "PromptPackReview"("packId", "publicUserId");
CREATE INDEX "PromptPackReview_packId_createdAt_idx" ON "PromptPackReview"("packId", "createdAt");
ALTER TABLE "PromptPackReview" ADD CONSTRAINT "PromptPackReview_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PromptPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromptPackReview" ADD CONSTRAINT "PromptPackReview_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Tool" ADD COLUMN "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Tool" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ToolReview" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ToolReview_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ToolReview_toolId_publicUserId_key" ON "ToolReview"("toolId", "publicUserId");
CREATE INDEX "ToolReview_toolId_createdAt_idx" ON "ToolReview"("toolId", "createdAt");
ALTER TABLE "ToolReview" ADD CONSTRAINT "ToolReview_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolReview" ADD CONSTRAINT "ToolReview_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "FreeResourceType" AS ENUM ('PDF', 'TEMPLATE', 'CHECKLIST', 'CHEATSHEET', 'EBOOK');
CREATE TYPE "FreeResourceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "FreeResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "FreeResourceType" NOT NULL DEFAULT 'PDF',
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "FreeResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "featuredImageUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FreeResource_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FreeResource_slug_key" ON "FreeResource"("slug");
CREATE INDEX "FreeResource_status_publishedAt_idx" ON "FreeResource"("status", "publishedAt");
CREATE INDEX "FreeResource_category_idx" ON "FreeResource"("category");
CREATE INDEX "FreeResource_type_idx" ON "FreeResource"("type");

CREATE TABLE "FreeResourceDownload" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "publicUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FreeResourceDownload_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FreeResourceDownload_resourceId_createdAt_idx" ON "FreeResourceDownload"("resourceId", "createdAt");
CREATE INDEX "FreeResourceDownload_publicUserId_idx" ON "FreeResourceDownload"("publicUserId");
ALTER TABLE "FreeResourceDownload" ADD CONSTRAINT "FreeResourceDownload_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "FreeResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreeResourceDownload" ADD CONSTRAINT "FreeResourceDownload_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "GlossaryTermStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "category" TEXT,
    "relatedTermIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "GlossaryTermStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GlossaryTerm_slug_key" ON "GlossaryTerm"("slug");
CREATE INDEX "GlossaryTerm_status_idx" ON "GlossaryTerm"("status");
CREATE INDEX "GlossaryTerm_category_idx" ON "GlossaryTerm"("category");
CREATE INDEX "GlossaryTerm_term_idx" ON "GlossaryTerm"("term");
