-- MES-047 Enterprise Organization Licensing

CREATE TABLE "OrganizationPlan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seatLimit" INTEGER NOT NULL,
    "askVolumeLimit" INTEGER,
    "marketplaceJobLimit" INTEGER,
    "learningSeatLimit" INTEGER,
    "stripePriceId" TEXT,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "managedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationPlan_key_key" ON "OrganizationPlan"("key");
CREATE INDEX "OrganizationPlan_active_sortOrder_idx" ON "OrganizationPlan"("active", "sortOrder");

CREATE TABLE "OrganizationSubscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "billingOwnerUserId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "seatLimitOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationSubscription_organizationId_key" ON "OrganizationSubscription"("organizationId");
CREATE UNIQUE INDEX "OrganizationSubscription_stripeSubscriptionId_key" ON "OrganizationSubscription"("stripeSubscriptionId");
CREATE INDEX "OrganizationSubscription_billingOwnerUserId_idx" ON "OrganizationSubscription"("billingOwnerUserId");
CREATE INDEX "OrganizationSubscription_status_updatedAt_idx" ON "OrganizationSubscription"("status", "updatedAt");
CREATE INDEX "OrganizationSubscription_stripeCustomerId_idx" ON "OrganizationSubscription"("stripeCustomerId");

ALTER TABLE "OrganizationPlan" ADD CONSTRAINT "OrganizationPlan_managedByAdminId_fkey" FOREIGN KEY ("managedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "OrganizationPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
