# eSchool — Web / Android Parity

Deliverable for docs/api/phase5-contract.md §H: per role, every menu entry and key action on web vs Android, marked **Same / Android (subset) / Web-only (by design) / Gap**; every Gap fixed or justified.

The **web column** comes from `SchoolWeb/src`, checked against the code. The **Android column** comes from `docs/parity-android.md` (the source of truth for Android, snapshot 2026-10-06), with a few rows it does not cover checked in `SchoolApp`.

## Legend

| Mark | Meaning |
|---|---|
| ✔ | Present on web for this role, with the listed actions |
| — | Not on web for this role |
| Same | Web and Android offer the same entry and key actions |
| Android (subset) | Android has the mobile part; the rest is web-only by design (parity-android.md "Web-only by design (rationale)") |
| Web-only (by design) | Desk task, not built for the phone (citation in Notes) |
| Android (see parity-android.md) | Android gap that is being fixed in Phase 5; tracked in parity-android.md "Gaps to fix" |

Rules used for the web column:
- Menus follow `ROLE_MENUS` + `LABEL_OVERRIDES` in `SchoolWeb/src/config/navigation.ts` (same as docs/navigation.md). A menu entry shows only if the role holds its `.view` permission (`menuFor` in `lib/permissions.ts`). Every route is also wrapped in `ModuleGuard` (blocks the page without the `.view` permission).
- Actions are listed only if the role's default permissions (`SchoolApi/src/core/rbac/default-role-permissions.ts`, security.md §2.1) pass the web's `can("…")` check. The gating permission is shown in brackets where it matters.
- Web-only decisions follow parity-android.md "Web-only by design (rationale)". Android shows "Manage this on the web panel" for `schools, users, roles, expenses, inventory, reports` (`WebOnlyModules`).

---

## Shared (all roles)

| Menu entry / area | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Sign in | Email or phone + password; school branding (logo, name, colour) from `/branding` on the login card; message after idle sign-out | ✔ | `feature/auth` login; `/branding` logo/colour on login | Same | `features/auth/components/LoginPanel.tsx`, `AuthLayout.tsx` |
| Two-step sign-in (login step) | 6-digit authenticator code, or switch to a recovery code | ✔ | `TwoFactorUiState/Validator` | Same | `TwoFactorLoginForm.tsx`, `use-two-factor-login.ts` |
| Forced password change | First sign-in with `must_change_password` → change before entering the portal | ✔ | `AppNavHost` routes `mustChangePassword` sessions to the change screen | Same | `ForcedPasswordChange.tsx` |
| Forgot password | Identifier → neutral "instructions sent" message → link to reset | ✔ | Forgot password screen (`ForgotPasswordRequestDto`) | Same | `/forgot-password` |
| Reset password | Token from link or typed reset code + new password with strength hints | ✔ | Token + new password screen | Same | `/reset-password` |
| Top bar | School branding (logo/colour), notifications bell, role switcher (only with 2+ roles), user menu (profile, sign out); PARENT: child switcher | ✔ | Branded top bar (`designsystem/brand`), role and child switcher (`RoleShellViewModel`) | Same | `components/layout/Topbar.tsx` |
| Notifications bell | Unread count (99+), recent list, mark one read on click, mark all read | ✔ | `feature/notifications`: list, unread filter, mark all read; FCM push | Same | `features/notifications`. Push is Android-only |
| Role switcher | Switch active role context → menu and `/me` reload | ✔ | `RoleShellViewModel.onRoleSelected` | Same | Menu follows the active role only (navigation.md) |
| Idle sign-out | Signs out after the school policy `sessionTimeoutMinutes` from `/me` (fallback `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES`, default 30), for every role | ✔ | Not idle-limited | Web-only (by design) | `use-idle-logout.ts`; security.md §7. phase5-contract Deviations: "ANDROID sessions are not idle-limited (the app lock covers this)" |
| Profile & Security | Edit own details; change password; two-step sign-in card (set up with QR + manual secret → confirm code → 10 recovery codes shown once with copy/download; turn off with password + code; shows "required for your role"); notification preferences per category/channel; signed-in devices (sign out one / all); my roles. PARENT also: link a child (admission no + DOB → OTP → school approval), ask for a contact change | ✔ | Edit, password, sessions, push prefs; PARENT: `LinkChildRoute`, `ContactChangeRoute` | Android (subset) | `features/profile/components/ProfilePage.tsx`. 2FA setup is web-only by design: the QR is scanned with the phone (phase5-contract §B "(QR on web)") |
| Audit history on records | "History" timeline in detail drawers (school, branch, user, guardian, staff) | ✔ (SUPER_ADMIN, PRINCIPAL: `audit.view`) | – | Web-only (by design) | `features/audit/components/EntityHistory.tsx`. Hangs off the org-setup drawers, which are desk work (parity-android.md rationale "Org setup") |

Android-only (parity-android.md): push notifications, offline outbox (registers, diary drafts, marks, cash payments, topic progress), `FLAG_SECURE`, release certificate pinning, branded launcher icon + splash, pull-to-refresh.

---

## SUPER_ADMIN

Holds every permission (`PERMISSION_CATALOGUE`).

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | School/branch/session scope bar; pending-approvals panel; attendance-today card; summary stats; notices feed card | ✔ | Supervisor summary, no Today queue | Same | |
| Schools | Search/filter; add; edit (incl. logo); archive / activate; detail drawer + history | ✔ | Web-only placeholder | Web-only (by design) | Rarely-used setup |
| Branches | Filter by school/status; add; edit; change principal; branch settings (attendance lock time, diary moderation); archive / activate; detail + history | ✔ | List + read-only detail (`organisation/branches`) | Android (subset) | Configuration is a desk task |
| Principals & Admin Users | Filter role/branch/status; add user (temporary password shown once); edit; reset password; **unlock account** (when locked); disable / enable; detail: add / end role assignments; history | ✔ | Web-only placeholder | Web-only (by design) | Bulk account admin. Unlock = Phase 5 (`POST /users/:id/unlock`). Nobody edits their own assignments |
| Roles & Permissions | Search; create custom role; edit permission matrix (system roles: SUPER_ADMIN only); delete custom role | ✔ | Web-only placeholder | Web-only (by design) | Needs a wide matrix |
| Sessions & Calendar | Sessions: add, edit, activate, close, manage terms (add/edit/delete). Calendar: add/edit/delete events | ✔ | Read-only calendar (`SessionsCalendarRoute`) | Android (subset) | Setup |
| Classes, Sections & Subjects | Branch picker; tabs Classes / Sections / Subjects / Rooms: add, edit, class subjects, archive section | ✔ | Read-only tabs (`ClassesRoute`) | Android (subset) | Setup |
| Students | Register student; list by session/class/section/status; Transfers tab (accept / reject / cancel). Detail `/students/[id]`: edit, change section, transfer, withdraw; tabs Profile, Guardians (add/remove link), Attendance, Health (edit profile), Pickup (verify/revoke persons), Documents (upload, verify/reject), Enrollment history, ID card (generate [`students.edit`], download) | ✔ | Section → roster → read-only profile (`MyClassesRoute`) | Android (subset) | Edits are desk work |
| Admissions | Enquiries (add, update, convert to application); Applications (add, edit, schedule test, record result, decide, confirm admission, withdraw, documents); Waiting list (offer seat) | ✔ | List + detail + Offer / Waitlist / Reject | Android (subset) | Data entry and confirmation are office work |
| Parents & Guardians | Branch picker; Guardians (detail: edit, create parent login with one-time password, link child, unlink, history); Link requests (approve / reject) | ✔ | List + link-request tab; approve via Approvals | Android (subset) | Edit/unlink is web |
| Teachers & Helpers | Add staff; list. Detail `/staff/[id]`: edit details, change status, probation; tabs Profile, Assignments (add/end), Workload, Documents (upload, verify) | ✔ | List + read-only detail | Android (subset) | HR setup |
| Timetable | Section timetable (edit cells, save draft, conflict check, publish); Bell schedule (edit periods); Substitutions (add/remove); Teacher week | ✔ | Read-only week per section | Android (subset) | Needs a grid editor |
| Syllabus & Books | Book lists (edit, submit, approve/return, history); Syllabus plans (edit chapters/topics, submit, approve/return, topic progress); Coverage | ✔ | Coverage read-only; decisions in Approvals | Android (subset) | Plan authoring is web |
| Daily Diary & Homework | Diary (add/edit/publish entries per section & day); Moderation (publish / return); Missing diaries | ✔ | `SupervisorDiaryRoute` (missing, return with comment) | Same | |
| Activities & Events | List / Calendar view, filters; propose; detail: edit (proposed), approve/reject, start, complete, cancel; participants & results; parent consent tracker | ✔ | List, propose, detail approve/reject, consent summary | Android (subset) | Lifecycle and participant editing are web |
| Notices | Compose with audience builder; save draft; publish; edit draft; read receipts | ✔ | Feed + compose (`notices.add`) | Android (subset) | Read receipts and edit/archive are web-only by design |
| Attendance & Leave | Register (mark, mark all present, save draft, submit, request correction when locked, health alerts); Branch summary (jump to unmarked section); Staff attendance (status, check-in/out, save); Leave (approve/reject) | ✔ | `BranchTodayRoute`; staff attendance being added | Android (see parity-android.md) | Gap 3: staff attendance marking |
| Exams & Results | Exams (create, edit); Grading schemes (add, edit, approve); Promotions (suggest, override, confirm for approval, apply). Detail `/exams/[id]`: schedule editor, open/close marks, mark sheets (enter, submit, accept/return), completeness, compute results, send for approval, publish, results + student result + report card PDF | ✔ | Completeness board + sheet review accept/return | Android (subset) | Exam setup, grading, promotions, publishing are web |
| Fees & Dues | Overview; Invoices (new, generate, issue selected; detail: issue, record payment, cancel, ledger, challan PDF); Payments (record, receipt, refund, reverse); Payment proofs (verify/reject); Dues (ledger, record payment, send reminders); Daily collections (close day); Concessions (request); Fee structure (fee heads, fee plans add/edit/approve) | ✔ | Today, Dues, Proofs (verify), Record payment (offline), invoice detail/receipt | Android (subset) | Structure, invoicing, concessions, refunds, reversals, close day are web |
| Salary & Payroll | Runs (create, calculate/recalculate, mark reviewed, send for approval, close, record payment, view payslip); Salary structures (edit); Adjustments (add) | ✔ | Runs list, run detail (`FLAG_SECURE`), send for approval | Android (subset) | Payroll setup and processing are web |
| Expenses & Vendors | Expenses (add, submit for approval, record payment); Vendors (add); Categories (add) | ✔ | Web-only placeholder | Web-only (by design) | Bookkeeping |
| Inventory & Purchasing | Stock; Items (add); Movements (record); Assets (add/edit); Purchasing (new request, create PO, receive, create bill); Student sales (record sale) | ✔ | Web-only placeholder | Web-only (by design) | Store-room / office work |
| Health & Safety | Incidents (report, close); Allergy alerts; Change requests (open in Approvals) | ✔ | Incidents (close), health card search, report incident; `FLAG_SECURE` | Android (subset) | Change-request review is web |
| Pickup & Departure | Date stepper; Early leave (record, approve/reject); Departures (record); Authorized persons (find student, verify/revoke) | ✔ | Gate desk: approve/reject early leave, record departure | Android (subset) | Authorised-person admin is web |
| Complaints | File complaint; boxes Mine / Assigned / All; detail: update, assign, escalate, reopen, close; timeline; "regarding" shown | ✔ | Boxes, file (anonymous, attachments), update, escalate/close/reopen | Android (see parity-android.md) | Gaps 6–7: attachments on updates, assign |
| Certificates | Branch filter; request; detail: approve/reject, issue, reissue, download PDF | ✔ | Review list approve/reject | Android (subset) | Issue/reissue (PDF) is web |
| Approvals | Filter status/type; detail with steps; approve / return / reject (never own request) | ✔ | `feature/approvals` | Same | |
| Reports & History | Catalog by area; request with parameters + format (PDF/XLSX/CSV) → background job → download; recent exports | ✔ | Web-only placeholder | Web-only (by design) | Heavy exports (architecture.md §8) |
| Settings & Backups | School picker. **School & branding** (name, logo, primary colour with contrast check, receipt/report-card footers); **Notifications** (email/SMS/push switches, category defaults); **Policies** (attendance lock, diary moderation, grading default, late fee, approval limits, password policy, session timeout, roles that must use 2FA); **Support** (failed notifications: resend / resend all; failed jobs: retry; system health); **Backups** (run, verify restore, download, view checks); **Data import** (kind + branch/session, template, upload, validate, errors + preview, commit / commit valid rows only, reconciliation, history, revert) | ✔ | Web-only placeholder (`SETTINGS` in `WebOnlyModules`) | Web-only (by design) | phase5-contract §G has no settings, backups or import on Android |
| Profile & Security | See Shared | ✔ | See Shared | Android (subset) | 2FA setup is web |

---

## PRINCIPAL

Branch-scoped. No `settings.edit`, no `fees.add/edit`, no `payroll.add/edit`, no `expenses.add`, no `inventory.add/edit`, no `complaints.add`*, no `branches.add/delete`.

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Scope bar; pending-approvals panel; attendance-today; summary stats | ✔ | Supervisor grid + Today queue | Same | |
| Branch & Calendar | Branch: view, edit, branch settings, history. Tab "Sessions & Calendar": sessions add/edit/activate/close, terms, calendar events add/edit/delete | ✔ | Read-only branch detail; calendar under the Sessions screen | Android (subset) | Label override; settings are desk work |
| Classes, Sections & Subjects | Add, edit, class subjects, archive section; rooms | ✔ | Read-only tabs | Android (subset) | |
| Students | Register; list; Transfers (accept/reject/cancel); detail: edit, change section, transfer, withdraw, guardians, health edit, pickup verify/revoke, documents verify, ID card | ✔ | Section → roster → read-only profile | Android (subset) | |
| Admissions | Same as SUPER_ADMIN (add, edit, test, decide, confirm, withdraw, offer seat) | ✔ | List + detail + Offer / Waitlist / Reject | Android (subset) | |
| Parents & Guardians | Edit, create parent login, link/unlink child, link requests approve/reject, history | ✔ | List + link requests; approve via Approvals | Android (subset) | |
| Teachers & Helpers | Add staff; edit; change status; probation; assignments add/end; documents verify | ✔ | List + read-only detail | Android (subset) | |
| Timetable | Section timetable edit + publish; bell schedule; substitutions; teacher week | ✔ | Read-only week per section | Android (subset) | |
| Attendance & Leave | Register (proxy: mark, submit, correction); Branch summary; Staff attendance; Leave approve/reject | ✔ | Branch day; leave via Approvals; staff attendance being added | Android (see parity-android.md) | Gap 3. `teacherwork.proxy` |
| Daily Diary & Homework | Add/edit/publish; Moderation (publish/return); Missing | ✔ | Moderation / return | Same | |
| Syllabus & Books | Edit book lists/plans, approve/return, topic progress, coverage | ✔ | Coverage + Approvals | Android (subset) | |
| Activities & Events | Propose; approve/reject; start/complete/cancel; participants & results; consent tracker | ✔ | List, propose, approve/reject, consent summary | Android (subset) | |
| Notices | Compose, draft, publish, edit draft, read receipts | ✔ | Feed + compose | Android (subset) | |
| Exams & Results | Create/edit exams; grading schemes add/edit/approve; promotions (suggest, override, confirm, apply); open/close marks; mark sheets (proxy entry, accept/return); compute; send for approval; publish; report cards | ✔ | Completeness, review, marks entry when `canEdit` | Android (subset) | Publish / promotions are web |
| Fees & Dues | Overview; Invoices (issue selected / issue; ledger; challan PDF); Payments (list, receipt); Proofs (verify/reject); Dues (ledger); Daily collections (close day); Concessions (list); Fee structure (approve plans) | ✔ | Today / Dues / Proofs / Record payment + Approvals link | Android (subset) | No record payment / refund / new invoice on web (`fees.add` not held) |
| Salary & Payroll | Runs: view, send for approval, close run, view payslips; structures/adjustments view | ✔ | Runs + send for approval; decide in Approvals | Android (subset) | Decides payroll in Approvals (not own salary) |
| Expenses & Vendors | View expenses, vendors, categories; decide in Approvals | ✔ | Web-only placeholder | Web-only (by design) | |
| Inventory & Purchasing | View stock, items, movements, assets, purchasing; decide requests in Approvals | ✔ | Web-only placeholder | Web-only (by design) | "Student sales" tab hidden (needs `fees.add`) |
| Health & Safety | Incidents (report, close); allergy alerts; change requests | ✔ | As SUPER_ADMIN (`FLAG_SECURE`) | Android (subset) | |
| Pickup & Departure | Early leave (record, approve/reject); departures (record); authorized persons (verify/revoke) | ✔ | Gate desk | Android (subset) | |
| Messages | Inbox "Mine" + "Branch (read-only)" toggle; new conversation; reply | ✔ | Threads, conversation, new thread, attachments | Same | |
| Meetings & Appointments | Request meeting [`meetings.add`]; Upcoming/Past (complete, no-show, cancel); My slots (add); Follow-ups | ✔ | List, complete, cancel, no-show, follow-ups; slot publishing being added | Android (see parity-android.md) | Gap 4 |
| Complaints | File complaint*; Mine / Assigned / All; assign; update/escalate/close as a party; "regarding" shown | ✔ | As SUPER_ADMIN (no assign) | Android (see parity-android.md) | *Not permission-gated: `POST /complaints` is open to every signed-in user (security-routes inventory). Gap 7: assign |
| Certificates | Request; approve/reject; issue/reissue; download | ✔ | Review approve/reject | Android (subset) | |
| Approvals | Decide (approve / return / reject), never own | ✔ | `feature/approvals` | Same | |
| Reports & History | Request exports (PDF/XLSX/CSV); recent exports | ✔ | Web-only placeholder | Web-only (by design) | |
| Settings | Read-only School & branding, Notifications, Policies (`settings.view`); Data import (full flow, `settings.import`) | ✔ | – | Web-only (by design) | Phase 5 API grants PRINCIPAL `settings.view` + `settings.import` (phase5-contract Deviations) |
| Profile & Security | See Shared; 2FA can be made mandatory by policy | ✔ | See Shared | Android (subset) | 2FA setup is web |

---

## COORDINATOR / HEAD_TEACHER

Same default permissions (SUPERVISOR set). View-only on classes, students, staff, timetable, health, certificates; full diary/attendance/syllabus/exams review; `teacherwork.proxy`.

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Scope bar; pending-approvals panel; attendance-today; summary stats; notices feed card | ✔ | Supervisor summary + Today queue | Same | |
| Classes, Sections & Subjects | Read-only tabs (classes, sections, subjects, rooms) | ✔ | Read-only `ClassesRoute` | Same | |
| Students | Read-only list + transfers list; detail tabs (profile, guardians, attendance, health, pickup, documents, enrollments, ID card download) | ✔ | Section → roster → profile | Same | ID card "Generate" hidden (needs `students.edit`) |
| Teachers & Helpers | Read-only list, detail (profile, assignments, workload, documents) | ✔ | List + detail | Same | |
| Timetable | Read-only admin view (section timetable, bell schedule, substitutions, teacher week) | ✔ | Read-only view | Android (subset) | Substitution editing is web |
| Attendance & Leave | Register (proxy mark/submit, correction); Branch summary; Staff attendance; Leave approve/reject | ✔ | `BranchTodayRoute`, proxy register from the branch day | Android (subset) | |
| Daily Diary & Homework | Add/edit/publish; Moderation; Missing | ✔ | Missing, return | Same | |
| Syllabus & Books | Edit, submit, approve/return, topic progress, coverage | ✔ | Coverage + Approvals link | Same | |
| Activities & Events | Propose; start/complete/cancel; participants & results | ✔ | List, propose, detail | Same | No approve (`activities.approve` not held) |
| Exams & Results | Create/edit exams; grading add/edit/approve; Promotions tab: suggest only; open/close marks; mark sheets (enter, submit, accept/return); compute; send for approval; results | ✔ | Completeness, accept/return | Android (subset) | Exam setup and grading are web (parity-android.md rationale). No publish; confirm/apply promotions are PRINCIPAL/SUPER_ADMIN only |
| Student Progress | Feedback notes (add); Homework completion (mark, mark all done, save) | ✔ | Notes + Homework tabs | Same | |
| Health & Safety | Incidents (report); Allergy alerts | ✔ | Incidents, health cards, report (`FLAG_SECURE`) | Same | No close / change requests (`health.edit` not held) |
| Pickup & Departure | Early leave (record); Departures (view); Authorized persons (view) | ✔ | Gate desk | Same | |
| Messages | Inbox; new conversation; reply; "Branch (read-only)" toggle | ✔ | Threads | Same | Toggle for both roles, as the API (`ThreadAccessService`) |
| Meetings & Appointments | Request; complete/no-show/cancel; My slots; Follow-ups | ✔ | Run meetings; slot publishing being added | Android (see parity-android.md) | Gap 4 |
| Complaints | File; Mine / Assigned / All; assign; update/escalate/close as a party | ✔ | Routed box, update, escalate (no assign) | Android (see parity-android.md) | Gap 7 |
| Approvals | Decide (approve / return / reject) | ✔ | Decide | Same | |
| My Attendance, Leave & Salary | My attendance by month; my leave (apply); my payslips (PDF) | ✔ | Payslips (`FLAG_SECURE`), own attendance, leave | Same | |
| Profile & Security | See Shared | ✔ | See Shared | Android (subset) | 2FA setup is web |

---

## TEACHER

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Today panel (periods, registers to mark, diaries, unread messages, assigned complaints); summary stats; notices feed card | ✔ | `TeacherTodayContent` | Same | |
| My Classes & Students | Own sections → roster → student detail (`MyClassesPage`) | ✔ | `MyClassesRoute` → roster → detail | Same | Label override |
| Timetable | "My week" view with week navigation | ✔ | My week | Same | |
| Attendance & Leave | Register (mark, mark all present, save draft, submit, request correction); Leave (decide student leave as class teacher) | ✔ | `MarkHomeRoute`, `RegisterRoute` (offline draft + outbox), `LeaveReviewRoute` | Same | Offline register is Android-only |
| Daily Diary & Homework | Add/edit/publish entries | ✔ | `TeacherDiaryRoute`, `DiaryEditorRoute` (offline drafts) | Same | Probation teachers' actions go to approval (API) |
| Syllabus & Books | Edit book lists and plans, submit, topic progress, coverage | ✔ | `MyPlansRoute`, topic progress (offline queue) | Same | Plan authoring is web by design |
| Activities & Events | Propose; start/complete/cancel; participants & results | ✔ | List, propose, detail | Same | |
| Exams & Results | Exams list (create/edit shown by `exams.add/edit`); grading add/edit; open/close marks; mark sheets (enter, submit) | ✔ | `MySheetsRoute`, `MarksEntryRoute` (offline queue) | Android (subset) | Exam setup is web. API scope limits to assigned sections |
| Student Progress | Feedback notes (add); Homework completion | ✔ | Notes + Homework tabs | Same | |
| Messages | Inbox; new conversation with parents; reply | ✔ | Threads, new thread, attachments | Same | |
| Meetings & Appointments | Request; complete/no-show/cancel; My slots; Follow-ups | ✔ | All but slots; slot publishing being added | Android (see parity-android.md) | Gap 4 |
| Complaints | File; Mine / Assigned; update/escalate/close as a party | ✔ | Own + routed, file, update | Same | |
| My Attendance, Leave & Salary | My attendance; my leave (apply); my payslips (PDF) | ✔ | Yes (`FLAG_SECURE`) | Same | Own salary only |
| Profile & Security | See Shared | ✔ | See Shared | Android (subset) | 2FA setup is web |

---

## HELPER

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Today panel; summary stats | ✔ | Teacher-mode dashboard | Same | |
| Classes, Sections & Subjects | Own sections → roster (`MyClassesPage`) | ✔ | `MyClassesRoute` | Same | |
| Attendance & Leave | Register as draft (mark, save draft, request correction); no submit; no Leave tab | ✔ | Register (`canEdit` limits to draft) | Same | Helper output stays DRAFT (security.md §3) |
| Daily Diary & Homework | Add/edit draft entries; no publish | ✔ | Editor, draft only | Same | |
| Activities & Events | Propose; start/complete/cancel; participants | ✔ | List, propose, detail | Same | Holds `activities.add/edit` |
| Complaints | File; Mine / Assigned | ✔ | Own | Same | |
| My Attendance, Leave & Salary | My attendance; my leave (apply); my payslips | ✔ | Yes | Same | |
| Profile & Security | See Shared | ✔ | See Shared | Android (subset) | 2FA setup is web |

---

## ACCOUNTANT

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Scope bar; summary stats | ✔ | Welcome + "Finance this month" card | Same | No pending panel (not a leader role) |
| Students | Read-only list and transfers; student detail | ✔ | Section browse + read-only profile | Android (subset) | No global search or ledger view |
| Fees & Dues | All tabs and actions: invoices (new, generate, issue, cancel, challan), payments (record, receipt, refund, reverse), proofs (verify/reject), dues (record payment, reminders), close day, concessions (request), fee structure (add/edit/approve) | ✔ | Today, Dues, Proofs verify, Record payment (offline), invoice/receipt | Android (subset) | Finance control work is web |
| Salary & Payroll | Create run; calculate/recalculate; mark reviewed; record payment; payslips; structures (edit); adjustments (add) | ✔ | Runs + run detail (`FLAG_SECURE`) + send for approval | Android (subset) | Web: no send for approval / close (`payroll.approve` not held) |
| Expenses & Vendors | Add expense; submit for approval; record payment; vendors; categories | ✔ | Web-only placeholder | Web-only (by design) | Bookkeeping |
| Inventory & Purchasing | Items, movements, assets, purchase requests, PO, receive, create bill, student sales | ✔ | Web-only placeholder | Web-only (by design) | Store work |
| Complaints | File; Mine / Assigned | ✔ | Own + routed | Same | |
| Reports & History | Request exports; recent exports | ✔ | Web-only placeholder | Web-only (by design) | XLSX/PDF |
| My Attendance, Leave & Salary | My attendance; my leave; my payslips | ✔ | Yes | Same | |
| Profile & Security | See Shared; 2FA can be required by policy | ✔ | See Shared | Android (subset) | 2FA setup is web |

---

## PARENT

Every screen is scoped to the child picked in the top-bar child switcher. With no verified child, screens show "link your child" states.

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Home | Child today: attendance, consent forms waiting, diary, notices, next meeting | ✔ | `ParentHomeContent` | Same | Label override |
| Child Profile | Read-only tabs: profile, guardians, attendance, health (request a change), pickup (add a pickup person), documents, enrollment history, ID card (download when issued) | ✔ | `ChildProfileRoute`, `ContactChangeRoute`, `LinkChildRoute` | Same | Label override |
| Daily Diary & Homework | Published diary, week by week | ✔ | `ParentDiaryRoute` | Same | |
| Attendance & Leave | Child attendance; leave requests (apply) | ✔ | `ChildAttendanceRoute` + `LeaveRequestSheet` | Same | |
| Progress & Results | Results with trend + report card PDF; teacher feedback; homework (last 30 days) | ✔ | `ParentProgressScreen`: Results & feedback / Homework (`ChildHomeworkRoute`, last 30 days) | Same | Label override |
| Syllabus & Books | Child syllabus plans with progress; book list | ✔ | `ParentSyllabusRoute` | Same | |
| Timetable, Calendar & Activities | Week timetable; upcoming school calendar (holidays/events, next 90 days); activities with consent (grant / decline) | ✔ | `ParentTimetableScreen` tabs: Timetable / Calendar (`SchoolCalendarRoute`) / Activities (consent via detail) | Same | Calendar from `GET /students/:studentId/calendar` (`timetable.view`). Label override |
| Fees, Dues & Receipts | Invoices; invoice drawer (challan PDF, payments with receipt PDF); upload payment proof; proofs list | ✔ | `ParentFeesRoute`, invoice detail, `ProofUploadRoute` | Same | Label override. No online payment (gateway off) |
| Certificates | Request for the child; download issued PDF | ✔ | `ParentCertificatesRoute` | Same | |
| Messages, Notices & Requests | Tabs: Messages (new conversation with a teacher, reply), Notices feed, Requests (leave, early leave) | ✔ | Threads + `ParentShortcuts` (notices, activities, pickup, health card with `FLAG_SECURE`, certificates) | Same | Label override |
| Meetings & Appointments | Book a slot; upcoming (cancel); past | ✔ | `ParentMeetingsRoute`, `BookMeetingRoute` | Same | |
| Complaints | File for a child; Mine; update/escalate/reopen/close | ✔ | File (anonymous), track | Same | |
| Profile & Security | See Shared + link a child, contact change request | ✔ | See Shared | Android (subset) | 2FA setup is web |

Custom roles: both clients build the menu from every catalogue `.view` the role holds; web-only ids show the web-only placeholder on Android. **Same.**

---

## Web notes

### Web-only by design
Decided in parity-android.md "Web-only by design (rationale)": org setup (schools, users, roles, sessions/classes setup, timetable editor, staff HR, student registration), Settings & Backups, Data import, 2FA setup (QR), reports and certificate PDFs, fee/payroll setup and processing, expenses, inventory, exam setup, admissions data entry, syllabus authoring, activity lifecycle. Idle sign-out is web-only per phase5-contract Deviations (Android sessions are not idle-limited).

### Web-side gaps and inconsistencies found
1. **PRINCIPAL `/settings`** — Fixed: the API grants PRINCIPAL `settings.view` + `settings.import`, so the read-only settings and Data import open.
2. **TEACHER "My Classes & Students"** — Fixed: `ClassesRoute` shows `MyClassesPage` (own sections → roster → student detail) for TEACHER/HELPER.
3. **PARENT calendar** — Fixed: new `GET /students/:studentId/calendar` (`timetable.view`) and an "Upcoming school calendar" section on the parent Timetable page (`ChildCalendarSection`).
4. **Messages branch toggle** — Fixed: web `BRANCH_READERS` now includes HEAD_TEACHER, matching the API's `ThreadAccessService`.
5. **Unscoped buttons** — Fixed: ID card "Generate" needs `students.edit` and "Request meeting" needs `meetings.add`. Justified: "File complaint" (API open to every signed-in user, checked in `ComplaintsService`), "Report incident" (API needs `health.view`, the same check as the button), and teacher exam create/grading/marks (TEACHER holds `exams.add/edit`, and the API limits these to assigned sections).
6. **Parent phone + OTP sign-in** — Justified: system-wide (there is no API endpoint and neither client has it), deferred beyond Phase 5; parents sign in with phone + password.
7. **Idle timeout** — Fixed: `use-idle-logout.ts` uses `/me` `sessionTimeoutMinutes`, with the env value as fallback.
8. **Students export** — Justified: `students.export` has no API endpoint or report kind yet and neither client offers it, so there is no parity gap. A student-list export would be a new report kind in Reports & History.
9. **Phase 5 API dependency** — Fixed: the `settings`, `support`, `backups` and `imports` API modules are implemented (e2e: `settings-support`, `backups`, `imports`).

All 34 catalogue modules are in `BUILT_MODULES` (`src/config/module-phases.ts`). No menu entry falls back to the "coming soon" page.
