-- MES-013 Homepage CMS

CREATE TYPE "HomepageStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "HomepageFeaturedKind" AS ENUM ('CATEGORY', 'ARTICLE', 'GUIDE', 'TOOL');
CREATE TYPE "HomepageSelectionMode" AS ENUM ('MANUAL', 'AUTOMATIC');

CREATE TABLE "Homepage" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "status" "HomepageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "askJson" JSONB,
    "whyJson" JSONB,
    "newsletterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Homepage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Homepage_key_key" ON "Homepage"("key");

CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visibilityRules" TEXT,
    "backgroundStyle" TEXT,
    "animationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "spacing" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT,
    "displayLimit" INTEGER,
    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepageSection_homepageId_sectionKey_key" ON "HomepageSection"("homepageId", "sectionKey");
CREATE INDEX "HomepageSection_homepageId_sortOrder_idx" ON "HomepageSection"("homepageId", "sortOrder");

CREATE TABLE "HomepageHero" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT 'Mendanize',
    "headline" TEXT NOT NULL,
    "supportingText" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL,
    "primaryCtaHref" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT NOT NULL,
    "secondaryCtaHref" TEXT NOT NULL,
    "trustLine" TEXT,
    "heroImageUrl" TEXT,
    "backgroundGradient" TEXT,
    "askPlaceholder" TEXT,
    CONSTRAINT "HomepageHero_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepageHero_homepageId_key" ON "HomepageHero"("homepageId");

CREATE TABLE "HomepageStatistic" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomepageStatistic_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomepageStatistic_homepageId_sortOrder_idx" ON "HomepageStatistic"("homepageId", "sortOrder");

CREATE TABLE "HomepageFAQ" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomepageFAQ_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomepageFAQ_homepageId_sortOrder_idx" ON "HomepageFAQ"("homepageId", "sortOrder");

CREATE TABLE "HomepageCTA" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL,
    "primaryCtaHref" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT NOT NULL,
    "secondaryCtaHref" TEXT NOT NULL,
    CONSTRAINT "HomepageCTA_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepageCTA_homepageId_key" ON "HomepageCTA"("homepageId");

CREATE TABLE "HomepageFeaturedContent" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "kind" "HomepageFeaturedKind" NOT NULL,
    "entityId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "selectionMode" "HomepageSelectionMode" NOT NULL DEFAULT 'MANUAL',
    "titleOverride" TEXT,
    CONSTRAINT "HomepageFeaturedContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomepageFeaturedContent_homepageId_kind_sortOrder_idx" ON "HomepageFeaturedContent"("homepageId", "kind", "sortOrder");

CREATE TABLE "HomepageTestimonial" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomepageTestimonial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomepageTestimonial_homepageId_sortOrder_idx" ON "HomepageTestimonial"("homepageId", "sortOrder");

ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageHero" ADD CONSTRAINT "HomepageHero_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageStatistic" ADD CONSTRAINT "HomepageStatistic_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageFAQ" ADD CONSTRAINT "HomepageFAQ_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageCTA" ADD CONSTRAINT "HomepageCTA_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageFeaturedContent" ADD CONSTRAINT "HomepageFeaturedContent_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomepageTestimonial" ADD CONSTRAINT "HomepageTestimonial_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
