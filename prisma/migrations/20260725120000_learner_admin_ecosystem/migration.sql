-- Learner ↔ Admin ecosystem tables

CREATE TYPE "CatalogPublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "LearnerProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED');

ALTER TYPE "CommentEntityType" ADD VALUE IF NOT EXISTS 'PROJECT';

ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "publicUserId" TEXT;
CREATE INDEX IF NOT EXISTS "Comment_publicUserId_idx" ON "Comment"("publicUserId");
DO $$ BEGIN
  ALTER TABLE "Comment" ADD CONSTRAINT "Comment_publicUserId_fkey"
    FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PromptPack" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "status" "CatalogPublishStatus" NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromptPack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PromptPack_slug_key" ON "PromptPack"("slug");
CREATE INDEX IF NOT EXISTS "PromptPack_status_sortOrder_idx" ON "PromptPack"("status", "sortOrder");

CREATE TABLE IF NOT EXISTS "PromptPackItem" (
  "id" TEXT NOT NULL,
  "packId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromptPackItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PromptPackItem_packId_sortOrder_idx" ON "PromptPackItem"("packId", "sortOrder");
DO $$ BEGIN
  ALTER TABLE "PromptPackItem" ADD CONSTRAINT "PromptPackItem_packId_fkey"
    FOREIGN KEY ("packId") REFERENCES "PromptPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ProjectTemplate" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "brief" TEXT NOT NULL,
  "difficulty" "GuideDifficulty" NOT NULL DEFAULT 'BEGINNER',
  "guideIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "toolIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "CatalogPublishStatus" NOT NULL DEFAULT 'DRAFT',
  "estimatedHours" INTEGER NOT NULL DEFAULT 4,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectTemplate_slug_key" ON "ProjectTemplate"("slug");
CREATE INDEX IF NOT EXISTS "ProjectTemplate_status_idx" ON "ProjectTemplate"("status");

CREATE TABLE IF NOT EXISTS "LearnerProject" (
  "id" TEXT NOT NULL,
  "publicUserId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "status" "LearnerProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "notes" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearnerProject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LearnerProject_publicUserId_templateId_key" ON "LearnerProject"("publicUserId", "templateId");
CREATE INDEX IF NOT EXISTS "LearnerProject_publicUserId_status_idx" ON "LearnerProject"("publicUserId", "status");
DO $$ BEGIN
  ALTER TABLE "LearnerProject" ADD CONSTRAINT "LearnerProject_publicUserId_fkey"
    FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "LearnerProject" ADD CONSTRAINT "LearnerProject_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "ProjectTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "CertificateTemplate" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "guideId" TEXT NOT NULL,
  "badgeUrl" TEXT,
  "status" "CatalogPublishStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CertificateTemplate_slug_key" ON "CertificateTemplate"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "CertificateTemplate_guideId_key" ON "CertificateTemplate"("guideId");
CREATE INDEX IF NOT EXISTS "CertificateTemplate_status_idx" ON "CertificateTemplate"("status");
DO $$ BEGIN
  ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_guideId_fkey"
    FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Certificate" (
  "id" TEXT NOT NULL,
  "publicUserId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "guideId" TEXT NOT NULL,
  "credentialCode" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_credentialCode_key" ON "Certificate"("credentialCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_publicUserId_templateId_key" ON "Certificate"("publicUserId", "templateId");
CREATE INDEX IF NOT EXISTS "Certificate_publicUserId_issuedAt_idx" ON "Certificate"("publicUserId", "issuedAt");
CREATE INDEX IF NOT EXISTS "Certificate_guideId_idx" ON "Certificate"("guideId");
DO $$ BEGIN
  ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_publicUserId_fkey"
    FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Achievement" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "iconKey" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Achievement_key_key" ON "Achievement"("key");

CREATE TABLE IF NOT EXISTS "AchievementGrant" (
  "id" TEXT NOT NULL,
  "publicUserId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AchievementGrant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AchievementGrant_publicUserId_achievementId_key" ON "AchievementGrant"("publicUserId", "achievementId");
CREATE INDEX IF NOT EXISTS "AchievementGrant_publicUserId_idx" ON "AchievementGrant"("publicUserId");
DO $$ BEGIN
  ALTER TABLE "AchievementGrant" ADD CONSTRAINT "AchievementGrant_publicUserId_fkey"
    FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "AchievementGrant" ADD CONSTRAINT "AchievementGrant_achievementId_fkey"
    FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LearningFeaturedSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL DEFAULT 'main',
  "featuredGuideIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "featuredArticleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "featuredToolIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "featuredPromptPackIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "featuredProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningFeaturedSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LearningFeaturedSetting_key_key" ON "LearningFeaturedSetting"("key");

CREATE TABLE IF NOT EXISTS "WorkspacePreset" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "guideId" TEXT,
  "starterPrompt" TEXT,
  "challengeNote" TEXT,
  "status" "CatalogPublishStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkspacePreset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspacePreset_slug_key" ON "WorkspacePreset"("slug");
CREATE INDEX IF NOT EXISTS "WorkspacePreset_status_idx" ON "WorkspacePreset"("status");
DO $$ BEGIN
  ALTER TABLE "WorkspacePreset" ADD CONSTRAINT "WorkspacePreset_guideId_fkey"
    FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LearningDailyStat" (
  "id" TEXT NOT NULL,
  "publicUserId" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "activityCount" INTEGER NOT NULL DEFAULT 0,
  "minutesApprox" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "LearningDailyStat_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LearningDailyStat_publicUserId_day_key" ON "LearningDailyStat"("publicUserId", "day");
CREATE INDEX IF NOT EXISTS "LearningDailyStat_publicUserId_day_idx" ON "LearningDailyStat"("publicUserId", "day");
DO $$ BEGIN
  ALTER TABLE "LearningDailyStat" ADD CONSTRAINT "LearningDailyStat_publicUserId_fkey"
    FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "Achievement" ("id", "key", "title", "description", "iconKey", "active", "createdAt", "updatedAt")
VALUES
  ('ach_first_lesson', 'first_lesson', 'First lesson', 'Completed your first lesson', 'book', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ach_streak_7', 'streak_7', '7-day streak', 'Learned on 7 consecutive days', 'flame', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ach_first_project', 'first_project', 'First project', 'Started your first learning project', 'folder', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ach_first_cert', 'first_certificate', 'First certificate', 'Earned your first certificate', 'award', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "LearningFeaturedSetting" ("id", "key", "featuredGuideIds", "featuredArticleIds", "featuredToolIds", "featuredPromptPackIds", "featuredProjectIds", "updatedAt")
VALUES ('lfs_main', 'main', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
