-- MES-044 Coding Workspace Execution Engine

CREATE TYPE "CodeExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMEOUT', 'KILLED', 'RATE_LIMITED', 'DISABLED');

CREATE TABLE "CodeWorkspace" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My workspace',
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "presetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CodeWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CodeWorkspace_publicUserId_updatedAt_idx" ON "CodeWorkspace"("publicUserId", "updatedAt");

CREATE TABLE "CodeWorkspaceFile" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeWorkspaceFile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CodeWorkspaceFile_workspaceId_path_key" ON "CodeWorkspaceFile"("workspaceId", "path");
CREATE INDEX "CodeWorkspaceFile_workspaceId_idx" ON "CodeWorkspaceFile"("workspaceId");

CREATE TABLE "CodeExecutionRun" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "entryPath" TEXT NOT NULL DEFAULT 'main.js',
    "sourceSnapshot" TEXT NOT NULL,
    "status" "CodeExecutionStatus" NOT NULL DEFAULT 'QUEUED',
    "stdout" TEXT,
    "stderr" TEXT,
    "exitCode" INTEGER,
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    CONSTRAINT "CodeExecutionRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CodeExecutionRun_publicUserId_createdAt_idx" ON "CodeExecutionRun"("publicUserId", "createdAt");
CREATE INDEX "CodeExecutionRun_status_createdAt_idx" ON "CodeExecutionRun"("status", "createdAt");
CREATE INDEX "CodeExecutionRun_workspaceId_idx" ON "CodeExecutionRun"("workspaceId");

CREATE TABLE "CodeExecutionSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "timeoutMs" INTEGER NOT NULL DEFAULT 3000,
    "memoryLimitBytes" INTEGER NOT NULL DEFAULT 16777216,
    "maxStdoutBytes" INTEGER NOT NULL DEFAULT 65536,
    "maxStderrBytes" INTEGER NOT NULL DEFAULT 16384,
    "freeDailyLimit" INTEGER NOT NULL DEFAULT 20,
    "paidDailyLimit" INTEGER NOT NULL DEFAULT 200,
    "maxSourceBytes" INTEGER NOT NULL DEFAULT 100000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeExecutionSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CodeExecutionSetting_key_key" ON "CodeExecutionSetting"("key");

ALTER TABLE "CodeWorkspace" ADD CONSTRAINT "CodeWorkspace_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeWorkspaceFile" ADD CONSTRAINT "CodeWorkspaceFile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CodeWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeExecutionRun" ADD CONSTRAINT "CodeExecutionRun_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeExecutionRun" ADD CONSTRAINT "CodeExecutionRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CodeWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
