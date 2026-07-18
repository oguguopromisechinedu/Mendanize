-- MES-020 Platform Settings

CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "platformName" TEXT NOT NULL DEFAULT 'Mendanize',
    "description" TEXT,
    "websiteUrl" TEXT NOT NULL DEFAULT 'https://mendanize.com',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@mendanize.com',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@mendanize.com',
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "language" TEXT NOT NULL DEFAULT 'en',
    "defaultHomepage" TEXT NOT NULL DEFAULT '/',
    "defaultUserRole" TEXT NOT NULL DEFAULT 'LEARNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");

CREATE TABLE "BrandingSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "brandName" TEXT NOT NULL DEFAULT 'Mendanize',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#E8940C',
    "secondaryColor" TEXT NOT NULL DEFAULT '#2A2A2A',
    "accentColor" TEXT NOT NULL DEFAULT '#E8940C',
    "tokenOverridesJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BrandingSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BrandingSetting_key_key" ON "BrandingSetting"("key");

CREATE TABLE "LocalizationSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "availableLanguages" TEXT NOT NULL DEFAULT 'en',
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "numberFormat" TEXT NOT NULL DEFAULT 'en-US',
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocalizationSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LocalizationSetting_key_key" ON "LocalizationSetting"("key");

CREATE TABLE "AuthenticationSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailVerification" BOOLEAN NOT NULL DEFAULT true,
    "passwordPolicyNote" TEXT,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 10080,
    "rememberMeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AuthenticationSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AuthenticationSetting_key_key" ON "AuthenticationSetting"("key");

CREATE TABLE "AiPlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "defaultTextProvider" TEXT NOT NULL DEFAULT 'claude',
    "defaultImageProvider" TEXT NOT NULL DEFAULT 'dalle',
    "defaultVideoProvider" TEXT NOT NULL DEFAULT 'video_tbd',
    "maxResponseLength" INTEGER NOT NULL DEFAULT 4000,
    "conversationHistoryOn" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitPlaceholder" TEXT,
    "enabledProvidersJson" TEXT,
    "modelsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiPlatformSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiPlatformSetting_key_key" ON "AiPlatformSetting"("key");

CREATE TABLE "SearchPlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "suggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "trendingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "resultLimit" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SearchPlatformSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SearchPlatformSetting_key_key" ON "SearchPlatformSetting"("key");

CREATE TABLE "EmailSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "senderName" TEXT NOT NULL DEFAULT 'Mendanize',
    "senderEmail" TEXT NOT NULL DEFAULT 'noreply@mendanize.com',
    "smtpPlaceholder" TEXT,
    "templatesNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailSetting_key_key" ON "EmailSetting"("key");

CREATE TABLE "SecuritySetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "auditLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "apiAccessPlaceholder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SecuritySetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SecuritySetting_key_key" ON "SecuritySetting"("key");

-- Extend existing FeatureFlag (init) for MES-020 module toggles
ALTER TABLE "FeatureFlag" ADD COLUMN "label" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FeatureFlag" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FeatureFlag" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "FeatureFlag_sortOrder_idx" ON "FeatureFlag"("sortOrder");

CREATE TABLE "MaintenanceConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "allowedAdminEmails" TEXT,
    "showBanner" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MaintenanceConfiguration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MaintenanceConfiguration_key_key" ON "MaintenanceConfiguration"("key");
