-- CreateTable
CREATE TABLE "staff_id_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "id_card_status" NOT NULL DEFAULT 'PENDING',
    "file_id" UUID,
    "error" TEXT,
    "requested_by_id" UUID NOT NULL,
    "generated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_id_cards_staff_id_version_key" ON "staff_id_cards"("staff_id", "version");

-- CreateIndex
CREATE INDEX "staff_id_cards_school_id_idx" ON "staff_id_cards"("school_id");

-- CreateIndex
CREATE INDEX "staff_id_cards_file_id_idx" ON "staff_id_cards"("file_id");

-- AddForeignKey
ALTER TABLE "staff_id_cards" ADD CONSTRAINT "staff_id_cards_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_id_cards" ADD CONSTRAINT "staff_id_cards_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_id_cards" ADD CONSTRAINT "staff_id_cards_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
