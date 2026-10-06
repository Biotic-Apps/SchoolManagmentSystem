# eSchool — Web / Android Parity

Deliverable for docs/api/phase5-contract.md §H: per role, every menu entry and key action on web vs Android, marked **Same / Web-only (by design) / Gap**; every Gap fixed or justified.

This file has the **web column** (from `SchoolWeb/src`, checked against the code). The Android column comes from `docs/parity-android.md`. To merge, copy each Android row into the matching `Android` cell (same role section, same menu entry), then set `Status`.

## Legend

| Mark | Meaning |
|---|---|
| ✔ | Present on web for this role, with the listed actions |
| — | Not on web for this role |
| TBD | To be filled in when the Android column is merged |
| Same | Web and Android offer the same entry and key actions |
| Web-only (by design) | Docs say this is web-only (citation in Notes) |
| Gap | One client lacks something the other has, or something navigation.md promises. Must be fixed or justified |

Rules used for the web column:
- Menus follow `ROLE_MENUS` + `LABEL_OVERRIDES` in `SchoolWeb/src/config/navigation.ts` (same as docs/navigation.md). A menu entry shows only if the role holds its `.view` permission (`menuFor` in `lib/permissions.ts`). Every route is also wrapped in `ModuleGuard` (blocks the page without the `.view` permission).
- Actions are listed only if the role's default permissions (`SchoolApi/src/core/rbac/default-role-permissions.ts`, security.md §2.1) pass the web's `can("…")` check. The gating permission is shown in brackets where it matters.
- No doc says outright that any module is web-only. Where the Phase 5 contract leaves something out of the Android scope (§G), the Notes say "web-only candidate". Status stays `TBD` until the team agrees (see Web notes).

---

## Shared (all roles)

| Menu entry / area | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Sign in | Email or phone + password; school branding (logo, name, colour) from `/branding` on the login card; message after idle sign-out | ✔ | TBD | TBD | `features/auth/components/LoginPanel.tsx`, `AuthLayout.tsx` |
| Two-step sign-in (login step) | 6-digit authenticator code, or switch to a recovery code | ✔ | TBD | TBD | `TwoFactorLoginForm.tsx`, `use-two-factor-login.ts` |
| Forced password change | First sign-in with `must_change_password` → change before entering the portal | ✔ | TBD | TBD | `ForcedPasswordChange.tsx` |
| Forgot password | Identifier → neutral "instructions sent" message → link to reset | ✔ | TBD | TBD | `/forgot-password` |
| Reset password | Token from link or typed reset code + new password with strength hints | ✔ | TBD | TBD | `/reset-password` |
| Top bar | School branding (logo/colour), notifications bell, role switcher (only with 2+ roles), user menu (profile, sign out); PARENT: child switcher | ✔ | TBD | TBD | `components/layout/Topbar.tsx` |
| Notifications bell | Unread count (99+), recent list, mark one read on click, mark all read | ✔ | TBD | TBD | `features/notifications` |
| Role switcher | Switch active role context → menu and `/me` reload | ✔ | TBD | TBD | Menu follows the active role only (navigation.md) |
| Idle sign-out | Signs out after `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` (default 30) of no activity, for every role | ✔ | TBD | TBD | `use-idle-logout.ts`; security.md §7 |
| Profile & Security | Edit own details; change password; two-step sign-in card (set up with QR + manual secret → confirm code → 10 recovery codes shown once with copy/download; turn off with password + code; shows "required for your role"); notification preferences per category/channel; signed-in devices (sign out one / all); my roles. PARENT also: link a child (admission no + DOB → OTP → school approval), ask for a contact change | ✔ | TBD | TBD | `features/profile/components/ProfilePage.tsx`. 2FA setup with QR: phase5-contract §B says "(QR on web)"; §G lists only "2FA verify" for Android, so **setup is a web-only candidate** |
| Audit history on records | "History" timeline in detail drawers (school, branch, user, guardian, staff) | ✔ (SUPER_ADMIN, PRINCIPAL: `audit.view`) | TBD | TBD | `features/audit/components/EntityHistory.tsx` |

---

## SUPER_ADMIN

Holds every permission (`PERMISSION_CATALOGUE`).

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | School/branch/session scope bar; pending-approvals panel; attendance-today card; summary stats; notices feed card | ✔ | TBD | TBD | |
| Schools | Search/filter; add; edit (incl. logo); archive / activate; detail drawer + history | ✔ | TBD | TBD | Web-only candidate (heavy admin; not in phase5-contract §G Android scope) |
| Branches | Filter by school/status; add; edit; change principal; branch settings (attendance lock time, diary moderation); archive / activate; detail + history | ✔ | TBD | TBD | |
| Principals & Admin Users | Filter role/branch/status; add user (temporary password shown once); edit; reset password; **unlock account** (when locked); disable / enable; detail: add / end role assignments; history | ✔ | TBD | TBD | Unlock = Phase 5 (`POST /users/:id/unlock`). Nobody edits their own assignments |
| Roles & Permissions | Search; create custom role; edit permission matrix (system roles: SUPER_ADMIN only); delete custom role | ✔ | TBD | TBD | Web-only candidate |
| Sessions & Calendar | Sessions: add, edit, activate, close, manage terms (add/edit/delete). Calendar: add/edit/delete events | ✔ | TBD | TBD | |
| Classes, Sections & Subjects | Branch picker; tabs Classes / Sections / Subjects / Rooms: add, edit, class subjects, archive section | ✔ | TBD | TBD | |
| Students | Register student; list by session/class/section/status; Transfers tab (accept / reject / cancel). Detail `/students/[id]`: edit, change section, transfer, withdraw; tabs Profile, Guardians (add/remove link), Attendance, Health (edit profile), Pickup (verify/revoke persons), Documents (upload, verify/reject), Enrollment history, ID card (generate, download) | ✔ | TBD | TBD | |
| Admissions | Enquiries (add, update, convert to application); Applications (add, edit, schedule test, record result, decide, confirm admission, withdraw, documents); Waiting list (offer seat) | ✔ | TBD | TBD | |
| Parents & Guardians | Branch picker; Guardians (detail: edit, create parent login with one-time password, link child, unlink, history); Link requests (approve / reject) | ✔ | TBD | TBD | |
| Teachers & Helpers | Add staff; list. Detail `/staff/[id]`: edit details, change status, probation; tabs Profile, Assignments (add/end), Workload, Documents (upload, verify) | ✔ | TBD | TBD | |
| Timetable | Section timetable (edit cells, save draft, conflict check, publish); Bell schedule (edit periods); Substitutions (add/remove); Teacher week | ✔ | TBD | TBD | |
| Syllabus & Books | Book lists (edit, submit, approve/return, history); Syllabus plans (edit chapters/topics, submit, approve/return, topic progress); Coverage | ✔ | TBD | TBD | |
| Daily Diary & Homework | Diary (add/edit/publish entries per section & day); Moderation (publish / return); Missing diaries | ✔ | TBD | TBD | |
| Activities & Events | List / Calendar view, filters; propose; detail: edit (proposed), approve/reject, start, complete, cancel; participants & results; parent consent tracker | ✔ | TBD | TBD | |
| Notices | Compose with audience builder; save draft; publish; edit draft; read receipts | ✔ | TBD | TBD | |
| Attendance & Leave | Register (mark, mark all present, save draft, submit, request correction when locked, health alerts); Branch summary (jump to unmarked section); Staff attendance (status, check-in/out, save); Leave (approve/reject) | ✔ | TBD | TBD | |
| Exams & Results | Exams (create, edit); Grading schemes (add, edit, approve); Promotions (suggest, override, confirm for approval, apply). Detail `/exams/[id]`: schedule editor, open/close marks, mark sheets (enter, submit, accept/return), completeness, compute results, send for approval, publish, results + student result + report card PDF | ✔ | TBD | TBD | |
| Fees & Dues | Overview; Invoices (new, generate, issue selected; detail: issue, record payment, cancel, ledger, challan PDF); Payments (record, receipt, refund, reverse); Payment proofs (verify/reject); Dues (ledger, record payment, send reminders); Daily collections (close day); Concessions (request); Fee structure (fee heads, fee plans add/edit/approve) | ✔ | TBD | TBD | |
| Salary & Payroll | Runs (create, calculate/recalculate, mark reviewed, send for approval, close, record payment, view payslip); Salary structures (edit); Adjustments (add) | ✔ | TBD | TBD | |
| Expenses & Vendors | Expenses (add, submit for approval, record payment); Vendors (add); Categories (add) | ✔ | TBD | TBD | |
| Inventory & Purchasing | Stock; Items (add); Movements (record); Assets (add/edit); Purchasing (new request, create PO, receive, create bill); Student sales (record sale) | ✔ | TBD | TBD | |
| Health & Safety | Incidents (report, close); Allergy alerts; Change requests (open in Approvals) | ✔ | TBD | TBD | |
| Pickup & Departure | Date stepper; Early leave (record, approve/reject); Departures (record); Authorized persons (find student, verify/revoke) | ✔ | TBD | TBD | |
| Complaints | File complaint; boxes Mine / Assigned / All; detail: update, assign, escalate, reopen, close; timeline; "regarding" shown | ✔ | TBD | TBD | |
| Certificates | Branch filter; request; detail: approve/reject, issue, reissue, download PDF | ✔ | TBD | TBD | |
| Approvals | Filter status/type; detail with steps; approve / return / reject (never own request) | ✔ | TBD | TBD | |
| Reports & History | Catalog by area; request with parameters + format (PDF/XLSX/CSV) → background job → download; recent exports | ✔ | TBD | TBD | Web-only candidate (heavy exports, architecture.md §8 (web architecture): "Heavy exports: request → job id → poll → signed download link") |
| Settings & Backups | School picker. **School & branding** (name, logo, primary colour with contrast check, receipt/report-card footers); **Notifications** (email/SMS/push switches, category defaults); **Policies** (attendance lock, diary moderation, grading default, late fee, approval limits, password policy, session timeout, roles that must use 2FA); **Support** (failed notifications: resend / resend all; failed jobs: retry; system health); **Backups** (run, verify restore, download, view checks); **Data import** (kind + branch/session, template, upload, validate, errors + preview, commit / commit valid rows only, reconciliation, history, revert) | ✔ | TBD | TBD | Phase 5. Web-only candidate: phase5-contract §G (Android scope) has no settings, backups or import |
| Profile & Security | See Shared | ✔ | TBD | TBD | |

---

## PRINCIPAL

Branch-scoped. No `settings.*`, no `fees.add/edit`, no `payroll.add/edit`, no `expenses.add`, no `inventory.add/edit`, no `complaints.add`*, no `branches.add/delete`.

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Scope bar; pending-approvals panel; attendance-today; summary stats | ✔ | TBD | TBD | |
| Branch & Calendar | Branch: view, edit, branch settings, history. Tab "Sessions & Calendar": sessions add/edit/activate/close, terms, calendar events add/edit/delete | ✔ | TBD | TBD | Label override; calendar tab because the menu has no `sessions` (`use-branches-view.ts`) |
| Classes, Sections & Subjects | Add, edit, class subjects, archive section; rooms | ✔ | TBD | TBD | |
| Students | Register; list; Transfers (accept/reject/cancel); detail: edit, change section, transfer, withdraw, guardians, health edit, pickup verify/revoke, documents verify, ID card | ✔ | TBD | TBD | |
| Admissions | Same as SUPER_ADMIN (add, edit, test, decide, confirm, withdraw, offer seat) | ✔ | TBD | TBD | |
| Parents & Guardians | Edit, create parent login, link/unlink child, link requests approve/reject, history | ✔ | TBD | TBD | |
| Teachers & Helpers | Add staff; edit; change status; probation; assignments add/end; documents verify | ✔ | TBD | TBD | |
| Timetable | Section timetable edit + publish; bell schedule; substitutions; teacher week | ✔ | TBD | TBD | |
| Attendance & Leave | Register (proxy: mark, submit, correction); Branch summary; Staff attendance; Leave approve/reject | ✔ | TBD | TBD | `teacherwork.proxy` |
| Daily Diary & Homework | Add/edit/publish; Moderation (publish/return); Missing | ✔ | TBD | TBD | |
| Syllabus & Books | Edit book lists/plans, approve/return, topic progress, coverage | ✔ | TBD | TBD | |
| Activities & Events | Propose; approve/reject; start/complete/cancel; participants & results; consent tracker | ✔ | TBD | TBD | |
| Notices | Compose, draft, publish, edit draft, read receipts | ✔ | TBD | TBD | |
| Exams & Results | Create/edit exams; grading schemes add/edit/approve; promotions (suggest, override, confirm, apply); open/close marks; mark sheets (proxy entry, accept/return); compute; send for approval; publish; report cards | ✔ | TBD | TBD | |
| Fees & Dues | Overview; Invoices (issue selected / issue; ledger; challan PDF); Payments (list, receipt); Proofs (verify/reject); Dues (ledger); Daily collections (close day); Concessions (list); Fee structure (approve plans) | ✔ | TBD | TBD | No record payment / refund / new invoice (`fees.add` not held) |
| Salary & Payroll | Runs: view, send for approval, close run, view payslips; structures/adjustments view | ✔ | TBD | TBD | Decides payroll in Approvals (not own salary) |
| Expenses & Vendors | View expenses, vendors, categories; decide in Approvals | ✔ | TBD | TBD | |
| Inventory & Purchasing | View stock, items, movements, assets, purchasing; decide requests in Approvals | ✔ | TBD | TBD | "Student sales" tab hidden (needs `fees.add`) |
| Health & Safety | Incidents (report, close); allergy alerts; change requests | ✔ | TBD | TBD | |
| Pickup & Departure | Early leave (record, approve/reject); departures (record); authorized persons (verify/revoke) | ✔ | TBD | TBD | |
| Messages | Inbox "Mine" + "Branch (read-only)" toggle; new conversation; reply | ✔ | TBD | TBD | |
| Meetings & Appointments | Request meeting; Upcoming/Past (complete, no-show, cancel); My slots (add); Follow-ups | ✔ | TBD | TBD | |
| Complaints | File complaint*; Mine / Assigned / All; assign; update/escalate/close as a party; "regarding" shown | ✔ | TBD | TBD | *Button is not permission-gated on web; API `POST /complaints` has no extra permission |
| Certificates | Request; approve/reject; issue/reissue; download | ✔ | TBD | TBD | |
| Approvals | Decide (approve / return / reject), never own | ✔ | TBD | TBD | |
| Reports & History | Request exports (PDF/XLSX/CSV); recent exports | ✔ | TBD | TBD | Web-only candidate (heavy exports) |
| Settings & Backups (no menu entry) | `/settings` by URL: read-only School & branding, Notifications, Policies, Support (view); Data import (full flow) | ✔ (URL only, see note) | TBD | TBD | navigation.md has no settings in the principal menu. **Today the default principal permissions have no `settings.view`, so `ModuleGuard` blocks `/settings` until the API grants it** (see Web notes). Web-only candidate |
| Profile & Security | See Shared; 2FA can be made mandatory by policy | ✔ | TBD | TBD | |

---

## COORDINATOR / HEAD_TEACHER

Same default permissions (SUPERVISOR set). View-only on classes, students, staff, timetable, health, certificates; full diary/attendance/syllabus/exams review; `teacherwork.proxy`.

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Scope bar; pending-approvals panel; attendance-today; summary stats; notices feed card | ✔ | TBD | TBD | |
| Classes, Sections & Subjects | Read-only tabs (classes, sections, subjects, rooms) | ✔ | TBD | TBD | |
| Students | Read-only list + transfers list; detail tabs (profile, guardians, attendance, health, pickup, documents, enrollments, ID card generate) | ✔ | TBD | TBD | ID card "Generate" is not permission-gated on web (API decides) |
| Teachers & Helpers | Read-only list, detail (profile, assignments, workload, documents) | ✔ | TBD | TBD | |
| Timetable | Read-only admin view (section timetable, bell schedule, substitutions, teacher week) | ✔ | TBD | TBD | |
| Attendance & Leave | Register (proxy mark/submit, correction); Branch summary; Staff attendance; Leave approve/reject | ✔ | TBD | TBD | |
| Daily Diary & Homework | Add/edit/publish; Moderation; Missing | ✔ | TBD | TBD | |
| Syllabus & Books | Edit, submit, approve/return, topic progress, coverage | ✔ | TBD | TBD | |
| Activities & Events | Propose; start/complete/cancel; participants & results | ✔ | TBD | TBD | No approve (`activities.approve` not held) |
| Exams & Results | Create/edit exams; grading add/edit/approve; Promotions tab: suggest only; open/close marks; mark sheets (enter, submit, accept/return); compute; send for approval; results | ✔ | TBD | TBD | No publish; confirm/apply promotions are PRINCIPAL/SUPER_ADMIN only |
| Student Progress | Feedback notes (add); Homework completion (mark, mark all done, save) | ✔ | TBD | TBD | |
| Health & Safety | Incidents (report); Allergy alerts | ✔ | TBD | TBD | No close / change requests (`health.edit` not held) |
| Pickup & Departure | Early leave (record); Departures (view); Authorized persons (view) | ✔ | TBD | TBD | No approve/departure recording |
| Messages | Inbox; new conversation; reply. COORDINATOR also "Branch (read-only)" toggle | ✔ | TBD | TBD | HEAD_TEACHER has no branch toggle (`BRANCH_READERS` in `use-inbox.ts`) — see Web notes |
| Meetings & Appointments | Request; complete/no-show/cancel; My slots; Follow-ups | ✔ | TBD | TBD | |
| Complaints | File; Mine / Assigned / All; assign; update/escalate/close as a party | ✔ | TBD | TBD | |
| Approvals | Decide (approve / return / reject) | ✔ | TBD | TBD | |
| My Attendance, Leave & Salary | My attendance by month; my leave (apply); my payslips (PDF) | ✔ | TBD | TBD | |
| Profile & Security | See Shared | ✔ | TBD | TBD | |

---

## TEACHER

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Today panel (periods, registers to mark, diaries, unread messages, assigned complaints); summary stats; notices feed card | ✔ | TBD | TBD | |
| My Classes & Students | Read-only classes, sections (with student counts), subjects, rooms | ✔ | TBD | TBD | Label override. No student roster on this page (see Web notes) |
| Timetable | "My week" view with week navigation | ✔ | TBD | TBD | |
| Attendance & Leave | Register (mark, mark all present, save draft, submit, request correction); Leave (decide student leave as class teacher) | ✔ | TBD | TBD | |
| Daily Diary & Homework | Add/edit/publish entries | ✔ | TBD | TBD | Probation teachers' actions go to approval (API) |
| Syllabus & Books | Edit book lists and plans, submit, topic progress, coverage | ✔ | TBD | TBD | |
| Activities & Events | Propose; start/complete/cancel; participants & results | ✔ | TBD | TBD | |
| Exams & Results | Exams list (create/edit shown by `exams.add/edit`); grading add/edit; open/close marks; mark sheets (enter, submit) | ✔ | TBD | TBD | API scope limits to assigned sections |
| Student Progress | Feedback notes (add); Homework completion | ✔ | TBD | TBD | |
| Messages | Inbox; new conversation with parents; reply | ✔ | TBD | TBD | |
| Meetings & Appointments | Request; complete/no-show/cancel; My slots; Follow-ups | ✔ | TBD | TBD | |
| Complaints | File; Mine / Assigned; update/escalate/close as a party | ✔ | TBD | TBD | |
| My Attendance, Leave & Salary | My attendance; my leave (apply); my payslips (PDF) | ✔ | TBD | TBD | Own salary only |
| Profile & Security | See Shared | ✔ | TBD | TBD | |

---

## HELPER

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Today panel; summary stats | ✔ | TBD | TBD | |
| Classes, Sections & Subjects | Read-only | ✔ | TBD | TBD | |
| Attendance & Leave | Register as draft (mark, save draft, request correction); no submit; no Leave tab | ✔ | TBD | TBD | Helper output stays DRAFT (security.md §3) |
| Daily Diary & Homework | Add/edit draft entries; no publish | ✔ | TBD | TBD | |
| Activities & Events | Propose; start/complete/cancel; participants | ✔ | TBD | TBD | Holds `activities.add/edit` |
| Complaints | File; Mine / Assigned | ✔ | TBD | TBD | |
| My Attendance, Leave & Salary | My attendance; my leave (apply); my payslips | ✔ | TBD | TBD | |
| Profile & Security | See Shared | ✔ | TBD | TBD | |

---

## ACCOUNTANT

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Dashboard | Scope bar; summary stats | ✔ | TBD | TBD | No pending panel (not a leader role) |
| Students | Read-only list and transfers; student detail | ✔ | TBD | TBD | |
| Fees & Dues | All tabs and actions: invoices (new, generate, issue, cancel, challan), payments (record, receipt, refund, reverse), proofs (verify/reject), dues (record payment, reminders), close day, concessions (request), fee structure (add/edit/approve) | ✔ | TBD | TBD | |
| Salary & Payroll | Create run; calculate/recalculate; mark reviewed; record payment; payslips; structures (edit); adjustments (add) | ✔ | TBD | TBD | No send for approval / close (`payroll.approve` not held) |
| Expenses & Vendors | Add expense; submit for approval; record payment; vendors; categories | ✔ | TBD | TBD | |
| Inventory & Purchasing | Items, movements, assets, purchase requests, PO, receive, create bill, student sales | ✔ | TBD | TBD | |
| Complaints | File; Mine / Assigned | ✔ | TBD | TBD | |
| Reports & History | Request exports; recent exports | ✔ | TBD | TBD | Web-only candidate (heavy exports) |
| My Attendance, Leave & Salary | My attendance; my leave; my payslips | ✔ | TBD | TBD | |
| Profile & Security | See Shared; 2FA can be required by policy | ✔ | TBD | TBD | |

---

## PARENT

Every screen is scoped to the child picked in the top-bar child switcher. With no verified child, screens show "link your child" states.

| Menu entry | Key actions (web) | Web | Android | Status | Notes |
|---|---|---|---|---|---|
| Home | Child today: attendance, consent forms waiting, diary, notices, next meeting | ✔ | TBD | TBD | Label override |
| Child Profile | Read-only tabs: profile, guardians, attendance, health (request a change), pickup (add a pickup person), documents, enrollment history, ID card (download when issued) | ✔ | TBD | TBD | Label override |
| Daily Diary & Homework | Published diary, week by week | ✔ | TBD | TBD | |
| Attendance & Leave | Child attendance; leave requests (apply) | ✔ | TBD | TBD | |
| Progress & Results | Results with trend + report card PDF; teacher feedback; homework (last 30 days) | ✔ | TBD | TBD | Label override |
| Syllabus & Books | Child syllabus plans with progress; book list | ✔ | TBD | TBD | |
| Timetable, Calendar & Activities | Week timetable; activities with consent (grant / decline) | ✔ | TBD | TBD | Label override. No school calendar list (see Web notes) |
| Fees, Dues & Receipts | Invoices; invoice drawer (challan PDF, payments with receipt PDF); upload payment proof; proofs list | ✔ | TBD | TBD | Label override. No online payment (gateway off) |
| Certificates | Request for the child; download issued PDF | ✔ | TBD | TBD | |
| Messages, Notices & Requests | Tabs: Messages (new conversation with a teacher, reply), Notices feed, Requests (leave, early leave) | ✔ | TBD | TBD | Label override |
| Meetings & Appointments | Book a slot; upcoming (cancel); past | ✔ | TBD | TBD | |
| Complaints | File for a child; Mine; update/escalate/reopen/close | ✔ | TBD | TBD | |
| Profile & Security | See Shared + link a child, contact change request | ✔ | TBD | TBD | |

---

## Web notes

### Web-only candidates (decision needed)
No doc in `docs/` says outright that any module is web-only. architecture.md §1 says "One web panel, one Android app … menus, screens and actions are generated from" the role, so nothing is web-only by default. These are the web-only candidates. To mark them **Web-only (by design)**, add one line to docs/navigation.md (or architecture.md) and cite it here:

| Area | Why web | Doc hint |
|---|---|---|
| Settings & Backups (school & branding, notifications, policies, support, backups) | Setup and operations for SUPER_ADMIN; long forms; signed backup downloads | phase5-contract §G (Android scope) has none of it; §A says Android reads only `/branding` |
| Data import | XLSX templates, file upload, error tables with up to 500 rows, preview grids | phase5-contract §E/§G |
| Reports & History exports | PDF/XLSX/CSV files from background jobs, opened on a desktop | architecture.md §8 (Web architecture): heavy exports via job + signed link |
| Schools; Roles & Permissions; Principals & Admin Users | Rare heavy admin work: permission matrix, user assignments | — (no doc) |
| 2FA setup (QR + recovery codes) | QR is shown on web | phase5-contract §B "(QR on web)"; §G lists only the 2FA verify step for Android |
| Bulk finance work (generate invoices, bulk issue, close day, payroll runs) | Large tables with multi-select | — (no doc) |

### Web-side gaps and inconsistencies found
1. **PRINCIPAL `/settings`**: the web route lets a principal see Settings read-only and use Data import (`use-settings-route.ts`). But `default-role-permissions.ts` gives PRINCIPAL no `settings.view`, so `ModuleGuard` shows "no access". Either the API grants `settings.view` to PRINCIPAL (phase5-contract §A: "principal: own school read-only"; §E: imports "or principal"), or Data import for principals needs its own permission or route. This is not a web code bug, but the feature cannot be reached today.
2. **TEACHER "My Classes & Students"**: the page is the read-only Classes / Sections / Subjects / Rooms screen. It has no roster of the teacher's students, although the label promises one and the teacher holds `students.view`. **Partial.**
3. **PARENT "Timetable, Calendar & Activities"**: shows the week timetable and activities, but no school calendar (holidays/events). Parent has no `sessions.view`. **Partial.**
4. **Messages branch toggle**: "Branch (read-only)" is shown to PRINCIPAL and COORDINATOR but not HEAD_TEACHER (`BRANCH_READERS`), though both have the same permissions. Confirm whether this is intended.
5. **Unscoped buttons** (the API enforces, but the UI shows them): "File complaint" for every role; "Generate" ID card on any non-parent student detail; "Report incident" for any role with `health.view`; "Request meeting" for any staff role with `meetings.view`. Teachers see "Create exam", grading "Add", and open/close marks, because they hold `exams.add/edit`. The API scope limits these.
6. **Parent phone + OTP sign-in** (security.md §1): not on web, and there is no matching auth endpoint in the API. A system-wide gap, not web-only.
7. **Idle timeout**: web uses the env value (`NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES`, default 30) for all roles. It does not read the Phase 5 policy `sessionTimeoutMinutes`, so the policy setting has no effect on web yet.
8. **Students export**: PRINCIPAL/SUPER_ADMIN hold `students.export`, but the Students page has no export button. Exports go only through Reports & History. Acceptable if the report catalog has a students report; otherwise a gap.
9. **Phase 5 API dependency**: the web screens for settings, support, backups, imports, 2FA and unlock are built against docs/api/phase5-contract.md. The matching API modules (`settings`, `support`, `backups`, `imports`) are still stubs, so these rows are verified against the contract, not live endpoints.

All 34 catalogue modules are in `BUILT_MODULES` (`src/config/module-phases.ts`). No menu entry falls back to the "coming soon" page.
