-- CreateEnum
CREATE TYPE "timetable_status" AS ENUM ('DRAFT', 'PUBLISHED', 'DRAFT_REVISION');

-- CreateEnum
CREATE TYPE "book_list_status" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "syllabus_plan_status" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "topic_status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "enquiry_status" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('SUBMITTED', 'DOCUMENTS_PENDING', 'TEST_SCHEDULED', 'TEST_COMPLETED', 'OFFERED', 'WAITLISTED', 'REJECTED', 'CONFIRMED', 'ENROLLED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "document_owner_type" AS ENUM ('STUDENT', 'GUARDIAN', 'STAFF', 'APPLICATION');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('BIRTH_CERTIFICATE', 'B_FORM', 'CNIC', 'PHOTO', 'PREVIOUS_RESULT', 'LEAVING_CERTIFICATE', 'MEDICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "student_status" AS ENUM ('ACTIVE', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('ACTIVE', 'WITHDRAWN', 'TRANSFERRED_OUT', 'PROMOTED', 'REPEATED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "guardian_relation" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "guardian_link_status" AS ENUM ('REQUESTED', 'VERIFIED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "child_link_request_status" AS ENUM ('OTP_PENDING', 'REQUESTED', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "transfer_status" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "id_card_status" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "staff_status" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "staff_assignment_kind" AS ENUM ('CLASS_TEACHER', 'SUBJECT_TEACHER', 'HELPER', 'COORDINATOR', 'HEAD_TEACHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "file_purpose" ADD VALUE 'STUDENT_PHOTO';
ALTER TYPE "file_purpose" ADD VALUE 'STAFF_PHOTO';
ALTER TYPE "file_purpose" ADD VALUE 'ID_CARD';

-- CreateTable
CREATE TABLE "branch_periods" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "period_index" INTEGER NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "is_break" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "branch_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "status" "timetable_status" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" UUID NOT NULL,
    "timetable_id" UUID NOT NULL,
    "published" BOOLEAN NOT NULL,
    "day" INTEGER NOT NULL,
    "period_index" INTEGER NOT NULL,
    "subject_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "room_id" UUID,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_overrides" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "period_index" INTEGER NOT NULL,
    "original_staff_id" UUID,
    "substitute_staff_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "cancelled_at" TIMESTAMPTZ(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "timetable_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_lists" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "book_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_list_revisions" (
    "id" UUID NOT NULL,
    "book_list_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "status" "book_list_status" NOT NULL DEFAULT 'DRAFT',
    "comment" TEXT,
    "submitted_by_id" UUID,
    "submitted_at" TIMESTAMPTZ(3),
    "decided_by_id" UUID,
    "approved_at" TIMESTAMPTZ(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "book_list_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_list_items" (
    "id" UUID NOT NULL,
    "revision_id" UUID NOT NULL,
    "subject_id" UUID,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "isbn" TEXT,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "price_minor" BIGINT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "book_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_plans" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "status" "syllabus_plan_status" NOT NULL DEFAULT 'DRAFT',
    "approval_request_id" UUID,
    "comment" TEXT,
    "submitted_by_id" UUID,
    "approved_at" TIMESTAMPTZ(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "syllabus_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_chapters" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "syllabus_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_topics" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "target_date" DATE NOT NULL,
    "status" "topic_status" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_on" DATE,
    "note" TEXT,
    "pending_approval_id" UUID,
    "updated_by_id" UUID,
    "on_behalf_of_staff_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "syllabus_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_enquiries" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "child_name" TEXT NOT NULL,
    "dob" DATE,
    "guardian_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "follow_up_date" DATE,
    "status" "enquiry_status" NOT NULL DEFAULT 'NEW',
    "application_id" UUID,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admission_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_applications" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "application_no" TEXT NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'SUBMITTED',
    "child_name" TEXT NOT NULL,
    "child" JSONB NOT NULL,
    "guardians" JSONB NOT NULL,
    "medical" JSONB,
    "notes" TEXT,
    "waitlist_position" INTEGER,
    "decision_reason" TEXT,
    "withdraw_reason" TEXT,
    "admission_fee" JSONB,
    "section_id" UUID,
    "student_id" UUID,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admission_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrance_tests" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "venue" TEXT,
    "notes" TEXT,
    "score" DECIMAL(6,2),
    "max_score" DECIMAL(6,2),
    "remarks" TEXT,
    "scheduled_by_id" UUID NOT NULL,
    "recorded_by_id" UUID,
    "recorded_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "entrance_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "owner_type" "document_owner_type" NOT NULL,
    "owner_id" UUID NOT NULL,
    "doc_type" "document_type" NOT NULL,
    "file_id" UUID NOT NULL,
    "status" "document_status" NOT NULL DEFAULT 'UPLOADED',
    "note" TEXT,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMPTZ(3),
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "admission_no" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "gender" "gender" NOT NULL,
    "b_form" TEXT,
    "photo_file_id" UUID,
    "address" TEXT,
    "admission_date" DATE NOT NULL,
    "status" "student_status" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_health_profiles" (
    "student_id" UUID NOT NULL,
    "allergies" TEXT,
    "conditions" TEXT,
    "notes" TEXT,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_health_profiles_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "roll_no" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "enrollment_status" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "relation" "guardian_relation" NOT NULL DEFAULT 'GUARDIAN',
    "cnic" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "occupation" TEXT,
    "address" TEXT,
    "status" "record_status" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_guardians" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "relation" "guardian_relation" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "guardian_link_status" NOT NULL DEFAULT 'REQUESTED',
    "verified_by_id" UUID,
    "verified_at" TIMESTAMPTZ(3),
    "revoked_by_id" UUID,
    "revoked_at" TIMESTAMPTZ(3),
    "revoke_reason" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_link_requests" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID,
    "guardian_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "relation" "guardian_relation" NOT NULL,
    "status" "child_link_request_status" NOT NULL DEFAULT 'OTP_PENDING',
    "otp_code_id" UUID,
    "link_id" UUID,
    "approval_request_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "child_link_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "from_branch_id" UUID NOT NULL,
    "to_branch_id" UUID NOT NULL,
    "from_enrollment_id" UUID NOT NULL,
    "to_enrollment_id" UUID,
    "effective_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "transfer_status" NOT NULL DEFAULT 'REQUESTED',
    "decision_reason" TEXT,
    "requested_by_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_cards" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "id_card_status" NOT NULL DEFAULT 'PENDING',
    "file_id" UUID,
    "error" TEXT,
    "requested_by_id" UUID NOT NULL,
    "generated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "employee_no" TEXT,
    "designation" TEXT NOT NULL,
    "join_date" DATE NOT NULL,
    "cnic" TEXT,
    "qualification" TEXT,
    "photo_file_id" UUID,
    "status" "staff_status" NOT NULL DEFAULT 'ACTIVE',
    "status_reason" TEXT,
    "status_effective_date" DATE,
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "reviewer_user_id" UUID,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_assignments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "kind" "staff_assignment_kind" NOT NULL,
    "section_id" UUID,
    "subject_id" UUID,
    "responsible_staff_id" UUID,
    "is_substitute" BOOLEAN NOT NULL DEFAULT false,
    "valid_from" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ(3),
    "ended_at" TIMESTAMPTZ(3),
    "role_assignment_id" UUID,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branch_periods_school_id_idx" ON "branch_periods"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_periods_branch_id_period_index_key" ON "branch_periods"("branch_id", "period_index");

-- CreateIndex
CREATE INDEX "timetables_school_id_idx" ON "timetables"("school_id");

-- CreateIndex
CREATE INDEX "timetables_branch_id_session_id_idx" ON "timetables"("branch_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_section_id_session_id_key" ON "timetables"("section_id", "session_id");

-- CreateIndex
CREATE INDEX "timetable_slots_staff_id_published_idx" ON "timetable_slots"("staff_id", "published");

-- CreateIndex
CREATE INDEX "timetable_slots_room_id_idx" ON "timetable_slots"("room_id");

-- CreateIndex
CREATE INDEX "timetable_slots_subject_id_idx" ON "timetable_slots"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_slots_timetable_id_published_day_period_index_key" ON "timetable_slots"("timetable_id", "published", "day", "period_index");

-- CreateIndex
CREATE INDEX "timetable_overrides_school_id_idx" ON "timetable_overrides"("school_id");

-- CreateIndex
CREATE INDEX "timetable_overrides_branch_id_date_idx" ON "timetable_overrides"("branch_id", "date");

-- CreateIndex
CREATE INDEX "timetable_overrides_substitute_staff_id_date_idx" ON "timetable_overrides"("substitute_staff_id", "date");

-- CreateIndex
CREATE INDEX "timetable_overrides_original_staff_id_idx" ON "timetable_overrides"("original_staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_overrides_one_per_period" ON "timetable_overrides"("section_id", "date", "period_index") WHERE (cancelled_at IS NULL);

-- CreateIndex
CREATE INDEX "book_lists_school_id_idx" ON "book_lists"("school_id");

-- CreateIndex
CREATE INDEX "book_lists_session_id_idx" ON "book_lists"("session_id");

-- CreateIndex
CREATE INDEX "book_lists_class_id_idx" ON "book_lists"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_lists_branch_id_session_id_class_id_key" ON "book_lists"("branch_id", "session_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_list_revisions_book_list_id_revision_key" ON "book_list_revisions"("book_list_id", "revision");

-- CreateIndex
CREATE INDEX "book_list_items_revision_id_idx" ON "book_list_items"("revision_id");

-- CreateIndex
CREATE INDEX "book_list_items_subject_id_idx" ON "book_list_items"("subject_id");

-- CreateIndex
CREATE INDEX "syllabus_plans_school_id_idx" ON "syllabus_plans"("school_id");

-- CreateIndex
CREATE INDEX "syllabus_plans_branch_id_session_id_idx" ON "syllabus_plans"("branch_id", "session_id");

-- CreateIndex
CREATE INDEX "syllabus_plans_subject_id_idx" ON "syllabus_plans"("subject_id");

-- CreateIndex
CREATE INDEX "syllabus_plans_session_id_idx" ON "syllabus_plans"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "syllabus_plans_section_id_subject_id_session_id_key" ON "syllabus_plans"("section_id", "subject_id", "session_id");

-- CreateIndex
CREATE INDEX "syllabus_chapters_plan_id_idx" ON "syllabus_chapters"("plan_id");

-- CreateIndex
CREATE INDEX "syllabus_topics_plan_id_idx" ON "syllabus_topics"("plan_id");

-- CreateIndex
CREATE INDEX "syllabus_topics_chapter_id_idx" ON "syllabus_topics"("chapter_id");

-- CreateIndex
CREATE INDEX "syllabus_topics_target_date_status_idx" ON "syllabus_topics"("target_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "admission_enquiries_application_id_key" ON "admission_enquiries"("application_id");

-- CreateIndex
CREATE INDEX "admission_enquiries_school_id_idx" ON "admission_enquiries"("school_id");

-- CreateIndex
CREATE INDEX "admission_enquiries_branch_id_status_idx" ON "admission_enquiries"("branch_id", "status");

-- CreateIndex
CREATE INDEX "admission_enquiries_session_id_idx" ON "admission_enquiries"("session_id");

-- CreateIndex
CREATE INDEX "admission_enquiries_class_id_idx" ON "admission_enquiries"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_student_id_key" ON "admission_applications"("student_id");

-- CreateIndex
CREATE INDEX "admission_applications_school_id_idx" ON "admission_applications"("school_id");

-- CreateIndex
CREATE INDEX "admission_applications_branch_id_session_id_status_idx" ON "admission_applications"("branch_id", "session_id", "status");

-- CreateIndex
CREATE INDEX "admission_applications_class_id_idx" ON "admission_applications"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_branch_id_application_no_key" ON "admission_applications"("branch_id", "application_no");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_waitlist_position" ON "admission_applications"("session_id", "class_id", "waitlist_position") WHERE (status = 'WAITLISTED'::application_status);

-- CreateIndex
CREATE UNIQUE INDEX "entrance_tests_application_id_key" ON "entrance_tests"("application_id");

-- CreateIndex
CREATE INDEX "documents_school_id_idx" ON "documents"("school_id");

-- CreateIndex
CREATE INDEX "documents_owner_type_owner_id_idx" ON "documents"("owner_type", "owner_id");

-- CreateIndex
CREATE INDEX "documents_file_id_idx" ON "documents"("file_id");

-- CreateIndex
CREATE INDEX "documents_verified_by_id_idx" ON "documents"("verified_by_id");

-- CreateIndex
CREATE INDEX "students_school_id_status_idx" ON "students"("school_id", "status");

-- CreateIndex
CREATE INDEX "students_photo_file_id_idx" ON "students"("photo_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_school_id_admission_no_key" ON "students"("school_id", "admission_no");

-- CreateIndex
CREATE INDEX "enrollments_school_id_idx" ON "enrollments"("school_id");

-- CreateIndex
CREATE INDEX "enrollments_branch_id_session_id_status_idx" ON "enrollments"("branch_id", "session_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_section_id_status_idx" ON "enrollments"("section_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_student_id_start_date_idx" ON "enrollments"("student_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_one_active_per_student" ON "enrollments"("student_id") WHERE (status = 'ACTIVE'::enrollment_status);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_roll_no_per_section" ON "enrollments"("section_id", "roll_no") WHERE (status = 'ACTIVE'::enrollment_status);

-- CreateIndex
CREATE UNIQUE INDEX "guardians_user_id_key" ON "guardians"("user_id");

-- CreateIndex
CREATE INDEX "guardians_school_id_phone_idx" ON "guardians"("school_id", "phone");

-- CreateIndex
CREATE INDEX "student_guardians_school_id_idx" ON "student_guardians"("school_id");

-- CreateIndex
CREATE INDEX "student_guardians_guardian_id_status_idx" ON "student_guardians"("guardian_id", "status");

-- CreateIndex
CREATE INDEX "student_guardians_student_id_status_idx" ON "student_guardians"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "student_guardians_open_link" ON "student_guardians"("student_id", "guardian_id") WHERE (status = ANY (ARRAY['REQUESTED'::guardian_link_status, 'VERIFIED'::guardian_link_status]));

-- CreateIndex
CREATE UNIQUE INDEX "student_guardians_one_primary" ON "student_guardians"("student_id") WHERE (is_primary AND status = 'VERIFIED'::guardian_link_status);

-- CreateIndex
CREATE INDEX "child_link_requests_school_id_idx" ON "child_link_requests"("school_id");

-- CreateIndex
CREATE INDEX "child_link_requests_branch_id_status_idx" ON "child_link_requests"("branch_id", "status");

-- CreateIndex
CREATE INDEX "child_link_requests_guardian_id_idx" ON "child_link_requests"("guardian_id");

-- CreateIndex
CREATE INDEX "child_link_requests_student_id_idx" ON "child_link_requests"("student_id");

-- CreateIndex
CREATE INDEX "transfers_school_id_idx" ON "transfers"("school_id");

-- CreateIndex
CREATE INDEX "transfers_from_branch_id_status_idx" ON "transfers"("from_branch_id", "status");

-- CreateIndex
CREATE INDEX "transfers_to_branch_id_status_idx" ON "transfers"("to_branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_one_open_per_student" ON "transfers"("student_id") WHERE (status = 'REQUESTED'::transfer_status);

-- CreateIndex
CREATE INDEX "id_cards_school_id_idx" ON "id_cards"("school_id");

-- CreateIndex
CREATE INDEX "id_cards_file_id_idx" ON "id_cards"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "id_cards_student_id_version_key" ON "id_cards"("student_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "staff_branch_id_status_idx" ON "staff"("branch_id", "status");

-- CreateIndex
CREATE INDEX "staff_reviewer_user_id_idx" ON "staff"("reviewer_user_id");

-- CreateIndex
CREATE INDEX "staff_photo_file_id_idx" ON "staff"("photo_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_school_id_employee_no_key" ON "staff"("school_id", "employee_no");

-- CreateIndex
CREATE UNIQUE INDEX "staff_assignments_role_assignment_id_key" ON "staff_assignments"("role_assignment_id");

-- CreateIndex
CREATE INDEX "staff_assignments_school_id_idx" ON "staff_assignments"("school_id");

-- CreateIndex
CREATE INDEX "staff_assignments_branch_id_session_id_idx" ON "staff_assignments"("branch_id", "session_id");

-- CreateIndex
CREATE INDEX "staff_assignments_staff_id_ended_at_idx" ON "staff_assignments"("staff_id", "ended_at");

-- CreateIndex
CREATE INDEX "staff_assignments_section_id_idx" ON "staff_assignments"("section_id");

-- CreateIndex
CREATE INDEX "staff_assignments_subject_id_idx" ON "staff_assignments"("subject_id");

-- CreateIndex
CREATE INDEX "staff_assignments_responsible_staff_id_idx" ON "staff_assignments"("responsible_staff_id");

-- CreateIndex
CREATE INDEX "staff_assignments_valid_until_idx" ON "staff_assignments"("valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "staff_assignments_one_class_teacher" ON "staff_assignments"("session_id", "section_id") WHERE (kind = 'CLASS_TEACHER'::staff_assignment_kind AND ended_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "staff_assignments_one_subject_teacher" ON "staff_assignments"("section_id", "subject_id") WHERE (kind = 'SUBJECT_TEACHER'::staff_assignment_kind AND NOT is_substitute AND ended_at IS NULL);

-- AddForeignKey
ALTER TABLE "branch_periods" ADD CONSTRAINT "branch_periods_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_periods" ADD CONSTRAINT "branch_periods_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_timetable_id_fkey" FOREIGN KEY ("timetable_id") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_overrides" ADD CONSTRAINT "timetable_overrides_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_overrides" ADD CONSTRAINT "timetable_overrides_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_overrides" ADD CONSTRAINT "timetable_overrides_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_overrides" ADD CONSTRAINT "timetable_overrides_original_staff_id_fkey" FOREIGN KEY ("original_staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_overrides" ADD CONSTRAINT "timetable_overrides_substitute_staff_id_fkey" FOREIGN KEY ("substitute_staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_lists" ADD CONSTRAINT "book_lists_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_lists" ADD CONSTRAINT "book_lists_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_lists" ADD CONSTRAINT "book_lists_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_lists" ADD CONSTRAINT "book_lists_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_list_revisions" ADD CONSTRAINT "book_list_revisions_book_list_id_fkey" FOREIGN KEY ("book_list_id") REFERENCES "book_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "book_list_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_plans" ADD CONSTRAINT "syllabus_plans_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_plans" ADD CONSTRAINT "syllabus_plans_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_plans" ADD CONSTRAINT "syllabus_plans_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_plans" ADD CONSTRAINT "syllabus_plans_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_plans" ADD CONSTRAINT "syllabus_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_chapters" ADD CONSTRAINT "syllabus_chapters_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "syllabus_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_topics" ADD CONSTRAINT "syllabus_topics_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "syllabus_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabus_topics" ADD CONSTRAINT "syllabus_topics_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "syllabus_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "admission_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance_tests" ADD CONSTRAINT "entrance_tests_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "admission_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_class_teacher_staff_id_fkey" FOREIGN KEY ("class_teacher_staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_photo_file_id_fkey" FOREIGN KEY ("photo_file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_health_profiles" ADD CONSTRAINT "student_health_profiles_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_link_requests" ADD CONSTRAINT "child_link_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_link_requests" ADD CONSTRAINT "child_link_requests_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_link_requests" ADD CONSTRAINT "child_link_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_branch_id_fkey" FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_branch_id_fkey" FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_photo_file_id_fkey" FOREIGN KEY ("photo_file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_responsible_staff_id_fkey" FOREIGN KEY ("responsible_staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_role_assignment_id_fkey" FOREIGN KEY ("role_assignment_id") REFERENCES "role_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Integrity checks (databaseManagement.md §3).
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_dates_check"
  CHECK ("end_date" IS NULL OR "end_date" >= "start_date");
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_roll_no_check"
  CHECK ("roll_no" IS NULL OR "roll_no" > 0);
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_validity_check"
  CHECK ("valid_until" IS NULL OR "valid_until" >= "valid_from");
ALTER TABLE "entrance_tests" ADD CONSTRAINT "entrance_tests_score_check"
  CHECK ("score" IS NULL OR ("score" >= 0 AND "max_score" > 0 AND "score" <= "max_score"));
ALTER TABLE "book_list_items" ADD CONSTRAINT "book_list_items_price_check"
  CHECK ("price_minor" IS NULL OR "price_minor" >= 0);
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_day_check"
  CHECK ("day" BETWEEN 1 AND 7);
ALTER TABLE "branch_periods" ADD CONSTRAINT "branch_periods_times_check"
  CHECK ("start_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
     AND "end_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
     AND "end_time" > "start_time");
