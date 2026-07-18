-- MES-009 Categories & Topics taxonomy enrichment

CREATE TYPE "CategoryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED');
CREATE TYPE "TopicStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED');

-- Category columns
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;

CREATE INDEX IF NOT EXISTS "Category_status_idx" ON "Category"("status");
CREATE INDEX IF NOT EXISTS "Category_displayOrder_idx" ON "Category"("displayOrder");

CREATE TABLE IF NOT EXISTS "CategoryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CategoryImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CategoryImage_categoryId_key" ON "CategoryImage"("categoryId");

DO $$ BEGIN
  ALTER TABLE "CategoryImage" ADD CONSTRAINT "CategoryImage_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Topic columns
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "status" "TopicStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;

-- Ensure every topic has a parent category before NOT NULL
INSERT INTO "Category" ("id", "name", "slug", "updatedAt")
SELECT 'cat_uncategorized', 'Uncategorized', 'uncategorized', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "slug" = 'uncategorized')
  AND EXISTS (SELECT 1 FROM "Topic" WHERE "categoryId" IS NULL);

UPDATE "Topic" t
SET "categoryId" = (SELECT c."id" FROM "Category" c ORDER BY c."createdAt" ASC LIMIT 1)
WHERE t."categoryId" IS NULL
  AND EXISTS (SELECT 1 FROM "Category");

DELETE FROM "Topic" WHERE "categoryId" IS NULL;

-- Drop old nullable FK if present, enforce required parent
ALTER TABLE "Topic" DROP CONSTRAINT IF EXISTS "Topic_categoryId_fkey";
ALTER TABLE "Topic" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Topic_categoryId_idx" ON "Topic"("categoryId");
CREATE INDEX IF NOT EXISTS "Topic_status_idx" ON "Topic"("status");
CREATE INDEX IF NOT EXISTS "Topic_displayOrder_idx" ON "Topic"("displayOrder");

CREATE TABLE IF NOT EXISTS "TopicImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TopicImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TopicImage_topicId_key" ON "TopicImage"("topicId");

DO $$ BEGIN
  ALTER TABLE "TopicImage" ADD CONSTRAINT "TopicImage_topicId_fkey"
    FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
