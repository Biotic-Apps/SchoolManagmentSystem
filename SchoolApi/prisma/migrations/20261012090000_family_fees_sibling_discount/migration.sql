-- Family-wise fees: sibling discount rules and family challan support.

-- Sibling discount rules per school (e.g. 2nd child 10 %, 3rd child 20 %).
CREATE TABLE "sibling_discounts" (
    "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"      UUID         NOT NULL,
    "child_index"    INTEGER      NOT NULL,
    "percent_off"    INTEGER      NOT NULL,
    "status"         "record_status" NOT NULL DEFAULT 'ACTIVE'::"record_status",
    "created_by_id"  UUID,
    "updated_by_id"  UUID,
    "created_at"     TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sibling_discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sibling_discounts_school_id_child_index_key"
    ON "sibling_discounts"("school_id", "child_index");

-- Track sibling discount amount on each invoice.
ALTER TABLE "invoices"
    ADD COLUMN "sibling_discount_minor" BIGINT NOT NULL DEFAULT 0;

-- Family challan toggle on school settings.
ALTER TABLE "school_settings"
    ADD COLUMN "family_challan_enabled" BOOLEAN NOT NULL DEFAULT false;
