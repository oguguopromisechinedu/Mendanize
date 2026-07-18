-- MES-010 Learning Guides

CREATE TYPE "GuideStatus" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "GuideDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "coverImageUrl" TEXT,
    "coverImageAlt" TEXT,
    "status" "GuideStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "GuideDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
    "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "topicId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "focusKeyword" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");
CREATE INDEX "Guide_status_idx" ON "Guide"("status");
CREATE INDEX "Guide_topicId_idx" ON "Guide"("topicId");
CREATE INDEX "Guide_authorId_idx" ON "Guide"("authorId");
CREATE INDEX "Guide_publishedAt_idx" ON "Guide"("publishedAt");

ALTER TABLE "Guide" ADD CONSTRAINT "Guide_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "GuideSection" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuideSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuideSection_guideId_slug_key" ON "GuideSection"("guideId", "slug");
CREATE INDEX "GuideSection_guideId_sortOrder_idx" ON "GuideSection"("guideId", "sortOrder");
ALTER TABLE "GuideSection" ADD CONSTRAINT "GuideSection_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "GuideLesson" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "readingTimeMin" INTEGER NOT NULL DEFAULT 1,
    "featuredImageUrl" TEXT,
    "featuredImageAlt" TEXT,
    "videoUrl" TEXT,
    "codeExample" TEXT,
    "resourceUrl" TEXT,
    "articleId" TEXT,
    "aiToolId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuideLesson_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuideLesson_sectionId_slug_key" ON "GuideLesson"("sectionId", "slug");
CREATE INDEX "GuideLesson_sectionId_sortOrder_idx" ON "GuideLesson"("sectionId", "sortOrder");
ALTER TABLE "GuideLesson" ADD CONSTRAINT "GuideLesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "GuideSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "GuideRevision" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuideRevision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GuideRevision_guideId_idx" ON "GuideRevision"("guideId");
ALTER TABLE "GuideRevision" ADD CONSTRAINT "GuideRevision_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuideRevision" ADD CONSTRAINT "GuideRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "GuideProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "completedLessonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "lastLessonId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuideProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuideProgress_userId_guideId_key" ON "GuideProgress"("userId", "guideId");
CREATE INDEX "GuideProgress_guideId_idx" ON "GuideProgress"("guideId");
ALTER TABLE "GuideProgress" ADD CONSTRAINT "GuideProgress_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
