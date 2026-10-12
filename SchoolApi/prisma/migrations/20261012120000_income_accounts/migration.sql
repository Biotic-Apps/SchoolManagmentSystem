-- Simple accounts: income categories and income entries.

-- CreateTable
CREATE TABLE "income_categories" (
    "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"  UUID         NOT NULL,
    "code"       TEXT         NOT NULL,
    "name"       TEXT         NOT NULL,
    "status"     "record_status" NOT NULL DEFAULT 'ACTIVE'::"record_status",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "income_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "income_categories_school_id_code_key"
    ON "income_categories"("school_id", "code");

-- CreateTable
CREATE TABLE "incomes" (
    "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"       UUID         NOT NULL,
    "branch_id"       UUID         NOT NULL,
    "category_id"     UUID         NOT NULL,
    "title"           TEXT         NOT NULL,
    "description"     TEXT,
    "amount_minor"    BIGINT       NOT NULL,
    "currency"        CHAR(3)      NOT NULL DEFAULT 'PKR',
    "received_on"     DATE         NOT NULL,
    "receipt_file_id" UUID,
    "notes"           TEXT,
    "created_by_id"   UUID         NOT NULL,
    "created_at"      TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incomes_branch_id_received_on_idx"
    ON "incomes"("branch_id", "received_on");

CREATE INDEX "incomes_category_id_idx"
    ON "incomes"("category_id");

-- AddForeignKey
ALTER TABLE "incomes"
    ADD CONSTRAINT "incomes_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "income_categories"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
