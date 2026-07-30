-- MES-049 Recommendations ML Upgrade

-- CreateEnum
CREATE TYPE "RecommendationModelStatus" AS ENUM ('SHADOW', 'CANARY', 'DEFAULT', 'DISABLED');

-- CreateTable
CREATE TABLE "RecommendationModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RecommendationModelStatus" NOT NULL DEFAULT 'SHADOW',
    "endpoint" TEXT,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "configJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "managedByAdminId" TEXT,

    CONSTRAINT "RecommendationModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationClick" (
    "id" TEXT NOT NULL,
    "publicUserId" TEXT,
    "sessionId" TEXT,
    "contextType" TEXT NOT NULL,
    "contextId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "position" INTEGER,
    "modelId" TEXT,
    "scoredByRules" BOOLEAN NOT NULL DEFAULT true,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationModel_name_key" ON "RecommendationModel"("name");
CREATE INDEX "RecommendationModel_status_idx" ON "RecommendationModel"("status");

CREATE INDEX "RecommendationClick_clickedAt_idx" ON "RecommendationClick"("clickedAt");
CREATE INDEX "RecommendationClick_modelId_clickedAt_idx" ON "RecommendationClick"("modelId", "clickedAt");
CREATE INDEX "RecommendationClick_publicUserId_clickedAt_idx" ON "RecommendationClick"("publicUserId", "clickedAt");

-- AddForeignKey
ALTER TABLE "RecommendationModel" ADD CONSTRAINT "RecommendationModel_managedByAdminId_fkey" FOREIGN KEY ("managedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecommendationClick" ADD CONSTRAINT "RecommendationClick_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecommendationClick" ADD CONSTRAINT "RecommendationClick_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "RecommendationModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
