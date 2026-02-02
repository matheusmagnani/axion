-- DropIndex
DROP INDEX IF EXISTS "associates_cpf_key";

-- DropIndex
DROP INDEX IF EXISTS "associates_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "associates_cpf_company_id_key" ON "associates"("cpf", "company_id");
