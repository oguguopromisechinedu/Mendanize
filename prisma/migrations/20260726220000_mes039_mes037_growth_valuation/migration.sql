-- MES-039 Professional Growth & Earnings + MES-037 Founder Valuation

-- Ask context extensions (MES-039 Career / Interview)
ALTER TYPE "AskContextType" ADD VALUE IF NOT EXISTS 'INTERVIEW';
ALTER TYPE "AskContextType" ADD VALUE IF NOT EXISTS 'CAREER';
ALTER TYPE "AskContextType" ADD VALUE IF NOT EXISTS 'RESUME';
ALTER TYPE "AskContextType" ADD VALUE IF NOT EXISTS 'PROPOSAL';

CREATE TYPE "MentorshipStatus" AS ENUM ('REQUESTED', 'ACTIVE', 'DECLINED', 'ENDED');
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'OPEN', 'JUDGING', 'CLOSED');
CREATE TYPE "ChallengeSubmissionStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED');
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'OPEN', 'FILLED', 'CLOSED', 'REJECTED');
CREATE TYPE "JobApplicationStatus" AS ENUM ('SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED');
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'FUNDED', 'RELEASED', 'REFUNDED');
CREATE TYPE "MarketplaceListingKind" AS ENUM ('AI_APP', 'AGENT', 'PROMPT_PACK', 'TEMPLATE', 'AUTOMATION');
CREATE TYPE "MarketplaceListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "MarketplacePricingModel" AS ENUM ('ONE_TIME', 'SUBSCRIPTION');
CREATE TYPE "ValuationConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "passThreshold" INTEGER NOT NULL DEFAULT 70,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answersJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "assessmentAttemptId" TEXT;

CREATE TABLE "PromptLibraryEntry" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "folder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromptLibraryEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearnerNote" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "guideId" TEXT,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearnerNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MentorshipRelationship" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'REQUESTED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MentorshipRelationship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "category" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChallengeSubmission" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ChallengeSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChallengeSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerProfile" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "targetRole" TEXT,
    "location" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceJson" TEXT,
    "educationJson" TEXT,
    "portfolioProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "careerProfileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "contentMarkdown" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "conversationId" TEXT,
    "targetRole" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerReadinessScore" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "breakdownJson" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerReadinessScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillGapResult" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "gapsJson" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SkillGapResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientFlag" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "grantedByAdminId" TEXT,
    "selfServe" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "ClientFlag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorFlag" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "grantedByAdminId" TEXT,
    "selfServe" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "CreatorFlag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNote" TEXT,
    "reviewedByAdminId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "disputeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractPayment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContractPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientReview" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "MarketplaceListingKind" NOT NULL,
    "pricingModel" "MarketplacePricingModel" NOT NULL DEFAULT 'ONE_TIME',
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "MarketplaceListingStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNote" TEXT,
    "reviewedByAdminId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplacePurchase" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketplacePurchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceSubscriptionInstance" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "stripeConnectSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketplaceSubscriptionInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorPayoutAccount" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "stripeConnectAccountId" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorPayoutAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceReview" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketplaceReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorFollower" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorFollower_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReputationScore" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "breakdownJson" TEXT NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReputationScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ValuationSnapshot" (
    "id" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL,
    "growthPercent" DOUBLE PRECISION,
    "confidenceLevel" "ValuationConfidence" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computedByAdminId" TEXT,
    CONSTRAINT "ValuationSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ValuationFactor" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "factorName" TEXT NOT NULL,
    "factorValue" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "ValuationFactor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrowthSnapshot" (
    "id" TEXT NOT NULL,
    "rangeStart" TIMESTAMP(3) NOT NULL,
    "rangeEnd" TIMESTAMP(3) NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "insightText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrowthSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Assessment_guideId_key" ON "Assessment"("guideId");
CREATE INDEX "AssessmentQuestion_assessmentId_sortOrder_idx" ON "AssessmentQuestion"("assessmentId", "sortOrder");
CREATE INDEX "AssessmentAttempt_publicUserId_assessmentId_idx" ON "AssessmentAttempt"("publicUserId", "assessmentId");
CREATE INDEX "AssessmentAttempt_assessmentId_createdAt_idx" ON "AssessmentAttempt"("assessmentId", "createdAt");
CREATE UNIQUE INDEX "Certificate_assessmentAttemptId_key" ON "Certificate"("assessmentAttemptId");
CREATE INDEX "PromptLibraryEntry_publicUserId_updatedAt_idx" ON "PromptLibraryEntry"("publicUserId", "updatedAt");
CREATE INDEX "LearnerNote_publicUserId_updatedAt_idx" ON "LearnerNote"("publicUserId", "updatedAt");
CREATE INDEX "LearnerNote_guideId_idx" ON "LearnerNote"("guideId");
CREATE UNIQUE INDEX "MentorshipRelationship_mentorId_menteeId_key" ON "MentorshipRelationship"("mentorId", "menteeId");
CREATE INDEX "MentorshipRelationship_menteeId_status_idx" ON "MentorshipRelationship"("menteeId", "status");
CREATE INDEX "MentorshipRelationship_mentorId_status_idx" ON "MentorshipRelationship"("mentorId", "status");
CREATE UNIQUE INDEX "LeaderboardEntry_periodKey_publicUserId_key" ON "LeaderboardEntry"("periodKey", "publicUserId");
CREATE INDEX "LeaderboardEntry_periodKey_rank_idx" ON "LeaderboardEntry"("periodKey", "rank");
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");
CREATE INDEX "Challenge_status_endsAt_idx" ON "Challenge"("status", "endsAt");
CREATE UNIQUE INDEX "ChallengeSubmission_challengeId_publicUserId_key" ON "ChallengeSubmission"("challengeId", "publicUserId");
CREATE INDEX "ChallengeSubmission_challengeId_status_idx" ON "ChallengeSubmission"("challengeId", "status");
CREATE UNIQUE INDEX "CareerProfile_publicUserId_key" ON "CareerProfile"("publicUserId");
CREATE INDEX "ResumeVersion_careerProfileId_createdAt_idx" ON "ResumeVersion"("careerProfileId", "createdAt");
CREATE INDEX "InterviewSession_publicUserId_createdAt_idx" ON "InterviewSession"("publicUserId", "createdAt");
CREATE INDEX "CareerReadinessScore_publicUserId_computedAt_idx" ON "CareerReadinessScore"("publicUserId", "computedAt");
CREATE INDEX "SkillGapResult_publicUserId_computedAt_idx" ON "SkillGapResult"("publicUserId", "computedAt");
CREATE UNIQUE INDEX "ClientFlag_publicUserId_key" ON "ClientFlag"("publicUserId");
CREATE UNIQUE INDEX "CreatorFlag_publicUserId_key" ON "CreatorFlag"("publicUserId");
CREATE UNIQUE INDEX "JobPosting_slug_key" ON "JobPosting"("slug");
CREATE INDEX "JobPosting_status_createdAt_idx" ON "JobPosting"("status", "createdAt");
CREATE INDEX "JobPosting_clientId_idx" ON "JobPosting"("clientId");
CREATE UNIQUE INDEX "JobApplication_jobId_publicUserId_key" ON "JobApplication"("jobId", "publicUserId");
CREATE INDEX "JobApplication_publicUserId_createdAt_idx" ON "JobApplication"("publicUserId", "createdAt");
CREATE UNIQUE INDEX "Contract_applicationId_key" ON "Contract"("applicationId");
CREATE INDEX "Contract_clientId_status_idx" ON "Contract"("clientId", "status");
CREATE INDEX "Contract_workerId_status_idx" ON "Contract"("workerId", "status");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Milestone_contractId_status_idx" ON "Milestone"("contractId", "status");
CREATE UNIQUE INDEX "ContractPayment_milestoneId_key" ON "ContractPayment"("milestoneId");
CREATE INDEX "ContractPayment_contractId_idx" ON "ContractPayment"("contractId");
CREATE UNIQUE INDEX "ClientReview_contractId_key" ON "ClientReview"("contractId");
CREATE INDEX "ClientReview_subjectId_idx" ON "ClientReview"("subjectId");
CREATE UNIQUE INDEX "MarketplaceListing_slug_key" ON "MarketplaceListing"("slug");
CREATE INDEX "MarketplaceListing_status_publishedAt_idx" ON "MarketplaceListing"("status", "publishedAt");
CREATE INDEX "MarketplaceListing_creatorId_idx" ON "MarketplaceListing"("creatorId");
CREATE INDEX "MarketplaceListing_kind_idx" ON "MarketplaceListing"("kind");
CREATE INDEX "MarketplacePurchase_buyerId_createdAt_idx" ON "MarketplacePurchase"("buyerId", "createdAt");
CREATE INDEX "MarketplacePurchase_listingId_idx" ON "MarketplacePurchase"("listingId");
CREATE UNIQUE INDEX "MarketplaceSubscriptionInstance_listingId_buyerId_key" ON "MarketplaceSubscriptionInstance"("listingId", "buyerId");
CREATE INDEX "MarketplaceSubscriptionInstance_buyerId_idx" ON "MarketplaceSubscriptionInstance"("buyerId");
CREATE UNIQUE INDEX "CreatorPayoutAccount_publicUserId_key" ON "CreatorPayoutAccount"("publicUserId");
CREATE UNIQUE INDEX "MarketplaceReview_listingId_publicUserId_key" ON "MarketplaceReview"("listingId", "publicUserId");
CREATE INDEX "MarketplaceReview_listingId_idx" ON "MarketplaceReview"("listingId");
CREATE UNIQUE INDEX "CreatorFollower_followerId_creatorId_key" ON "CreatorFollower"("followerId", "creatorId");
CREATE INDEX "CreatorFollower_creatorId_idx" ON "CreatorFollower"("creatorId");
CREATE UNIQUE INDEX "ReputationScore_publicUserId_key" ON "ReputationScore"("publicUserId");
CREATE INDEX "ValuationSnapshot_computedAt_idx" ON "ValuationSnapshot"("computedAt");
CREATE INDEX "ValuationFactor_snapshotId_idx" ON "ValuationFactor"("snapshotId");
CREATE INDEX "GrowthSnapshot_rangeEnd_idx" ON "GrowthSnapshot"("rangeEnd");

ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_assessmentAttemptId_fkey" FOREIGN KEY ("assessmentAttemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromptLibraryEntry" ADD CONSTRAINT "PromptLibraryEntry_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerNote" ADD CONSTRAINT "LearnerNote_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerNote" ADD CONSTRAINT "LearnerNote_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MentorshipRelationship" ADD CONSTRAINT "MentorshipRelationship_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MentorshipRelationship" ADD CONSTRAINT "MentorshipRelationship_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerProfile" ADD CONSTRAINT "CareerProfile_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_careerProfileId_fkey" FOREIGN KEY ("careerProfileId") REFERENCES "CareerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerReadinessScore" ADD CONSTRAINT "CareerReadinessScore_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillGapResult" ADD CONSTRAINT "SkillGapResult_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientFlag" ADD CONSTRAINT "ClientFlag_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorFlag" ADD CONSTRAINT "CreatorFlag_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractPayment" ADD CONSTRAINT "ContractPayment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractPayment" ADD CONSTRAINT "ContractPayment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientReview" ADD CONSTRAINT "ClientReview_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientReview" ADD CONSTRAINT "ClientReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientReview" ADD CONSTRAINT "ClientReview_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplacePurchase" ADD CONSTRAINT "MarketplacePurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplacePurchase" ADD CONSTRAINT "MarketplacePurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceSubscriptionInstance" ADD CONSTRAINT "MarketplaceSubscriptionInstance_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceSubscriptionInstance" ADD CONSTRAINT "MarketplaceSubscriptionInstance_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorPayoutAccount" ADD CONSTRAINT "CreatorPayoutAccount_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorFollower" ADD CONSTRAINT "CreatorFollower_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorFollower" ADD CONSTRAINT "CreatorFollower_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReputationScore" ADD CONSTRAINT "ReputationScore_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ValuationFactor" ADD CONSTRAINT "ValuationFactor_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ValuationSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
