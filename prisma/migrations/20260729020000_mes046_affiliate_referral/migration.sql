-- MES-046 Affiliate & Referral Tracking

CREATE TYPE "ReferralConversionStatus" AS ENUM ('QUALIFIED', 'REWARDED', 'VOID');
CREATE TYPE "ReferralRewardStatus" AS ENUM ('PENDING_PAYOUT', 'GRANTED', 'DENIED', 'BLOCKED_FRAUD');

CREATE TABLE "ReferralSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "attributionWindowDays" INTEGER NOT NULL DEFAULT 30,
    "rewardMechanism" TEXT NOT NULL DEFAULT 'manual_admin_payout_flag',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReferralSetting_key_key" ON "ReferralSetting"("key");

CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "disabledReason" TEXT,
    "disabledAt" TIMESTAMP(3),
    "disabledByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReferralCode_publicUserId_key" ON "ReferralCode"("publicUserId");
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE INDEX "ReferralCode_enabled_createdAt_idx" ON "ReferralCode"("enabled", "createdAt");

CREATE TABLE "ReferralAttribution" (
    "id" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "codeSnapshot" TEXT NOT NULL,
    "landingPath" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "attributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cookieCapturedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "selfReferralBlocked" BOOLEAN NOT NULL DEFAULT false,
    "abuseFlagged" BOOLEAN NOT NULL DEFAULT false,
    "abuseReason" TEXT,
    CONSTRAINT "ReferralAttribution_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReferralAttribution_referredUserId_key" ON "ReferralAttribution"("referredUserId");
CREATE INDEX "ReferralAttribution_referralCodeId_attributedAt_idx" ON "ReferralAttribution"("referralCodeId", "attributedAt");
CREATE INDEX "ReferralAttribution_abuseFlagged_attributedAt_idx" ON "ReferralAttribution"("abuseFlagged", "attributedAt");

CREATE TABLE "ReferralConversion" (
    "id" TEXT NOT NULL,
    "attributionId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "stripeSubscriptionId" TEXT,
    "planTier" TEXT NOT NULL,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReferralConversionStatus" NOT NULL DEFAULT 'QUALIFIED',
    CONSTRAINT "ReferralConversion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReferralConversion_attributionId_key" ON "ReferralConversion"("attributionId");
CREATE INDEX "ReferralConversion_referrerUserId_convertedAt_idx" ON "ReferralConversion"("referrerUserId", "convertedAt");
CREATE INDEX "ReferralConversion_referredUserId_idx" ON "ReferralConversion"("referredUserId");
CREATE INDEX "ReferralConversion_status_convertedAt_idx" ON "ReferralConversion"("status", "convertedAt");

CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "conversionId" TEXT NOT NULL,
    "status" "ReferralRewardStatus" NOT NULL DEFAULT 'PENDING_PAYOUT',
    "note" TEXT,
    "resolvedByAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReferralReward_conversionId_key" ON "ReferralReward"("conversionId");
CREATE INDEX "ReferralReward_status_createdAt_idx" ON "ReferralReward"("status", "createdAt");

ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_disabledByAdminId_fkey" FOREIGN KEY ("disabledByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReferralAttribution" ADD CONSTRAINT "ReferralAttribution_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralAttribution" ADD CONSTRAINT "ReferralAttribution_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralConversion" ADD CONSTRAINT "ReferralConversion_attributionId_fkey" FOREIGN KEY ("attributionId") REFERENCES "ReferralAttribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralConversion" ADD CONSTRAINT "ReferralConversion_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralConversion" ADD CONSTRAINT "ReferralConversion_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_conversionId_fkey" FOREIGN KEY ("conversionId") REFERENCES "ReferralConversion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
