-- MES-036 Community Platform

CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "StudyGroupMemberRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');
CREATE TYPE "TeamMemberRole" AS ENUM ('OWNER', 'LEAD', 'MEMBER');
CREATE TYPE "TeamProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');
CREATE TYPE "CommunityReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');
CREATE TYPE "CommunityReportContentType" AS ENUM ('DISCUSSION', 'REPLY', 'PROJECT', 'COMMENT');

CREATE TABLE "CommunityCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommunityCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityCategory_slug_key" ON "CommunityCategory"("slug");
CREATE INDEX "CommunityCategory_active_sortOrder_idx" ON "CommunityCategory"("active", "sortOrder");

CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Discussion_categoryId_createdAt_idx" ON "Discussion"("categoryId", "createdAt");
CREATE INDEX "Discussion_publicUserId_idx" ON "Discussion"("publicUserId");
CREATE INDEX "Discussion_hidden_pinned_createdAt_idx" ON "Discussion"("hidden", "pinned", "createdAt");

CREATE TABLE "DiscussionReply" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DiscussionReply_discussionId_createdAt_idx" ON "DiscussionReply"("discussionId", "createdAt");
CREATE INDEX "DiscussionReply_publicUserId_idx" ON "DiscussionReply"("publicUserId");

CREATE TABLE "DiscussionLike" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DiscussionLike_publicUserId_discussionId_key" ON "DiscussionLike"("publicUserId", "discussionId");
CREATE INDEX "DiscussionLike_discussionId_idx" ON "DiscussionLike"("discussionId");

CREATE TABLE "StudyGroup" (
    "id" TEXT NOT NULL,
    "ownerPublicUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "pinnedResources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sharedNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudyGroup_slug_key" ON "StudyGroup"("slug");
CREATE INDEX "StudyGroup_visibility_archived_idx" ON "StudyGroup"("visibility", "archived");
CREATE INDEX "StudyGroup_ownerPublicUserId_idx" ON "StudyGroup"("ownerPublicUserId");

CREATE TABLE "StudyGroupMember" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "studyGroupId" TEXT NOT NULL,
    "role" "StudyGroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyGroupMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudyGroupMember_publicUserId_studyGroupId_key" ON "StudyGroupMember"("publicUserId", "studyGroupId");
CREATE INDEX "StudyGroupMember_studyGroupId_status_idx" ON "StudyGroupMember"("studyGroupId", "status");

-- Replace unused legacy Team stub (name/ownerId only) if present
DROP TABLE IF EXISTS "Team" CASCADE;

CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "progressStatus" "TeamProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "ownerPublicUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");
CREATE INDEX "Team_visibility_progressStatus_idx" ON "Team"("visibility", "progressStatus");
CREATE INDEX "Team_ownerPublicUserId_idx" ON "Team"("ownerPublicUserId");

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamMember_publicUserId_teamId_key" ON "TeamMember"("publicUserId", "teamId");
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

CREATE TABLE "ShowcaseProject" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT,
    "teamId" TEXT,
    "guideId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "screenshotUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "demoUrl" TEXT,
    "repoUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShowcaseProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShowcaseProject_slug_key" ON "ShowcaseProject"("slug");
CREATE INDEX "ShowcaseProject_featured_hidden_createdAt_idx" ON "ShowcaseProject"("featured", "hidden", "createdAt");
CREATE INDEX "ShowcaseProject_publicUserId_idx" ON "ShowcaseProject"("publicUserId");
CREATE INDEX "ShowcaseProject_teamId_idx" ON "ShowcaseProject"("teamId");
CREATE INDEX "ShowcaseProject_guideId_idx" ON "ShowcaseProject"("guideId");

CREATE TABLE "ProjectLike" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectLike_publicUserId_projectId_key" ON "ProjectLike"("publicUserId", "projectId");
CREATE INDEX "ProjectLike_projectId_idx" ON "ProjectLike"("projectId");

CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectComment_projectId_createdAt_idx" ON "ProjectComment"("projectId", "createdAt");
CREATE INDEX "ProjectComment_publicUserId_idx" ON "ProjectComment"("publicUserId");

CREATE TABLE "ProjectBookmark" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectBookmark_publicUserId_projectId_key" ON "ProjectBookmark"("publicUserId", "projectId");
CREATE INDEX "ProjectBookmark_projectId_idx" ON "ProjectBookmark"("projectId");

CREATE TABLE "CommunityProfile" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "certificatesPlaceholder" BOOLEAN NOT NULL DEFAULT true,
    "guidesCompletedPlaceholder" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommunityProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityProfile_publicUserId_key" ON "CommunityProfile"("publicUserId");

CREATE TABLE "CommunityModeratorFlag" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "grantedByAdminId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "CommunityModeratorFlag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityModeratorFlag_publicUserId_key" ON "CommunityModeratorFlag"("publicUserId");
CREATE INDEX "CommunityModeratorFlag_active_idx" ON "CommunityModeratorFlag"("active");

CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "contentType" "CommunityReportContentType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "reporterPublicUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "CommunityReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedByAdminId" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityReport_status_createdAt_idx" ON "CommunityReport"("status", "createdAt");
CREATE INDEX "CommunityReport_contentType_contentId_idx" ON "CommunityReport"("contentType", "contentId");
CREATE INDEX "CommunityReport_reporterPublicUserId_idx" ON "CommunityReport"("reporterPublicUserId");

ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CommunityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscussionLike" ADD CONSTRAINT "DiscussionLike_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscussionLike" ADD CONSTRAINT "DiscussionLike_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_ownerPublicUserId_fkey" FOREIGN KEY ("ownerPublicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CommunityCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerPublicUserId_fkey" FOREIGN KEY ("ownerPublicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowcaseProject" ADD CONSTRAINT "ShowcaseProject_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowcaseProject" ADD CONSTRAINT "ShowcaseProject_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShowcaseProject" ADD CONSTRAINT "ShowcaseProject_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectLike" ADD CONSTRAINT "ProjectLike_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectLike" ADD CONSTRAINT "ProjectLike_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ShowcaseProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ShowcaseProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectBookmark" ADD CONSTRAINT "ProjectBookmark_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectBookmark" ADD CONSTRAINT "ProjectBookmark_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ShowcaseProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityProfile" ADD CONSTRAINT "CommunityProfile_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityModeratorFlag" ADD CONSTRAINT "CommunityModeratorFlag_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityModeratorFlag" ADD CONSTRAINT "CommunityModeratorFlag_grantedByAdminId_fkey" FOREIGN KEY ("grantedByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reporterPublicUserId_fkey" FOREIGN KEY ("reporterPublicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Default discussion categories (MES-036)
INSERT INTO "CommunityCategory" ("id", "name", "slug", "description", "sortOrder", "active", "createdAt", "updatedAt") VALUES
  ('ccat_ai', 'Artificial Intelligence', 'artificial-intelligence', 'AI concepts, models, and applications', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_prompt', 'Prompt Engineering', 'prompt-engineering', 'Crafting effective prompts', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_prog', 'Programming', 'programming', 'Languages, patterns, and practice', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_web', 'Web Development', 'web-development', 'Frontend, backend, and full-stack', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_mobile', 'Mobile Development', 'mobile-development', 'iOS, Android, and cross-platform', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_ml', 'Machine Learning', 'machine-learning', 'ML models and pipelines', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_ds', 'Data Science', 'data-science', 'Analysis, visualization, and data work', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_uiux', 'UI/UX', 'ui-ux', 'Design and user experience', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_career', 'Career Advice', 'career-advice', 'Jobs, interviews, and growth', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_certs', 'Certifications', 'certifications', 'Exam prep and credentials', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_general', 'General Discussion', 'general-discussion', 'Open conversation', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ccat_help', 'Community Help', 'community-help', 'Get help from fellow learners', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
