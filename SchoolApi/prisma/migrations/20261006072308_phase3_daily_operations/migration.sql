-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "register_status" AS ENUM ('DRAFT', 'SUBMITTED', 'LOCKED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "correction_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "leave_kind" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "leave_type" AS ENUM ('CASUAL', 'SICK', 'ANNUAL', 'UNPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "leave_status" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "diary_status" AS ENUM ('DRAFT', 'SUBMITTED', 'PUBLISHED', 'RETURNED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('EVENT', 'SPORTS', 'TRIP', 'COMPETITION', 'CLUB');

-- CreateEnum
CREATE TYPE "activity_status" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED', 'ANNOUNCED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "consent_status" AS ENUM ('PENDING', 'GRANTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "notice_status" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('SENT', 'PENDING_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "complaint_category" AS ENUM ('ACADEMIC', 'STAFF_BEHAVIOUR', 'FACILITY', 'TRANSPORT', 'FEE', 'SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "complaint_status" AS ENUM ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REOPENED');

-- CreateEnum
CREATE TYPE "meeting_mode" AS ENUM ('IN_PERSON', 'PHONE', 'VIDEO');

-- CreateEnum
CREATE TYPE "meeting_slot_status" AS ENUM ('OPEN', 'BOOKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "meeting_status" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "follow_up_status" AS ENUM ('OPEN', 'DONE');

-- CreateEnum
CREATE TYPE "incident_type" AS ENUM ('INJURY', 'ILLNESS', 'ALLERGIC_REACTION', 'OTHER');

-- CreateEnum
CREATE TYPE "incident_severity" AS ENUM ('MINOR', 'MODERATE', 'SERIOUS');

-- CreateEnum
CREATE TYPE "incident_status" AS ENUM ('REPORTED', 'PARENT_NOTIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "pickup_person_status" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REVOKED');

-- CreateEnum
CREATE TYPE "early_leave_status" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'DEPARTED');

-- AlterEnum
ALTER TYPE "approval_type" ADD VALUE 'NOTICE';

-- AlterTable
ALTER TABLE "student_health_profiles" ADD COLUMN     "allergy_list" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "blood_group" TEXT,
ADD COLUMN     "condition_list" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "doctor" JSONB,
ADD COLUMN     "emergency_contacts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "medications" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "attendance_registers" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "register_status" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "submitted_by_id" UUID,
    "submitted_at" TIMESTAMPTZ(3),
    "on_behalf_of_staff_id" UUID,
    "locked_at" TIMESTAMPTZ(3),
    "pending_approval_id" UUID,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_entries" (
    "id" UUID NOT NULL,
    "register_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "attendance_status" NOT NULL,
    "remark" TEXT,
    "guardian_notified_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "old_status" "attendance_status" NOT NULL,
    "new_status" "attendance_status" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "correction_status" NOT NULL DEFAULT 'PENDING',
    "approval_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_attendance" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "attendance_status" NOT NULL,
    "check_in" VARCHAR(5),
    "check_out" VARCHAR(5),
    "remark" TEXT,
    "marked_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "kind" "leave_kind" NOT NULL,
    "student_id" UUID,
    "staff_id" UUID,
    "section_id" UUID,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "type" "leave_type" NOT NULL DEFAULT 'OTHER',
    "reason" TEXT NOT NULL,
    "attachment_file_id" UUID,
    "status" "leave_status" NOT NULL DEFAULT 'SUBMITTED',
    "requested_by_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "comment" TEXT,
    "approval_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_job_marks" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "job" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_job_marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "client_request_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_entries" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "topics" TEXT NOT NULL,
    "homework" TEXT,
    "due_date" DATE,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "status" "diary_status" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "author_id" UUID NOT NULL,
    "on_behalf_of_staff_id" UUID,
    "comment" TEXT,
    "approval_id" UUID,
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_revisions" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "topics" TEXT NOT NULL,
    "homework" TEXT,
    "due_date" DATE,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "edited_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diary_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "type" "activity_type" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_at" TIMESTAMPTZ(3) NOT NULL,
    "end_at" TIMESTAMPTZ(3) NOT NULL,
    "venue" TEXT,
    "audience" JSONB NOT NULL,
    "consent_required" BOOLEAN NOT NULL DEFAULT false,
    "consent_deadline" DATE,
    "fee_minor" BIGINT,
    "max_participants" INTEGER,
    "status" "activity_status" NOT NULL DEFAULT 'PROPOSED',
    "reason" TEXT,
    "approval_id" UUID,
    "proposed_by_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_consents" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "guardian_id" UUID,
    "status" "consent_status" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "responded_by_id" UUID,
    "responded_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "activity_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_participants" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "role" TEXT,
    "result" TEXT,
    "position" INTEGER,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "activity_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" JSONB NOT NULL,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "expires_on" DATE,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "status" "notice_status" NOT NULL DEFAULT 'DRAFT',
    "author_id" UUID NOT NULL,
    "approval_id" UUID,
    "comment" TEXT,
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notice_recipients" (
    "id" UUID NOT NULL,
    "notice_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMPTZ(3),

    CONSTRAINT "notice_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "last_message_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_participants" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "last_read_at" TIMESTAMPTZ(3),

    CONSTRAINT "thread_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "sender_role" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "status" "message_status" NOT NULL DEFAULT 'SENT',
    "delivered_silently" BOOLEAN NOT NULL DEFAULT false,
    "pending_approval_id" UUID,
    "sent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID,
    "ticket_no" TEXT NOT NULL,
    "category" "complaint_category" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "complaint_status" NOT NULL DEFAULT 'SUBMITTED',
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "sla_due_at" TIMESTAMPTZ(3) NOT NULL,
    "complainant_id" UUID NOT NULL,
    "complainant_role" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "against_user_id" UUID,
    "student_id" UUID,
    "assignee_id" UUID,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "resolved_at" TIMESTAMPTZ(3),
    "closed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_updates" (
    "id" UUID NOT NULL,
    "complaint_id" UUID NOT NULL,
    "author_id" UUID,
    "message" TEXT NOT NULL,
    "status" "complaint_status",
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_slots" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "staff_user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "mode" "meeting_mode" NOT NULL,
    "location" TEXT,
    "status" "meeting_slot_status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meeting_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "slot_id" UUID,
    "student_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "staff_user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "mode" "meeting_mode" NOT NULL,
    "location" TEXT,
    "agenda" TEXT NOT NULL,
    "status" "meeting_status" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "summary" TEXT,
    "share_summary" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "requested_by_id" UUID NOT NULL,
    "reminder_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_follow_ups" (
    "id" UUID NOT NULL,
    "meeting_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "follow_up_status" NOT NULL DEFAULT 'OPEN',
    "done_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_incidents" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "type" "incident_type" NOT NULL,
    "severity" "incident_severity" NOT NULL,
    "description" TEXT NOT NULL,
    "action_taken" TEXT NOT NULL,
    "attachment_file_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "status" "incident_status" NOT NULL DEFAULT 'REPORTED',
    "reported_by_id" UUID NOT NULL,
    "closed_by_id" UUID,
    "closed_at" TIMESTAMPTZ(3),
    "close_note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "health_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_persons" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "cnic" TEXT,
    "phone" TEXT NOT NULL,
    "photo_file_id" UUID,
    "status" "pickup_person_status" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "added_by_id" UUID NOT NULL,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMPTZ(3),
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pickup_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_leaves" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "reason" TEXT NOT NULL,
    "pickup_person_id" UUID,
    "status" "early_leave_status" NOT NULL DEFAULT 'REQUESTED',
    "approval_id" UUID,
    "requested_by_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "decided_at" TIMESTAMPTZ(3),
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "early_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departures" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "early_leave_id" UUID,
    "pickup_person_id" UUID,
    "guardian_id" UUID,
    "picked_up_by_name" TEXT NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL,
    "recorded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_registers_branch_id_date_idx" ON "attendance_registers"("branch_id", "date");

-- CreateIndex
CREATE INDEX "attendance_registers_status_date_idx" ON "attendance_registers"("status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_registers_section_id_date_key" ON "attendance_registers"("section_id", "date");

-- CreateIndex
CREATE INDEX "attendance_entries_student_id_idx" ON "attendance_entries"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_entries_register_id_student_id_key" ON "attendance_entries"("register_id", "student_id");

-- CreateIndex
CREATE INDEX "attendance_corrections_entry_id_idx" ON "attendance_corrections"("entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_corrections_one_pending" ON "attendance_corrections"("entry_id") WHERE (status = 'PENDING'::correction_status);

-- CreateIndex
CREATE INDEX "staff_attendance_branch_id_date_idx" ON "staff_attendance"("branch_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_attendance_staff_id_date_key" ON "staff_attendance"("staff_id", "date");

-- CreateIndex
CREATE INDEX "leave_requests_branch_id_status_idx" ON "leave_requests"("branch_id", "status");

-- CreateIndex
CREATE INDEX "leave_requests_student_id_from_date_idx" ON "leave_requests"("student_id", "from_date");

-- CreateIndex
CREATE INDEX "leave_requests_staff_id_from_date_idx" ON "leave_requests"("staff_id", "from_date");

-- CreateIndex
CREATE INDEX "leave_requests_requested_by_id_idx" ON "leave_requests"("requested_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_job_marks_branch_id_job_date_key" ON "branch_job_marks"("branch_id", "job", "date");

-- CreateIndex
CREATE UNIQUE INDEX "client_requests_user_id_client_request_id_key" ON "client_requests"("user_id", "client_request_id");

-- CreateIndex
CREATE INDEX "diary_entries_branch_id_date_idx" ON "diary_entries"("branch_id", "date");

-- CreateIndex
CREATE INDEX "diary_entries_section_id_date_status_idx" ON "diary_entries"("section_id", "date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "diary_entries_section_id_subject_id_date_key" ON "diary_entries"("section_id", "subject_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "diary_revisions_entry_id_revision_key" ON "diary_revisions"("entry_id", "revision");

-- CreateIndex
CREATE INDEX "activities_branch_id_start_at_idx" ON "activities"("branch_id", "start_at");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- CreateIndex
CREATE INDEX "activity_consents_student_id_status_idx" ON "activity_consents"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "activity_consents_activity_id_student_id_key" ON "activity_consents"("activity_id", "student_id");

-- CreateIndex
CREATE INDEX "activity_participants_student_id_idx" ON "activity_participants"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_activity_id_student_id_key" ON "activity_participants"("activity_id", "student_id");

-- CreateIndex
CREATE INDEX "notices_school_id_status_idx" ON "notices"("school_id", "status");

-- CreateIndex
CREATE INDEX "notices_branch_id_status_idx" ON "notices"("branch_id", "status");

-- CreateIndex
CREATE INDEX "notice_recipients_user_id_idx" ON "notice_recipients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notice_recipients_notice_id_user_id_key" ON "notice_recipients"("notice_id", "user_id");

-- CreateIndex
CREATE INDEX "message_threads_branch_id_last_message_at_idx" ON "message_threads"("branch_id", "last_message_at");

-- CreateIndex
CREATE INDEX "message_threads_student_id_idx" ON "message_threads"("student_id");

-- CreateIndex
CREATE INDEX "thread_participants_user_id_idx" ON "thread_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "thread_participants_thread_id_user_id_key" ON "thread_participants"("thread_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_thread_id_sent_at_idx" ON "messages"("thread_id", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_ticket_no_key" ON "complaints"("ticket_no");

-- CreateIndex
CREATE INDEX "complaints_branch_id_status_idx" ON "complaints"("branch_id", "status");

-- CreateIndex
CREATE INDEX "complaints_complainant_id_idx" ON "complaints"("complainant_id");

-- CreateIndex
CREATE INDEX "complaints_assignee_id_status_idx" ON "complaints"("assignee_id", "status");

-- CreateIndex
CREATE INDEX "complaints_status_sla_due_at_idx" ON "complaints"("status", "sla_due_at");

-- CreateIndex
CREATE INDEX "complaint_updates_complaint_id_created_at_idx" ON "complaint_updates"("complaint_id", "created_at");

-- CreateIndex
CREATE INDEX "meeting_slots_branch_id_date_idx" ON "meeting_slots"("branch_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_slots_staff_user_id_date_start_time_key" ON "meeting_slots"("staff_user_id", "date", "start_time");

-- CreateIndex
CREATE INDEX "meetings_branch_id_date_idx" ON "meetings"("branch_id", "date");

-- CreateIndex
CREATE INDEX "meetings_staff_user_id_date_idx" ON "meetings"("staff_user_id", "date");

-- CreateIndex
CREATE INDEX "meetings_guardian_id_date_idx" ON "meetings"("guardian_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_one_scheduled_per_slot" ON "meetings"("slot_id") WHERE (status = 'SCHEDULED'::meeting_status);

-- CreateIndex
CREATE INDEX "meeting_follow_ups_owner_user_id_status_idx" ON "meeting_follow_ups"("owner_user_id", "status");

-- CreateIndex
CREATE INDEX "health_incidents_branch_id_occurred_at_idx" ON "health_incidents"("branch_id", "occurred_at");

-- CreateIndex
CREATE INDEX "health_incidents_student_id_occurred_at_idx" ON "health_incidents"("student_id", "occurred_at");

-- CreateIndex
CREATE INDEX "pickup_persons_student_id_status_idx" ON "pickup_persons"("student_id", "status");

-- CreateIndex
CREATE INDEX "early_leaves_branch_id_date_idx" ON "early_leaves"("branch_id", "date");

-- CreateIndex
CREATE INDEX "early_leaves_student_id_date_idx" ON "early_leaves"("student_id", "date");

-- CreateIndex
CREATE INDEX "departures_branch_id_at_idx" ON "departures"("branch_id", "at");

-- CreateIndex
CREATE INDEX "departures_student_id_at_idx" ON "departures"("student_id", "at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_category_key" ON "notification_preferences"("user_id", "category");

-- AddForeignKey
ALTER TABLE "attendance_registers" ADD CONSTRAINT "attendance_registers_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_registers" ADD CONSTRAINT "attendance_registers_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_registers" ADD CONSTRAINT "attendance_registers_on_behalf_of_staff_id_fkey" FOREIGN KEY ("on_behalf_of_staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_entries" ADD CONSTRAINT "attendance_entries_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "attendance_registers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_entries" ADD CONSTRAINT "attendance_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "attendance_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendance" ADD CONSTRAINT "staff_attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_on_behalf_of_staff_id_fkey" FOREIGN KEY ("on_behalf_of_staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_revisions" ADD CONSTRAINT "diary_revisions_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_proposed_by_id_fkey" FOREIGN KEY ("proposed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_consents" ADD CONSTRAINT "activity_consents_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_consents" ADD CONSTRAINT "activity_consents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_consents" ADD CONSTRAINT "activity_consents_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice_recipients" ADD CONSTRAINT "notice_recipients_notice_id_fkey" FOREIGN KEY ("notice_id") REFERENCES "notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_participants" ADD CONSTRAINT "thread_participants_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_participants" ADD CONSTRAINT "thread_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_complainant_id_fkey" FOREIGN KEY ("complainant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_against_user_id_fkey" FOREIGN KEY ("against_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_slots" ADD CONSTRAINT "meeting_slots_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "meeting_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_follow_ups" ADD CONSTRAINT "meeting_follow_ups_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_follow_ups" ADD CONSTRAINT "meeting_follow_ups_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_incidents" ADD CONSTRAINT "health_incidents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_incidents" ADD CONSTRAINT "health_incidents_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_persons" ADD CONSTRAINT "pickup_persons_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_leaves" ADD CONSTRAINT "early_leaves_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departures" ADD CONSTRAINT "departures_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
