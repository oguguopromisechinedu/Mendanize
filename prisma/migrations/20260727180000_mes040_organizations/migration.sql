-- MES-040: Organization accounts + hybrid marketplace listing source

CREATE TYPE "MarketplaceListingSource" AS ENUM ('OFFICIAL', 'THIRD_PARTY', 'BUILT_ON_MENDANIZE');
CREATE TYPE "OrganizationType" AS ENUM ('COMPANY', 'STARTUP', 'EDUCATION', 'NONPROFIT', 'OTHER');
CREATE TYPE "OrganizationVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

ALTER TABLE "MarketplaceListing" ADD COLUMN IF NOT EXISTS "source" "MarketplaceListingSource" NOT NULL DEFAULT 'BUILT_ON_MENDANIZE';

CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'COMPANY',
    "description" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "location" TEXT,
    "verificationStatus" "OrganizationVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verificationNote" TEXT,
    "reviewedByAdminId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "ownerPublicUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "role" "OrganizationMemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX IF NOT EXISTS "Organization_ownerPublicUserId_idx" ON "Organization"("ownerPublicUserId");
CREATE INDEX IF NOT EXISTS "Organization_verificationStatus_createdAt_idx" ON "Organization"("verificationStatus", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationMember_organizationId_publicUserId_key" ON "OrganizationMember"("organizationId", "publicUserId");
CREATE INDEX IF NOT EXISTS "OrganizationMember_publicUserId_idx" ON "OrganizationMember"("publicUserId");
CREATE INDEX IF NOT EXISTS "JobPosting_organizationId_idx" ON "JobPosting"("organizationId");
CREATE INDEX IF NOT EXISTS "MarketplaceListing_source_idx" ON "MarketplaceListing"("source");

ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_ownerPublicUserId_fkey";
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerPublicUserId_fkey" FOREIGN KEY ("ownerPublicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMember" DROP CONSTRAINT IF EXISTS "OrganizationMember_organizationId_fkey";
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMember" DROP CONSTRAINT IF EXISTS "OrganizationMember_publicUserId_fkey";
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobPosting" DROP CONSTRAINT IF EXISTS "JobPosting_organizationId_fkey";
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
