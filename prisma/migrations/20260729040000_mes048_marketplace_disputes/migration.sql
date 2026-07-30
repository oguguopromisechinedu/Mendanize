-- MES-048 Marketplace Dispute Resolution

CREATE TYPE "DisputeReason" AS ENUM ('NON_PAYMENT', 'SCOPE', 'QUALITY', 'OTHER');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "DisputeResolutionAction" AS ENUM ('NONE', 'RELEASE_MILESTONE', 'PARTIAL_REFUND', 'CANCEL_CONTRACT');

CREATE TABLE "MarketplaceDispute" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "openedByPublicUserId" TEXT NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionAction" "DisputeResolutionAction",
    "resolutionNote" TEXT,
    "partialRefundCents" INTEGER,
    "resolvedByAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketplaceDispute_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MarketplaceDispute_status_createdAt_idx" ON "MarketplaceDispute"("status", "createdAt");
CREATE INDEX "MarketplaceDispute_contractId_status_idx" ON "MarketplaceDispute"("contractId", "status");
CREATE INDEX "MarketplaceDispute_openedByPublicUserId_idx" ON "MarketplaceDispute"("openedByPublicUserId");

CREATE TABLE "DisputeStatement" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeStatement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DisputeStatement_disputeId_createdAt_idx" ON "DisputeStatement"("disputeId", "createdAt");

CREATE TABLE "DisputeAttachment" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeAttachment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DisputeAttachment_disputeId_idx" ON "DisputeAttachment"("disputeId");

ALTER TABLE "MarketplaceDispute" ADD CONSTRAINT "MarketplaceDispute_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceDispute" ADD CONSTRAINT "MarketplaceDispute_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketplaceDispute" ADD CONSTRAINT "MarketplaceDispute_openedByPublicUserId_fkey" FOREIGN KEY ("openedByPublicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceDispute" ADD CONSTRAINT "MarketplaceDispute_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DisputeStatement" ADD CONSTRAINT "DisputeStatement_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "MarketplaceDispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisputeStatement" ADD CONSTRAINT "DisputeStatement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisputeAttachment" ADD CONSTRAINT "DisputeAttachment_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "MarketplaceDispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
