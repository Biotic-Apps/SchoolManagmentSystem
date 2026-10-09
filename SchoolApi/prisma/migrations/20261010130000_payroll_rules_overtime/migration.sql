-- Payroll for every staff type: school payroll rules (working days, late rule,
-- overtime), approved overtime entries, FINE adjustments, per-structure overtime rate.
-- CreateEnum
CREATE TYPE "payroll_overtime_source" AS ENUM ('ATTENDANCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "payroll_overtime_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "payroll_adjustment_kind" ADD VALUE 'FINE';

-- AlterTable
ALTER TABLE "payroll_lines" ADD COLUMN     "overtime_minor" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "overtime_minutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "salary_structures" ADD COLUMN     "overtime_rate_minor" BIGINT;

-- CreateTable
CREATE TABLE "payroll_settings" (
    "school_id" UUID NOT NULL,
    "working_days_mode" TEXT NOT NULL DEFAULT 'CALENDAR',
    "fixed_working_days" INTEGER NOT NULL DEFAULT 26,
    "per_day_base" TEXT NOT NULL DEFAULT 'GROSS',
    "lates_per_deduction" INTEGER NOT NULL DEFAULT 3,
    "late_deduction_days" DECIMAL(3,1) NOT NULL DEFAULT 1,
    "overtime_enabled" BOOLEAN NOT NULL DEFAULT true,
    "overtime_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    "overtime_grace_minutes" INTEGER NOT NULL DEFAULT 15,
    "daily_hours" DECIMAL(4,2),
    "updated_by_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payroll_settings_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "payroll_overtime" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "source" "payroll_overtime_source" NOT NULL,
    "status" "payroll_overtime_status" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "run_id" UUID,
    "created_by_id" UUID,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "decision_note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payroll_overtime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payroll_overtime_branch_id_month_idx" ON "payroll_overtime"("branch_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_overtime_staff_id_date_source_key" ON "payroll_overtime"("staff_id", "date", "source");

-- AddForeignKey
ALTER TABLE "payroll_overtime" ADD CONSTRAINT "payroll_overtime_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

