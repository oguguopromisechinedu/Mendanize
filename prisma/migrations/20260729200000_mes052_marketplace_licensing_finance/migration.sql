-- MES-052 Marketplace Experience, Licensing & Revenue Control

-- Pricing model: FREE
DO $$ BEGIN
  ALTER TYPE "MarketplacePricingModel" ADD VALUE IF NOT EXISTS 'FREE';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TYPE "MarketplaceLicenseType" AS ENUM ('STANDARD', 'TRANSFERABLE', 'RESALE');
CREATE TYPE "MarketplaceLicenseStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'SUSPENDED', 'REVOKED');
CREATE TYPE "MarketplaceCommissionScope" AS ENUM ('TOOLS', 'WORK');
CREATE TYPE "MarketplaceSellerTier" AS ENUM ('STANDARD', 'PRO', 'ENTERPRISE');

ALTER TABLE "JobPosting"
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "jobType" TEXT,
  ADD COLUMN IF NOT EXISTS "location" TEXT,
  ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT,
  ADD COLUMN IF NOT EXISTS "workplaceType" TEXT,
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "JobPosting_category_idx" ON "JobPosting"("category");
CREATE INDEX IF NOT EXISTS "JobPosting_featured_status_idx" ON "JobPosting"("featured", "status");

ALTER TABLE "JobApplication"
  ADD COLUMN IF NOT EXISTS "bidCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "estimatedDays" INTEGER;

ALTER TABLE "MarketplaceListing"
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "licenseType" "MarketplaceLicenseType" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN IF NOT EXISTS "deliveryType" TEXT;

CREATE INDEX IF NOT EXISTS "MarketplaceListing_category_idx" ON "MarketplaceListing"("category");
CREATE INDEX IF NOT EXISTS "MarketplaceListing_featured_status_idx" ON "MarketplaceListing"("featured", "status");

CREATE TABLE IF NOT EXISTS "MarketplaceLicense" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "previousOwnerId" TEXT,
  "licenseType" "MarketplaceLicenseType" NOT NULL,
  "status" "MarketplaceLicenseStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "transferredAt" TIMESTAMP(3),
  CONSTRAINT "MarketplaceLicense_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceLicense_purchaseId_key" ON "MarketplaceLicense"("purchaseId");
CREATE INDEX IF NOT EXISTS "MarketplaceLicense_ownerId_status_idx" ON "MarketplaceLicense"("ownerId", "status");
CREATE INDEX IF NOT EXISTS "MarketplaceLicense_listingId_idx" ON "MarketplaceLicense"("listingId");
CREATE INDEX IF NOT EXISTS "MarketplaceLicense_licenseType_status_idx" ON "MarketplaceLicense"("licenseType", "status");

DO $$ BEGIN
  ALTER TABLE "MarketplaceLicense" ADD CONSTRAINT "MarketplaceLicense_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MarketplaceLicense" ADD CONSTRAINT "MarketplaceLicense_purchaseId_fkey"
    FOREIGN KEY ("purchaseId") REFERENCES "MarketplacePurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MarketplaceLicense" ADD CONSTRAINT "MarketplaceLicense_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MarketplaceLicense" ADD CONSTRAINT "MarketplaceLicense_previousOwnerId_fkey"
    FOREIGN KEY ("previousOwnerId") REFERENCES "PublicUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MarketplaceCommissionRule" (
  "id" TEXT NOT NULL,
  "scope" "MarketplaceCommissionScope" NOT NULL,
  "sellerTier" "MarketplaceSellerTier" NOT NULL DEFAULT 'STANDARD',
  "feeBps" INTEGER NOT NULL,
  "label" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceCommissionRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceCommissionRule_scope_sellerTier_key"
  ON "MarketplaceCommissionRule"("scope", "sellerTier");
CREATE INDEX IF NOT EXISTS "MarketplaceCommissionRule_active_scope_idx"
  ON "MarketplaceCommissionRule"("active", "scope");

-- Seed default commission rules (15% tools standard, 10% work standard)
INSERT INTO "MarketplaceCommissionRule" ("id", "scope", "sellerTier", "feeBps", "label", "active", "createdAt", "updatedAt")
VALUES
  ('mcr_tools_standard', 'TOOLS', 'STANDARD', 1500, 'AI Tools — Standard seller', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mcr_tools_pro', 'TOOLS', 'PRO', 1000, 'AI Tools — Pro seller', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mcr_tools_enterprise', 'TOOLS', 'ENTERPRISE', 500, 'AI Tools — Enterprise partner', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mcr_work_standard', 'WORK', 'STANDARD', 1000, 'Work — Standard', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mcr_work_pro', 'WORK', 'PRO', 700, 'Work — Pro', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mcr_work_enterprise', 'WORK', 'ENTERPRISE', 500, 'Work — Enterprise', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("scope", "sellerTier") DO NOTHING;
