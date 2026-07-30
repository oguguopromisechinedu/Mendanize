-- MES-051 Email Management System

CREATE TYPE "EmsTemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "EmailSenderStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
CREATE TYPE "EmailQueueStatus" AS ENUM ('PENDING', 'SENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TABLE "EmailCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "systemCritical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailCategory_name_key" ON "EmailCategory"("name");
CREATE UNIQUE INDEX "EmailCategory_slug_key" ON "EmailCategory"("slug");

CREATE TABLE "EmailSender" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "replyTo" TEXT,
    "status" "EmailSenderStatus" NOT NULL DEFAULT 'PENDING',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailSender_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailSender_address_key" ON "EmailSender"("address");
CREATE INDEX "EmailSender_status_enabled_idx" ON "EmailSender"("status", "enabled");

ALTER TABLE "EmailTemplate" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "EmailTemplate" ADD COLUMN "senderId" TEXT;
ALTER TABLE "EmailTemplate" ADD COLUMN "replyTo" TEXT;
ALTER TABLE "EmailTemplate" ADD COLUMN "status" "EmsTemplateStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "EmailTemplate" ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "EmailTemplate" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE TABLE "EmailTemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailTemplateVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailTemplateVersion_templateId_version_key" ON "EmailTemplateVersion"("templateId", "version");
CREATE INDEX "EmailTemplateVersion_templateId_idx" ON "EmailTemplateVersion"("templateId");

CREATE TABLE "EmailVariableDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sampleValue" TEXT,
    "builtin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailVariableDefinition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailVariableDefinition_key_key" ON "EmailVariableDefinition"("key");

CREATE TABLE "EmailAutomationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "senderId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "conditionJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailAutomationRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailAutomationRule_eventKey_enabled_idx" ON "EmailAutomationRule"("eventKey", "enabled");

CREATE TABLE "EmailQueueItem" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "templateKey" TEXT,
    "campaignId" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "bodyText" TEXT,
    "status" "EmailQueueStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "providerMessageId" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "payloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    CONSTRAINT "EmailQueueItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailQueueItem_status_createdAt_idx" ON "EmailQueueItem"("status", "createdAt");
CREATE INDEX "EmailQueueItem_campaignId_idx" ON "EmailQueueItem"("campaignId");

CREATE TABLE "EmailDeliveryEvent" (
    "id" TEXT NOT NULL,
    "queueItemId" TEXT,
    "templateKey" TEXT,
    "campaignId" TEXT,
    "type" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailDeliveryEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailDeliveryEvent_type_createdAt_idx" ON "EmailDeliveryEvent"("type", "createdAt");
CREATE INDEX "EmailDeliveryEvent_templateKey_idx" ON "EmailDeliveryEvent"("templateKey");

ALTER TABLE "EmailSetting" ADD COLUMN "defaultReplyTo" TEXT;
ALTER TABLE "EmailSetting" ADD COLUMN "brandLogoUrl" TEXT;
ALTER TABLE "EmailSetting" ADD COLUMN "footerHtml" TEXT;
ALTER TABLE "EmailSetting" ADD COLUMN "companyAddress" TEXT;
ALTER TABLE "EmailSetting" ADD COLUMN "socialLinksJson" TEXT;
ALTER TABLE "EmailSetting" ADD COLUMN "unsubscribeFooterHtml" TEXT;
ALTER TABLE "EmailSetting" ADD COLUMN "trackingOpens" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "EmailSetting" ADD COLUMN "trackingClicks" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EmailCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "EmailSender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailTemplateVersion" ADD CONSTRAINT "EmailTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailAutomationRule" ADD CONSTRAINT "EmailAutomationRule_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "EmailSender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailQueueItem" ADD CONSTRAINT "EmailQueueItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "NewsletterCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailDeliveryEvent" ADD CONSTRAINT "EmailDeliveryEvent_queueItemId_fkey" FOREIGN KEY ("queueItemId") REFERENCES "EmailQueueItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "EmailTemplate_status_enabled_idx" ON "EmailTemplate"("status", "enabled");
CREATE INDEX "EmailTemplate_categoryId_idx" ON "EmailTemplate"("categoryId");
CREATE INDEX "EmailTemplate_deletedAt_idx" ON "EmailTemplate"("deletedAt");
