-- MES-014 Media Library

CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'PROCESSING', 'FAILED');
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

CREATE TABLE "MediaCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaCategory_slug_key" ON "MediaCategory"("slug");

CREATE TABLE "MediaCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaCollection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaCollection_slug_key" ON "MediaCollection"("slug");

CREATE TABLE "MediaTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaTag_slug_key" ON "MediaTag"("slug");

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "storageProvider" TEXT NOT NULL DEFAULT 'placeholder',
    "width" INTEGER,
    "height" INTEGER,
    "sizeBytes" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "copyright" TEXT,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "categoryId" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");
CREATE INDEX "MediaAsset_categoryId_idx" ON "MediaAsset"("categoryId");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
CREATE INDEX "MediaAsset_featured_idx" ON "MediaAsset"("featured");

CREATE TABLE "MediaAssetTag" (
    "assetId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "MediaAssetTag_pkey" PRIMARY KEY ("assetId","tagId")
);

CREATE TABLE "MediaCollectionAsset" (
    "collectionId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MediaCollectionAsset_pkey" PRIMARY KEY ("collectionId","assetId")
);

CREATE TABLE "MediaUsage" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaUsage_assetId_idx" ON "MediaUsage"("assetId");
CREATE INDEX "MediaUsage_entityType_entityId_idx" ON "MediaUsage"("entityType", "entityId");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MediaCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MediaAssetTag" ADD CONSTRAINT "MediaAssetTag_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaAssetTag" ADD CONSTRAINT "MediaAssetTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MediaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaCollectionAsset" ADD CONSTRAINT "MediaCollectionAsset_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "MediaCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaCollectionAsset" ADD CONSTRAINT "MediaCollectionAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaUsage" ADD CONSTRAINT "MediaUsage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
