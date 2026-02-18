-- Convert AssociateStatus enum to integer
-- 0 = inactive, 1 = active, 2 = pending

-- Add temporary integer column
ALTER TABLE "associates" ADD COLUMN "status_int" INTEGER NOT NULL DEFAULT 2;

-- Migrate existing data
UPDATE "associates" SET "status_int" = CASE
  WHEN "status" = 'ACTIVE' THEN 1
  WHEN "status" = 'INACTIVE' THEN 0
  WHEN "status" = 'PENDING' THEN 2
  ELSE 2
END;

-- Drop old column and rename new one
ALTER TABLE "associates" DROP COLUMN "status";
ALTER TABLE "associates" RENAME COLUMN "status_int" TO "status";

-- Drop the enum type
DROP TYPE "AssociateStatus";
