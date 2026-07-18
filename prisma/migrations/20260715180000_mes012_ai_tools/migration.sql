-- MES-012 AI Tools directory

CREATE TYPE "ToolStatus" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ToolPricing" AS ENUM ('FREE', 'FREEMIUM', 'PAID', 'ENTERPRISE');
CREATE TYPE "ToolDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "ToolAvailability" AS ENUM ('AVAILABLE', 'BETA', 'WAITLIST', 'DISCONTINUED');
CREATE TYPE "ToolFeatureKind" AS ENUM ('FEATURE', 'USE_CASE', 'ADVANTAGE', 'LIMITATION');
CREATE TYPE "ToolImageKind" AS ENUM ('LOGO', 'COVER', 'SCREENSHOT');

CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "websiteUrl" TEXT,
    "developer" TEXT,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" "ToolAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "pricing" "ToolPricing" NOT NULL DEFAULT 'FREEMIUM',
    "difficulty" "ToolDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "recommendedFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedArticleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedGuideIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedToolIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "demoVideoUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ToolStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "focusKeyword" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
CREATE INDEX "Tool_status_idx" ON "Tool"("status");
CREATE INDEX "Tool_pricing_idx" ON "Tool"("pricing");
CREATE INDEX "Tool_featured_idx" ON "Tool"("featured");
CREATE INDEX "Tool_publishedAt_idx" ON "Tool"("publishedAt");

CREATE TABLE "ToolCategoryRelation" (
    "toolId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "ToolCategoryRelation_pkey" PRIMARY KEY ("toolId","categoryId")
);
ALTER TABLE "ToolCategoryRelation" ADD CONSTRAINT "ToolCategoryRelation_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolCategoryRelation" ADD CONSTRAINT "ToolCategoryRelation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ToolTopicRelation" (
    "toolId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "ToolTopicRelation_pkey" PRIMARY KEY ("toolId","topicId")
);
ALTER TABLE "ToolTopicRelation" ADD CONSTRAINT "ToolTopicRelation_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolTopicRelation" ADD CONSTRAINT "ToolTopicRelation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ToolFeature" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "ToolFeatureKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ToolFeature_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ToolFeature_toolId_kind_sortOrder_idx" ON "ToolFeature"("toolId", "kind", "sortOrder");
ALTER TABLE "ToolFeature" ADD CONSTRAINT "ToolFeature_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ToolImage" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "kind" "ToolImageKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ToolImage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ToolImage_toolId_kind_idx" ON "ToolImage"("toolId", "kind");
ALTER TABLE "ToolImage" ADD CONSTRAINT "ToolImage_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ToolTag" (
    "toolId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ToolTag_pkey" PRIMARY KEY ("toolId","tagId")
);
ALTER TABLE "ToolTag" ADD CONSTRAINT "ToolTag_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolTag" ADD CONSTRAINT "ToolTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
