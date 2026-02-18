-- AlterTable: Convert Role status from enum to Int
ALTER TABLE "roles" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "roles" ALTER COLUMN "status" TYPE INTEGER USING (CASE WHEN "status"::text = 'ACTIVE' THEN 1 ELSE 0 END);
ALTER TABLE "roles" ALTER COLUMN "status" SET DEFAULT 1;

-- DropEnum
DROP TYPE "RoleStatus";

-- AddColumn: deletedAt to all tables
ALTER TABLE "companies" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "associates" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "contracts" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "billings" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "roles" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "deleted_at" TIMESTAMP(3);
