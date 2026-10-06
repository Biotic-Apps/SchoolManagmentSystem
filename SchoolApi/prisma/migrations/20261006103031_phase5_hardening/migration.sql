-- CreateEnum
CREATE TYPE "backup_run_status" AS ENUM ('RUNNING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "backup_verify_status" AS ENUM ('NOT_RUN', 'RUNNING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "backup_trigger" AS ENUM ('MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "import_kind" AS ENUM ('STUDENTS', 'GUARDIANS', 'STAFF', 'OPENING_BALANCES', 'FEE_PLANS');

-- CreateEnum
CREATE TYPE "import_status" AS ENUM ('VALIDATING', 'READY', 'INVALID', 'COMMITTING', 'COMMITTED', 'REVERTED', 'FAILED');

-- AlterEnum
ALTER TYPE "file_purpose" ADD VALUE 'IMPORT';

-- AlterEnum
ALTER TYPE "invoice_source" ADD VALUE 'OPENING';

-- AlterTable
ALTER TABLE "job_runs" ADD COLUMN     "data" JSONB,
ADD COLUMN     "retried_at" TIMESTAMPTZ(3),
ADD COLUMN     "retried_by_id" UUID;

-- AlterTable
ALTER TABLE "payroll_adjustments" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMPTZ(3),
ADD COLUMN     "cancelled_by_id" UUID;

-- CreateTable
CREATE TABLE "school_settings" (
    "school_id" UUID NOT NULL,
    "display_name" TEXT,
    "app_name" TEXT NOT NULL DEFAULT 'eSchool',
    "primary_color" VARCHAR(7) NOT NULL DEFAULT '#7A2944',
    "accent_soft_color" VARCHAR(7) NOT NULL DEFAULT '#F6EAF0',
    "receipt_footer" TEXT,
    "report_card_footer" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "locale" TEXT NOT NULL DEFAULT 'en-PK',
    "notifications" JSONB NOT NULL DEFAULT '{}',
    "policies" JSONB NOT NULL DEFAULT '{}',
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "user_two_factor" (
    "user_id" UUID NOT NULL,
    "secret_enc" TEXT NOT NULL,
    "enabled_at" TIMESTAMPTZ(3),
    "last_used_step" BIGINT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_two_factor_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "two_factor_recovery_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_recovery_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_challenges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform" "client_platform" NOT NULL,
    "device_name" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_runs" (
    "id" UUID NOT NULL,
    "trigger" "backup_trigger" NOT NULL,
    "format" TEXT NOT NULL,
    "status" "backup_run_status" NOT NULL DEFAULT 'RUNNING',
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(3),
    "size_bytes" BIGINT,
    "checksum_sha256" CHAR(64),
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "storage_key" TEXT,
    "source_stats" JSONB,
    "error" TEXT,
    "requested_by_id" UUID,
    "verify_status" "backup_verify_status" NOT NULL DEFAULT 'NOT_RUN',
    "verify_started_at" TIMESTAMPTZ(3),
    "restore_verified_at" TIMESTAMPTZ(3),
    "verify_checks" JSONB,
    "verify_error" TEXT,
    "pruned_at" TIMESTAMPTZ(3),

    CONSTRAINT "backup_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID,
    "kind" "import_kind" NOT NULL,
    "status" "import_status" NOT NULL DEFAULT 'VALIDATING',
    "file_id" UUID,
    "file_name" TEXT NOT NULL,
    "totals" JSONB NOT NULL DEFAULT '{}',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "preview" JSONB NOT NULL DEFAULT '[]',
    "rows" JSONB,
    "created" JSONB,
    "reconciliation" JSONB,
    "skip_invalid" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "created_by_id" UUID NOT NULL,
    "committed_by_id" UUID,
    "committed_at" TIMESTAMPTZ(3),
    "reverted_by_id" UUID,
    "reverted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_recovery_codes_code_hash_key" ON "two_factor_recovery_codes"("code_hash");

-- CreateIndex
CREATE INDEX "two_factor_recovery_codes_user_id_idx" ON "two_factor_recovery_codes"("user_id");

-- CreateIndex
CREATE INDEX "two_factor_challenges_user_id_idx" ON "two_factor_challenges"("user_id");

-- CreateIndex
CREATE INDEX "two_factor_challenges_expires_at_idx" ON "two_factor_challenges"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "backup_runs_storage_key_key" ON "backup_runs"("storage_key");

-- CreateIndex
CREATE INDEX "backup_runs_status_started_at_idx" ON "backup_runs"("status", "started_at");

-- CreateIndex
CREATE INDEX "import_batches_branch_id_created_at_idx" ON "import_batches"("branch_id", "created_at");

-- CreateIndex
CREATE INDEX "import_batches_school_id_created_at_idx" ON "import_batches"("school_id", "created_at");

-- AddForeignKey
ALTER TABLE "school_settings" ADD CONSTRAINT "school_settings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_two_factor" ADD CONSTRAINT "user_two_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_recovery_codes" ADD CONSTRAINT "two_factor_recovery_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_challenges" ADD CONSTRAINT "two_factor_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- audit_logs: monthly range partitions (databaseManagement.md §6, carry-over).
-- The existing table is copied into a partitioned table of the same shape and
-- then dropped. Partitions are named audit_logs_YYYY_MM (UTC month bounds);
-- audit_logs_default catches rows outside prepared months. The
-- maintenance.auditPartitions job keeps the next months prepared.
-- ---------------------------------------------------------------------------
ALTER TABLE "audit_logs" RENAME TO "audit_logs_unpartitioned";
ALTER TABLE "audit_logs_unpartitioned" RENAME CONSTRAINT "audit_logs_pkey" TO "audit_logs_unpartitioned_pkey";
ALTER INDEX "audit_logs_entity_type_entity_id_idx" RENAME TO "audit_logs_unpartitioned_entity_idx";
ALTER INDEX "audit_logs_actor_id_at_idx" RENAME TO "audit_logs_unpartitioned_actor_idx";
ALTER INDEX "audit_logs_branch_id_at_idx" RENAME TO "audit_logs_unpartitioned_branch_idx";

CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "on_behalf_of_staff_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "school_id" UUID,
    "branch_id" UUID,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id","at")
) PARTITION BY RANGE ("at");

CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_actor_id_at_idx" ON "audit_logs"("actor_id", "at");
CREATE INDEX "audit_logs_branch_id_at_idx" ON "audit_logs"("branch_id", "at");

CREATE TABLE "audit_logs_default" PARTITION OF "audit_logs" DEFAULT;

-- Row triggers on the parent are cloned to every partition; TRUNCATE triggers are per table.
CREATE TRIGGER audit_logs_append_only_row
  BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION forbid_append_only_mutation();
CREATE TRIGGER audit_logs_append_only_truncate
  BEFORE TRUNCATE ON "audit_logs"
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_append_only_mutation();
CREATE TRIGGER audit_logs_append_only_truncate
  BEFORE TRUNCATE ON "audit_logs_default"
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_append_only_mutation();

-- Creates the partition for the UTC month containing p_month (idempotent).
CREATE OR REPLACE FUNCTION audit_logs_ensure_partition(p_month date) RETURNS text AS $$
DECLARE
  v_first date := make_date(extract(year FROM p_month)::int, extract(month FROM p_month)::int, 1);
  v_from timestamptz := (v_first::timestamp AT TIME ZONE 'UTC');
  v_to timestamptz := ((v_first + interval '1 month')::timestamp AT TIME ZONE 'UTC');
  v_name text := 'audit_logs_' || to_char(v_first, 'YYYY_MM');
BEGIN
  IF to_regclass('public.' || quote_ident(v_name)) IS NOT NULL THEN
    RETURN v_name;
  END IF;
  IF EXISTS (SELECT 1 FROM "audit_logs_default" WHERE "at" >= v_from AND "at" < v_to) THEN
    RAISE EXCEPTION 'audit_logs_default already holds rows for %; partition not created', v_name;
  END IF;
  EXECUTE format('CREATE TABLE public.%I PARTITION OF public."audit_logs" FOR VALUES FROM (%L) TO (%L)', v_name, v_from, v_to);
  EXECUTE format('CREATE TRIGGER audit_logs_append_only_truncate BEFORE TRUNCATE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION forbid_append_only_mutation()', v_name);
  RETURN v_name;
END;
$$ LANGUAGE plpgsql;

-- Partitions for every month that has data, up to two months ahead.
DO $$
DECLARE
  v_month date;
  v_last date := ((now() AT TIME ZONE 'UTC')::date + interval '2 months')::date;
BEGIN
  SELECT COALESCE((min("at") AT TIME ZONE 'UTC')::date, (now() AT TIME ZONE 'UTC')::date)
    INTO v_month FROM "audit_logs_unpartitioned";
  v_month := make_date(extract(year FROM v_month)::int, extract(month FROM v_month)::int, 1);
  WHILE v_month <= v_last LOOP
    PERFORM audit_logs_ensure_partition(v_month);
    v_month := (v_month + interval '1 month')::date;
  END LOOP;
END;
$$;

INSERT INTO "audit_logs" ("id", "actor_id", "on_behalf_of_staff_id", "action", "entity_type", "entity_id",
  "school_id", "branch_id", "before", "after", "ip", "user_agent", "at")
SELECT "id", "actor_id", "on_behalf_of_staff_id", "action", "entity_type", "entity_id",
  "school_id", "branch_id", "before", "after", "ip", "user_agent", "at"
FROM "audit_logs_unpartitioned";

-- Safety net: refuse to drop the old table unless every row arrived.
DO $$
BEGIN
  IF (SELECT count(*) FROM "audit_logs") <> (SELECT count(*) FROM "audit_logs_unpartitioned") THEN
    RAISE EXCEPTION 'audit_logs copy is incomplete';
  END IF;
END;
$$;

DROP TABLE "audit_logs_unpartitioned";

-- ---------------------------------------------------------------------------
-- Integrity for Phase 5 tables.
-- ---------------------------------------------------------------------------
ALTER TABLE "school_settings" ADD CONSTRAINT "school_settings_colors_hex"
  CHECK ("primary_color" ~ '^#[0-9A-Fa-f]{6}$' AND "accent_soft_color" ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE "backup_runs" ADD CONSTRAINT "backup_runs_size_check"
  CHECK ("size_bytes" IS NULL OR "size_bytes" >= 0);
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_cancel_reason_check"
  CHECK ("status" <> 'CANCELLED' OR ("cancel_reason" IS NOT NULL AND "cancelled_at" IS NOT NULL));
