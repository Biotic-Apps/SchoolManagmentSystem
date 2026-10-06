-- CreateEnum
CREATE TYPE "certificate_type" AS ENUM ('SCHOOL_LEAVING', 'TRANSFER', 'CHARACTER', 'ATTENDANCE', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "certificate_status" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'ISSUED');

-- CreateEnum
CREATE TYPE "generated_document_kind" AS ENUM ('REPORT_CARD', 'CHALLAN', 'RECEIPT', 'PAYSLIP', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "generated_document_status" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "async_task_status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "report_format" AS ENUM ('PDF', 'XLSX', 'CSV');

-- CreateEnum
CREATE TYPE "fee_head_kind" AS ENUM ('RECURRING', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "fee_frequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'TERM', 'YEARLY', 'ONCE');

-- CreateEnum
CREATE TYPE "fee_plan_status" AS ENUM ('DRAFT', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "invoice_source" AS ENUM ('GENERATED', 'ADHOC', 'SALE');

-- CreateEnum
CREATE TYPE "ledger_entry_type" AS ENUM ('CHARGE', 'LATE_FEE', 'CONCESSION', 'PAYMENT', 'REVERSAL', 'REFUND', 'CANCELLATION');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'BANK', 'CHEQUE', 'ONLINE', 'WALLET', 'OTHER');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('RECORDED', 'REVERSAL_PENDING', 'REVERSED');

-- CreateEnum
CREATE TYPE "proof_status" AS ENUM ('SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "concession_type" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "finance_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "payroll_run_status" AS ENUM ('DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'CLOSED');

-- CreateEnum
CREATE TYPE "payroll_adjustment_kind" AS ENUM ('BONUS', 'DEDUCTION', 'ADVANCE', 'ARREAR');

-- CreateEnum
CREATE TYPE "payroll_adjustment_status" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "payroll_line_status" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "expense_status" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "item_category" AS ENUM ('FURNITURE', 'COMPUTER', 'STATIONERY', 'UNIFORM', 'BOOK', 'SPORTS', 'OTHER');

-- CreateEnum
CREATE TYPE "stock_movement_type" AS ENUM ('IN', 'ISSUE', 'ADJUST', 'TRANSFER_OUT', 'TRANSFER_IN');

-- CreateEnum
CREATE TYPE "asset_condition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DISPOSED');

-- CreateEnum
CREATE TYPE "purchase_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ORDERED');

-- CreateEnum
CREATE TYPE "purchase_order_status" AS ENUM ('ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'BILLED');

-- CreateEnum
CREATE TYPE "grading_scheme_status" AS ENUM ('DRAFT', 'APPROVED');

-- CreateEnum
CREATE TYPE "exam_type" AS ENUM ('TERM', 'MIDTERM', 'UNIT_TEST', 'FINAL');

-- CreateEnum
CREATE TYPE "exam_status" AS ENUM ('DRAFT', 'SCHEDULED', 'MARKS_OPEN', 'MARKS_CLOSED', 'RESULTS_APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "mark_sheet_status" AS ENUM ('NOT_ENTERED', 'DRAFT', 'SUBMITTED', 'ACCEPTED', 'RETURNED');

-- CreateEnum
CREATE TYPE "progress_category" AS ENUM ('HOMEWORK', 'BEHAVIOUR', 'LEARNING', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "homework_completion" AS ENUM ('DONE', 'PARTIAL', 'NOT_DONE');

-- CreateEnum
CREATE TYPE "promotion_decision_kind" AS ENUM ('PROMOTE', 'REPEAT', 'CONDITIONAL', 'GRADUATE');

-- CreateEnum
CREATE TYPE "promotion_status" AS ENUM ('SUGGESTED', 'CONFIRMED', 'APPLIED');

-- AlterEnum
ALTER TYPE "approval_type" ADD VALUE 'INVOICE_CANCEL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "file_purpose" ADD VALUE 'REPORT_CARD';
ALTER TYPE "file_purpose" ADD VALUE 'CHALLAN';
ALTER TYPE "file_purpose" ADD VALUE 'RECEIPT';
ALTER TYPE "file_purpose" ADD VALUE 'PAYSLIP';
ALTER TYPE "file_purpose" ADD VALUE 'CERTIFICATE';
ALTER TYPE "file_purpose" ADD VALUE 'REPORT';

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "type" "certificate_type" NOT NULL,
    "purpose" TEXT,
    "details" JSONB,
    "status" "certificate_status" NOT NULL DEFAULT 'REQUESTED',
    "serial_no" TEXT,
    "duplicate_of_id" UUID,
    "reissue_reason" TEXT,
    "issued_on" DATE,
    "effective_date" DATE,
    "document_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "reject_reason" TEXT,
    "issued_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "kind" "generated_document_kind" NOT NULL,
    "entity_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "generated_document_status" NOT NULL DEFAULT 'PENDING',
    "file_id" UUID,
    "error" TEXT,
    "owner_user_id" UUID NOT NULL,
    "generated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "async_tasks" (
    "id" UUID NOT NULL,
    "school_id" UUID,
    "branch_id" UUID,
    "kind" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "format" "report_format",
    "status" "async_task_status" NOT NULL DEFAULT 'PENDING',
    "file_id" UUID,
    "result" JSONB,
    "error" TEXT,
    "requested_by_id" UUID NOT NULL,
    "active_role" TEXT,
    "started_at" TIMESTAMPTZ(3),
    "finished_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "async_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_heads" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "fee_head_kind" NOT NULL,
    "refundable" BOOLEAN NOT NULL DEFAULT false,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "status" "record_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fee_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_plans" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "fee_plan_status" NOT NULL DEFAULT 'DRAFT',
    "late_fee_minor" BIGINT,
    "late_fee_after_days" INTEGER,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "approved_snapshot" JSONB,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ(3),
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fee_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_plan_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "fee_head_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "frequency" "fee_frequency" NOT NULL,
    "due_day" INTEGER NOT NULL,

    CONSTRAINT "fee_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "section_id" UUID,
    "class_id" UUID,
    "period" VARCHAR(7),
    "source" "invoice_source" NOT NULL DEFAULT 'GENERATED',
    "status" "invoice_status" NOT NULL DEFAULT 'DRAFT',
    "issue_date" DATE,
    "due_date" DATE NOT NULL,
    "subtotal_minor" BIGINT NOT NULL DEFAULT 0,
    "concession_minor" BIGINT NOT NULL DEFAULT 0,
    "late_fee_minor" BIGINT NOT NULL DEFAULT 0,
    "total_minor" BIGINT NOT NULL DEFAULT 0,
    "paid_minor" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "plan_id" UUID,
    "late_fee_rule" JSONB,
    "cancel_reason" TEXT,
    "cancel_approval_id" UUID,
    "cancelled_at" TIMESTAMPTZ(3),
    "issued_by_id" UUID,
    "created_by_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "fee_head_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "ref_type" TEXT,
    "ref_id" UUID,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_concessions" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "concession_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,

    CONSTRAINT "invoice_concessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "invoice_id" UUID,
    "payment_id" UUID,
    "type" "ledger_entry_type" NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "ref_type" TEXT NOT NULL,
    "ref_id" UUID NOT NULL,
    "reverses_id" UUID,
    "reason" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_proofs" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "paid_on" DATE NOT NULL,
    "method" "payment_method" NOT NULL,
    "reference" TEXT NOT NULL,
    "file_id" UUID NOT NULL,
    "status" "proof_status" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_by_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "note" TEXT,
    "reject_reason" TEXT,
    "payment_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "receipt_no" TEXT NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "unallocated_minor" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "method" "payment_method" NOT NULL,
    "reference" TEXT,
    "received_on" DATE NOT NULL,
    "received_by_id" UUID NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'RECORDED',
    "gateway" TEXT,
    "gateway_ref" TEXT,
    "proof_id" UUID,
    "reversal_reason" TEXT,
    "reversal_approval_id" UUID,
    "reversed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "reversed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concessions" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "fee_head_id" UUID,
    "type" "concession_type" NOT NULL,
    "value" BIGINT NOT NULL,
    "from_period" VARCHAR(7) NOT NULL,
    "to_period" VARCHAR(7),
    "reason" TEXT NOT NULL,
    "estimate_minor" BIGINT NOT NULL,
    "status" "finance_request_status" NOT NULL DEFAULT 'PENDING',
    "approval_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "concessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "method" "payment_method" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "finance_request_status" NOT NULL DEFAULT 'PENDING',
    "approval_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_collections" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totals" JSONB NOT NULL,
    "cash_expected_minor" BIGINT NOT NULL,
    "cash_counted_minor" BIGINT NOT NULL,
    "difference_minor" BIGINT NOT NULL,
    "note" TEXT,
    "closed_by_id" UUID NOT NULL,
    "closed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "effective_from" VARCHAR(7) NOT NULL,
    "basic_minor" BIGINT NOT NULL,
    "allowances" JSONB NOT NULL,
    "deductions" JSONB NOT NULL,
    "reason" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_adjustments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "kind" "payroll_adjustment_kind" NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "payroll_adjustment_status" NOT NULL DEFAULT 'PENDING',
    "run_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payroll_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "status" "payroll_run_status" NOT NULL DEFAULT 'DRAFT',
    "approval_id" UUID,
    "pending_approval_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "calculated_at" TIMESTAMPTZ(3),
    "calculated_by_id" UUID,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ(3),
    "closed_by_id" UUID,
    "closed_at" TIMESTAMPTZ(3),
    "created_by_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_lines" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "designation" TEXT NOT NULL,
    "structure_id" UUID,
    "basic_minor" BIGINT NOT NULL,
    "allowances_minor" BIGINT NOT NULL,
    "deductions_minor" BIGINT NOT NULL,
    "working_days" INTEGER NOT NULL,
    "unpaid_leave_days" DECIMAL(5,1) NOT NULL,
    "leave_deduction_minor" BIGINT NOT NULL,
    "adjustments_minor" BIGINT NOT NULL,
    "net_minor" BIGINT NOT NULL,
    "paid_minor" BIGINT NOT NULL DEFAULT 0,
    "status" "payroll_line_status" NOT NULL DEFAULT 'UNPAID',
    "route" TEXT NOT NULL DEFAULT 'BRANCH',
    "approval_id" UUID,
    "detail" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payroll_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_payments" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "line_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "method" "payment_method" NOT NULL,
    "reference" TEXT,
    "paid_on" DATE NOT NULL,
    "paid_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "ntn" TEXT,
    "status" "record_status" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "record_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "vendor_id" UUID,
    "title" TEXT NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "paid_minor" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "bill_date" DATE NOT NULL,
    "due_date" DATE,
    "bill_file_id" UUID,
    "recurring_monthly" BOOLEAN NOT NULL DEFAULT false,
    "recurring_until" VARCHAR(7),
    "recurring_parent_id" UUID,
    "recurring_period" VARCHAR(7),
    "purchase_order_id" UUID,
    "notes" TEXT,
    "status" "expense_status" NOT NULL DEFAULT 'DRAFT',
    "approval_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_payments" (
    "id" UUID NOT NULL,
    "expense_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "method" "payment_method" NOT NULL,
    "reference" TEXT,
    "paid_on" DATE NOT NULL,
    "paid_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "item_category" NOT NULL,
    "unit" TEXT NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "is_asset" BOOLEAN NOT NULL,
    "saleable" BOOLEAN NOT NULL,
    "sale_price_minor" BIGINT,
    "status" "record_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "type" "stock_movement_type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "issued_to" TEXT,
    "student_id" UUID,
    "reason" TEXT,
    "ref_type" TEXT,
    "ref_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "tag" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "condition" "asset_condition" NOT NULL,
    "assigned_to" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "lines" JSONB NOT NULL,
    "estimated_total_minor" BIGINT NOT NULL,
    "status" "purchase_request_status" NOT NULL DEFAULT 'PENDING',
    "approval_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL,
    "po_no" TEXT NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "status" "purchase_order_status" NOT NULL DEFAULT 'ORDERED',
    "total_minor" BIGINT NOT NULL,
    "expected_on" DATE,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_minor" BIGINT NOT NULL,
    "received_qty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "received_on" DATE NOT NULL,
    "lines" JSONB NOT NULL,
    "received_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_schemes" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "pass_percent" INTEGER NOT NULL,
    "status" "grading_scheme_status" NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ(3),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "grading_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_bands" (
    "id" UUID NOT NULL,
    "scheme_id" UUID NOT NULL,
    "grade" TEXT NOT NULL,
    "min_percent" INTEGER NOT NULL,
    "max_percent" INTEGER NOT NULL,
    "remark" TEXT,
    "grade_point" DECIMAL(4,2),

    CONSTRAINT "grade_bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "term_id" UUID,
    "name" TEXT NOT NULL,
    "type" "exam_type" NOT NULL,
    "grading_scheme_id" UUID NOT NULL,
    "weight_percent" INTEGER,
    "class_ids" UUID[],
    "status" "exam_status" NOT NULL DEFAULT 'DRAFT',
    "approval_id" UUID,
    "computed_at" TIMESTAMPTZ(3),
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "created_by_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_papers" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "max_marks" INTEGER NOT NULL,
    "pass_marks" INTEGER NOT NULL,
    "room_id" UUID,

    CONSTRAINT "exam_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mark_sheets" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "status" "mark_sheet_status" NOT NULL DEFAULT 'NOT_ENTERED',
    "teacher_staff_id" UUID,
    "entered_by_id" UUID,
    "on_behalf_of_staff_id" UUID,
    "submitted_by_id" UUID,
    "submitted_at" TIMESTAMPTZ(3),
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "comment" TEXT,
    "approval_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mark_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marks" (
    "id" UUID NOT NULL,
    "mark_sheet_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "marks" DECIMAL(6,2),
    "absent" BOOLEAN NOT NULL DEFAULT false,
    "remark" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "total_marks" DECIMAL(8,2) NOT NULL,
    "max_total" INTEGER NOT NULL,
    "percent" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "position" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "remarks" TEXT,
    "teacher_remark" TEXT,
    "subjects" JSONB NOT NULL,
    "computed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cards" (
    "id" UUID NOT NULL,
    "result_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "document_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_notes" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "category" "progress_category" NOT NULL,
    "note" TEXT NOT NULL,
    "visible_to_parent" BOOLEAN NOT NULL,
    "author_id" UUID NOT NULL,
    "on_behalf_of_staff_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_statuses" (
    "id" UUID NOT NULL,
    "diary_entry_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "homework_completion" NOT NULL,
    "marked_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "homework_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_decisions" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "from_session_id" UUID NOT NULL,
    "to_session_id" UUID NOT NULL,
    "from_section_id" UUID NOT NULL,
    "from_class_id" UUID NOT NULL,
    "to_class_id" UUID,
    "to_section_id" UUID,
    "suggested" "promotion_decision_kind" NOT NULL,
    "decision" "promotion_decision_kind" NOT NULL,
    "status" "promotion_status" NOT NULL DEFAULT 'SUGGESTED',
    "percent" DECIMAL(5,2),
    "failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "basis" JSONB,
    "reason" TEXT,
    "overridden_by_id" UUID,
    "approval_id" UUID,
    "effective_date" DATE,
    "applied_at" TIMESTAMPTZ(3),
    "new_enrollment_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "promotion_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certificates_branch_id_status_idx" ON "certificates"("branch_id", "status");

-- CreateIndex
CREATE INDEX "certificates_student_id_idx" ON "certificates"("student_id");

-- CreateIndex
CREATE INDEX "certificates_serial_no_idx" ON "certificates"("serial_no");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_serial_no_original" ON "certificates"("serial_no") WHERE (duplicate_of_id IS NULL AND serial_no IS NOT NULL);

-- CreateIndex
CREATE INDEX "generated_documents_kind_entity_id_idx" ON "generated_documents"("kind", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_documents_kind_entity_id_version_key" ON "generated_documents"("kind", "entity_id", "version");

-- CreateIndex
CREATE INDEX "async_tasks_requested_by_id_created_at_idx" ON "async_tasks"("requested_by_id", "created_at");

-- CreateIndex
CREATE INDEX "async_tasks_kind_status_idx" ON "async_tasks"("kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fee_heads_school_id_code_key" ON "fee_heads"("school_id", "code");

-- CreateIndex
CREATE INDEX "fee_plans_branch_id_session_id_idx" ON "fee_plans"("branch_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_plans_session_id_class_id_name_key" ON "fee_plans"("session_id", "class_id", "name");

-- CreateIndex
CREATE INDEX "fee_plan_items_plan_id_idx" ON "fee_plan_items"("plan_id");

-- CreateIndex
CREATE INDEX "fee_plan_items_fee_head_id_idx" ON "fee_plan_items"("fee_head_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_no_key" ON "invoices"("invoice_no");

-- CreateIndex
CREATE INDEX "invoices_branch_id_status_due_date_idx" ON "invoices"("branch_id", "status", "due_date");

-- CreateIndex
CREATE INDEX "invoices_branch_id_period_idx" ON "invoices"("branch_id", "period");

-- CreateIndex
CREATE INDEX "invoices_student_id_due_date_idx" ON "invoices"("student_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_one_generated_per_period" ON "invoices"("student_id", "period") WHERE (source = 'GENERATED'::invoice_source AND status <> 'CANCELLED'::invoice_status);

-- CreateIndex
CREATE INDEX "invoice_lines_invoice_id_idx" ON "invoice_lines"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_lines_fee_head_id_idx" ON "invoice_lines"("fee_head_id");

-- CreateIndex
CREATE INDEX "invoice_lines_ref_type_ref_id_idx" ON "invoice_lines"("ref_type", "ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_concessions_invoice_id_concession_id_key" ON "invoice_concessions"("invoice_id", "concession_id");

-- CreateIndex
CREATE INDEX "ledger_entries_student_id_created_at_idx" ON "ledger_entries"("student_id", "created_at");

-- CreateIndex
CREATE INDEX "ledger_entries_branch_id_created_at_idx" ON "ledger_entries"("branch_id", "created_at");

-- CreateIndex
CREATE INDEX "ledger_entries_invoice_id_idx" ON "ledger_entries"("invoice_id");

-- CreateIndex
CREATE INDEX "ledger_entries_payment_id_idx" ON "ledger_entries"("payment_id");

-- CreateIndex
CREATE INDEX "ledger_entries_ref_type_ref_id_idx" ON "ledger_entries"("ref_type", "ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_proofs_payment_id_key" ON "payment_proofs"("payment_id");

-- CreateIndex
CREATE INDEX "payment_proofs_branch_id_status_idx" ON "payment_proofs"("branch_id", "status");

-- CreateIndex
CREATE INDEX "payment_proofs_invoice_id_idx" ON "payment_proofs"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_no_key" ON "payments"("receipt_no");

-- CreateIndex
CREATE INDEX "payments_branch_id_received_on_idx" ON "payments"("branch_id", "received_on");

-- CreateIndex
CREATE INDEX "payments_student_id_received_on_idx" ON "payments"("student_id", "received_on");

-- CreateIndex
CREATE INDEX "payments_received_by_id_received_on_idx" ON "payments"("received_by_id", "received_on");

-- CreateIndex
CREATE INDEX "payment_allocations_payment_id_idx" ON "payment_allocations"("payment_id");

-- CreateIndex
CREATE INDEX "payment_allocations_invoice_id_idx" ON "payment_allocations"("invoice_id");

-- CreateIndex
CREATE INDEX "concessions_student_id_status_idx" ON "concessions"("student_id", "status");

-- CreateIndex
CREATE INDEX "concessions_branch_id_status_idx" ON "concessions"("branch_id", "status");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "refunds_branch_id_status_idx" ON "refunds"("branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_collections_branch_id_date_key" ON "daily_collections"("branch_id", "date");

-- CreateIndex
CREATE INDEX "salary_structures_staff_id_effective_from_idx" ON "salary_structures"("staff_id", "effective_from");

-- CreateIndex
CREATE INDEX "payroll_adjustments_staff_id_month_idx" ON "payroll_adjustments"("staff_id", "month");

-- CreateIndex
CREATE INDEX "payroll_adjustments_branch_id_month_idx" ON "payroll_adjustments"("branch_id", "month");

-- CreateIndex
CREATE INDEX "payroll_runs_school_id_idx" ON "payroll_runs"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_branch_id_month_key" ON "payroll_runs"("branch_id", "month");

-- CreateIndex
CREATE INDEX "payroll_lines_staff_id_idx" ON "payroll_lines"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_lines_run_id_staff_id_key" ON "payroll_lines"("run_id", "staff_id");

-- CreateIndex
CREATE INDEX "payroll_payments_run_id_idx" ON "payroll_payments"("run_id");

-- CreateIndex
CREATE INDEX "payroll_payments_line_id_idx" ON "payroll_payments"("line_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_school_id_name_key" ON "vendors"("school_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_school_id_code_key" ON "expense_categories"("school_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_purchase_order_id_key" ON "expenses"("purchase_order_id");

-- CreateIndex
CREATE INDEX "expenses_branch_id_status_idx" ON "expenses"("branch_id", "status");

-- CreateIndex
CREATE INDEX "expenses_branch_id_bill_date_idx" ON "expenses"("branch_id", "bill_date");

-- CreateIndex
CREATE INDEX "expenses_category_id_idx" ON "expenses"("category_id");

-- CreateIndex
CREATE INDEX "expenses_vendor_id_idx" ON "expenses"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_one_recurring_copy_per_month" ON "expenses"("recurring_parent_id", "recurring_period") WHERE (recurring_parent_id IS NOT NULL);

-- CreateIndex
CREATE INDEX "expense_payments_expense_id_idx" ON "expense_payments"("expense_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_school_id_sku_key" ON "inventory_items"("school_id", "sku");

-- CreateIndex
CREATE INDEX "stock_movements_branch_id_item_id_idx" ON "stock_movements"("branch_id", "item_id");

-- CreateIndex
CREATE INDEX "stock_movements_student_id_idx" ON "stock_movements"("student_id");

-- CreateIndex
CREATE INDEX "stock_movements_ref_type_ref_id_idx" ON "stock_movements"("ref_type", "ref_id");

-- CreateIndex
CREATE INDEX "assets_branch_id_idx" ON "assets"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_school_id_tag_key" ON "assets"("school_id", "tag");

-- CreateIndex
CREATE INDEX "purchase_requests_branch_id_status_idx" ON "purchase_requests"("branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_no_key" ON "purchase_orders"("po_no");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_request_id_key" ON "purchase_orders"("request_id");

-- CreateIndex
CREATE INDEX "purchase_orders_branch_id_status_idx" ON "purchase_orders"("branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_lines_order_id_item_id_key" ON "purchase_order_lines"("order_id", "item_id");

-- CreateIndex
CREATE INDEX "goods_receipts_order_id_idx" ON "goods_receipts"("order_id");

-- CreateIndex
CREATE INDEX "grading_schemes_school_id_idx" ON "grading_schemes"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "grading_schemes_session_id_name_key" ON "grading_schemes"("session_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "grade_bands_scheme_id_grade_key" ON "grade_bands"("scheme_id", "grade");

-- CreateIndex
CREATE INDEX "exams_branch_id_session_id_status_idx" ON "exams"("branch_id", "session_id", "status");

-- CreateIndex
CREATE INDEX "exams_grading_scheme_id_idx" ON "exams"("grading_scheme_id");

-- CreateIndex
CREATE UNIQUE INDEX "exams_branch_id_session_id_name_key" ON "exams"("branch_id", "session_id", "name");

-- CreateIndex
CREATE INDEX "exam_papers_date_idx" ON "exam_papers"("date");

-- CreateIndex
CREATE UNIQUE INDEX "exam_papers_exam_id_class_id_subject_id_key" ON "exam_papers"("exam_id", "class_id", "subject_id");

-- CreateIndex
CREATE INDEX "mark_sheets_exam_id_status_idx" ON "mark_sheets"("exam_id", "status");

-- CreateIndex
CREATE INDEX "mark_sheets_section_id_subject_id_idx" ON "mark_sheets"("section_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "mark_sheets_paper_id_section_id_key" ON "mark_sheets"("paper_id", "section_id");

-- CreateIndex
CREATE INDEX "marks_student_id_idx" ON "marks"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "marks_mark_sheet_id_student_id_key" ON "marks"("mark_sheet_id", "student_id");

-- CreateIndex
CREATE INDEX "exam_results_student_id_idx" ON "exam_results"("student_id");

-- CreateIndex
CREATE INDEX "exam_results_section_id_idx" ON "exam_results"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_exam_id_student_id_key" ON "exam_results"("exam_id", "student_id");

-- CreateIndex
CREATE INDEX "report_cards_student_id_exam_id_idx" ON "report_cards"("student_id", "exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_result_id_version_key" ON "report_cards"("result_id", "version");

-- CreateIndex
CREATE INDEX "progress_notes_student_id_created_at_idx" ON "progress_notes"("student_id", "created_at");

-- CreateIndex
CREATE INDEX "homework_statuses_student_id_idx" ON "homework_statuses"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "homework_statuses_diary_entry_id_student_id_key" ON "homework_statuses"("diary_entry_id", "student_id");

-- CreateIndex
CREATE INDEX "promotion_decisions_branch_id_from_session_id_status_idx" ON "promotion_decisions"("branch_id", "from_session_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_decisions_student_id_from_session_id_key" ON "promotion_decisions"("student_id", "from_session_id");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_duplicate_of_id_fkey" FOREIGN KEY ("duplicate_of_id") REFERENCES "certificates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_plan_items" ADD CONSTRAINT "fee_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "fee_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_plan_items" ADD CONSTRAINT "fee_plan_items_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "fee_heads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_fee_head_id_fkey" FOREIGN KEY ("fee_head_id") REFERENCES "fee_heads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_concessions" ADD CONSTRAINT "invoice_concessions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_concessions" ADD CONSTRAINT "invoice_concessions_concession_id_fkey" FOREIGN KEY ("concession_id") REFERENCES "concessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "payroll_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "payroll_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_payments" ADD CONSTRAINT "expense_payments_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "purchase_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_bands" ADD CONSTRAINT "grade_bands_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "grading_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_grading_scheme_id_fkey" FOREIGN KEY ("grading_scheme_id") REFERENCES "grading_schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_papers" ADD CONSTRAINT "exam_papers_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_sheets" ADD CONSTRAINT "mark_sheets_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_sheets" ADD CONSTRAINT "mark_sheets_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "exam_papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_mark_sheet_id_fkey" FOREIGN KEY ("mark_sheet_id") REFERENCES "mark_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "exam_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_notes" ADD CONSTRAINT "progress_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Human number of purchase requests (PR-{BRANCH}-{YEAR}-{SEQ}).
ALTER TABLE "purchase_requests" ADD COLUMN "request_no" TEXT NOT NULL;
CREATE UNIQUE INDEX "purchase_requests_request_no_key" ON "purchase_requests"("request_no");

-- ---------------------------------------------------------------------------
-- Phase 4 integrity (databaseManagement.md §3): append-only money and stock,
-- non-negative amounts, sane ranges. Signs live only in ledger_entries.
-- ---------------------------------------------------------------------------
CREATE TRIGGER ledger_entries_append_only_row
  BEFORE UPDATE OR DELETE ON "ledger_entries"
  FOR EACH ROW EXECUTE FUNCTION forbid_append_only_mutation();
CREATE TRIGGER ledger_entries_append_only_truncate
  BEFORE TRUNCATE ON "ledger_entries"
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_append_only_mutation();

CREATE TRIGGER stock_movements_append_only_row
  BEFORE UPDATE OR DELETE ON "stock_movements"
  FOR EACH ROW EXECUTE FUNCTION forbid_append_only_mutation();
CREATE TRIGGER stock_movements_append_only_truncate
  BEFORE TRUNCATE ON "stock_movements"
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_append_only_mutation();

ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_amount_nonzero"
  CHECK ("amount_minor" <> 0);
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_quantity_nonzero"
  CHECK ("quantity" <> 0);

ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_amount_check"
  CHECK ("amount_minor" >= 0);
ALTER TABLE "invoice_concessions" ADD CONSTRAINT "invoice_concessions_amount_check"
  CHECK ("amount_minor" > 0);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_amounts_check"
  CHECK ("subtotal_minor" >= 0 AND "concession_minor" >= 0 AND "late_fee_minor" >= 0
     AND "total_minor" >= 0 AND "paid_minor" >= 0 AND "paid_minor" <= "total_minor"
     AND "total_minor" = "subtotal_minor" - "concession_minor" + "late_fee_minor");
ALTER TABLE "fee_plan_items" ADD CONSTRAINT "fee_plan_items_check"
  CHECK ("amount_minor" >= 0 AND "due_day" BETWEEN 1 AND 31);
ALTER TABLE "fee_plans" ADD CONSTRAINT "fee_plans_late_fee_check"
  CHECK (("late_fee_minor" IS NULL OR "late_fee_minor" >= 0) AND ("late_fee_after_days" IS NULL OR "late_fee_after_days" >= 0));
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_check"
  CHECK ("amount_minor" > 0 AND "unallocated_minor" >= 0 AND "unallocated_minor" <= "amount_minor");
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_amount_check"
  CHECK ("amount_minor" > 0);
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_amount_check"
  CHECK ("amount_minor" > 0);
ALTER TABLE "concessions" ADD CONSTRAINT "concessions_value_check"
  CHECK ("value" > 0 AND ("type" <> 'PERCENT'::concession_type OR "value" <= 100) AND "estimate_minor" >= 0);
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_amount_check"
  CHECK ("amount_minor" > 0);
ALTER TABLE "daily_collections" ADD CONSTRAINT "daily_collections_amount_check"
  CHECK ("cash_expected_minor" >= 0 AND "cash_counted_minor" >= 0);

ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_basic_check"
  CHECK ("basic_minor" >= 0);
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_amount_check"
  CHECK ("amount_minor" > 0);
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_amounts_check"
  CHECK ("basic_minor" >= 0 AND "allowances_minor" >= 0 AND "deductions_minor" >= 0
     AND "leave_deduction_minor" >= 0 AND "net_minor" >= 0 AND "paid_minor" >= 0
     AND "paid_minor" <= "net_minor" AND "unpaid_leave_days" >= 0);
ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_amount_check"
  CHECK ("amount_minor" > 0);

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_amount_check"
  CHECK ("amount_minor" > 0 AND "paid_minor" >= 0 AND "paid_minor" <= "amount_minor");
ALTER TABLE "expense_payments" ADD CONSTRAINT "expense_payments_amount_check"
  CHECK ("amount_minor" > 0);
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_check"
  CHECK ("reorder_level" >= 0 AND ("sale_price_minor" IS NULL OR "sale_price_minor" >= 0));
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_check"
  CHECK ("quantity" > 0 AND "unit_price_minor" >= 0 AND "received_qty" >= 0 AND "received_qty" <= "quantity");
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_amount_check"
  CHECK ("estimated_total_minor" >= 0);

-- Marks: never negative (marks <= max_marks is enforced in the app per paper).
ALTER TABLE "marks" ADD CONSTRAINT "marks_value_check"
  CHECK ("marks" IS NULL OR "marks" >= 0);
ALTER TABLE "marks" ADD CONSTRAINT "marks_absent_has_no_marks"
  CHECK (NOT "absent" OR "marks" IS NULL);
ALTER TABLE "exam_papers" ADD CONSTRAINT "exam_papers_marks_check"
  CHECK ("max_marks" > 0 AND "pass_marks" >= 0 AND "pass_marks" <= "max_marks" AND "end_time" > "start_time");
ALTER TABLE "grading_schemes" ADD CONSTRAINT "grading_schemes_pass_check"
  CHECK ("pass_percent" BETWEEN 0 AND 100);
ALTER TABLE "grade_bands" ADD CONSTRAINT "grade_bands_range_check"
  CHECK ("min_percent" >= 0 AND "max_percent" <= 100 AND "min_percent" <= "max_percent");
ALTER TABLE "exams" ADD CONSTRAINT "exams_weight_check"
  CHECK ("weight_percent" IS NULL OR "weight_percent" BETWEEN 0 AND 100);
