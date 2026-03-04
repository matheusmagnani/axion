-- AlterTable
ALTER TABLE "billings" ADD COLUMN     "discount_type" TEXT,
ADD COLUMN     "discount_value" DECIMAL(10,2),
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "plan_id" INTEGER,
ADD COLUMN     "product_ids" INTEGER[],
ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "type" TEXT;
