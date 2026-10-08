-- Parent one-time sign-in codes move from SMS (phone) to email.

-- Codes issued for a phone can never be verified by email: retire them.
UPDATE "login_otps" SET "used_at" = CURRENT_TIMESTAMP WHERE "used_at" IS NULL;

-- DropIndex
DROP INDEX "login_otps_phone_created_at_idx";

-- AlterTable (rename keeps existing rows valid; no NOT NULL column is added)
ALTER TABLE "login_otps" RENAME COLUMN "phone" TO "email";

-- CreateIndex
CREATE INDEX "login_otps_email_created_at_idx" ON "login_otps"("email", "created_at");
