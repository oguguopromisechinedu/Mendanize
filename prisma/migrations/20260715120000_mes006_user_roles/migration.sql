-- AlterEnum: expand UserRole for MES-006
ALTER TYPE "UserRole" ADD VALUE 'LEARNER';
ALTER TYPE "UserRole" ADD VALUE 'EDITOR';
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- Default new users to LEARNER
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'LEARNER'::"UserRole";
