-- CreateEnum
CREATE TYPE "homework_status" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "submission_status" AS ENUM ('SUBMITTED', 'LATE', 'GRADED', 'RETURNED');

-- CreateTable
CREATE TABLE "homework" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "max_marks" INTEGER,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "assigned_by_id" UUID NOT NULL,
    "status" "homework_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "homework_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT,
    "file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "marks" INTEGER,
    "grade" TEXT,
    "feedback" TEXT,
    "graded_by_id" UUID,
    "graded_at" TIMESTAMPTZ(3),
    "status" "submission_status" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "homework_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homework_section_id_due_date_idx" ON "homework"("section_id", "due_date");

-- CreateIndex
CREATE INDEX "homework_branch_id_due_date_idx" ON "homework"("branch_id", "due_date");

-- CreateIndex
CREATE INDEX "homework_school_id_status_idx" ON "homework"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "homework_submissions_homework_id_student_id_key" ON "homework_submissions"("homework_id", "student_id");

-- CreateIndex
CREATE INDEX "homework_submissions_student_id_idx" ON "homework_submissions"("student_id");

-- AddForeignKey
ALTER TABLE "homework" ADD CONSTRAINT "homework_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework" ADD CONSTRAINT "homework_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework" ADD CONSTRAINT "homework_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_graded_by_id_fkey" FOREIGN KEY ("graded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default homework permissions into existing roles
INSERT INTO "permissions" ("id", "role_id", "key", "created_at", "updated_at")
SELECT gen_random_uuid(), r."id", p."key", NOW(), NOW()
FROM "roles" r
CROSS JOIN (
  VALUES ('homework.view'), ('homework.add'), ('homework.edit'), ('homework.delete'), ('homework.submit')
) AS p("key")
WHERE r."key" IN ('SUPER_ADMIN', 'PRINCIPAL')
ON CONFLICT DO NOTHING;

-- Teachers get view, add, edit (not delete)
INSERT INTO "permissions" ("id", "role_id", "key", "created_at", "updated_at")
SELECT gen_random_uuid(), r."id", p."key", NOW(), NOW()
FROM "roles" r
CROSS JOIN (
  VALUES ('homework.view'), ('homework.add'), ('homework.edit')
) AS p("key")
WHERE r."key" IN ('TEACHER', 'HEAD_TEACHER', 'COORDINATOR')
ON CONFLICT DO NOTHING;

-- Parents get view and submit
INSERT INTO "permissions" ("id", "role_id", "key", "created_at", "updated_at")
SELECT gen_random_uuid(), r."id", p."key", NOW(), NOW()
FROM "roles" r
CROSS JOIN (
  VALUES ('homework.view'), ('homework.submit')
) AS p("key")
WHERE r."key" = 'PARENT'
ON CONFLICT DO NOTHING;
