-- MES-015 SEO Center

CREATE TYPE "RedirectType" AS ENUM ('PERMANENT_301', 'TEMPORARY_302');
CREATE TYPE "RedirectStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "SeoEntityType" AS ENUM ('HOMEPAGE', 'ARTICLE', 'CATEGORY', 'TOPIC', 'GUIDE', 'AI_TOOL', 'PAGE');

CREATE TABLE "GlobalSEOSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "websiteTitle" TEXT NOT NULL DEFAULT 'Mendanize',
    "defaultMetaTitle" TEXT,
    "defaultMetaDescription" TEXT,
    "defaultOgImageUrl" TEXT,
    "defaultTwitterImageUrl" TEXT,
    "brandName" TEXT NOT NULL DEFAULT 'Mendanize',
    "siteLanguage" TEXT NOT NULL DEFAULT 'en',
    "canonicalDomain" TEXT,
    "defaultRobotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "defaultRobotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "faviconUrl" TEXT,
    "appleTouchIconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GlobalSEOSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GlobalSEOSettings_key_key" ON "GlobalSEOSettings"("key");

CREATE TABLE "SEOProfile" (
    "id" TEXT NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "entityId" TEXT,
    "path" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "canonicalUrl" TEXT,
    "slug" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImageUrl" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SEOProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SEOProfile_entityType_entityId_key" ON "SEOProfile"("entityType", "entityId");
CREATE INDEX "SEOProfile_entityType_idx" ON "SEOProfile"("entityType");
CREATE INDEX "SEOProfile_path_idx" ON "SEOProfile"("path");

CREATE TABLE "MetadataTemplate" (
    "id" TEXT NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "name" TEXT NOT NULL,
    "titleTemplate" TEXT NOT NULL,
    "descriptionTemplate" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MetadataTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MetadataTemplate_entityType_name_key" ON "MetadataTemplate"("entityType", "name");
CREATE INDEX "MetadataTemplate_entityType_idx" ON "MetadataTemplate"("entityType");

CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "type" "RedirectType" NOT NULL DEFAULT 'PERMANENT_301',
    "status" "RedirectStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Redirect_sourcePath_key" ON "Redirect"("sourcePath");
CREATE INDEX "Redirect_status_idx" ON "Redirect"("status");

CREATE TABLE "StructuredData" (
    "id" TEXT NOT NULL,
    "schemaType" TEXT NOT NULL,
    "entityType" "SeoEntityType",
    "label" TEXT NOT NULL,
    "jsonPreview" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StructuredData_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StructuredData_schemaType_idx" ON "StructuredData"("schemaType");

CREATE TABLE "RobotsRule" (
    "id" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '*',
    "allowPath" TEXT,
    "disallowPath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RobotsRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SitemapConfiguration" (
    "id" TEXT NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "changefreq" TEXT NOT NULL DEFAULT 'weekly',
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "lastRegeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SitemapConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SitemapConfiguration_entityType_key" ON "SitemapConfiguration"("entityType");
