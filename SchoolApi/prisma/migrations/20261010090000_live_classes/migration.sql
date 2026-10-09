-- Live classes (Jitsi): scheduled/instant online classes per section, joined by
-- teachers and by parents for their children; attendance per visit.
-- CreateEnum
CREATE TYPE "live_class_status" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "live_classes" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "subject_id" UUID,
    "host_user_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "scheduled_start" TIMESTAMPTZ(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "status" "live_class_status" NOT NULL DEFAULT 'SCHEDULED',
    "room_name" VARCHAR(64) NOT NULL,
    "started_at" TIMESTAMPTZ(3),
    "ended_at" TIMESTAMPTZ(3),
    "cancel_reason" VARCHAR(300),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "live_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_sections" (
    "live_class_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,

    CONSTRAINT "live_class_sections_pkey" PRIMARY KEY ("live_class_id","section_id")
);

-- CreateTable
CREATE TABLE "live_class_attendance" (
    "id" UUID NOT NULL,
    "live_class_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "student_id" UUID,
    "joined_at" TIMESTAMPTZ(3) NOT NULL,
    "current_join_at" TIMESTAMPTZ(3),
    "left_at" TIMESTAMPTZ(3),
    "total_seconds" INTEGER NOT NULL DEFAULT 0,
    "join_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "live_class_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_classes_room_name_key" ON "live_classes"("room_name");

-- CreateIndex
CREATE INDEX "live_classes_branch_id_scheduled_start_idx" ON "live_classes"("branch_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "live_classes_host_user_id_scheduled_start_idx" ON "live_classes"("host_user_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "live_classes_status_scheduled_start_idx" ON "live_classes"("status", "scheduled_start");

-- CreateIndex
CREATE INDEX "live_class_sections_section_id_idx" ON "live_class_sections"("section_id");

-- CreateIndex
CREATE INDEX "live_class_attendance_student_id_idx" ON "live_class_attendance"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_class_attendance_one_child" ON "live_class_attendance"("live_class_id", "user_id", "student_id") WHERE (student_id IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "live_class_attendance_one_staff" ON "live_class_attendance"("live_class_id", "user_id") WHERE (student_id IS NULL);

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_sections" ADD CONSTRAINT "live_class_sections_live_class_id_fkey" FOREIGN KEY ("live_class_id") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_sections" ADD CONSTRAINT "live_class_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_attendance" ADD CONSTRAINT "live_class_attendance_live_class_id_fkey" FOREIGN KEY ("live_class_id") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_attendance" ADD CONSTRAINT "live_class_attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_attendance" ADD CONSTRAINT "live_class_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Permissions (security.md §2.1): view/join for parents and staff; manage for teaching staff and leaders.
INSERT INTO "permissions" ("key", "module", "action", "description", "created_at") VALUES
  ('live_classes.view', 'live_classes', 'view', 'View and join live classes', now()),
  ('live_classes.manage', 'live_classes', 'manage', 'Schedule, start and end live classes', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key", "created_at")
SELECT r."id", k.key, now()
FROM "roles" r
CROSS JOIN (VALUES ('live_classes.view'), ('live_classes.manage')) AS k(key)
WHERE r."school_id" IS NULL
  AND r."key" IN ('SUPER_ADMIN', 'PRINCIPAL', 'COORDINATOR', 'HEAD_TEACHER', 'TEACHER')
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key", "created_at")
SELECT r."id", 'live_classes.view', now()
FROM "roles" r
WHERE r."school_id" IS NULL AND r."key" = 'PARENT'
ON CONFLICT DO NOTHING;
