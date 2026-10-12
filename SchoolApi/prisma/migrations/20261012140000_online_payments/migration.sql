-- Online payment tracking (JazzCash / Easypaisa)

CREATE TYPE "online_payment_gateway" AS ENUM ('JAZZCASH', 'EASYPAISA');
CREATE TYPE "online_payment_status" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'EXPIRED');

CREATE TABLE "online_payments" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id"        UUID NOT NULL,
    "branch_id"        UUID NOT NULL,
    "invoice_id"       UUID NOT NULL,
    "gateway"          "online_payment_gateway" NOT NULL,
    "amount_minor"     BIGINT NOT NULL,
    "currency"         CHAR(3) NOT NULL DEFAULT 'PKR',
    "status"           "online_payment_status" NOT NULL DEFAULT 'INITIATED',
    "gateway_ref"      TEXT,
    "payment_id"       UUID,
    "redirect_url"     TEXT,
    "webhook_payload"  JSONB,
    "returned_at"      TIMESTAMPTZ(3),
    "created_at"       TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "online_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "online_payments_invoice_id_idx" ON "online_payments"("invoice_id");
CREATE INDEX "online_payments_school_id_status_idx" ON "online_payments"("school_id", "status");
CREATE INDEX "online_payments_branch_id_created_at_idx" ON "online_payments"("branch_id", "created_at");
CREATE INDEX "online_payments_gateway_ref_idx" ON "online_payments"("gateway_ref");

ALTER TABLE "online_payments"
    ADD CONSTRAINT "online_payments_invoice_id_fkey"
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
