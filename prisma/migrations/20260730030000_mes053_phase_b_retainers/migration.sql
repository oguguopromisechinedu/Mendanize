-- MES-053 Phase B: monthly maintenance retainers (Connect Billing)

CREATE TYPE "MaintenanceRetainerTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'CUSTOM');
CREATE TYPE "MaintenanceSubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'INCOMPLETE');

ALTER TABLE "MaintenanceTask" ADD COLUMN "coveredByRetainer" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "MaintenanceSubscription" (
  "id" TEXT NOT NULL,
  "rootContractId" TEXT NOT NULL,
  "continuationContractId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "workerId" TEXT NOT NULL,
  "tier" "MaintenanceRetainerTier" NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" "MaintenanceSubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "stripeSubscriptionId" TEXT,
  "stripeCustomerId" TEXT,
  "stripePriceId" TEXT,
  "applicationFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MaintenanceSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MaintenanceSubscription_stripeSubscriptionId_key" ON "MaintenanceSubscription"("stripeSubscriptionId");
CREATE INDEX "MaintenanceSubscription_continuationContractId_status_idx" ON "MaintenanceSubscription"("continuationContractId", "status");
CREATE INDEX "MaintenanceSubscription_clientId_status_idx" ON "MaintenanceSubscription"("clientId", "status");
CREATE INDEX "MaintenanceSubscription_workerId_status_idx" ON "MaintenanceSubscription"("workerId", "status");
CREATE INDEX "MaintenanceSubscription_status_idx" ON "MaintenanceSubscription"("status");

ALTER TABLE "MaintenanceSubscription"
  ADD CONSTRAINT "MaintenanceSubscription_rootContractId_fkey"
  FOREIGN KEY ("rootContractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceSubscription"
  ADD CONSTRAINT "MaintenanceSubscription_continuationContractId_fkey"
  FOREIGN KEY ("continuationContractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceSubscription"
  ADD CONSTRAINT "MaintenanceSubscription_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceSubscription"
  ADD CONSTRAINT "MaintenanceSubscription_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "MaintenanceSubscriptionPayment" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "stripeInvoiceId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'paid',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MaintenanceSubscriptionPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MaintenanceSubscriptionPayment_stripeInvoiceId_key" ON "MaintenanceSubscriptionPayment"("stripeInvoiceId");
CREATE INDEX "MaintenanceSubscriptionPayment_subscriptionId_createdAt_idx" ON "MaintenanceSubscriptionPayment"("subscriptionId", "createdAt");

ALTER TABLE "MaintenanceSubscriptionPayment"
  ADD CONSTRAINT "MaintenanceSubscriptionPayment_subscriptionId_fkey"
  FOREIGN KEY ("subscriptionId") REFERENCES "MaintenanceSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
