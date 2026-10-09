# eSchool — Backend Flows

Every flow is a state machine. For each: states, transitions (who may do them), side effects, and background jobs. "Notify" means enqueue on the `notifications` queue (in-app + push, plus email/SMS where configured). Every transition writes an audit entry.

Shared conventions:
- `performedById` = logged-in user; `onBehalfOfStaffId` set when a supervisor works as a teacher (proxy).
- If the acting teacher is on **probation**, any transition marked **(P)** becomes `PENDING_REVIEW` and creates an approval request (`PROBATION_REVIEW`). On approval the original transition is executed with the reviewer recorded.
- Helper actions marked **(H)** only produce `DRAFT`.
- "Locked" records can only change through a correction approval that keeps the old value, new value and reason.

---

## 1. Setup flows

### 1.1 School and branch
`School: ACTIVE ⇄ ARCHIVED` — SUPER_ADMIN only. Archive blocks new logins for that school's branches but keeps all data readable for Super Admin.
`Branch: ACTIVE ⇄ ARCHIVED` — SUPER_ADMIN. Branch has timings, working days, contacts, responsible principal.

### 1.2 Principal assignment / change
1. Super Admin creates user (or selects existing) and a `RoleAssignment(PRINCIPAL, BRANCH)`.
2. On change: old assignment gets `validUntil = now`; refresh tokens tied to that role are revoked; pending approval requests where old principal was approver are **reassigned** to the new principal (job `approvals.reassign`).
3. Notify both.

### 1.3 Academic session
`DRAFT → ACTIVE → CLOSED`. Only one ACTIVE session per branch. Closing requires: results published or explicitly skipped, promotions decided. Closed sessions are read-only, never deleted.

### 1.4 Classes and sections
Unique `(branchId, sessionId, classId, sectionName)`. Capacity enforced on enrollment (override needs principal permission and is audited).

---

## 2. Admissions

```
ENQUIRY → APPLICATION_SUBMITTED → DOCUMENTS_PENDING → TEST_SCHEDULED → TEST_COMPLETED
       → OFFERED | WAITLISTED | REJECTED
OFFERED → CONFIRMED (fee paid/waived) → ENROLLED
WAITLISTED → OFFERED (when seat frees, by position) | EXPIRED
any → WITHDRAWN
```
| Step | Who | Side effects |
|---|---|---|
| Enquiry | Office/Principal, or public form | Lead record, follow-up date |
| Application | Office, Parent (web) | Admission form, guardian details, documents upload |
| Document verification | Office/Principal | Each document `UPLOADED → VERIFIED / REJECTED(reason)` |
| Entrance test | Principal sets schedule; teacher records score | Notify guardian with slot |
| Decision | Principal (approval `ADMISSION`) | Offer letter PDF job |
| Waiting list | Auto position per class/session | Seat release → notify next |
| Confirmation | Accountant records admission fee or waiver | Creates Student + Guardian link (verified) + Enrollment, admission number generated (`{SCHOOL}-{YEAR}-{SEQ}`), ID card job |

## 3. Students, guardians and documents

### 3.1 Enrollment
`ACTIVE → WITHDRAWN | TRANSFERRED_OUT | GRADUATED`; `PROMOTED / REPEATED` create a new enrollment in the next session. Previous enrollments keep attendance, results and dues.

### 3.2 Transfer between branches
Principal (source) requests → destination principal accepts section placement → effective date recorded → source enrollment ends, destination starts. Open dues stay on original invoices. Transfer certificate optional.

### 3.3 Parent / guardian link
```
REQUESTED → VERIFIED | REJECTED
VERIFIED → REVOKED
```
Parent can request link (child admission no + DOB + OTP to registered phone). Principal/office approves (`CHILD_LINK`). Only VERIFIED links grant access. Contact changes (`CONTACT_CHANGE`) are approved before replacing the verified contact; old value kept in history.

### 3.4 Student ID card
Job `documents.idCard` renders PDF (photo, name, class, admission no, QR with student public id, branch contact). Reprint increments version.

## 4. Staff

- Staff profile: employment status `ACTIVE | ON_LEAVE | RESIGNED | TERMINATED`.
- Assignments: class teacher (SECTION), subject teacher (SUBJECT_SECTION), helper (SECTION, responsible teacher), coordinator/head teacher (BRANCH or class range).
- Substitute: assignment with `validUntil`; nightly job `maintenance.expireAssignments`.
- Probation: principal sets `requiresReview` + reviewer; removing it is audited.
- Disable account: all sessions revoked instantly; pending items of the user listed for reassignment.

## 5. Timetable
```
DRAFT → CONFLICT_CHECKED → PUBLISHED → (change) DRAFT_REVISION → PUBLISHED
```
Conflict check (sync, small): same teacher/room in same period/day; section double-booked; teacher outside branch working days. Publish requires `timetable.publish` (Principal). Substitute assignment for a day creates `TimetableOverride` and notifies teacher.

## 6. Syllabus and books (retired 2026-10-10)
- Removed by owner decision; tables kept for data, no endpoints or jobs.

## 7. Attendance

### 7.1 Student attendance (per section per day)
```
(no register) = UNMARKED  ← never treated as absent
DRAFT (H allowed) → SUBMITTED (P) → LOCKED (at branch lock time)
LOCKED → correction request → APPROVED → new value with history
```
- Entry statuses: `PRESENT, ABSENT, LATE, LEAVE (approved), HALF_DAY`.
- Submit before branch deadline; after lock time job `attendance.lock` locks all submitted registers and lists unmarked ones on the principal's pending list (and notifies class teacher).
- On submit (or approval if probation): notify guardians of absent/late students only once per day.
- Supervisor proxy allowed.
- Offline: Android sends with `clientRequestId` (idempotent). If register already submitted by another user, server returns `409 ALREADY_SUBMITTED` with current state.

### 7.2 Staff attendance
Marked by office/principal or self check-in (if enabled). Same statuses; separate register. Feeds payroll.

### 7.3 Leave
```
Student leave (parent): SUBMITTED → APPROVED | REJECTED (class teacher/principal)
Staff leave: SUBMITTED → APPROVED | REJECTED (principal; principal's own → super admin)
```
Approved leave auto-fills `LEAVE` in attendance for those dates.

## 8. Daily diary and homework
```
DRAFT (H) → PUBLISHED                         (moderation off, teacher not on probation)
DRAFT → SUBMITTED → PUBLISHED | RETURNED      (moderation on, or probation (P))
PUBLISHED → EDITED (keeps revision)           (allowed until end of day; afterwards correction)
```
Entry: date, section, subject, taught topics, homework, due date, attachments. Publishing notifies guardians of that section. Job `diary.missingCheck` at branch closing time lists sections without a diary on principal's pending list.

## 9. Activities, sports, trips, competitions
```
PROPOSED (teacher) → APPROVED | REJECTED (principal) → ANNOUNCED → ONGOING → COMPLETED | CANCELLED
```
- Types: EVENT, SPORTS, TRIP, COMPETITION, CLUB.
- If `consentRequired`: each guardian gets a permission slip `PENDING → GRANTED | DECLINED`. **No response = not consented** — student excluded until GRANTED.
- Participation record per student: role, result/position, certificate eligibility.
- Fees for trips (optional) create invoice lines.

## 10. Notices
`DRAFT → PUBLISHED (→ EXPIRED)`; audience = school / branch / class / section / staff only / specific guardians. Teacher notices need principal approval (P/role setting). Read receipts stored.

## 11. Messaging (parent ↔ teacher)
- Thread = guardian + staff + student context. A guardian can message teachers of their linked children; teachers can message guardians of assigned students only.
- Office hours setting: messages outside hours delivered silently.
- Principal/Coordinator can view threads in scope (audit logged) for safeguarding.
- Attachments via file service. Probation teacher outgoing messages optionally reviewed (branch setting).

## 12. Complaints (all roles)
```
SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
                       ↘ ESCALATED (to principal, then super admin)
RESOLVED → REOPENED (by complainant within N days)
```
- Who can file: every role. Categories: academic, staff behaviour, facility, transport, fee, safety, other. Optional anonymous-to-target (identity visible only to principal/super admin).
- Routing: parent → class teacher/office per category; teacher/staff → coordinator/principal; principal → super admin; complaint **about** a person never routes to that person.
- SLA per category; job `complaints.slaCheck` escalates overdue ones.
- Response and final status recorded; complainant notified on every status change.

## 13. Meetings and appointments
```
Slot: OPEN → BOOKED → COMPLETED | CANCELLED | NO_SHOW
Request: REQUESTED → SCHEDULED → COMPLETED (notes + follow-ups)
```
Staff publish availability slots; parents book. Meeting notes visible to staff; summary optionally shared with parent. Follow-up actions: `OPEN → DONE` with owner + due date, appear in owner's tasks.

## 14. Health and safety
- Student health profile: emergency contacts (ordered), allergies, conditions, medications, medical instructions, doctor contact. Parent proposes changes → office verifies.
- First-aid incident: `REPORTED → PARENT_NOTIFIED → CLOSED`; recorded by any staff; immediate high-priority notification to guardians; serious incidents escalate to principal.
- Medical data visible only to roles with `health.view` in scope (see security.md).

## 15. Pickup and departure
- Authorized pickup persons per student (name, relation, CNIC/ID, phone, photo) — added by parent, verified by office.
- Early leave: parent request or school-initiated → `REQUESTED → APPROVED | REJECTED` (class teacher/principal) → `DEPARTED` (gate staff records who picked up, time).
- Departure log: picker must be in authorized list or guardian; otherwise blocked and principal alerted.
- Guardian notified on departure.

## 16. Exams, results and promotion
```
Exam: DRAFT → SCHEDULED → MARKS_OPEN → MARKS_CLOSED → RESULTS_APPROVED → PUBLISHED
Marks (per subject per section): NOT_ENTERED → DRAFT → SUBMITTED (P) → RETURNED | ACCEPTED
```
- Grading rules (bands, pass marks, weightage) approved per session.
- Missing marks stay `PENDING` — never auto zero; absent recorded as `ABSENT` explicitly.
- Principal reviews completeness → approves (`RESULT_PUBLISH`) → job `documents.reportCards` renders PDFs → publish notifies guardians.
- Promotion at term end: system suggests `PROMOTE | REPEAT | CONDITIONAL` from rules; principal confirms (`PROMOTION`); confirmed decisions create next-session enrollments from effective date.

## 17. Fees, payments and dues

### 17.1 Structure and invoices
- Fee heads (tuition, admission, exam, transport, trip...) and fee plans per class/session; due day, late fee rule.
- Monthly job `fees.generateInvoices` creates `DRAFT` invoices → finance reviews → `ISSUED` (notify guardians).
```
Invoice: DRAFT → ISSUED → PARTIALLY_PAID → PAID
                       ↘ OVERDUE (job) ; CANCELLED (approval, reason)
```
### 17.2 Payments
```
Proof upload (parent): SUBMITTED → VERIFIED (creates Payment) | REJECTED(reason)
Payment (cashier/gateway): RECORDED → ALLOCATED to invoice lines
Reversal: request → approval (PAYMENT_REVERSAL) → reversing ledger entry
```
- **Uploaded proof alone never marks paid.** Only verified payments allocate.
- Gateway adapter (`initiate`, `verifyCallback`, `refund`) — Manual gateway now.
- Receipt PDF job on each payment; receipt numbers sequential per branch.
### 17.3 Concessions and refunds
Request with reason → approval by authorized approver within amount limit (above limit escalates). Applied as negative ledger lines; never edit original amounts.
### 17.4 Dues and daily collections
Balance = sum(ledger). Old dues stay linked to original invoice. Daily collection report (job at day end) per cashier and mode (cash/bank/online), with cash closing confirmation by accountant.

## 18. Payroll
```
Run (month, branch): DRAFT → CALCULATED → REVIEWED → APPROVED → PARTIALLY_PAID → PAID → CLOSED
```
- Inputs: salary structure (basic, allowances, deductions), staff attendance, unpaid leave, approved adjustments.
- Job `payroll.calculate` produces lines; finance reviews; approver approves (`PAYROLL`); principal's own line requires higher admin.
- Payments recorded separately (amount, date, mode, reference); partial payments keep visible balance.
- Payslip PDF job; staff see only their own payslips.

## 19. Expenses and vendors
```
Expense / vendor bill: DRAFT → SUBMITTED → APPROVED | REJECTED → PAID (partial allowed)
```
Categories: rent, utilities, supplies, repairs, maintenance, transport, other. Attach bill images. Approval limits per role. Recurring expenses (rent) generate drafts monthly.

## 20. Inventory and purchasing
- Items (furniture, computers, stationery, uniforms, books) with category, unit, reorder level; fixed assets get asset tags + location + condition.
- Purchase request `DRAFT → APPROVED → ORDERED (PO) → RECEIVED (partial ok) → BILLED` → links to vendor bill.
- Stock movements (IN, OUT/issue, ADJUST with reason, TRANSFER between branches) — stock = sum(movements). Uniform/book sales can create invoice lines.
- Low stock job notifies store keeper.

## 21. Certificates
Types: SCHOOL_LEAVING, TRANSFER, CHARACTER, ATTENDANCE, ACHIEVEMENT.
`REQUESTED → APPROVED (principal) → ISSUED (PDF, serial no, QR verification)`; leaving/transfer certificate checks clearance (dues, library, inventory). Reissue keeps original serial with "duplicate" mark.

## 22. Parent requests (generic)
Correction / information requests: `SUBMITTED → ASSIGNED (teacher or office) → RESOLVED | ESCALATED (principal) → CLOSED`. Response and final status recorded.

## 23. Notifications
- Channels: IN_APP (always), PUSH (FCM), EMAIL, SMS (adapters).
- Delivery log per recipient/channel: `QUEUED → SENT → DELIVERED | FAILED(retry n)`; failures after retries listed in Settings › Failed notifications for manual resend.
- User preferences per category; critical (health incident, pickup) cannot be muted.

## 24. Reports and dashboards
- Dashboard counters served from lightweight aggregate queries with short cache (Redis, 60 s) and scope.
- Heavy reports (fee aging, payroll summary, attendance %, results analysis, branch comparison) → `reports` queue → file in storage → signed link.

## 25. Scheduled jobs (summary)
| Job | When |
|---|---|
| attendance.lock + unmarked list | Branch lock time daily |
| diary.missingCheck | Branch closing time daily |
| fees.generateInvoices | Monthly per plan |
| fees.markOverdue | Daily |
| fees.dailyCollection | End of day |
| complaints.slaCheck | Hourly |
| maintenance.expireAssignments | Nightly |
| expenses.recurring | Monthly |
| inventory.lowStock | Daily |
| notifications.retryFailed | Every 10 min |
| maintenance.backup + restore verification | Nightly / weekly |
