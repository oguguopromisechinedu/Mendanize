-- MES-053 Phase A: Work Marketplace lifecycle (continuations + maintenance tasks)

CREATE TYPE "ContractKind" AS ENUM ('PROJECT', 'CONTINUATION');
CREATE TYPE "MaintenanceTaskType" AS ENUM ('FEATURE', 'BUG', 'CONTENT', 'SEO', 'PERFORMANCE', 'OTHER');
CREATE TYPE "MaintenanceTaskStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'SUBMITTED', 'DONE', 'CANCELLED');
CREATE TYPE "MaintenanceTaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

ALTER TABLE "Contract"
  ADD COLUMN "kind" "ContractKind" NOT NULL DEFAULT 'PROJECT',
  ADD COLUMN "parentContractId" TEXT,
  ADD COLUMN "websiteLabel" TEXT;

ALTER TABLE "Contract"
  ADD CONSTRAINT "Contract_parentContractId_fkey"
  FOREIGN KEY ("parentContractId") REFERENCES "Contract"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Contract_parentContractId_idx" ON "Contract"("parentContractId");
CREATE INDEX "Contract_kind_status_idx" ON "Contract"("kind", "status");

CREATE TABLE "MaintenanceTask" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "assigneeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "MaintenanceTaskType" NOT NULL DEFAULT 'OTHER',
  "status" "MaintenanceTaskStatus" NOT NULL DEFAULT 'REQUESTED',
  "priority" "MaintenanceTaskPriority" NOT NULL DEFAULT 'NORMAL',
  "milestoneId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MaintenanceTask_milestoneId_key" ON "MaintenanceTask"("milestoneId");
CREATE INDEX "MaintenanceTask_contractId_status_idx" ON "MaintenanceTask"("contractId", "status");
CREATE INDEX "MaintenanceTask_assigneeId_status_idx" ON "MaintenanceTask"("assigneeId", "status");
CREATE INDEX "MaintenanceTask_createdById_idx" ON "MaintenanceTask"("createdById");

ALTER TABLE "MaintenanceTask"
  ADD CONSTRAINT "MaintenanceTask_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "Contract"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceTask"
  ADD CONSTRAINT "MaintenanceTask_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "PublicUser"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceTask"
  ADD CONSTRAINT "MaintenanceTask_assigneeId_fkey"
  FOREIGN KEY ("assigneeId") REFERENCES "PublicUser"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceTask"
  ADD CONSTRAINT "MaintenanceTask_milestoneId_fkey"
  FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
