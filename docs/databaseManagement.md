# eSchool — Database Management

PostgreSQL 16, accessed only through Prisma in `SchoolApi`. Android Room is a cache + offline outbox, never a source of truth.

## 1. Conventions

| Rule | Detail |
|---|---|
| Naming | Prisma models PascalCase; DB tables/columns snake_case via `@@map` / `@map`. |
| IDs | `uuid` (v7 generated in app for time ordering). Human numbers (admission no, receipt no, invoice no) are separate unique columns. |
| Tenancy | Every operational table carries `school_id` and, where relevant, `branch_id` and `session_id`. Repositories always filter by resolved scope. |
| Timestamps | `created_at`, `updated_at` (timestamptz, UTC). School-local business dates use `date`. |
| Actor columns | `created_by_id`, `updated_by_id`; teacher-work tables also `on_behalf_of_staff_id`. |
| Archive, not delete | `status` (`ACTIVE/ARCHIVED`) or `archived_at`. Hard delete only for drafts never submitted. |
| Money | `bigint` minor units (`amount_minor`) + `currency char(3)` (default PKR). No floats. |
| Enums | Postgres enums via Prisma for closed sets (statuses); lookup tables for school-configurable lists (fee heads, expense categories). |
| JSON | Only for snapshots (approval payload, audit before/after) and flexible settings. |
| Optimistic locking | `version int` on records edited by multiple people (registers, marks, invoices). Update `WHERE version = ?`. |
| Idempotency | `client_request_id` unique on records created offline (attendance, diary). |

## 2. Domains and core tables

### 2.1 Identity and access
- `users` (id, name, email?, phone?, password_hash, status ACTIVE/DISABLED, last_login_at, must_change_password)
- `refresh_sessions` (id, user_id, token_hash, device_name, platform WEB/ANDROID, ip, created_at, expires_at, revoked_at, replaced_by_id)
- `password_reset_tokens`, `otp_codes` (hashed, expiry, attempts)
- `roles` (id, key, name, is_system, school_id? for custom)
- `permissions` (key `module.action`, description) — seeded from code catalogue
- `role_permissions` (role_id, permission_key)
- `role_assignments` (id, user_id, role_id, scope_type, school_id?, branch_id?, section_id?, subject_id?, valid_from, valid_until?, granted_by_id)
- `user_devices` (FCM tokens)

### 2.2 Organisation
- `schools` (code unique, name, logo_file_id, address, contacts, status)
- `branches` (school_id, code, name, address, contacts, timings json, working_days, principal_user_id?, status)
- `branch_settings` (branch_id, key, value json) — attendance lock time, diary moderation, approval limits, office hours...
- `academic_sessions` (branch_id, name "2026-27", start_date, end_date, status DRAFT/ACTIVE/CLOSED) — partial unique: one ACTIVE per branch
- `terms`, `calendar_events` (HOLIDAY, VACATION, DEADLINE, EVENT)
- `classes` (school_id, name, level_order), `sections` (branch_id, session_id, class_id, name, capacity, room_id?, class_teacher_staff_id?) unique (session_id, class_id, name)
- `subjects`, `class_subjects`, `rooms`

### 2.3 People
- `students` (school_id, admission_no unique per school, names, dob, gender, photo_file_id, status)
- `enrollments` (student_id, branch_id, session_id, section_id, roll_no, start_date, end_date?, status, reason)
- `guardians` (user_id?, name, relation, cnic, phones, email, address)
- `student_guardians` (student_id, guardian_id, relation, is_primary, status REQUESTED/VERIFIED/REJECTED/REVOKED, verified_by_id, verified_at)
- `staff` (user_id, school_id, employee_no, designation, employment_status, join_date, requires_review, reviewer_user_id)
- `staff_assignments` (staff_id, branch_id, session_id, section_id?, subject_id?, kind CLASS_TEACHER/SUBJECT_TEACHER/HELPER/COORDINATOR/HEAD_TEACHER, responsible_staff_id?, valid_until?)
- `documents` (owner_type, owner_id, doc_type BIRTH_CERT/CNIC/PHOTO/..., file_id, status UPLOADED/VERIFIED/REJECTED, verified_by_id, note)
- `files` (storage_key, mime, size, sha256, uploaded_by_id, scan_status)

### 2.4 Admissions
- `admission_enquiries`, `admission_applications` (status machine), `entrance_tests`, `entrance_test_results`, `waiting_list_entries` (class_id, session_id, position)

### 2.5 Academics
- `timetables` (section_id, session_id, status, version), `timetable_slots` (day, period, subject_id, staff_id, room_id), `timetable_overrides`
- `book_lists` + `book_list_revisions` + `book_list_items`
- `syllabus_plans` (section/subject/session, status, revision), `syllabus_topics` (chapter, topic, target_date, status, completed_at)

### 2.6 Daily operations
- `attendance_registers` (section_id, date, status DRAFT/SUBMITTED/LOCKED, submitted_by_id, on_behalf_of_staff_id, version, client_request_id) unique (section_id, date)
- `attendance_entries` (register_id, student_id, status, remark)
- `attendance_corrections` (entry_id, old_status, new_status, reason, approval_request_id)
- `staff_attendance_registers` / `staff_attendance_entries`
- `leave_requests` (requester_type STUDENT/STAFF, subject_id, from, to, reason, status)
- `diary_entries` (section_id, subject_id, date, topics, homework, due_date, status, revision, client_request_id), `diary_attachments`
- `activities` (type, title, scope, dates, consent_required, status), `activity_audiences`, `activity_consents` (student_id, guardian_id, status, responded_at), `activity_participants` (role, result)
- `notices`, `notice_audiences`, `notice_reads`
- `message_threads` (student_id?, branch_id), `thread_participants`, `messages`
- `complaints` (category, against_user_id?, anonymous, status, assigned_to_id, escalation_level, sla_due_at), `complaint_updates`
- `meeting_slots`, `meetings` (participants, status, notes), `follow_up_actions`
- `student_health_profiles`, `emergency_contacts`, `allergies`, `medical_instructions`, `health_incidents`
- `pickup_persons`, `early_leave_requests`, `departure_logs`

### 2.7 Exams and results
- `grading_schemes` + `grade_bands`
- `exams` (session, term, status), `exam_subjects` (exam_id, class_id, subject_id, max_marks, date)
- `mark_sheets` (exam_subject_id, section_id, status, version), `marks` (mark_sheet_id, student_id, marks_obtained numeric(6,2)? null = pending, is_absent)
- `results` (exam_id, student_id, totals, grade, rank, status), `report_cards` (file_id, version)
- `promotion_decisions` (student_id, from_session, to_session, decision, status, decided_by_id)
- `certificates` (type, student_id, serial_no unique, status, file_id, duplicate_of_id?)

### 2.8 Finance
- `fee_heads`, `fee_plans`, `fee_plan_items` (class/session, head, amount_minor, frequency)
- `invoices` (invoice_no, student_id, branch_id, session_id, period, due_date, status, version)
- `invoice_lines` (invoice_id, fee_head_id, description, amount_minor)
- `ledger_entries` **immutable** (student_id, invoice_id?, type CHARGE/PAYMENT/CONCESSION/REFUND/REVERSAL/LATE_FEE, amount_minor signed, ref_type, ref_id, reason, created_by_id) — balance = SUM
- `payment_proofs` (invoice_id, file_id, amount_minor, status, verified_by_id)
- `payments` (receipt_no, branch_id, amount_minor, mode CASH/BANK/ONLINE, gateway, gateway_ref, received_by_id, status), `payment_allocations` (payment_id, invoice_id, amount_minor)
- `concessions`, `refunds` (each linked to approval_request)
- `daily_collections` (branch_id, date, cashier_id, totals by mode, closed_by_id)
- `salary_structures` (staff_id, components json, effective_from), `payroll_runs`, `payroll_lines`, `payroll_adjustments`, `payroll_payments`, `payslips`
- `vendors`, `expense_categories`, `expenses` (status, amount_minor, bill_file_id), `expense_payments`
- `inventory_items`, `stock_movements` (immutable), `assets`, `purchase_requests`, `purchase_orders`, `purchase_order_lines`, `goods_receipts`

### 2.9 Cross-cutting
- `approval_requests`, `approval_steps`
- `audit_logs` (actor_id, on_behalf_of?, action, entity_type, entity_id, school_id, branch_id, before json, after json, ip, user_agent, at) — append-only, partitioned by month
- `notifications` (user_id, category, title, body, data, read_at), `notification_deliveries` (channel, status, attempts, last_error)
- `job_runs` (queue, name, status, started_at, finished_at, error) for visibility
- `backup_runs` (file, size, checksum, restore_verified_at)
- `sequences` (scope key → next value) for admission/receipt/invoice/certificate numbers, incremented with `SELECT ... FOR UPDATE`.

## 3. Integrity rules in the database
- Unique constraints: section per session/class; register per section/date; mark per sheet/student; admission no per school; receipt no per branch.
- Partial unique: one ACTIVE session per branch; one primary guardian per student.
- Check constraints: `amount_minor >= 0` on invoice lines (signs only in ledger); `end_date >= start_date`.
- Foreign keys with `ON DELETE RESTRICT` by default (archive instead).
- `ledger_entries`, `stock_movements`, `audit_logs`: no UPDATE/DELETE — enforced by a DB trigger raising an exception and by repository code.

## 4. Indexing strategy
- Every FK indexed.
- Scope-first composite indexes: `(branch_id, session_id, ...)`, e.g. `attendance_registers(branch_id, date)`, `invoices(branch_id, status, due_date)`, `ledger_entries(student_id, created_at)`.
- Dashboard counters: `(branch_id, status)` on approvals, complaints, invoices.
- Full-text (trigram) on student and guardian names for search.

## 5. Transactions
- Multi-row changes (submit register, allocate payment, approve payroll, promote students) run in one Prisma `$transaction` with `Serializable` or row locks where money/sequences are involved.
- Side effects (notifications, PDFs) are emitted **after** commit (outbox table `domain_events` → job dispatcher), so a rolled-back transaction never sends a notification.

## 6. Migrations
- `prisma migrate dev` locally; `prisma migrate deploy` in staging/production.
- Migrations reviewed and committed; never edit an applied migration.
- Destructive changes in two steps (add new → backfill job → remove old in a later release).
- Raw SQL migrations for triggers, partial indexes and partitions.

## 7. Seed data
`prisma/seed.ts` creates: permission catalogue, system roles with default permissions, one Super Admin (password from env), and (dev only) demo school "Bright School" › "Main Branch" › 2026-27 with classes, sections, staff in every role, students, guardians.

## 8. Backups and restore
- Nightly `pg_dump -Fc` via `maintenance.backup` job → encrypted (AES-256) → object storage with 30-day daily + 12 monthly retention.
- File storage bucket versioning on.
- Weekly restore verification: job restores the latest dump into a scratch database, runs row-count and checksum checks on key tables (ledger totals, student count), records result in `backup_runs.restore_verified_at`. Failure alerts Super Admin.
- Point-in-time recovery (WAL archiving) in production.

## 9. Data import (pilot)
- CSV/XLSX templates for students, guardians, staff, opening balances.
- Import job: validate → preview errors → commit in a transaction; each import has an id and can be listed and reverted while nothing references it.
- Opening balances import as `ledger_entries(type=CHARGE, ref_type=OPENING_BALANCE)`; reconciliation report must match the school's ledger before go-live.

## 10. Data retention
- Students, results, finance and audit: retained permanently (archived).
- OTP / reset tokens: deleted after expiry + 7 days.
- Notification deliveries: 180 days.
- Revoked refresh sessions: 90 days.

## 11. Android local database (Room)
| Table | Purpose |
|---|---|
| `session_cache` | Logged-in user, `/me` snapshot |
| `cached_*` | Read cache for lists (sections, students, timetable, diary, notices) keyed by scope |
| `attendance_drafts`, `diary_drafts` | Offline drafts |
| `outbox` | Pending API calls: id, type, payload json, client_request_id, attempts, last_error, status |

Cache cleared on logout or role switch. Room DB file excluded from cloud backup (see security.md).
