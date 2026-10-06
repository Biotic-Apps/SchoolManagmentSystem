# Phase 3 API Contract (Daily Operations)

Same conventions as phase1/phase2 contracts incl. their **Deviations** sections. Dates `YYYY-MM-DD`, times `HH:mm` 24h in the API (clients show 12-hour). Scope rules from Phase 2 apply (teacher → own sections, parent → verified children only, 404 for others).
Flows: [backendFlows.md](../backendFlows.md) §7–15, §22–23. Every mutation is audited.

Markers: **(P)** probation-gated via `ProbationGate` → `{ status: "PENDING_REVIEW", approvalId }`. **(H)** helper can only create/edit `DRAFT`; the responsible teacher finalises. **(X)** supervisor proxy allowed (`teacherwork.proxy`): record stores `performedById` + `onBehalfOfStaffId`. **(O)** Android may send offline with `clientRequestId` (idempotent: same id → same result, never a duplicate).

## 1. Student attendance
```
Register (section, date): (none) = UNMARKED → DRAFT → SUBMITTED → LOCKED
LOCKED → correction request → APPROVED applies new status (old kept in history)
```
| Method | Path | Permission |
|---|---|---|
| GET | `/attendance/registers?sectionId=&date=` | `attendance.view` → `Register` (if none: `{ status: "UNMARKED", entries: roster with status null }`) |
| PUT | `/attendance/registers` | `attendance.edit` `{ sectionId, date, entries: { studentId, status, remark? }[], clientRequestId? }` → DRAFT **(H)(X)(O)** |
| POST | `/attendance/registers/submit` | `attendance.submit` `{ sectionId, date, entries?, clientRequestId? }` → SUBMITTED **(P)(X)(O)**; `409 ALREADY_SUBMITTED` with current register if someone else submitted; `423 RECORD_LOCKED` after lock |
| POST | `/attendance/corrections` | `attendance.edit` `{ entryId, newStatus, reason }` → approval `ATTENDANCE_CORRECTION` (principal) |
| GET | `/attendance/students/:id?from=&to=` | view (parent: own child) → `{ entries: { date, status, remark }[], summary: { present, absent, late, leave, halfDay, unmarked, percent } }` |
| GET | `/attendance/summary?branchId=&date=` | view → per section `{ sectionId, className, sectionName, status, present, absent, late, leave, total }` |
| GET | `/attendance/unmarked?branchId=&date=` | view → sections with no SUBMITTED register (principal pending list) |
```ts
AttendanceStatus = "PRESENT"|"ABSENT"|"LATE"|"LEAVE"|"HALF_DAY"
Register = { id|null, sectionId, date, status: "UNMARKED"|"DRAFT"|"SUBMITTED"|"LOCKED"|"PENDING_REVIEW", version,
  submittedBy: {id,name}|null, onBehalfOf: {id,name}|null, lockedAt,
  entries: { entryId|null, studentId, name, rollNo, photoUrl, status: AttendanceStatus|null, remark, onLeave: boolean }[] }
```
Rules: **unmarked ≠ absent** (summary keeps them separate); students with approved leave are prefilled `LEAVE`; holidays/non-working days → `400 VALIDATION_FAILED` (`NON_WORKING_DAY`). Job `attendance.lock` at branch `attendance.lockTime` locks SUBMITTED registers and notifies class teachers of UNMARKED ones. On SUBMITTED (or approval), guardians of ABSENT/LATE students get one notification per day.

## 2. Staff attendance
| Method | Path | Permission |
|---|---|---|
| GET/PUT | `/staff-attendance?branchId=&date=` | `attendance.view` / `attendance.approve` (office/principal) `{ branchId, date, entries: { staffId, status, checkIn?, checkOut?, remark? }[] }` |
| GET | `/staff-attendance/me?from=&to=` | self → own records + summary |

## 3. Leave
```
SUBMITTED → APPROVED | REJECTED ; SUBMITTED → CANCELLED (by requester)
```
| Method | Path | Permission |
|---|---|---|
| POST | `/leave` | PARENT for own child `{ studentId, from, to, reason, attachmentFileId? }`; staff self `{ from, to, type: "CASUAL"\|"SICK"\|"ANNUAL"\|"UNPAID"\|"OTHER", reason }` |
| GET | `/leave?scope=mine\|review&status=&branchId=` | mine = requester; review = what the caller can decide |
| POST | `/leave/:id/approve` · `/reject` · `/cancel` | student leave: class teacher or principal; staff leave: principal (principal's own → super admin) `{ comment? }` |
```ts
Leave = { id, kind: "STUDENT"|"STAFF", subject: {id,name}, from, to, days, type, reason, status, requestedBy: {id,name}, decidedBy: {id,name}|null, comment, createdAt }
```

## 4. Daily diary and homework
```
DRAFT (H) → PUBLISHED                        (moderation off, not on probation)
DRAFT → SUBMITTED → PUBLISHED | RETURNED     (branch diary.moderation on → DIARY_MODERATION approval; or probation (P))
PUBLISHED: editable until diary.closingTime same day (revision kept), then 423
```
| Method | Path | Permission |
|---|---|---|
| GET | `/diary?sectionId=&date=&from=&to=` | `diary.view` (parent: child's section, PUBLISHED only) |
| PUT | `/diary` | `diary.edit` `{ sectionId, subjectId, date, topics, homework?, dueDate?, attachmentFileIds?: string[], clientRequestId? }` upsert DRAFT **(H)(X)(O)** |
| POST | `/diary/:id/publish` | `diary.publish` → PUBLISHED or SUBMITTED **(P)(X)(O)** |
| POST | `/diary/:id/return` | `diary.approve` `{ comment }` |
| GET | `/diary/missing?branchId=&date=` | view → section+subject slots from the published timetable with no PUBLISHED entry |
```ts
DiaryEntry = { id, sectionId, className, sectionName, subject: {id,name}, date, topics, homework, dueDate,
  attachments: { id, url, mime, name }[], status: "DRAFT"|"SUBMITTED"|"PUBLISHED"|"RETURNED"|"PENDING_REVIEW", revision,
  author: {id,name}, onBehalfOf: {id,name}|null, comment, publishedAt }
```
Publishing notifies the section's guardians. Job `diary.missingCheck` at `diary.closingTime`.

## 5. Activities (events, sports, trips, competitions)
```
PROPOSED → APPROVED | REJECTED → ANNOUNCED → ONGOING → COMPLETED ; any (not COMPLETED) → CANCELLED
Consent per student: PENDING → GRANTED | DECLINED   (no response = not consented)
```
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/activities?branchId=&type=&status=&from=&to=` | `activities.view` / `activities.add` `{ branchId, type: "EVENT"\|"SPORTS"\|"TRIP"\|"COMPETITION"\|"CLUB", title, description, startAt, endAt, venue?, audience: { sectionIds?: string[], classIds?: string[], wholeBranch?: boolean }, consentRequired, consentDeadline?, feeMinor?, maxParticipants? }` → PROPOSED (teacher) |
| GET/PATCH | `/activities/:id` | view / edit (PROPOSED only) |
| POST | `/activities/:id/approve` · `/reject` | `activities.approve` (principal) — approve → ANNOUNCED, notifies audience guardians (consent request if required) |
| POST | `/activities/:id/status` | `activities.edit` `{ status: "ONGOING"\|"COMPLETED"\|"CANCELLED", reason? }` |
| GET | `/activities/:id/consents` | view → per student `{ student, guardian, status, respondedAt }` + counts |
| POST | `/activities/:id/consents` | PARENT `{ studentId, decision: "GRANTED"\|"DECLINED", note? }` (before deadline) |
| GET/PUT | `/activities/:id/participants` | view / edit `{ participants: { studentId, role?, result?, position?, remarks? }[] }` — only GRANTED students when consent required (`409`) |
| GET | `/activities/mine?studentId=` | PARENT/student view of upcoming + consent pending |

## 6. Notices
`DRAFT → PUBLISHED → EXPIRED` (expiry job); teacher-authored notices need principal approval when branch setting `notices.requireApproval` (default true).
| Method | Path | Permission |
|---|---|---|
| GET | `/notices?branchId=&status=` | `notices.view` (recipients see PUBLISHED addressed to them) |
| POST | `/notices` | `notices.add` `{ title, body, audience: { schoolWide?, branchIds?, classIds?, sectionIds?, staffOnly?, guardianIds? }, attachmentFileIds?, expiresOn?, pinned? }` |
| PATCH | `/notices/:id` | edit (DRAFT) |
| POST | `/notices/:id/publish` | `notices.publish` (or approval request for teachers) |
| POST | `/notices/:id/read` | any recipient |
| GET | `/notices/:id/reads` | `notices.view` author/principal → read counts |

## 7. Messaging (parent ↔ staff)
| Method | Path | Permission |
|---|---|---|
| GET | `/messages/threads?studentId=&unread=` | `messages.view` (own threads; principal/coordinator may pass `scope=branch` read-only, audited) |
| POST | `/messages/threads` | `{ studentId, staffUserId?, subject, body, attachmentFileIds? }` — parent→teachers/office of linked child; staff→guardians of assigned students; target validated else 403 |
| GET | `/messages/threads/:id?before=` | participant → `{ thread, messages: Message[] }` (cursor paging) |
| POST | `/messages/threads/:id/messages` | participant `{ body, attachmentFileIds? }` |
| POST | `/messages/threads/:id/read` | participant |
```ts
Thread = { id, subject, student: {id,name,className,sectionName}, participants: {userId,name,role}[], lastMessage: {body,at,senderName}, unreadCount, closed }
Message = { id, threadId, sender: {userId,name,role}, body, attachments, sentAt, readByOthers: boolean }
```
Outside `messaging.officeHours` messages are delivered silently (no push) — returned `deliveredSilently: true`. Probation teachers' outgoing messages are reviewed when branch setting `messaging.reviewProbation` is true **(P)**.

## 8. Complaints (every role)
```
SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
any open → ESCALATED (level+1: principal, then super admin) ; RESOLVED → REOPENED (complainant, within 7 days)
```
| Method | Path | Permission |
|---|---|---|
| POST | `/complaints` | any authenticated `{ category: "ACADEMIC"\|"STAFF_BEHAVIOUR"\|"FACILITY"\|"TRANSPORT"\|"FEE"\|"SAFETY"\|"OTHER", subject, description, studentId?, againstUserId?, anonymous?, attachmentFileIds? }` |
| GET | `/complaints?box=mine\|assigned\|all&status=&category=` | mine = filed by me; assigned = routed to me; all = `complaints.view` branch-wide |
| GET | `/complaints/:id` | complainant, assignee, or principal/super admin |
| POST | `/complaints/:id/assign` | `complaints.edit` `{ assigneeUserId }` |
| POST | `/complaints/:id/updates` | assignee/complainant `{ message, status?: "IN_PROGRESS"\|"RESOLVED", attachmentFileIds? }` |
| POST | `/complaints/:id/escalate` · `/close` · `/reopen` | assignee/complainant per rules `{ reason? }` |
```ts
Complaint = { id, ticketNo, category, subject, description, status, escalationLevel, slaDueAt, overdue,
  complainant: {id,name,role} | null /*null when anonymous and viewer not principal/super admin*/, against: {id,name}|null,
  student: {id,name}|null, assignee: {id,name}|null, updates: { id, author: {id,name}|null, message, status, at }[], createdAt }
```
Routing on create: parent → class teacher (ACADEMIC) or office/principal (others); staff → coordinator/principal; principal → super admin; a complaint **against** a user is never routed to or visible to that user (also excluded from `assigned`). SLA hours per category (branch setting `complaints.slaHours`, default 48); hourly job `complaints.slaCheck` escalates overdue ones. `ticketNo` = `CMP-{YEAR}-{SEQ}`.

## 9. Meetings and appointments
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/meetings/slots?staffUserId=&from=&to=` | `meetings.view` / staff self `{ date, startTime, endTime, mode: "IN_PERSON"\|"PHONE"\|"VIDEO", location? }` (bulk: `slots: [...]`) |
| DELETE | `/meetings/slots/:id` | owner (OPEN only) |
| POST | `/meetings` | PARENT `{ slotId, studentId, agenda }` (books OPEN slot, 409 if taken) or staff `{ guardianId, studentId, date, startTime, endTime, mode, agenda }` (direct request) |
| GET | `/meetings?box=upcoming\|past&studentId=` | participants (principal: branch) |
| POST | `/meetings/:id/cancel` · `/complete` · `/no-show` | participant / staff `{ reason? }` · `{ notes, shareSummaryWithParent: boolean, summary?, followUps?: { title, ownerUserId, dueDate }[] }` |
| GET | `/follow-ups?mine=true&status=OPEN` · POST `/follow-ups/:id/done` | owner |
```ts
Meeting = { id, student: {id,name}, guardian: {id,name}, staff: {userId,name}, date, startTime, endTime, mode, location, agenda,
  status: "SCHEDULED"|"COMPLETED"|"CANCELLED"|"NO_SHOW", notes /*staff only*/, summary /*parent sees if shared*/, followUps }
```
Reminder notification 1 hour before (job).

## 10. Health and safety
| Method | Path | Permission |
|---|---|---|
| GET | `/students/:id/health` | `health.view` (teacher: assigned; parent: own child) → `HealthProfile` |
| PUT | `/students/:id/health` | `health.edit` (office/principal) |
| POST | `/students/:id/health/change-requests` | PARENT `{ changes: Partial<HealthProfile> }` → office verifies (approval `CONTACT_CHANGE` reused with `entityType: "HEALTH"`) |
| GET | `/health/alerts?sectionId=` | teacher/supervisor → students in section with allergies/medical instructions (shown on attendance/roster) |
| POST | `/health/incidents` | any staff `{ studentId, occurredAt, type: "INJURY"\|"ILLNESS"\|"ALLERGIC_REACTION"\|"OTHER", severity: "MINOR"\|"MODERATE"\|"SERIOUS", description, actionTaken, attachmentFileIds? }` → guardians notified immediately (critical, not mutable); SERIOUS → principal notified |
| GET | `/health/incidents?studentId=&branchId=&from=&to=` | `health.view` (parent: own child) |
| POST | `/health/incidents/:id/close` | `health.edit` `{ note? }` |
```ts
HealthProfile = { bloodGroup, allergies: { name, severity, reaction }[], conditions: string[], medications: { name, dose, schedule }[],
  instructions, doctor: { name, phone } | null, emergencyContacts: { name, relation, phone, priority }[], updatedAt }
```
Reading a health profile writes an audit entry (`READ`).

## 11. Pickup and departure
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/students/:id/pickup-persons` | `pickup.view` / PARENT add `{ name, relation, cnic?, phone, photoFileId? }` → `PENDING_VERIFICATION`; office `POST /pickup-persons/:id/verify` · `/revoke` |
| POST | `/early-leave` | PARENT `{ studentId, date, time, reason, pickupPersonId? }` or staff-initiated `{ studentId, date, time, reason }` → REQUESTED |
| GET | `/early-leave?branchId=&date=&status=` | `pickup.view` |
| POST | `/early-leave/:id/approve` · `/reject` | class teacher/principal |
| POST | `/departures` | gate/office (`pickup.edit`) `{ studentId, earlyLeaveId?, pickedUpBy: { pickupPersonId? , guardianId? }, at? }` → blocked `403 PICKUP_NOT_AUTHORIZED` + principal alert if picker not verified |
| GET | `/departures?branchId=&date=` | `pickup.view` |
Guardians notified on departure.

## 12. Principal workspace and dashboard
`GET /dashboard/pending?branchId=&date=` (`dashboard.view`, principal/coordinator) →
`{ unmarkedAttendance: number, missingDiaries: number, pendingApprovals: number, pendingLeave: number, openComplaints: number, overdueComplaints: number, delayedTopics: number, todayIncidents: number, earlyLeavesToday: number, staffAbsentToday: number }`.
`GET /dashboard/summary` adds `attendanceToday: { present, absent, late, unmarked }` (scoped).
Teacher: `GET /dashboard/teacher-today` → `{ periods: TeacherSlot[], registers: { sectionId, status }[], diariesPending: { sectionId, subjectId }[], unreadMessages, assignedComplaints }`.
Parent: `GET /dashboard/child-today?studentId=` → `{ attendance: { status }, diary: DiaryEntry[], notices: Notice[], consentsPending: number, nextMeeting: Meeting|null }`.

## 13. Notifications / devices
`POST /devices` (Phase 1) is used by Android with the FCM token. Push adapter: real FCM when `FCM_SERVICE_ACCOUNT_JSON` is set, otherwise logs (dev). Notification categories: `ATTENDANCE, DIARY, ACTIVITY, CONSENT, NOTICE, MESSAGE, COMPLAINT, MEETING, HEALTH, PICKUP, LEAVE, APPROVAL`. HEALTH and PICKUP are critical (cannot be muted). `GET/PUT /notifications/preferences` → `{ category, inApp: true, push: boolean }[]`.

## 14. Seed additions (dev)
- Fix siblings: `parent@`'s two children share the surname (e.g. Ayesha Javed 5-A, Omar Javed 4-B).
- Today and the previous 10 school days: attendance registers for 5-A (SUBMITTED/LOCKED) with mixed statuses; 5-B today UNMARKED.
- Diary entries for 5-A/5-B last 5 days; one DRAFT by a helper; one PENDING_REVIEW by `newteacher@`.
- 3 activities (sports day APPROVED with consent, a trip PROPOSED, a competition COMPLETED with results); 2 notices; 2 message threads between `parent@` and `teacher@`; 4 complaints in different states (one overdue); meeting slots for `teacher@` this week, one booked by `parent@`; health profiles with an allergy for one 5-A child; one minor incident; authorized pickup persons for `parent@`'s children; one early-leave request today.
- A `HELPER` demo account `helper@eschool.local` (5-A, responsible teacher = `teacher@`).

## Deviations (as implemented in SchoolApi)
Paths and documented fields are unchanged unless listed. Additions and clarifications:
- **Errors**: new codes `ALREADY_SUBMITTED` (409) and `PICKUP_NOT_AUTHORIZED` (403). Holidays/non-working days → `400 VALIDATION_FAILED` with `details: { reason: "NON_WORKING_DAY" }`. Dates in the future are refused for registers and diary entries (400).
- **Offline (O)**: `clientRequestId` (8–100 chars) is stored per user; a repeat returns the current record without applying again. Accepted on `PUT /attendance/registers`, `POST /attendance/registers/submit`, `PUT /diary` and in the body of `POST /diary/:id/publish`.
- **Attendance**: `Register` adds `approvalId` (pending probation review). `POST /attendance/registers/submit` returns 200; every roster student must be marked (students on approved leave default to `LEAVE`), else 400 with `details.studentIds`. `409 ALREADY_SUBMITTED` puts the current `Register` in `error.details`; a draft save on a submitted register is also 409 ALREADY_SUBMITTED; only the original submitter may re-submit before the lock; `PENDING_REVIEW` → 409 CONFLICT; LOCKED → 423. Who may mark: class teacher / helper / section supervisor of the section, or `teacherwork.proxy` with branch management scope (records `onBehalfOf` = class teacher). Parents get 404 on `/attendance/registers` (they use `/attendance/students/:id`). Helpers: drafts only (403 on submitted registers).
- **Attendance**: `POST /attendance/corrections` returns 201 `{ id, entryId, oldStatus, newStatus, reason, status, approvalId, createdAt }`; only for SUBMITTED/LOCKED registers; one pending correction per entry (409). `GET /attendance/students/:id` lists every working day in range (default last 30 days, max 366) with `status: null` for unmarked days; `summary.percent` = (present + late + ½·halfDay) / marked non-leave days, `null` when nothing is marked. `GET /attendance/summary` rows add `halfDay`; `GET /attendance/unmarked` rows are `{ sectionId, className, sectionName, status, classTeacher }`. Both take optional `date` (default today) and are limited to the caller's sections for teachers. Guardians of ABSENT/LATE students are notified once per student per day.
- **Jobs**: `attendance.lock` and `diary.missingCheck` run every 5 minutes and act once per branch per day after the branch's `attendance.lockTime` / `diary.closingTime` (server-local time); the lock job also locks older SUBMITTED registers. `complaints.slaCheck` hourly, `meetings.reminder` every 10 minutes, `notices.expire` daily 00:05.
- **Staff attendance**: `GET /staff-attendance` → `{ branchId, date, entries: { staff, designation, status|null, checkIn, checkOut, remark }[] }` (branch management scope); `PUT` takes the documented body and returns the same day view; `GET /staff-attendance/me` → `{ records: { date, status, checkIn, checkOut, remark }[], summary }` (default last 30 days).
- **Leave**: `POST /leave` with `studentId` is for parents (own child); without it, for staff (self). `type` is optional (student default `OTHER`, staff `CASUAL`); `days` counts working days; overlapping SUBMITTED/APPROVED leave → 409. Every leave creates a `LEAVE` approval (step PRINCIPAL; the principal's own → SUPER_ADMIN), so it can also be decided from `/approvals`. `Leave` adds `approvalId`. `GET /leave` returns a plain array (max 200); `scope` defaults to `mine`. Approved student leave turns that student's entries in unlocked registers to LEAVE; approved staff leave writes LEAVE staff attendance for the working days.
- **Diary**: `GET /diary` returns a plain array; `sectionId` is optional (staff: their scope; parents: their children's sections, PUBLISHED only); default date today, max range 62 days. `DiaryEntry` adds `approvalId`. Published entries can be edited by the author's side until `diary.closingTime` on the entry's day (revision +1, previous content kept in `diary_revisions`), afterwards 423; SUBMITTED/PENDING_REVIEW entries → 409; helpers editing a published entry → 403. Publish is allowed from DRAFT/RETURNED; with `diary.moderation` the entry becomes SUBMITTED with a `DIARY_MODERATION` approval (step PRINCIPAL). `POST /diary/:id/return` (branch management scope) works for SUBMITTED and PENDING_REVIEW entries. `GET /diary/missing` rows: `{ sectionId, className, sectionName, subject, teacher }`.
- **Dashboard**: `GET /dashboard/pending` is for non-teacher staff scopes (403 for teachers/parents); without `branchId` it sums all managed branches; unmarked/missing counts are 0 on non-working days. `attendanceToday.present` includes half days. `teacher-today` `registers` lists the caller's class sections. `child-today` (parents only, 404 otherwise): `notices` are `{ id, title, body, pinned, publishedAt, read }` (latest 5) and `nextMeeting` is `{ id, date, startTime, endTime, mode, location, agenda, status, staff: { userId, name } }`.
- **Notifications**: `GET /notifications/preferences` items add `critical`; `PUT` takes the array `{ category, push, inApp? }[]` (critical categories stay on) and returns the full list. Messages outside office hours create the in-app notification only (no push).
- **Branch settings**: new keys `notices.requireApproval` (true), `messaging.reviewProbation` (false), `complaints.slaHours` (48, or a per-category map).
- **Permissions**: TEACHER adds `notices.view/add`, `pickup.view`; COORDINATOR/HEAD_TEACHER add `notices.view/add`; PARENT adds `pickup.view/add`. Leave endpoints need no module permission (rules in the service).
- **Approvals**: a handler may be registered per `type` + `entityType` (used for `CONTACT_CHANGE` of `HEALTH`). New approval type `NOTICE`.
- **Seed**: `helper@eschool.local` (HELPER of 5-A, responsible teacher `teacher@`). parent@'s children are Ayesha Javed (5-A) and Omar Javed (4-B). The sports day is seeded as ANNOUNCED (approved). If today is not a working day, the latest seeded register is LOCKED instead of SUBMITTED.
- **Activities (§5)**: approval moves PROPOSED straight to ANNOUNCED (APPROVED is never stored; the seeded sports day is ANNOUNCED). A proposer cannot approve their own proposal (e.g. a principal's proposal needs a super admin). `POST /:id/status` and `PUT /:id/participants` are for the proposer or branch management (403 otherwise); participants editable while ANNOUNCED/ONGOING/COMPLETED (409 otherwise); cancel allowed from PROPOSED/APPROVED/ANNOUNCED/ONGOING. 409s for consent/audience violations carry `details: { studentIds }`; duplicate students → 409. `GET /:id/consents` is staff-only and items add `note`; `POST /:id/consents` needs `activities.view` (parents). `ActivityDto.myConsent` only in `/activities/mine`; parents see only their children as participants; participant items add `studentName`. `from`/`to` filter `startAt` (server-local days).
- **Notices (§6)**: `PATCH`/`publish` accept `notices.add|edit|publish`; only the author edits, only DRAFT; statuses add `PENDING_APPROVAL` and `REJECTED`. School-wide notices have `branchId: null`. Teachers may target only their own sections/branch (no `classIds`). `read` is false only for a recipient who has not opened it. The author is never a recipient.
- **Messaging (§7)**: added `GET /messages/recipients?studentId=` (`messages.view`) → `{ userId, name, role: "CLASS_TEACHER"|"SUBJECT_TEACHER"|"PRINCIPAL", subjectName? }[]` (one entry per user, subject names joined); parents 404 for other children, staff 403 outside scope. Exactly this list is accepted as `staffUserId` from parents (default class teacher; none → 409); there is no office role. A parent's thread has the parent and the chosen staff; a staff thread includes every verified guardian with a login. Message adds `status` (`SENT|PENDING_REVIEW|REJECTED`) and `deliveredSilently`; held/rejected messages are visible only to their sender and never unread. `GET /messages/threads` also accepts `branchId`; `scope=branch` only for PRINCIPAL/COORDINATOR/HEAD_TEACHER/SUPER_ADMIN (managed branches, `unreadCount` 0, audited `messages.branch_view`, read-only → posting 403). Non-participants get 404.
- **Section staff**: `GET /sections/:id/staff` entries (`classTeacher`, `subjectTeachers[].staff`, `helpers[].staff`) add `userId` (null when the staff member has no login).
- **Complaints (§8)**: `GET /complaints` is paged; list items carry `updates: []` (detail and action responses include them). Complaint and each update add `attachments: { id, url, mime, name }[]`. Branch managers who see a complaint under `box=all` (e.g. coordinator) may open it; anonymous complainants stay masked for them. There is no office role: non-academic parent complaints go to the principal; when nobody is eligible the complaint stays SUBMITTED without assignee. The person a complaint is about gets 404 and never sees it in any box; assigning it to them → 403. Setting a status without being the assignee → 403; actions on closed/non-open complaints → 409; escalating beyond level 2 → 409. Reopen resets `slaDueAt` and clears `resolvedAt`. `complaints.slaHours` accepts a number or a per-category map (`{ ACADEMIC: 24, ... }`), default 48. Every status change adds an update row (SLA job rows have `author: null`).
- **Meetings (§9)**: `GET /meetings` is paged; `GET /meetings/:id` added; follow-ups add `meetingId`. Parents see OPEN slots from today on in their children's branches; staff see non-cancelled slots in readable branches; `from` defaults to today. Overlapping slots of the same staff → 409. `DELETE /meetings/slots/:id` cancels the slot (soft delete; non-owner 404, non-OPEN 409). Parent booking without `slotId` → 400; staff with `slotId` → 403; staff direct request needs a VERIFIED guardian link (else 404). cancel/complete/no-show only on SCHEDULED (409); cancelling reopens the slot. `GET /follow-ups?mine=false` is for principal/super admin (managed branches); done by non-owner → 404, already DONE → 409. Reminder 60 minutes before (server-local time).
- **Health (§10)**: allergy `severity` is `MILD|MODERATE|SEVERE`; `reaction`, medication `dose`/`schedule` and `bloodGroup` are nullable. Reads are audited as `health.read` (entityType `Student`). HELPER gets only `allergies` and `instructions` (other fields empty/null). Change requests are PARENT-only (403 for staff), one PENDING per student (409), empty `changes` → 400; response 201 `{ approvalId, status: "PENDING" }`. The structured profile is mirrored into the Phase 2 `medical` text fields (allergies, conditions, notes = instructions).
- **Incidents**: `POST /health/incidents` needs `health.view` (403 for parents); status `PARENT_NOTIFIED` when at least one guardian with a login was notified, else `REPORTED`; closing a CLOSED incident → 409; `GET` is paged; `from`/`to` are `YYYY-MM-DD` (inclusive).
- **Pickup (§11)**: `cnic` masked as `*****-*******-1` without `people.sensitive.view`; phone normalised; adding a person notifies the principal silently; verify/revoke notify guardians; a REVOKED person cannot be re-verified (409). `POST /early-leave` needs `pickup.add` or `pickup.view`; a `pickupPersonId` that is not VERIFIED for the student → 400; one REQUESTED/APPROVED early leave per student per date (409); decisions go through an `EARLY_LEAVE` approval (also decidable from `/approvals`). Approve/reject need `pickup.view`/`pickup.approve` plus class teacher or branch management scope (200).
- **Departures**: exactly one of `pickedUpBy.pickupPersonId` / `guardianId` (else 400); `earlyLeaveId` of another student → 400, not APPROVED → 409; blocked pickup → 403 `PICKUP_NOT_AUTHORIZED` with `details.reason` (audited, principal alerted). `GET /early-leave` and `GET /departures` return plain arrays.
