-- MES-030 Dual Authentication retrofit
-- Splits legacy "User" into PublicUser (learners) and Admin (staff).
-- Run AFTER reviewing. Prefer: apply schema via prisma migrate, then
-- `npx tsx scripts/migrate-dual-auth.ts` for data backfill if User still exists.
--
-- This migration assumes the previous schema (single User model) is present.
-- It is intentionally defensive (IF EXISTS) so re-runs fail safely where possible.

-- 1) Enums
DO $$ BEGIN
  CREATE TYPE "AdminRoleKey" AS ENUM (
    'SUPER_ADMINISTRATOR',
    'ADMINISTRATOR',
    'EDITOR',
    'CONTENT_MANAGER',
    'ANALYTICS_MANAGER',
    'SUPPORT_MANAGER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) RBAC tables
CREATE TABLE IF NOT EXISTS "AdminRole" (
  "id" TEXT NOT NULL,
  "key" "AdminRoleKey" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminRole_key_key" ON "AdminRole"("key");

CREATE TABLE IF NOT EXISTS "Permission" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_key_key" ON "Permission"("key");

CREATE TABLE IF NOT EXISTS "RolePermission" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

CREATE TABLE IF NOT EXISTS "PublicUser" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "passwordHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublicUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PublicUser_email_key" ON "PublicUser"("email");

CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "passwordHash" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

CREATE TABLE IF NOT EXISTS "PublicSession" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "publicUserId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublicSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PublicSession_sessionToken_key" ON "PublicSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "PublicSession_publicUserId_idx" ON "PublicSession"("publicUserId");

CREATE TABLE IF NOT EXISTS "AdminSession" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminSession_sessionToken_key" ON "AdminSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "AdminSession_adminId_idx" ON "AdminSession"("adminId");

CREATE TABLE IF NOT EXISTS "AuthorizationLog" (
  "id" TEXT NOT NULL,
  "adminId" TEXT,
  "actorEmail" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "summary" TEXT NOT NULL,
  "metadataJson" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthorizationLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuthorizationLog_createdAt_idx" ON "AuthorizationLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuthorizationLog_adminId_idx" ON "AuthorizationLog"("adminId");
CREATE INDEX IF NOT EXISTS "AuthorizationLog_action_idx" ON "AuthorizationLog"("action");

-- 3) Seed default roles (ids are stable for backfill mapping)
INSERT INTO "AdminRole" ("id","key","name","description","createdAt","updatedAt")
VALUES
  ('role_super_admin','SUPER_ADMINISTRATOR','Super Administrator','Full platform access',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('role_admin','ADMINISTRATOR','Administrator','Administrative access',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('role_editor','EDITOR','Editor','Content editing',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('role_content','CONTENT_MANAGER','Content Manager','Content operations',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('role_analytics','ANALYTICS_MANAGER','Analytics Manager','Analytics access',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('role_support','SUPPORT_MANAGER','Support Manager','Support access',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- 4) Default permissions
INSERT INTO "Permission" ("id","key","name","description","createdAt","updatedAt")
VALUES
  ('perm_dashboard','dashboard.access','Access dashboard','Enter /dashboard',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('perm_users','users.manage','Manage admins','Users & Roles',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('perm_content','content.manage','Manage content','Articles/Guides/Tools',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('perm_settings','settings.manage','Manage settings','Platform settings',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('perm_analytics','analytics.view','View analytics','Analytics dashboards',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('perm_billing_ro','billing.view','View billing overview','Read-only revenue',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r.id, p.id FROM "AdminRole" r CROSS JOIN "Permission" p
WHERE r.key = 'SUPER_ADMINISTRATOR'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r.id, p.id FROM "AdminRole" r
JOIN "Permission" p ON p.key IN ('dashboard.access','content.manage','settings.manage','analytics.view','billing.view')
WHERE r.key = 'ADMINISTRATOR'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r.id, p.id FROM "AdminRole" r
JOIN "Permission" p ON p.key IN ('dashboard.access','content.manage')
WHERE r.key = 'EDITOR'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r.id, p.id FROM "AdminRole" r
JOIN "Permission" p ON p.key IN ('dashboard.access','content.manage')
WHERE r.key = 'CONTENT_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r.id, p.id FROM "AdminRole" r
JOIN "Permission" p ON p.key IN ('dashboard.access','analytics.view')
WHERE r.key = 'ANALYTICS_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId","permissionId")
SELECT r.id, p.id FROM "AdminRole" r
JOIN "Permission" p ON p.key IN ('dashboard.access')
WHERE r.key = 'SUPPORT_MANAGER'
ON CONFLICT DO NOTHING;

-- 5) FKs for new auth tables
DO $$ BEGIN
  ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey"
    FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Admin" ADD CONSTRAINT "Admin_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "PublicSession" ADD CONSTRAINT "PublicSession_publicUserId_fkey"
    FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "AuthorizationLog" ADD CONSTRAINT "AuthorizationLog_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTE: Column renames (userId -> publicUserId / adminId) and data split from
-- legacy "User" are performed by scripts/migrate-dual-auth.ts so IDs are preserved
-- and authoring FKs are remapped safely. Do not drop "User" until that script succeeds.
