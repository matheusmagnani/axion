-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "status" "RoleStatus" NOT NULL DEFAULT 'ACTIVE';
