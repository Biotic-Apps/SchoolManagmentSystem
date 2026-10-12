-- HR letters: templates and generated letters for staff.

-- Enum: hr_letter_type
CREATE TYPE "hr_letter_type" AS ENUM ('EXPERIENCE', 'SALARY_CERTIFICATE', 'RELIEVING', 'CUSTOM');

-- Enum: hr_letter_template_status
CREATE TYPE "hr_letter_template_status" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "hr_letter_templates" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"     UUID         NOT NULL,
    "type"          "hr_letter_type" NOT NULL,
    "title"         TEXT         NOT NULL,
    "body_template" TEXT         NOT NULL,
    "status"        "hr_letter_template_status" NOT NULL DEFAULT 'ACTIVE'::"hr_letter_template_status",
    "created_by_id" UUID         NOT NULL,
    "created_at"    TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "hr_letter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hr_letter_templates_school_id_type_status_idx"
    ON "hr_letter_templates"("school_id", "type", "status");

-- AddForeignKey
ALTER TABLE "hr_letter_templates"
    ADD CONSTRAINT "hr_letter_templates_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "hr_letters" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"     UUID         NOT NULL,
    "staff_id"      UUID         NOT NULL,
    "template_id"   UUID         NOT NULL,
    "type"          "hr_letter_type" NOT NULL,
    "subject"       TEXT         NOT NULL,
    "body"          TEXT         NOT NULL,
    "file_id"       UUID,
    "issued_at"     TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_by_id"  UUID         NOT NULL,
    "created_at"    TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "hr_letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hr_letters_staff_id_type_idx" ON "hr_letters"("staff_id", "type");
CREATE INDEX "hr_letters_school_id_idx" ON "hr_letters"("school_id");
CREATE INDEX "hr_letters_file_id_idx" ON "hr_letters"("file_id");

-- AddForeignKey
ALTER TABLE "hr_letters"
    ADD CONSTRAINT "hr_letters_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hr_letters"
    ADD CONSTRAINT "hr_letters_staff_id_fkey"
    FOREIGN KEY ("staff_id") REFERENCES "staff"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hr_letters"
    ADD CONSTRAINT "hr_letters_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "hr_letter_templates"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hr_letters"
    ADD CONSTRAINT "hr_letters_file_id_fkey"
    FOREIGN KEY ("file_id") REFERENCES "files"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
