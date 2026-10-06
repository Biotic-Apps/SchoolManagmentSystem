# Web / Android Parity (Phase 5 §H)

Per role: every menu entry from `docs/navigation.md` and its key actions, web panel vs Android app.
Snapshot 2026-10-06, taken from the code (`SchoolWeb/src/features/*`, `SchoolApp/feature/*`, `SchoolApp/app/.../navigation/AppShellContent.kt`).

**Status:** `Same` = same capability on both · `Android (subset)` = the mobile-relevant part only, with the rest on web · `Web-only (by design)` = a desk task, not built for the phone · `Gap` = missing on Android with no design reason; fix or accept.

**How Android routes menus:** `NavigationCatalog.menuFor` applies the same rule as web (system role default list filtered by permissions; custom role = every `.view` it holds). A menu id with no screen in `AppShellContent` shows `MenuPlaceholder`. Ids in `WebOnlyModules` (`schools, users, roles, expenses, inventory, reports`) show "Manage this on the web panel". Every other unmapped id shows "Coming in Phase N" (`feature/home/components/MenuPlaceholder.kt`).

## Shared (all roles)

| Area | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| Login | identifier + password, BFF/refresh | yes | `feature/auth` | Same | |
| Branding on login + top bar | `/branding` logo/colour | `features/branding` | `core/data/branding`, `designsystem/brand` (Phase 5, in progress) | Same | |
| Forgot / reset password | request, token + new password | `(auth)/forgot-password`, `reset-password` | Phase 5, in progress (`ForgotPasswordRequestDto`) | Same | |
| 2FA verify on login | challenge → code | `TwoFactorLoginForm` | `TwoFactorUiState/Validator` (Phase 5, in progress) | Same | |
| 2FA setup / disable / recovery codes | QR, enable, disable, codes | `profile/TwoFactorCard`, `TwoFactorSetupPanel`, `RecoveryCodesDialog` | – | Web-only (by design) | the QR must be scanned from a second screen; codes are shown once |
| Role switch / child switcher | switch active role/child | yes | `RoleShellViewModel.onRoleSelected/onChildSelected` | Same | |
| Notifications inbox | list, unread filter, mark all read | `NotificationBell` | `feature/notifications` | Same | |
| Push notifications | FCM delivery | – | `DeviceRegistrar` (NoOp provider until Firebase is configured) | Android-only | |
| Launcher icon + splash | branded | n/a | Phase 5, in progress (`ic_splash_mark`, adaptive icon) | Android-only | |
| Pull-to-refresh | refresh lists | browser reload | `RefreshBox` across features, organisation screens being added | Android-only | |

## SUPER_ADMIN

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard | summary tiles, scope bar | yes | Supervisor summary, no Today queue (`DashboardMode`) | Same | |
| schools | create/edit, logo, status | yes | placeholder (web-only message) | Web-only (by design) | rarely-used setup |
| branches | create/edit, settings, status, change principal | yes | list + detail read-only (`organisation/branches`) | Android (subset) | configuration is a desk task |
| users | create/edit, assignments, reset password, status, **unlock** | yes | placeholder (web-only message) | Web-only (by design) | bulk account admin |
| roles | role CRUD, permission matrix | yes | placeholder (web-only message) | Web-only (by design) | needs a wide matrix |
| sessions | sessions/terms/events CRUD, transitions | yes | read-only calendar (`SessionsCalendarRoute`) | Android (subset) | setup |
| classes | classes/sections/subjects/rooms CRUD | yes | read-only tabs (`ClassesRoute`) | Android (subset) | setup |
| students | search, register, edit, transfer, withdraw, change section, ID card, guardians | yes | browse by section → roster → read-only profile (`MyClassesRoute`) | Android (subset) | no global search; edits are desk work |
| admissions | enquiries, applications, test schedule/result, waiting list, confirm admission, documents | yes | list + detail + Offer/Waitlist/Reject (`admissions/detail`) | Android (subset) | data entry and confirmation are office work |
| guardians | list, edit, link/unlink, link requests | yes | list + link-request tab, approve via Approvals | Android (subset) | edit/unlink is web |
| staff | add/edit, assignments, probation, status, workload | yes | list + read-only detail | Android (subset) | HR setup |
| timetable | bell schedules, section editor, substitutions, overrides | yes | read-only week view per section | Android (subset) | needs a grid editor |
| syllabus | plan editor, book lists, coverage, review | yes | coverage read-only, link to Approvals | Android (subset) | plan authoring is web |
| diary | missing list, moderation/return | yes | `SupervisorDiaryRoute` (missing, return with comment) | Same | |
| activities | create/edit, approve/reject, start/complete/cancel, participants, consent tracker | yes | list, propose, detail approve/reject, consent summary | Android (subset) | lifecycle (start/complete/cancel) and participant editing are web |
| notices | compose, audience, pin, expiry, read receipts | yes | feed + compose (FAB when `notices.add`) | Android (subset) | no read-receipt list or edit/archive |
| attendance | branch summary, registers, corrections, **staff attendance**, leave review | yes | `BranchTodayRoute` (sections by day) | Gap | staff attendance marking missing |
| exams | exams CRUD, schedule, grading schemes, completeness, accept/return sheets, results publish, report cards, promotions | yes | completeness board + sheet review accept/return (`exams/board`, `review`) | Android (subset) | exam setup, grading, promotions and publishing are web |
| fees | finance overview, structure (heads/plans), invoices generate/issue/cancel, payments, receipts, reversals, refunds, concessions, proofs verify, dues, close day, ledger | yes | Today, Dues, Proofs (verify), Record payment (offline-queued), invoice detail/receipt | Android (subset) | fee structure setup, invoicing, concessions/refunds/reversals and close day are web |
| payroll | structures, adjustments, create/calculate/review/approve/close run, payments, payslips | yes | runs list, run detail (FLAG_SECURE), "Send for approval" | Android (subset) | payroll setup and run processing are web |
| expenses | expenses, categories, vendors, payments | yes | placeholder (web-only message) | Web-only (by design) | bookkeeping |
| inventory | items, stock, movements, purchasing, sales, assets | yes | placeholder (web-only message) | Web-only (by design) | store-room/office work |
| health | incidents, health profiles, allergy alerts, change requests | yes | incidents (close), student health card search, report incident | Android (subset) | change-request review is web; no FLAG_SECURE (see Gaps) |
| pickup | early leave, departures, authorised persons | yes | gate desk: approve/reject early leave, record departure | Android (subset) | authorised-person admin is web |
| complaints | boxes, file, update, assign, escalate, close, reopen | yes | boxes, file (anonymous, attachments), update, escalate/close/reopen | Android (subset) | assign is web; no attachments on updates |
| certificates | approve/reject, issue/reissue PDF | yes | review list approve/reject (`certificates/review`) | Android (subset) | issue/reissue (PDF generation) is web |
| approvals | inbox, detail, approve/reject/return | yes | `feature/approvals` | Same | |
| reports | catalogue, parameters, export jobs, recent exports | yes | placeholder (web-only message) | Web-only (by design) | XLSX/PDF exports |
| settings | school/branding, notifications, policies, support (failed notifications, jobs, health), backups, data import | yes (`features/settings`) | placeholder says **"Coming in Phase 5"**, not the web-only message | Web-only (by design) + Gap | by design; but the placeholder message is wrong (add `SETTINGS` to `WebOnlyModules`) |
| profile | edit, password, device sessions, notification prefs, 2FA | yes | edit, password, sessions, push prefs | Android (subset) | 2FA setup is web (QR) |

## PRINCIPAL

Same as SUPER_ADMIN for the shared entries (branches labelled "Branch & Calendar", principal-scoped). Differences and extra entries:

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard | summary + Today pending queue | yes | supervisor grid + Today queue | Same | |
| branches ("Branch & Calendar") | view own branch, settings | yes | read-only branch detail; calendar under Sessions screen only | Android (subset) | settings are desk work |
| classes, students, admissions, guardians, staff, timetable, syllabus | as SUPER_ADMIN | yes | as SUPER_ADMIN | Android (subset) | see above |
| attendance | branch day, corrections, staff attendance, leave approvals | yes | branch day; leave via Approvals | Gap | staff attendance marking missing |
| diary | moderation/return | yes | yes | Same | |
| activities, notices | as SUPER_ADMIN | yes | as SUPER_ADMIN | Android (subset) | |
| exams | completeness, accept/return, proxy marks (`exams.submit`) | yes | completeness, review, marks entry when `canEdit` | Android (subset) | publish/promotions are web |
| fees | as SUPER_ADMIN (approve within limit via Approvals) | yes | Today/Dues/Proofs/Record payment + Approvals link | Android (subset) | |
| payroll | approve run (not own) | yes | runs + send for approval; decide in Approvals | Android (subset) | |
| expenses, inventory, reports | as SUPER_ADMIN | yes | web-only placeholder | Web-only (by design) | |
| health, pickup, complaints, certificates, approvals | as SUPER_ADMIN | yes | as SUPER_ADMIN | as above | |
| messages | threads, new thread to guardians, attachments | yes | threads, conversation, new thread, attachments | Same | |
| meetings | list, complete (notes, follow-ups), cancel, no-show, **publish slots** | yes | list, complete, cancel, no-show, follow-up done | Gap | slot publishing missing (PROGRESS "Not yet") |
| settings (read-only own school) | view settings, import templates | yes | not in principal menu | Web-only (by design) | imports/settings are desk tasks |
| profile | as above | yes | as above | Android (subset) | 2FA setup web |

## COORDINATOR / HEAD_TEACHER

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard | supervisor summary + Today queue | yes | yes | Same | |
| classes | view | yes | read-only `ClassesRoute` | Same | view-only role |
| students | view scope | yes | section → roster → profile | Same | |
| staff | view | yes | list + detail | Same | |
| timetable | view, substitutions | yes | read-only view | Android (subset) | substitutions editing is web |
| attendance | branch day, proxy mark, review | yes | `BranchTodayRoute` | Android (subset) | proxy register opened from the branch day |
| diary | missing, return | yes | yes | Same | |
| syllabus | coverage, review | yes | coverage + Approvals link | Same | |
| activities | propose, view | yes | list, propose, detail | Same | |
| exams | completeness, accept/return | yes | yes | Same | |
| progress | notes, homework ticks | yes | Notes + Homework tabs (`ProgressMenuScreen`) | Same | |
| health | incidents, cards, report | yes | yes | Same | no FLAG_SECURE (Gaps) |
| pickup | gate | yes | gate desk | Same | |
| messages | threads | yes | yes | Same | |
| meetings | run meetings, publish slots | yes | run meetings | Gap | no slot publishing |
| complaints | routed box, update, escalate | yes | yes (no assign) | Android (subset) | assign is web |
| approvals | decide | yes | yes | Same | |
| my_salary | payslips, own attendance, leave apply | yes | payslips (FLAG_SECURE), own attendance, leave | Same | |
| profile | | yes | | Android (subset) | 2FA setup web |

## TEACHER

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard | today periods, registers, diaries | yes | `TeacherTodayContent` | Same | |
| classes ("My Classes & Students") | sections, roster, student profile | yes | `MyClassesRoute` → roster → detail | Same | |
| timetable | my week | yes | yes | Same | |
| attendance | mark register, mark all present, draft, submit, correction request, health alerts, student leave review | yes | `MarkHomeRoute`, `RegisterRoute` (offline draft + outbox), `LeaveReviewRoute` | Same | Android-only: offline register |
| diary | write topics/homework, attachments, draft, publish | yes | `TeacherDiaryRoute`, `DiaryEditorRoute` (offline drafts) | Same | Android-only: offline drafts |
| syllabus | my plans, topic progress | yes | `MyPlansRoute`, `PlanDetail` topic sheet (offline queue) | Same | plan authoring (`PlanEditorDialog`) web-only by design |
| activities | propose, view | yes | list, propose, detail | Same | |
| exams | my mark sheets, enter marks, absent, draft, submit | yes | `MySheetsRoute`, `MarksEntryRoute` (offline queue) | Same | |
| progress | notes (visible to parent), homework ticks | yes | Notes + Homework tabs | Same | |
| messages | threads, new thread to guardians, attachments | yes | yes | Same | |
| meetings | list, complete, cancel, no-show, follow-ups, **publish slots** | yes | all but slots | Gap | slot publishing missing |
| complaints | own + routed, file, update | yes | yes | Same | |
| my_salary | payslips, own attendance, apply leave | yes | yes (FLAG_SECURE) | Same | |
| profile | | yes | | Android (subset) | 2FA setup web |

## HELPER

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard | today | yes | teacher-mode dashboard | Same | |
| classes | assigned sections, roster | yes | `MyClassesRoute` | Same | |
| attendance | draft only | yes | register (`canEdit` limits to draft) | Same | |
| diary | draft only | yes | editor draft | Same | |
| activities | view | yes | yes | Same | |
| complaints | own | yes | yes | Same | |
| my_salary | own payslips, attendance, leave | yes | yes | Same | |
| profile | | yes | | Android (subset) | 2FA setup web |

## ACCOUNTANT

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard | finance overview | yes | Welcome + "Finance this month" card (`FinanceLoader`) | Same | |
| students | branch list (finance fields), ledger | yes | section browse + read-only profile | Android (subset) | no global search or ledger view |
| fees | full fee desk (see SUPER_ADMIN) | yes | Today, Dues, Proofs verify, Record payment (offline), invoice/receipt | Android (subset) | fee structures, invoice generation, concessions, refunds, reversals, close day and ledger are web |
| payroll | prepare: structures, adjustments, calculate, review, payments | yes | runs + run detail (FLAG_SECURE) + send for approval | Android (subset) | payroll setup and processing are web |
| expenses | | yes | web-only placeholder | Web-only (by design) | bookkeeping |
| inventory | | yes | web-only placeholder | Web-only (by design) | store work |
| complaints | own + routed | yes | yes | Same | |
| reports | exports | yes | web-only placeholder | Web-only (by design) | XLSX/PDF |
| my_salary | | yes | yes | Same | |
| profile | | yes | | Android (subset) | 2FA setup web |

## PARENT (child switcher)

| Menu entry | Key actions | Web | Android | Status | Note |
|---|---|---|---|---|---|
| dashboard ("Home") | child today, diary, notices, follow-ups, health link | yes | `ParentHomeContent` | Same | |
| students ("Child Profile") | profile, guardians, documents, contact change request, link child (OTP) | yes (`ChildProfilePage`, profile `LinkChildCard`, `ContactChangeCard`) | `ChildProfileRoute`, `ContactChangeRoute`, `LinkChildRoute` | Same | |
| diary | child feed | yes | `ParentDiaryRoute` | Same | |
| attendance | month calendar, leave request | yes | `ChildAttendanceRoute` + `LeaveRequestSheet` | Same | |
| progress ("Progress & Results") | results, report card, teacher feedback, **homework status** | yes (Results / Teacher feedback / Homework tabs) | results + report card + teacher notes (`ParentResultsRoute`) | Gap | homework-completion tab missing |
| syllabus | plans, book lists | yes | `ParentSyllabusRoute` | Same | |
| timetable ("Timetable, Calendar & Activities") | week, activities | yes (`ChildTimetableView` + `ChildActivitiesSection`) | week view; activities via Messages shortcut | Android (subset) | activities not inline |
| fees ("Fees, Dues & Receipts") | summary, invoices, receipt, pay online, upload proof | yes | `ParentFeesRoute`, invoice detail, `ProofUploadRoute` | Same | |
| certificates | request, status | yes | `ParentCertificatesRoute` | Same | |
| messages ("Messages, Notices & Requests") | threads, new message, shortcuts (notices, activities + consent, pickup, health card, certificates) | yes | threads + `ParentShortcuts` | Same | |
| – pickup (via shortcut) | authorised persons, early leave | yes | `ParentPickupRoute` | Same | |
| – health card (via shortcut) | view, propose change | yes | `HealthCardRoute` change request | Same | no FLAG_SECURE (Gaps) |
| meetings | book a slot, list | yes | `ParentMeetingsRoute`, `BookMeetingRoute` | Same | |
| complaints | file (anonymous), track | yes | yes | Same | |
| profile | edit, password, sessions, notification prefs | yes | yes | Android (subset) | 2FA setup web |

## Custom roles
Both clients build the menu from every catalogue `.view` the role holds. On Android each screen picks its supervisor/staff variant by role (e.g. `else ->` branches in `*MenuScreen.kt`). Web-only ids show the web-only placeholder. **Same.**

## Android-only capabilities
- Offline outbox (Room + WorkManager `core/sync`): attendance registers (`AttendanceRegisterEntity`), diary drafts, mark sheets (`MARKS_SAVE/SUBMIT`), cash payment recording (`PAYMENT_RECORD`), syllabus topic progress (`SYLLABUS_PROGRESS`).
- Push notifications (FCM via `DeviceRegistrar`; NoOp provider until Firebase is configured).
- `FLAG_SECURE` (`core/ui/SecureWindow.kt`) on payroll run and My Salary screens.
- Release certificate pinning from Gradle properties (`core/network/security/CertificatePinning.kt`, Phase 5).
- Branded adaptive launcher icon + SplashScreen (Phase 5).

## Gaps to fix (prioritised)
1. **FLAG_SECURE missing on medical screens.** `SecureWindowEffect` is only used in `feature/payroll`. Its own KDoc and security.md §5 cover medical data. Add it to `HealthCardRoute`, the incident detail/list and `ReportIncident`. (Security.)
2. **Settings placeholder shows "Coming in Phase 5"** instead of the web-panel message. Add `MenuIds.SETTINGS` to `WebOnlyModules` in `feature/home/components/MenuPlaceholder.kt`. (Trivial.)
3. **Staff attendance marking** (principal / super admin) has no Android screen. Web has `attendance/StaffAttendanceTab`. Done daily at the gate, so it fits the phone.
4. **Meeting slot publishing** for teachers and supervisors. Web has `meetings/MySlotsTab` + `SlotsDialog`. Without it, parents have no slots to book unless staff use the web. (PROGRESS Phase 3 "Not yet".)
5. **Parent homework-completion view** under Progress & Results. Web has `progress/ChildHomeworkTab`. Teachers already tick homework on Android.
6. **Attachments on incident reports and complaint updates** (PROGRESS Phase 3 "Not yet"). Filing a complaint supports attachments; updates and incidents do not.
7. **Complaint assign** (supervisors). Web has `complaints/AssignDialog`. Low priority: routing is automatic.
8. Low: parent activities are not inline on Timetable (reachable via the Messages shortcut). Notices have no read-receipt list or edit on Android.

## Web-only by design (rationale)
- **Org setup** (schools, users incl. unlock and reset password, roles & permissions matrix, sessions/terms, classes/sections/subjects/rooms, branch settings, timetable editor, staff HR, student registration/transfer/withdraw): low frequency, many fields, wide tables. Done at a desk by admins.
- **Settings & Backups** (school branding, notification channels, policies, support: failed notifications, jobs, health; backups, restore verification, download): SUPER_ADMIN operations with audit weight. Not for the phone.
- **Data import** (XLSX templates, validate, commit, revert): needs file handling and an error table.
- **2FA setup** (QR, recovery codes): the QR is scanned with the phone's authenticator app, so the setup screen must be on another device. Verify-on-login is on Android.
- **Reports & exports** (XLSX/PDF jobs) and **certificate issue/reissue** (PDF generation).
- **Fee structure setup** (heads, plans, late fees), invoice generation/issue/cancel, concessions, refunds, payment reversals, close day, ledger: finance control work with approval limits. Android keeps collection, dues and proof verification.
- **Payroll setup and processing** (structures, adjustments, calculate/review/close, payments). Android shows runs and sends them for approval; decisions go through Approvals.
- **Expenses & vendors, inventory & purchasing**: office bookkeeping.
- **Exam setup** (exams, schedule, grading schemes, results publish, promotions, report-card generation): Android keeps marks entry and sheet review.
- **Admissions data entry** (enquiries, tests, confirmation, documents), **syllabus plan/book-list authoring**, **activity lifecycle and participants editing**: long forms. Android keeps the decisions (offer/waitlist/reject, approve/reject, consent).
