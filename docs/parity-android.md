# Web / Android Parity

Snapshot **2026-10-08** (after `9fb30fe`). Static comparison of the web panel (`SchoolWeb/src/app/(portal)/**`, `SchoolWeb/src/features/**`, menu from `docs/navigation.md` + `SchoolWeb/src/config/navigation.ts`) with the Android app (`SchoolApp/feature/**`, `core/network/.../api/*Api.kt`, `core/navigation`, `app/.../navigation/AppShellContent.kt`), plus read-only GETs against the local API for every Retrofit `GET` with all 8 demo roles to confirm DTO shapes.

**Legend:** ✅ same · ⚠️ partial (what is missing is named) · ❌ missing · 🚧 placeholder screen (`feature/home/components/MenuPlaceholder.kt`, "Manage this on the web panel") · 🐞 suspected bug · ⏳ **in progress** (another agent is adding principal management right now: class setup, subjects/rooms, bell schedule, timetable builder, students add/edit, fee plan; not analysed again here).

**Contract checks (all pass unless listed as 🐞):**
- All **176 Retrofit paths** (and the 7 offline-outbox paths in `core/data`: `attendance/registers`, `attendance/registers/submit`, `diary`, `diary/{id}/publish`, `mark-sheets/{id}`, `mark-sheets/{id}/submit`, `payments`) exist in the API controllers with the same HTTP method.
- **Request bodies:** every app `@Body` DTO was compared field by field with the controller's `@Body` class. The API runs `ValidationPipe({ whitelist, forbidNonWhitelisted })`. No extra or missing required top-level fields were found.
- **Responses:** `NetworkJson` is lenient (`ignoreUnknownKeys`, `coerceInputValues`). No response fails to decode. The 🐞 items are fields the app reads under a name the API never sends, so the UI shows blank or zero values.

**Android menu routing:** `AppShellContent.menuScreens` maps every catalogue id except `schools, users, roles, expenses, inventory, reports, settings`. Those ids show the web-only placeholder (`WebOnlyModules`).

---

## SUPER_ADMIN

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard | summary tiles, scope bar, setup checklist | `feature/dashboard` supervisor grid + `SetupChecklistCard` | ✅ |
| dashboard › setup wizard | one-form school provisioning (`school-setup/SetupWizard`) | none | ❌ |
| schools | add, edit, logo, status/archive, restore, permanent delete (`schools/*`) | placeholder | 🚧 |
| branches | add, edit, settings, status, change principal | `organisation/branches` list + read-only detail | ⚠️ view only |
| users | add, edit, assignments, reset password, status/unlock | placeholder | 🚧 |
| roles | role add/edit/delete, permission matrix | placeholder | 🚧 |
| sessions | sessions/terms/events add/edit/delete, transitions | `SessionsCalendarRoute` read-only | ⚠️ view only |
| classes | overview, class setup, sections, subjects, rooms, allocation | `ClassesRoute` read-only overview | ⏳ |
| students | search, register, edit, transfer/accept, withdraw, change section, ID card, guardians, documents upload, enrolments, history | section → roster → read-only profile (`students/*`) | ⚠️ ⏳ add/edit; ❌ search, transfer, withdraw, change section, ID card, doc upload |
| admissions | enquiries, application add/edit, test schedule/result, waiting list, decide, confirm admission, documents | list + detail + decide (`admissions`) | ⚠️ decide only |
| guardians | list, edit, link/unlink child, link requests | list + link-request tab (approve via Approvals) | ⚠️ no edit, link or unlink |
| staff | add, edit, status, assign classes, sign-in create/reset, probation, assignments tab, workload | `feature/staff` add, edit, status, assign classes, sign-in, workload | ⚠️ no probation, no generic assignments tab |
| timetable | builder, bell schedule, substitutions/overrides, teacher week | `TimetableAdminRoute` + Substitutions tab (list by date; assign/remove with `timetable.edit`) | ⏳ builder and bell; ✅ substitutions |
| diary | missing list, moderation, return | `SupervisorDiaryRoute` | ✅ |
| activities | add/edit, approve/reject, start/complete/cancel, participants, consent tracker | list, propose, approve/reject, consent summary | ⚠️ no lifecycle, participants edit or edit |
| notices | compose (audience), publish, pin, expiry, edit/archive, read receipts | feed + compose + publish | ⚠️ no edit, archive or read receipts |
| attendance | branch summary, registers, corrections, staff attendance, leave review, student history | `SupervisorAttendanceRoute` (classes + staff mark), leave review | ✅ |
| exams | exam add/edit, schedule, grading schemes, completeness, accept/return, results, publish, report cards, promotions | completeness + sheet review (`exams/board`, `review`) | ⚠️ no setup, results, publish or promotions |
| fees | overview, structure (heads/plans), invoices generate/issue/cancel, payments, receipts, reversals, refunds, concessions, proofs verify, dues + reminders, close day, ledger | Today (close day, payment sheet: receipt/refund/reverse), Dues (+ reminders), Proofs verify, Record payment, invoice/receipt (`feature/fees`) | ⚠️ ⏳ fee plan; ❌ invoicing, concessions, ledger |
| payroll | structures, adjustments, run create/calculate/review/approve/close, payments, payslips | runs list + run detail + approve (`feature/payroll`) | ⚠️ view and approve only |
| expenses | expenses, categories, vendors, payments | placeholder | 🚧 |
| inventory | items, stock, movements, purchasing, sales, assets | placeholder | 🚧 |
| health | incidents, health profiles edit, allergy alerts, change-request review | incidents, close, report, health card search | ⚠️ no profile edit or change-request review |
| pickup | early leave, departures, authorised persons (add/revoke) | gate desk: approve/reject early leave, record departure | ⚠️ no staff-side authorised persons |
| complaints | boxes, file, update, assign, escalate, close, reopen | all | ✅ |
| certificates | review approve/reject, issue/reissue PDF, download | review approve/reject | ⚠️ no issue/reissue/download |
| approvals | inbox, detail, decide | `feature/approvals` | ✅ |
| reports | catalogue, parameters, export jobs | placeholder | 🚧 |
| settings | branding, notifications, policies, support, backups, imports | placeholder | 🚧 |
| profile | edit, password, sessions, notification prefs, 2FA setup | all except 2FA setup (app lock is Android-only) | ⚠️ no 2FA setup |
| entity history | audit trail drawer (`audit/EntityHistory`) | none | ❌ |
| navigation | – | bottom bar = Home, Branches, Staff, Approvals (web-only ids never fill a slot) | ✅ |

## PRINCIPAL
Same as SUPER_ADMIN for shared pages, scoped to the principal's branch. Rows that differ:

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard | summary + Today pending queue + setup checklist | supervisor grid + Today queue + checklist | ✅ |
| branches ("Branch & Calendar") | view own branch, edit settings, calendar events | read-only detail; calendar only under Sessions | ⚠️ no settings edit or event add |
| classes | class setup, sections, subjects/rooms, allocation | read-only overview; ⏳ setup screens | ⏳ |
| students | as SUPER_ADMIN | as SUPER_ADMIN | ⚠️ ⏳ add/edit |
| admissions | as SUPER_ADMIN | decide only | ⚠️ |
| guardians | as SUPER_ADMIN | list + link requests | ⚠️ |
| staff | add, edit, status, assign, sign-in, probation, workload | add, edit, status, assign, sign-in, workload | ⚠️ no probation |
| timetable | builder, publish/discard, bell schedule, substitutions | Substitutions tab | ⏳ builder and bell; ✅ substitutions |
| attendance | branch day, corrections, staff attendance, leave approvals | classes + staff tabs, leave review | ✅ |
| diary | moderation/return | `SupervisorDiaryRoute` | ✅ |
| activities | add, approve/reject, lifecycle, participants | propose, approve/reject, consents | ⚠️ |
| notices | compose, publish, edit/archive, read receipts | compose + publish | ⚠️ |
| exams | completeness, accept/return, proxy marks, publish, promotions, report cards | completeness, review, marks entry when `canEdit` | ⚠️ |
| fees | as SUPER_ADMIN + approve within limit | Today/Dues/Proofs/Record payment, reminders, refund/reverse, close day + Approvals link | ⚠️ ⏳ fee plan |
| payroll | approve run (not own), close | runs + approve | ⚠️ no close, payments |
| expenses, inventory, reports | as SUPER_ADMIN | placeholder | 🚧 |
| settings ("Settings") | own-school settings, import templates | placeholder | 🚧 |
| health, pickup, certificates | as SUPER_ADMIN | as SUPER_ADMIN | ⚠️ |
| complaints, approvals | as SUPER_ADMIN | as SUPER_ADMIN | ✅ |
| messages | threads (own / branch read-only scope), new thread, attachments | threads, conversation, new thread, attachments | ⚠️ no branch read-only scope (`messages/ScopeToggle`) |
| meetings | list, complete, cancel, no-show, follow-ups, publish slots | all | ✅ |
| profile | as SUPER_ADMIN | as SUPER_ADMIN | ⚠️ 2FA setup |

## COORDINATOR / HEAD_TEACHER

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard | supervisor summary + pending queue | yes | ✅ |
| classes | overview, view class setup | read-only `ClassesRoute` (branch from assignments) | ✅ |
| students | view scope, profile | section → roster → profile | ✅ |
| staff | view, workload | list + detail + workload | ✅ |
| timetable | view; **draft branch-wide** (new builder role rule); substitutions | Substitutions tab | ⏳ drafting; ✅ substitutions |
| attendance | branch day, proxy register, corrections, leave review | `BranchTodayRoute`, register, leave review | ✅ |
| diary | missing, moderation, return | yes | ✅ |
| activities | propose, view | list, propose, detail | ✅ |
| exams | completeness, accept/return, class results | completeness + review + Class results tab (`exams.view`) | ✅ |
| progress | notes, homework ticks | Notes + Homework tabs | ✅ |
| health | incidents, cards, report, change requests | incidents, cards, report | ⚠️ no change-request review |
| pickup | gate, authorised persons | gate desk | ⚠️ |
| messages | threads, branch scope | threads | ⚠️ no branch scope |
| meetings | run meetings, publish slots | yes | ✅ |
| complaints | routed box, update, assign, escalate | yes | ✅ |
| approvals | decide | yes | ✅ |
| my_salary | payslips, own attendance, leave | yes (FLAG_SECURE) | ✅ |
| profile | incl. 2FA setup | no 2FA setup | ⚠️ |

## TEACHER

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard | today periods, registers, pending diaries | `TeacherTodayContent` | ✅ |
| classes ("My Classes & Students") | sections, roster, student profile | `MyClassesRoute` → roster → detail | ✅ |
| timetable | my week, section view; **class teacher drafts own section** | week/day view (`TimetableRoute`) | ⏳ drafting (needs builder); view ✅ |
| attendance | mark, mark all, draft, submit, correction request, health alerts, student leave review | `MarkHomeRoute`, `RegisterRoute` (offline), `LeaveReviewRoute` | ✅ |
| diary | write, attachments, draft, publish | `TeacherDiaryRoute`, `DiaryEditorRoute` (offline) | ✅ |
| activities | propose, view | yes | ✅ |
| exams | my sheets, marks entry, absent, submit, class results | `MySheetsRoute`, `MarksEntryRoute` (offline), Class results tab | ✅ |
| progress | notes, homework ticks | yes | ✅ |
| messages | threads, new thread, attachments | yes | ✅ |
| meetings | list, complete, cancel, no-show, follow-ups, slots | yes | ✅ |
| complaints | own + routed, file, update | yes | ✅ |
| my_salary | payslips, own attendance, leave apply/cancel | yes | ✅ |
| profile | incl. 2FA setup | no 2FA setup | ⚠️ |

## HELPER

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard | today | teacher-mode dashboard | ✅ |
| classes | assigned sections, roster | `MyClassesRoute` | ✅ |
| attendance | draft register only | register (`canEdit` limits to draft) | ✅ |
| diary | draft only | editor draft | ✅ |
| activities | view | yes | ✅ |
| complaints | own | yes | ✅ |
| my_salary | payslips, attendance, leave | yes | ✅ |
| profile | | as above | ⚠️ 2FA setup |

## ACCOUNTANT

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard | finance overview | Welcome + "Finance this month" card | ✅ |
| students | branch list with finance columns, search, ledger (`fees/.../StudentLedgerDialog`) | section browse + student search + read-only profile | ⚠️ no ledger |
| fees › overview | collection rate, billed/collected | `OverviewTiles` (Today tab) | ✅ |
| fees › collections | daily totals, close day | daily collection card + close day (`fees.approve`) + closing card | ✅ |
| fees › payments | record, receipt, reverse, refund | record (offline); tap a Today payment: receipt, refund (`fees.add`), reverse (`fees.edit`), both confirmed | ✅ (today's payments only; no full payments list) |
| fees › invoices | add, generate bulk, issue, cancel, challan print | invoice detail (read) | ❌ |
| fees › dues | list, aging, select + send reminders | Dues tab with aging, guardian, multi-select reminders (`fees.edit`) | ✅ (no class / min-days filters) |
| fees › proofs | verify, reject | verify, reject | ✅ |
| fees › concessions | add, approve flow | none | ❌ |
| fees › structure | heads, plans, late fee | none | ⏳ fee plan |
| payroll | structures, adjustments, run create/calculate/review, payments, payslips | runs list + detail | ⚠️ view only |
| expenses | | placeholder | 🚧 |
| inventory | | placeholder | 🚧 |
| complaints | own + routed | yes | ✅ |
| reports | exports | placeholder | 🚧 |
| my_salary | | yes | ✅ |
| profile | | as above | ⚠️ 2FA setup |

## PARENT (child switcher)

| Page (web) | Actions | Android | Status |
|---|---|---|---|
| dashboard ("Home") | child today, diary, notices, consents, next meeting | `ParentHomeContent` | ✅ |
| students ("Child Profile") | profile, guardians, documents, contact change, link child (OTP) | `ChildProfileRoute`, `ContactChangeRoute`, `LinkChildRoute` | ✅ |
| diary | child feed | `ParentDiaryRoute` | ✅ |
| attendance | month calendar, leave request | `ChildAttendanceRoute` + `LeaveRequestSheet` | ✅ |
| progress ("Progress & Results") | results, report card, feedback, homework | `ParentProgressScreen` | ✅ |
| timetable ("Timetable, Calendar & Activities") | week, calendar, activities + consent | `ParentTimetableScreen` 3 tabs | ✅ |
| fees ("Fees, Dues & Receipts") | summary, invoices, receipt, pay online, upload proof, proof status | `ParentFeesRoute` (+ submitted proofs with status and rejection reason), invoice detail, `ProofUploadRoute` | ✅ |
| certificates | request, status, download | `ParentCertificatesRoute` | ⚠️ (serial and rejection reason now shown) |
| messages | threads, new message, shortcuts (pickup, health card…) | threads + `ParentShortcuts` | ✅ |
| – pickup | authorised persons, early leave | `ParentPickupRoute` | ✅ |
| – health card | view, propose change | `HealthCardRoute` | ✅ |
| meetings | book, list, cancel | `ParentMeetingsRoute`, `BookMeetingRoute` | ✅ |
| complaints | file (anonymous), track | yes | ✅ |
| profile | edit, password, sessions, prefs, 2FA | all but 2FA setup | ⚠️ |

### Counts (rows per table)

| Role | rows | ✅ | ⚠️ | ❌ | 🚧 | ⏳ | rows with 🐞 |
|---|---|---|---|---|---|---|---|
| SUPER_ADMIN | 33 | 5 | 16 | 2 | 7 | 2 | 4 (fees, payroll, certificates, bottom bar; bottom bar counted only as 🐞) |
| PRINCIPAL | 23 | 5 | 14 | 0 | 2 | 2 | 1 (fees; payroll/certificates inherit) |
| COORDINATOR / HEAD_TEACHER | 19 | 13 | 5 | 0 | 0 | 1 | 0 |
| TEACHER | 14 | 10 | 3 | 0 | 0 | 1 | 1 (health alerts) |
| HELPER | 8 | 7 | 1 | 0 | 0 | 0 | 1 (health alerts) |
| ACCOUNTANT | 17 | 5 | 6 | 2 | 3 | 1 | 3 (dues, payroll, bottom bar) |
| PARENT | 15 | 13 | 2 | 0 | 0 | 0 | 2 (proof reason, certificates) |

---

## Suspected bugs (🐞), confirmed against live JSON

**Status 2026-10-08:** B1–B8 fixed (B8: exam term name resolved from `sessions/{id}/terms`, cached) (DTO/mapper aliases + mapper tests built from live JSON in `core/data/src/test`); B6 also maps `approval.id` only while the approval is `PENDING`. Extra mismatch found and fixed: `collections/daily` sends `closed` as an object (`DayClosingDto`) or null, not a boolean, and payments carry the cashier as `receivedBy`.

| # | Where (app) | API sends | App reads | Effect | Fix |
|---|---|---|---|---|---|
| B1 | `core/network/.../dto/fees/CollectionDtos.kt:9-12` `AgingDto` | `aging.d0_30, d31_60, d61_90, d90plus` | `@SerialName("0-30")…"90+"` | Dues aging buckets always 0 | Change the four `@SerialName`s |
| B2 | `CollectionDtos.kt:16-27` `DuesRowDto` | `student{id,name,admissionNo,className,sectionName}`, `oldestOverdueDays`, `overdueMinor`, `guardian` | flat `admissionNo/className/sectionName`, `oldestDueDays`/`days`; `student` typed `IdNameDto` | Dues cards: no class, adm. no or days overdue; no guardian phone | Give `student` its own DTO; read `oldestOverdueDays`; map `guardian` (`core/data/fees/FeeMappers.kt:97`) |
| B3 | `dto/health/HealthDtos.kt:46-53` `HealthAlertDto` | `studentId, name, rollNo, allergies, instructions` | `student.name` / `studentName` | Register health-alert sheet shows no student names | Add `name` (+`rollNo`); map in `core/data/health/HealthMappers.kt:49` |
| B4 | `dto/certificates/CertificateDtos.kt:15-30` `CertificateDto` | `serialNo, rejectionReason, isDuplicate, requestedAt, effectiveDate` | `serial, rejectReason/reason, duplicate, createdAt, issuedOn` | Serial, rejection reason, duplicate badge and request date never shown (staff + parent) | Rename or alias the fields; `core/data/certificates/CertificateMappers.kt:17-28` |
| B5 | `dto/fees/PaymentDtos.kt:21` `PaymentProofDto.reason` | `rejectReason`, `note`, `fileId` | `reason`, `file` | Parent and accountant cannot see why a proof was rejected | Read `rejectReason`; `core/data/fees/FeeMappers.kt:79` |
| B6 | `dto/payroll/PayrollDtos.kt:50-60` `PayrollRunDto` | `totals{netMinor,paidMinor,balanceMinor}`, `approval{…}` | flat `netMinor…`, `approvalId` | Totals fall back to summing lines (fine when lines are sent); `approvalId` is always null, so there is no link to the pending approval | Add `totals` and `approval` DTOs |
| B7 | `core/navigation/.../PrimaryNavigation.kt:18` and `:24` | – | SUPER_ADMIN bottom bar = Schools, Users; ACCOUNTANT = Expenses | 2 of 4 super-admin tabs and 1 accountant tab open the web-only placeholder | Use mapped screens (e.g. SA: Branches, Staff; Accountant: Students) until those modules exist |
| B8 | `dto/exams/ExamDtos.kt:7` `ExamDto.term/termName` | `termId` only | `term`, `termName` | Exam term label blank | Resolve the term name from `sessions` terms, or have the API embed `term{id,name}` |

Non-bugs that were checked: every path in `app_eps` matches the API. `classes/{id}/setup`, `staff/{id}/account*`, `sections/{id}/class-teacher`, `sections/{id}/subject-teachers/{subjectId}`, `timetables`, `branches/{id}/bell-schedule` and `setup/checklist` match the post-rework API. `TimetableDto` is compatible (it ignores the new `canPublish, draftSlotCount, workingDays…`). Parent `results` carry `examName`. `notices` send `read`. Coordinator branch scope comes from assignments (`BranchOptionsLoader`), so the 403 on `/branches` is handled.

---

## Prioritised gap list

**P1: daily-use broken or missing**

| # | Gap | Web | App | Hint |
|---|---|---|---|---|
| 1 | ✅ done 2026-10-08: Dues aging + row details blank (B1, B2) | `features/fees/components/dues/DuesTab` | `feature/fees` DuesTab, `core/network/dto/fees/CollectionDtos.kt` | Fix DTO names; no UI change needed |
| 2 | ✅ done 2026-10-08: Health-alert student names blank in the register (B3) | `attendance/HealthAlertsNotice` | `feature/attendance/HealthAlertSheet`, `HealthDtos.kt` | Add `name` to `HealthAlertDto` |
| 3 | ✅ done 2026-10-08: Rejected proof/certificate reasons hidden from parents (B4, B5) | `fees/ParentProofsSection`, `certificates/CertificateDetailDrawer` | `feature/fees` parent, `feature/certificates` | Alias `rejectReason` / `rejectionReason`, `serialNo` |
| 4 | ✅ done 2026-10-08: Bottom bar opens placeholders (B7) | `config/navigation.ts` | `core/navigation/PrimaryNavigation.kt` | Drop unmapped ids from `Preferred` (filter by `AppShellContent` keys) |
| 5 | ✅ done 2026-10-08: Fee reminders from Dues | `fees/components/dues/DuesSelectionBar` | `feature/fees` DuesTab | Multi-select rows + `POST dues/reminders` |
| 6 | ✅ done 2026-10-08: Payment reversal / refund | `fees/ReversePaymentDialog`, `RefundDialog` | `feature/fees` receipt / invoice detail | `POST payments/{id}/reverse` and `POST refunds`, each with a reason sheet |
| 7 | ✅ done 2026-10-08: Close day | `fees/CloseDayDialog`, `CollectionClosingCard` | `feature/fees` TodayTab `DailyCollectionCard` | "Close day" action on the Today card → `POST collections/daily/close` |
| 8 | ✅ done 2026-10-08: Timetable substitutions (absent-teacher cover) | `timetable/SubstitutionsTab`, `OverrideFormDialog` | `feature/timetable` | `GET/POST/DELETE timetable-overrides` list + add sheet; not in the in-progress builder scope |
| 9 | ✅ done 2026-10-08: Student search (principal, accountant) | `students/StudentSearchField`, `StudentsTab` | `feature/students/sections` | Search bar on `GET students?q=` above the section list |
| 10 | ✅ done 2026-10-08: Staff class results view | `exams/ResultsTab`, `StudentResultDrawer` | `feature/exams` | Wire the unused `ExamsApi.results(examId, sectionId)` into a results tab |
| 11 | ✅ done 2026-10-08: Payroll run approval link (B6) | `payroll/RunActionsBar` | `feature/payroll` PayrollRunRoute | Read `approval.id` and open Approval detail |

**P2: management parity (desk tasks that principals now want on the phone)**

| # | Gap | Web | App | Hint |
|---|---|---|---|---|
| 1 | ⏳ Class setup, subjects/rooms, bell schedule, timetable builder (incl. teacher/coordinator drafting), students add/edit, fee plan | `classes/*`, `timetable/*Bell*`, `TimetableBuilderView`, `students/RegisterStudentDialog`, `fees/FeePlanDialog` | other agent (`core/data/academics`, `timetable/*Builder*`) | In progress; extend builder role gating to class teacher (own section) and coordinator (branch) when it lands |
| 2 | Invoices: add, generate, issue, cancel | `fees/GenerateInvoicesDialog`, `InvoiceFormDialog`, `InvoiceDialogs` | `feature/fees` | Invoices tab with generate sheet (class + month) |
| 3 | Concessions | `fees/ConcessionsTab`, `ConcessionFormDialog` | `feature/fees` | Form → approval flow already in Approvals |
| 4 | Student lifecycle: transfer, withdraw, change section, accept transfer | `students/TransferStudentDialog`, `WithdrawStudentDialog`, `ChangeSectionDialog` | `feature/students/detail` | Action sheet on student detail |
| 5 | Admissions data entry: enquiries, application form, tests, confirm admission | `admissions/*` | `feature/admissions` | Add Enquiries tab + confirm dialog first (highest value) |
| 6 | Guardians edit / link / unlink | `guardians/EditGuardianDialog`, `LinkChildDialog`, `UnlinkDialog` | `feature/students/guardians` | Detail screen with these three actions |
| 7 | Sessions/terms/events CRUD; branch calendar event add | `sessions/*FormDialog` | `feature/organisation/sessions` | Event add first (most frequent) |
| 8 | Branch settings edit / change principal | `branches/BranchSettingsDialog`, `ChangePrincipalDialog` | `feature/organisation/branches` | Edit sheet on `BranchSettingsCard` |
| 9 | Exam setup, schedule, grading, publish results, promotions, report cards | `exams/ExamFormDialog`, `ScheduleTab`, `GradingTab`, `PromotionsTab`, `ExamStatusControls` | `feature/exams` | Publish + report-card generate first; setup later |
| 10 | Payroll processing: create/calculate/review/close run, payments, adjustments, structures | `payroll/*` | `feature/payroll` | Run actions bar mirroring `RunActionsBar` |
| 11 | Activities lifecycle (start/complete/cancel), edit, participants | `activities/ActivityDetailActions`, `ParticipantsEditor` | `feature/activities` detail | Add action row + participants sheet |
| 12 | Notices edit/archive + read receipts | `notices/NoticesManagePage`, `NoticeReadsDialog` | `feature/notices` | Overflow menu on own notices; read counts list |
| 14 | Health profile edit + change-request review | `health/HealthProfileDialog`, `ChangeRequestsTab` | `feature/health` | Review list reusing `ChangeRequestEditor` diff |
| 15 | Staff-side authorised pickup persons (add/revoke) | `pickup/PickupPersonsTab`, `AddPickupPersonDialog` | `feature/pickup` | Reuse parent `AddPersonSheet` from student search |
| 16 | Certificate issue/reissue + PDF download | `certificates/CertificateActions` | `feature/certificates/review` | Issue action → job → open `fileUrl` |
| 17 | Staff probation, generic role assignments | `staff/ProbationDialog`, `AssignmentsTab` | `feature/staff/detail` | Add to `StaffActionsCard` |
| 18 | Expenses (accountant daily bookkeeping) | `expenses/*` | none (placeholder) | Expense add + list first; vendors/categories later |
| 19 | Setup wizard for a new school | `school-setup/SetupWizard` | `feature/dashboard/setup` | Checklist exists; link steps to the ⏳ screens |

**P3: nice to have**

| # | Gap | Web | App | Hint |
|---|---|---|---|---|
| 1 | Schools, users, roles admin | `schools/*`, `users/*`, `roles/*` | placeholder | Keep web-only; users reset password / unlock is the only mobile-worthy action |
| 2 | Settings, backups, imports | `settings/*` | placeholder | Keep web-only |
| 3 | Reports & exports | `reports/*` | placeholder | Read-only "recent exports" with download could be added |
| 4 | Inventory | `inventory/*` | placeholder | Stock lookup only |
| 5 | 2FA setup | `profile/TwoFactorSetupPanel` | `feature/profile` | Show the secret as text + copy for an authenticator on the same phone |
| 6 | Messages branch read-only scope | `messages/ScopeToggle` | `feature/messages` | Toggle chip on the thread list |
| 7 | Audit history | `audit/EntityHistory` | none | Bottom sheet on student/staff detail |
| 8 | Student ID card, document upload | `students/IdCardPanel`, `documents/DocumentUploadDialog` | `feature/students/profile/DocumentsCard` | Upload via `FilesApi` + attach |
| 9 | Student ledger (accountant) | `fees/StudentLedgerDialog` | `feature/students/detail` | Ledger list on the fee summary |
| 10 | ✅ done 2026-10-08: Exam term label (B8) | `exams/ExamHeader` | `feature/exams` | Resolve `termId` |

## Android-only (unchanged)
Offline outbox (registers, diary, mark sheets, cash payments), push notifications (FCM via `DeviceRegistrar`), `FLAG_SECURE` on payroll, my salary and health screens, release certificate pinning, app lock (biometric/device credential), pull-to-refresh, branded splash/launcher icon.
