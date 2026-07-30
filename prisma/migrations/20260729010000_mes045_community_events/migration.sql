-- MES-045 Community Events & Learning Calendar

CREATE TYPE "CommunityEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');
CREATE TYPE "CommunityEventLocationType" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

CREATE TABLE "CommunityEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locationType" "CommunityEventLocationType" NOT NULL DEFAULT 'ONLINE',
    "locationLabel" TEXT,
    "joinUrl" TEXT,
    "capacity" INTEGER,
    "status" "CommunityEventStatus" NOT NULL DEFAULT 'DRAFT',
    "challengeId" TEXT,
    "createdByAdminId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommunityEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CommunityEvent_slug_key" ON "CommunityEvent"("slug");
CREATE INDEX "CommunityEvent_status_startsAt_idx" ON "CommunityEvent"("status", "startsAt");
CREATE INDEX "CommunityEvent_challengeId_idx" ON "CommunityEvent"("challengeId");

CREATE TABLE "EventRsvp" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "publicUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remindedAt" TIMESTAMP(3),
    CONSTRAINT "EventRsvp_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EventRsvp_eventId_publicUserId_key" ON "EventRsvp"("eventId", "publicUserId");
CREATE INDEX "EventRsvp_publicUserId_createdAt_idx" ON "EventRsvp"("publicUserId", "createdAt");
CREATE INDEX "EventRsvp_eventId_remindedAt_idx" ON "EventRsvp"("eventId", "remindedAt");

ALTER TABLE "CommunityEvent" ADD CONSTRAINT "CommunityEvent_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityEvent" ADD CONSTRAINT "CommunityEvent_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CommunityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_publicUserId_fkey" FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
