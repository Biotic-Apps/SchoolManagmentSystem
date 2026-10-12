-- CreateEnum
CREATE TYPE "qr_scan_result" AS ENUM ('MARKED', 'ALREADY_MARKED', 'NOT_FOUND', 'OUTSIDE_HOURS');

-- CreateEnum
CREATE TYPE "qr_resolved_type" AS ENUM ('STUDENT', 'STAFF');

-- CreateTable
CREATE TABLE "qr_scan_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "scanned_by_id" UUID NOT NULL,
    "public_id" UUID NOT NULL,
    "resolved_type" "qr_resolved_type",
    "resolved_id" UUID,
    "result" "qr_scan_result" NOT NULL,
    "scanned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "qr_scan_logs_school_id_scanned_at_idx" ON "qr_scan_logs"("school_id", "scanned_at");

-- CreateIndex
CREATE INDEX "qr_scan_logs_public_id_idx" ON "qr_scan_logs"("public_id");

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scanned_by_id_fkey" FOREIGN KEY ("scanned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
