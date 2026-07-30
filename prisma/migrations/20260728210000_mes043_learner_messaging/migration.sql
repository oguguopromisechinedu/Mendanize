-- MES-043 Learner Messaging (DMs)

CREATE TYPE "MessageReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "jobApplicationId" TEXT,
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MessageThread_updatedAt_idx" ON "MessageThread"("updatedAt");
CREATE INDEX "MessageThread_jobApplicationId_idx" ON "MessageThread"("jobApplicationId");
CREATE INDEX "MessageThread_contractId_idx" ON "MessageThread"("contractId");

CREATE TABLE "MessageThreadParticipant" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    CONSTRAINT "MessageThreadParticipant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MessageThreadParticipant_threadId_publicUserId_key" ON "MessageThreadParticipant"("threadId", "publicUserId");
CREATE INDEX "MessageThreadParticipant_publicUserId_muted_idx" ON "MessageThreadParticipant"("publicUserId", "muted");

CREATE TABLE "ThreadMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "ThreadMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ThreadMessage_threadId_createdAt_idx" ON "ThreadMessage"("threadId", "createdAt");
CREATE INDEX "ThreadMessage_senderId_createdAt_idx" ON "ThreadMessage"("senderId", "createdAt");

CREATE TABLE "MessageReport" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "reporterPublicUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "MessageReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedByAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageReport_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MessageReport_status_createdAt_idx" ON "MessageReport"("status", "createdAt");
CREATE INDEX "MessageReport_threadId_idx" ON "MessageReport"("threadId");

CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

ALTER TABLE "MessageThreadParticipant" ADD CONSTRAINT "MessageThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageThreadParticipant" ADD CONSTRAINT "MessageThreadParticipant_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThreadMessage" ADD CONSTRAINT "ThreadMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThreadMessage" ADD CONSTRAINT "ThreadMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ThreadMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_reporterPublicUserId_fkey" FOREIGN KEY ("reporterPublicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
