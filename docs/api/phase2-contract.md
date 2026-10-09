# Phase 2 API Contract (People & Academics)

Same conventions as [phase1-contract.md](phase1-contract.md) incl. its **Deviations** section (envelope, paging, error codes, 201 on create / 200 on actions, scope rules, signed file URLs). Dates `YYYY-MM-DD`; times `HH:mm` 24-hour in the API (clients show 12-hour). Money `amountMinor` integer.

Flows behind these endpoints: [backendFlows.md](../backendFlows.md) §2–6. Every mutation writes an audit entry. "(P)" = when the acting teacher is on probation, the change is held as `PENDING_REVIEW` and a `PROBATION_REVIEW` approval request is created; it applies on approval.

## 0. Scope changes from Phase 1
- Staff assignments (§4) now feed the `ScopeService`: TEACHER/HELPER see only their assigned sections (class teacher → whole section; subject teacher → that subject in that section); COORDINATOR/HEAD_TEACHER see their assigned sections, or the whole branch when assigned at branch level.
- PARENT sees only students with a `VERIFIED` guardian link. For parents, a student outside the link returns `404 NOT_FOUND` (not 403).
- `GET /me` → `children[]` is now populated for PARENT: `{ id, name, admissionNo, photoUrl, className, sectionName, branchName, sessionName }`.
- `GET /dashboard/summary` adds `students`, `staff`, `pendingAdmissions`, `pendingChildLinks` (role-scoped; teachers count only their sections).
- New supervisor permission `teacherwork.proxy` (already in catalogue) is honoured by the probation/proxy helpers introduced here (records keep `performedById` + `onBehalfOfStaffId`).

## 1. Admissions
```
Enquiry: NEW → CONTACTED → CONVERTED | CLOSED
Application: SUBMITTED → DOCUMENTS_PENDING → TEST_SCHEDULED → TEST_COMPLETED → OFFERED | WAITLISTED | REJECTED
             OFFERED → CONFIRMED → ENROLLED ;  WAITLISTED → OFFERED | EXPIRED ;  any open → WITHDRAWN
```
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/admissions/enquiries?branchId=&status=&search=` | `admissions.view` / `admissions.add` `{ branchId, sessionId, classId, childName, dob?, guardianName, phone, email?, source?, notes?, followUpDate? }` |
| PATCH | `/admissions/enquiries/:id` | `admissions.edit` `{ status?, notes?, followUpDate? }` |
| POST | `/admissions/enquiries/:id/convert` | `admissions.add` → creates an Application prefilled from the enquiry |
| GET/POST | `/admissions/applications?branchId=&sessionId=&classId=&status=&search=` | view / add `ApplicationInput` |
| GET/PATCH | `/admissions/applications/:id` | view / edit (only before OFFERED) |
| POST | `/admissions/applications/:id/documents` | edit `{ docType, fileId }` → Document (§3) |
| POST | `/admissions/applications/:id/test` | edit `{ scheduledAt: ISO, venue?, notes? }` → TEST_SCHEDULED, notifies guardian |
| POST | `/admissions/applications/:id/test-result` | edit `{ score, maxScore, remarks? }` → TEST_COMPLETED |
| POST | `/admissions/applications/:id/decide` | `admissions.approve` `{ decision: "OFFER"\|"WAITLIST"\|"REJECT", reason? }` (WAITLIST assigns next position for class+session) |
| POST | `/admissions/applications/:id/confirm` | `admissions.approve` `{ admissionFee: { status: "PAID"\|"WAIVED"\|"PENDING", reference?, amountMinor? }, sectionId, admissionDate }` → CONFIRMED then ENROLLED: creates Student + Guardian(s) + VERIFIED links + Enrollment + admission number + ID card job; returns `{ application, studentId }`. Section capacity full → `409 CONFLICT` |
| POST | `/admissions/applications/:id/withdraw` | edit `{ reason }` |
| GET | `/admissions/waiting-list?branchId=&sessionId=&classId=` | view → applications in WAITLISTED ordered by `waitlistPosition` |
| POST | `/admissions/waiting-list/:applicationId/offer` | approve → OFFERED (notifies guardian) |
```ts
ApplicationInput = {
  branchId, sessionId, classId,
  child: { firstName, lastName, dob, gender: "MALE"|"FEMALE"|"OTHER", bForm?, previousSchool?, photoFileId? },
  guardians: { name, relation: "FATHER"|"MOTHER"|"GUARDIAN"|"OTHER", cnic?, phone, email?, occupation?, address?, isPrimary }[],  // ≥1, exactly one primary
  medical?: { allergies?, conditions?, notes? },
  notes?
}
Application = ApplicationInput & { id, applicationNo, status, className, waitlistPosition: number|null,
  test: { scheduledAt, venue, score, maxScore, remarks } | null,
  documents: Document[], decisionReason, studentId: string|null, createdAt }
Enquiry = { id, branchId, sessionId, classId, className, childName, dob, guardianName, phone, email, source, notes, followUpDate, status, createdAt }
```
`applicationNo` = `APP-{YEAR}-{SEQ}` per branch; `admissionNo` = `{SCHOOLCODE}-{YEAR}-{SEQ}` per school (sequences table, row-locked).

## 2. Students and enrollment
| Method | Path | Permission |
|---|---|---|
| GET | `/students?branchId=&sessionId=&classId=&sectionId=&status=&search=` | `students.view` (scoped) → `StudentSummary[]` |
| POST | `/students` | `students.add` — direct registration (bypassing admissions) `{ child, guardians, sectionId, admissionDate }` same shapes as ApplicationInput |
| GET | `/students/:id` | `students.view` → `StudentDetail` |
| PATCH | `/students/:id` | `students.edit` `{ firstName?, lastName?, dob?, gender?, bForm?, photoFileId?, address? }` |
| GET | `/students/:id/enrollments` | view → history (all sessions/branches) |
| POST | `/students/:id/withdraw` | `students.edit` `{ effectiveDate, reason }` → enrollment WITHDRAWN, student status WITHDRAWN |
| POST | `/students/:id/change-section` | `students.edit` `{ sectionId, effectiveDate, reason }` (same session & branch) |
| POST | `/students/:id/transfers` | `students.edit` `{ toBranchId, effectiveDate, reason }` → Transfer `REQUESTED` |
| GET | `/transfers?branchId=&direction=IN\|OUT&status=` | `students.view` |
| POST | `/transfers/:id/accept` | `students.edit` in **destination** branch `{ sectionId }` → source enrollment TRANSFERRED_OUT, new enrollment ACTIVE from effectiveDate |
| POST | `/transfers/:id/reject` · `/cancel` | destination / source `{ reason }` |
| POST | `/students/:id/id-card` | `students.view` → `{ jobId }`; job renders PDF; `GET /students/:id/id-card` → `{ status: "PENDING"\|"READY"\|"FAILED", fileUrl, version, generatedAt }` |
```ts
StudentSummary = { id, admissionNo, name, photoUrl, gender, dob, className, sectionName, sectionId, branchName, rollNo, status: "ACTIVE"|"WITHDRAWN"|"TRANSFERRED"|"GRADUATED", primaryGuardian: { name, phone } | null }
StudentDetail = StudentSummary & { firstName, lastName, bForm /*masked unless people.sensitive.view*/, address, admissionDate,
  enrollment: Enrollment | null, guardians: GuardianLink[], documents: Document[], medical: { allergies, conditions, notes } | null /*health.view only*/ }
Enrollment = { id, branchId, branchName, sessionId, sessionName, sectionId, className, sectionName, rollNo, startDate, endDate, status: "ACTIVE"|"WITHDRAWN"|"TRANSFERRED_OUT"|"PROMOTED"|"REPEATED"|"GRADUATED", reason }
Transfer = { id, student: {id,name,admissionNo}, fromBranch: {id,name}, toBranch: {id,name}, effectiveDate, reason, status: "REQUESTED"|"ACCEPTED"|"REJECTED"|"CANCELLED", createdAt }
```
Roll numbers auto-assigned per section (next free), editable via change-section.

## 3. Documents
| Method | Path | Permission |
|---|---|---|
| GET | `/documents?ownerType=STUDENT\|GUARDIAN\|STAFF\|APPLICATION&ownerId=` | view of owner module |
| POST | `/documents` | edit of owner module `{ ownerType, ownerId, docType, fileId, note? }` |
| POST | `/documents/:id/verify` · `/reject` | `students.edit` (or `staff.edit` for staff) `{ note? }` / `{ reason }` |
```ts
Document = { id, ownerType, ownerId, docType: "BIRTH_CERTIFICATE"|"B_FORM"|"CNIC"|"PHOTO"|"PREVIOUS_RESULT"|"LEAVING_CERTIFICATE"|"MEDICAL"|"OTHER",
             file: { id, url, mime, size }, status: "UPLOADED"|"VERIFIED"|"REJECTED", note, verifiedBy: {id,name}|null, verifiedAt }
```
Files upload via Phase 1 `POST /files` with `purpose: DOCUMENT` (or `STUDENT_PHOTO` / `STAFF_PHOTO`, images only).

## 4. Guardians and child links

**Parent logins are automatic.** Registering a student (`POST /students`) and confirming an admission (`POST /admissions/applications/:id/confirm`) give every guardian without a login a PARENT login with a generated temporary password (must change at first sign-in). Both responses add `parentLogins: ParentLogin[]`; confirm also adds `admissionNo`. `ParentLogin = { guardianId, guardianName, status: "CREATED"|"EXISTING"|"SKIPPED", email, phone, temporaryPassword (CREATED only, shown once), reason (SKIPPED only, e.g. the phone already signs in for another guardian) }`. A clash never blocks the admission. Audits record status only, never the password.
| Method | Path | Permission |
|---|---|---|
| GET | `/guardians?branchId=&search=` | `guardians.view` |
| GET | `/guardians/:id` | view → `Guardian & { login: {email,phone,status,mustChangePassword,lastLoginAt} \| null, children: {studentId,admissionNo,name,className,sectionName,relation,status}[] }` |
| PATCH | `/guardians/:id` | `guardians.edit` |
| POST | `/guardians/:id/account` | `guardians.edit` → creates/attaches PARENT user (login = guardian phone/email, or any linked child's admission number), returns `{ userId, email, phone, temporaryPassword }` once |
| POST | `/guardians/:id/account/reset-password` | `guardians.edit` + `users.edit` → `{ userId, temporaryPassword }` once; must change at next sign-in, all sessions revoked. Refused (403) for a login that also holds a staff role (reset it from Users). Audited `guardian.account_reset_password` |
| POST | `/guardians/:id/account/send-sign-in` | `guardians.edit` → emails/SMSes sign-in steps (never a password) to the parent login; `{ channels: ("EMAIL"\|"SMS")[] }`. Audited |
| POST | `/students/:id/guardians` | `students.edit` `{ guardianId? , guardian?: GuardianInput, relation, isPrimary }` → link VERIFIED (staff-created); returns `GuardianLink & { parentLogin: ParentLogin \| null }` — the guardian gets a parent login if they had none |
| DELETE | `/students/:id/guardians/:linkId` | `guardians.edit` `{ reason }` → REVOKED (immediate) |
| POST | `/child-links/request` | PARENT (self) `{ admissionNo, dob, relation }` → sends OTP to the phone on the student's primary guardian record; returns `{ requestId, maskedPhone }` |
| POST | `/child-links/:requestId/otp` | PARENT `{ code }` → link REQUESTED + approval `CHILD_LINK` to principal/office |
| GET | `/child-links?status=REQUESTED&branchId=` | `guardians.view` |
| POST | `/child-links/:id/approve` · `/reject` | `guardians.edit` (through approval engine) |
| POST | `/guardians/me/contact-change` | PARENT `{ phone?, email?, address? }` → approval `CONTACT_CHANGE`; applied on approval, old value in history |
```ts
GuardianInput = { name, relation, cnic?, phone, email?, occupation?, address? }
Guardian = GuardianInput & { id, cnic /*masked*/, userId: string|null, hasAccount: boolean }
GuardianLink = { id, guardian: Guardian, relation, isPrimary, status: "REQUESTED"|"VERIFIED"|"REJECTED"|"REVOKED", verifiedAt }
ChildLinkRequest = { id, guardian: {id,name,phone}, student: {id,name,admissionNo,className,sectionName}, relation, status, createdAt }
```
Dev: OTP codes are logged by the notification adapter (and returned as `devCode` only when `NODE_ENV=development`).

## 5. Staff
| Method | Path | Permission |
|---|---|---|
| GET | `/staff?branchId=&designation=&status=&search=` | `staff.view` → `StaffSummary[]` |
| POST | `/staff` | `staff.add` `{ name, email?, phone?, employeeNo?, designation, joinDate, branchId, cnic?, qualification?, photoFileId?, createAccount: boolean, roleKey?: "TEACHER"\|"HELPER"\|"COORDINATOR"\|"HEAD_TEACHER"\|"ACCOUNTANT" }` → returns `{ staff, temporaryPassword? }` |
| GET/PATCH | `/staff/:id` | view / `staff.edit` |
| POST | `/staff/:id/status` | `staff.edit` `{ status: "ACTIVE"\|"ON_LEAVE"\|"RESIGNED"\|"TERMINATED", effectiveDate, reason }` (RESIGNED/TERMINATED disables the account and ends assignments) |
| PUT | `/staff/:id/probation` | `staff.edit` (PRINCIPAL) `{ requiresReview: boolean, reviewerUserId? }` — reviewer must be COORDINATOR/HEAD_TEACHER/PRINCIPAL of same branch |
| GET | `/staff/:id/assignments?sessionId=` | view |
| POST | `/staff/:id/assignments` | `staff.edit` `AssignmentInput2` |
| DELETE | `/staff/:id/assignments/:assignmentId` | `staff.edit` (ends it; history kept) |
| GET | `/staff/:id/workload?sessionId=` | view → `{ periodsPerWeek, sections, subjects }` |
| GET | `/sections/:id/staff` | `classes.view` → class teacher, subject teachers, helpers |
```ts
AssignmentInput2 = { kind: "CLASS_TEACHER"|"SUBJECT_TEACHER"|"HELPER"|"COORDINATOR"|"HEAD_TEACHER", sessionId,
  branchId, sectionId?, subjectId?, responsibleStaffId? /*HELPER*/, validUntil? /*substitute*/, isSubstitute?: boolean }
StaffSummary = { id, userId, name, photoUrl, employeeNo, designation, branchName, status, roles: RoleKey[], requiresReview, reviewer: {id,name}|null, sectionCount, subjectCount }
StaffDetail = StaffSummary & { email, phone, cnic /*masked*/, qualification, joinDate, assignments: StaffAssignment[], documents: Document[] }
StaffAssignment = { id, kind, sessionId, sectionId, sectionName, className, subjectId, subjectName, responsibleStaff: {id,name}|null, validUntil, isSubstitute }
```
Rules: one CLASS_TEACHER per section per session (409); one SUBJECT_TEACHER per (section, subject) unless `isSubstitute`; assignments sync `role_assignments` (SECTION / SUBJECT_SECTION / BRANCH scope); expiry handled by nightly `maintenance.expireAssignments` job. `Section.classTeacher` in Phase 1 DTOs is now filled.

## 6. Timetable
```
Timetable (per section per session): DRAFT → PUBLISHED ; PUBLISHED → (edit) DRAFT_REVISION → PUBLISHED (version+1)
```
| Method | Path | Permission |
|---|---|---|
| GET/PUT | `/branches/:id/periods` | `timetable.view` / `timetable.edit` `{ periods: { index, startTime, endTime, isBreak, label? }[] }` (bell schedule per branch) |
| GET | `/timetables?sectionId=` | view → current timetable (draft if editor, else published) |
| PUT | `/timetables/:sectionId/slots` | `timetable.edit` `{ sessionId, slots: { day 1..7, periodIndex, subjectId, staffId, roomId? }[] }` (replaces draft) |
| POST | `/timetables/:sectionId/check` | edit → `{ conflicts: Conflict[] }` (no state change) |
| POST | `/timetables/:sectionId/publish` | `timetable.publish` → 409 `CONFLICT` with `details.conflicts` if any; else PUBLISHED, notifies affected teachers |
| GET | `/timetables/teacher/:staffId?weekOf=` | view (teacher: own only) → `TeacherSlot[]` incl. overrides |
| GET | `/timetables/me?weekOf=` | TEACHER/HELPER own; PARENT `?studentId=` child's section |
| POST | `/timetable-overrides` | `timetable.edit` `{ sectionId, date, periodIndex, substituteStaffId, reason }` → notifies substitute |
| GET/DELETE | `/timetable-overrides?branchId=&date=` · `/:id` | view / edit |
```ts
Timetable = { sectionId, sessionId, status: "DRAFT"|"PUBLISHED"|"DRAFT_REVISION", version, publishedAt, slots: Slot[], periods: Period[] }
Slot = { day, periodIndex, subject: {id,name}, staff: {id,name}, room: {id,name}|null }
Conflict = { type: "TEACHER_DOUBLE_BOOKED"|"ROOM_DOUBLE_BOOKED"|"TEACHER_NOT_ASSIGNED"|"NON_WORKING_DAY"|"BREAK_PERIOD", day, periodIndex, message, otherSectionId? }
TeacherSlot = { date, day, periodIndex, startTime, endTime, section: {id,name,className}, subject: {id,name}, room, isSubstitute }
```

## 7. Syllabus and books
| Method | Path | Permission |
|---|---|---|
| GET | `/book-lists?branchId=&sessionId=&classId=` | `syllabus.view` (parent: child's class, APPROVED only) |
| PUT | `/book-lists/:classId/draft` | `syllabus.edit` `{ branchId, sessionId, items: { subjectId?, title, author?, publisher?, isbn?, isMandatory, priceMinor? }[] }` |
| POST | `/book-lists/:id/submit` · `/approve` · `/return` | edit / `syllabus.approve` `{ comment? }` — approving a new revision keeps the old one and notifies guardians of that class |
| GET | `/book-lists/:id/revisions` | view |
| GET | `/syllabus-plans?sectionId=&subjectId=&sessionId=` | view |
| PUT | `/syllabus-plans/draft` | edit `{ sectionId, subjectId, sessionId, chapters: { title, order, topics: { title, order, targetDate }[] }[] }` |
| POST | `/syllabus-plans/:id/submit` · `/approve` · `/return` | edit / `syllabus.approve` (approval type `SYLLABUS_PLAN`) |
| POST | `/syllabus-topics/:id/progress` | `syllabus.edit` (assigned teacher, helper draft not allowed, supervisor proxy allowed) `{ status: "NOT_STARTED"\|"IN_PROGRESS"\|"COMPLETED", completedOn?, note? }` **(P)** |
| GET | `/syllabus/coverage?branchId=&sessionId=&classId=` | view → per section/subject `{ total, completed, delayed, percent }` |
```ts
BookList = { id, branchId, sessionId, classId, className, revision, status: "DRAFT"|"SUBMITTED"|"APPROVED"|"RETURNED", items: BookItem[], approvedAt, comment }
SyllabusPlan = { id, sectionId, subjectId, subjectName, sessionId, revision, status, chapters: { id, title, order, topics: Topic[] }[], progress: { total, completed, delayed, percent } }
Topic = { id, title, order, targetDate, status, completedOn, isDelayed, pendingReview: boolean }
```
Weekly job `syllabus.delayReport` creates in-app notifications for the principal listing delayed topics.

## 8. Probation helper (used here, reused in Phase 3–4)
`ProbationGate.run(actor, action)` — if actor's staff record `requiresReview` and the action is reviewable, store the payload on an `ApprovalRequest(PROBATION_REVIEW, entityType, entityId, payload)` routed to `reviewerUserId`, return `202`-style result `{ status: "PENDING_REVIEW", approvalId }` (HTTP 200); the approval handler replays the action as the reviewer with `onBehalfOfStaffId`. In Phase 2 it gates `syllabus-topics/:id/progress`.

## 9. Seed additions (dev)
- Staff records for the demo teacher/coordinator/accountant + 3 more teachers; demo teacher = class teacher of Class 5-A and subject teacher of Maths in 5-A and 5-B; one teacher `newteacher@eschool.local` on probation reviewed by the coordinator.
- 40 students across Class 4–5 sections with guardians; `parent@eschool.local` VERIFIED to two children (one in 5-A, one in 4-B); `teacherparent@eschool.local` parent of one child in 4-A.
- Bell schedule (8 periods incl. a break) and a PUBLISHED timetable for 5-A and 5-B; approved book list and syllabus plan for 5-A Maths with some topics completed/delayed.
- 3 enquiries, 4 applications in different states, 2 waitlisted.

## Deviations (as implemented in SchoolApi)
Paths and documented fields are unchanged unless listed. Additions and clarifications:
- **Approvals**: `ApprovalRequest` (GET `/approvals`, `/approvals/:id`, decide) adds `payload`, the stored JSON snapshot (CONTACT_CHANGE `{guardianId,before,after}`, CHILD_LINK `{requestId,linkId}`, SYLLABUS_PLAN `{planId,revision}`, PROBATION_REVIEW `{action,payload,staffId,onBehalfOfStaffId}`).
- **Scope**: TEACHER/HELPER BRANCH-level role assignments are membership only (read branch config). Section data (students, timetables, syllabus, sections list, dashboard counts) comes from SECTION / SUBJECT_SECTION assignments synced from staff assignments. Teachers get `403 FORBIDDEN_SCOPE` for students outside their sections; parents get `404`.
- **Section** DTO now has `classTeacher: {id,name}|null` and a real `studentCount` (active enrollments).
- **`GET /me` children** are filled whenever the user holds PARENT (also when another role is active).
- **Admissions**: `POST /admissions/enquiries/:id/convert` takes `{ gender, dob? }` (dob required when the enquiry has none). `ApplicationInput.child` accepts optional `address`. Application responses add `branchId, sessionId, classId`; list endpoints return `documents: []` (detail returns them). A rejected application document moves SUBMITTED to DOCUMENTS_PENDING; a new upload moves it back. Applicant notices (test slot, decision, offer) go by SMS straight to the primary guardian phone (no account needed). `confirm` returns 200. `GET /admissions/waiting-list` is a plain array.
- **Students**: `POST /students` returns `StudentDetail` (201). `change-section` accepts optional `rollNo` (also the way to edit a roll number within the same section); the enrollment row moves and the old section/roll stays in the audit log. Withdraw is refused (409) while a transfer is open. Students list defaults to `status=ACTIVE`. Summary class/section fields are null only for students without any enrollment.
- **ID card**: `POST /students/:id/id-card` returns 200 `{ jobId }`, where `jobId` is the id of the card version being rendered (a still-PENDING card is reused). `GET` returns 404 when no card exists yet.
- **Transfers**: `Transfer` adds `decisionReason`. `GET /transfers` is paged.
- **Documents**: `GET /documents` returns a plain array; permission is checked per owner module (`students|guardians|staff|admissions` `.view` / `.edit`); verify/reject need `students.edit` (`staff.edit` for staff documents). Accepted file purposes: DOCUMENT, STUDENT_PHOTO, STAFF_PHOTO. New `FilePurpose` values `STUDENT_PHOTO`, `STAFF_PHOTO` (images only) and `ID_CARD` (system-generated, not uploadable).
- **Guardians**: `GET /guardians/:id` `children[]` adds `linkId` (the student_guardians id); `className/sectionName` are nullable. `POST /students/:id/guardians` and `DELETE .../:linkId` return the `GuardianLink`. `POST /guardians/:id/account` returns 201; `temporaryPassword` is `null` when an existing login was attached; a guardian that already has an account gives 409.
- **Child links**: `POST /child-links/request` and `/:id/otp` return 200, use the strict auth throttle and need `guardians.add` (PARENT holds it). The parent guardian record is created from their profile on first request (profile phone required). `/otp` returns `ChildLinkRequest`; a wrong or expired code gives 400. `ChildLinkRequest` adds `approvalId`; statuses are `OTP_PENDING|REQUESTED|VERIFIED|REJECTED|EXPIRED`. `GET /child-links` defaults to `status=REQUESTED`, managed branches only. `/approve` and `/reject` accept `{ comment? }`; `/reject` also accepts `{ reason }`. Decisions go through the approval engine (step = branch PRINCIPAL).
- **Contact change**: `POST /guardians/me/contact-change` (permission `guardians.add`) returns `{ approvalId, status }`; routed to the principal of a linked child's branch; one pending request at a time (409).
- **Staff**: `designation` is one of `TEACHER|HELPER|COORDINATOR|HEAD_TEACHER|ACCOUNTANT|OFFICE_STAFF|OTHER` (validated). `StaffSummary` adds `branchId`; `reviewer.id` is the reviewer's **user** id. `roleKey` defaults from the designation (else TEACHER); the login gets a BRANCH-scoped role. `POST /staff` returns 201 `{ staff: StaffDetail, temporaryPassword? }`. `DELETE /staff/:id/assignments/:assignmentId` returns the ended `StaffAssignment`. Nobody can change their own assignments or status (403). `PUT /staff/:id/probation`: PRINCIPAL or SUPER_ADMIN only; `reviewerUserId` defaults to the branch principal and must hold COORDINATOR/HEAD_TEACHER/PRINCIPAL in the staff branch. `GET /sections/:id/staff` returns `{ classTeacher: {id,name}|null, subjectTeachers: {staff,subject,isSubstitute}[], helpers: {staff,responsibleStaff}[] }`. Role sync: CLASS_TEACHER/HELPER to SECTION, SUBJECT_TEACHER to SUBJECT_SECTION, COORDINATOR/HEAD_TEACHER to SECTION or BRANCH.
- **Jobs**: `maintenance.expireAssignments` nightly (01:15) under BullMQ; with `JOBS_DRIVER=inline` it runs once at boot (not in tests). `syllabus.delayReport` weekly (Mon 07:00) on the `reports` queue (no boot run inline). `documents.idCard` on the `documents` queue, enqueued through the `domain_events` outbox after commit.
- **Timetable**: `Timetable.status` is `DRAFT` with empty slots when none exists. `TeacherSlot` adds `staff: {id,name}` (the substitute when overridden). `/timetables/me` for PARENT requires `studentId` (400 otherwise, 404 for a non-child). Teachers may read only their own `/timetables/teacher/:staffId`. `POST /timetables/:sectionId/check` returns 200. The check compares the draft with other sections' **published** slots in the same session; TEACHER_NOT_ASSIGNED accepts the class teacher for any subject. Override `DELETE` cancels (row kept with `cancelledAt`) and returns the override; `GET /timetable-overrides` returns a plain array of `{ id, sectionId, date, periodIndex, originalStaff, substituteStaff, reason, createdAt }`. Period indexes 1 to 20.
- **Book lists**: `id` is the book list id; actions act on its latest revision. Editing an APPROVED list starts a new DRAFT revision; editing while SUBMITTED gives 409. Drafts need management scope over the branch (coordinator/principal). Users without edit/approve see the latest APPROVED revision; parents only their children's classes.
- **Syllabus**: `SyllabusPlan` adds `approvalId` and `comment`. Re-planning an APPROVED plan bumps `revision` and keeps topic progress where chapter and topic titles match; a rejected plan becomes `RETURNED`. `POST /syllabus-topics/:id/progress` returns `{ status: "APPLIED"|"PENDING_REVIEW", approvalId, topic }`; the plan must be APPROVED; a topic with a pending review gives 409; `completedOn` defaults to today for COMPLETED. `GET /syllabus/coverage` rows: `{ sectionId, sectionName, className, subjectId, subjectName, total, completed, delayed, percent }`.
- **Dashboard** adds `students, staff, pendingAdmissions, pendingChildLinks` (0 for teachers/parents where not applicable).
- **Seed**: extra logins `teacher2@`, `teacher3@`, `newteacher@eschool.local` (password `Demo@1234`); `teacherparent@` also has a staff record. Applications are for Class 1: SUBMITTED, TEST_SCHEDULED, TEST_COMPLETED, OFFERED plus 2 WAITLISTED. 5-A also has an approved English plan (used for probation testing).
- **Not implemented yet**: offer-letter PDF, automatic waitlist EXPIRED, photo re-encode, transfer certificate.
