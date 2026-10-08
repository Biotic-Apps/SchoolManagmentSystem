# eSchool — Pilot plan

One branch, one term, a small school team plus one technical person. Server setup and support tooling are in
[deployment.md](deployment.md).

## 1. Who does what

| Person | Role in the system | Pilot job |
|---|---|---|
| Technical lead (1) | Super Admin | Server, backups, accounts for the principal, provider setup, weekly health check, updates |
| Principal | Principal | Owner of the pilot: approves data, signs off UAT and go-live, runs the weekly review |
| Office / admin person | Principal or Coordinator account | Data entry and imports, parent account help desk |
| Accountant | Accountant | Fee plans, opening balances, daily collections |
| 2–3 "champion" teachers | Teacher | Learn first, help other teachers |
| 5–10 volunteer parents | Parent | Test the parent app/web in week 1 before all parents are invited |

## 2. Timeline (about 6 weeks)

| Week | What | Done when |
|---|---|---|
| 0 | Server, domains, email/SMS providers, first super admin (deployment.md §4) | Test email and test SMS arrive |
| 1 | School setup + data import (section 3) | Principal has checked class lists, staff and opening balances |
| 2 | Training (section 4) + UAT (section 5) on the real data | All UAT rows ticked or logged |
| 3 | Go-live for staff (attendance, diary, fees); volunteer parents | Go-live checklist (section 6) signed |
| 4 | All parents invited | ≥ 60 % of families signed in |
| 5–6 | Normal running, weekly review, exit decision (section 9) | Exit criteria met or plan agreed |

## 3. Onboarding runbook (school setup)

Do the steps in this order — each one needs the one before. Sign in as **Super Admin** unless noted.

- [ ] **School**: Schools → add the school (name, logo, contact). Settings & Backups → School & branding: logo, colours, time zone `Asia/Karachi`, currency.
- [ ] **Notifications**: Settings & Backups → Notifications: sender name for email, SMS sender ID, which categories go by SMS / email / push.
- [ ] **Policies**: Settings & Backups → Policies: password rules, session timeout, 2FA required for Super Admin / Principal / Accountant, approval amount limits.
- [ ] **Branch**: Branches → add the pilot branch (address, timings, office hours).
- [ ] **Principal account**: Principals & Admin Users → add the principal (they must change the password at first sign-in).
- [ ] **Session**: Sessions & Calendar → academic session and terms; holidays and events on the calendar.
- [ ] **Classes**: Classes, Sections & Subjects → classes, sections (with rooms), subjects.
- [ ] **Staff** (principal or admin): Settings & Backups → Data import → *Staff* template → fill → upload → check errors → commit. Then Teachers & Helpers → assign class teachers and subject teachers to sections.
- [ ] **Students and guardians**: Data import → *Students* template, then *Guardians* template (links parents to children by admission number). Use one phone number per parent in `+92…` or `03…` format — parents sign in with it.
- [ ] **Fee plans** (accountant/admin): Data import → *Fee plans* (or Fees & Dues → fee plans by hand).
- [ ] **Opening balances**: Data import → *Opening balances* — dues each student already owes from the old system.
- [ ] **Timetable**: Timetable → bell schedule → section timetables → publish.
- [ ] **Check**: the principal compares three class lists, five student fee balances and the staff list against the old records and signs off.

Data import tips: download the template each time (it has an Instructions sheet); fix the rows listed in the error
table and upload again; "Commit" only when the preview looks right; an import can be **reverted** as long as nothing
uses its data yet. Keep the original spreadsheets.

## 4. Training (per role)

Short, hands-on sessions on the real school data, in the school. Each person signs in with their own account.

| Role | Length | Covers |
|---|---|---|
| Principal | 2 h | Dashboard, approvals inbox, attendance/diary review, fee monitoring, notices, complaints, reports, staff and users, Settings (read-only parts), 2FA |
| Office / admin | 2 h | Admissions, students and guardians, contact-change approvals, data import, certificates, pickup, parent help desk (password reset, phone sign-in) |
| Coordinator / Head teacher | 1.5 h | Sections and timetable, proxy attendance/diary, syllabus review, exams and progress, approvals |
| Teacher | 1 h (+ 30 min on the Android app) | Mark attendance, diary and homework, syllabus progress, marks entry, messages, meetings, own salary/leave |
| Helper | 30 min | Draft attendance/diary, activities, own leave |
| Accountant | 2 h | Invoices, recording payments, verifying payment proofs, receipts, reversals with reason, expenses, payroll, inventory, reports |
| Parents | 10-min demo at a parent meeting + one-page handout | Install app / open the web link, sign in with email code, child switcher, diary, attendance, fees and receipts, messages |

Hand-outs: one page per role with the sign-in link, the 3–5 daily tasks, and who to call for help.

## 5. UAT checklist (per role)

Run on the pilot server with real accounts. Tick each item on **web** (W) and **Android** (A) where the role uses the
app. Anything that fails goes into the feedback log (section 8) with a screenshot.

**All roles**
- [ ] Sign in; forced password change on first sign-in; sign out.
- [ ] Menu matches the role (below); no menu item gives "Forbidden".
- [ ] Profile & Security: change password, see and revoke sessions; 2FA where required.
- [ ] Forgot password → email/SMS arrives → reset works.

**Super Admin** — menu: Dashboard, Schools, Branches, Principals & Admin Users, Roles & Permissions, Sessions & Calendar, Classes, Students, Admissions, Parents & Guardians, Teachers & Helpers, Timetable, Syllabus, Diary, Activities, Notices, Attendance, Exams, Fees, Payroll, Expenses, Inventory, Health, Pickup, Complaints, Certificates, Approvals, Reports, Settings & Backups, Profile
- [ ] Create a user, assign a role, disable it (sessions end at once), unlock a locked account.
- [ ] Custom role in Roles & Permissions shows only its menus.
- [ ] Settings & Backups: Run backup → DONE; Verify restore → passed; Support → health all green; Send test message (email + SMS) arrives.
- [ ] Audit: filter by user and date.

**Principal** — menu: Dashboard, Branch & Calendar, Classes, Students, Admissions, Guardians, Staff, Timetable, Attendance, Diary, Syllabus, Activities, Notices, Exams, Fees, Payroll, Expenses, Inventory, Health, Pickup, Messages, Meetings, Complaints, Certificates, Approvals, Reports, Settings, Profile
- [ ] Approve an attendance correction, a leave request, a concession within the limit (above the limit escalates).
- [ ] Publish a notice to one class; parents of that class see it, others do not.
- [ ] Publish exam results; parents see only published results.
- [ ] Data import (students) with one deliberate error row → error shown → fix → commit.
- [ ] Issue a certificate; verify it via its public link/QR.

**Coordinator / Head teacher** — menu: Dashboard, Classes, Students, Staff, Timetable, Attendance, Diary, Syllabus, Activities, Exams, Progress, Health, Pickup, Messages, Meetings, Complaints, Approvals, My Attendance/Leave/Salary, Profile
- [ ] Proxy attendance for an absent teacher (audit shows both names).
- [ ] Review a probation teacher's diary entry (approve/return).

**Teacher** — menu: Dashboard, My Classes & Students, Timetable, Attendance, Diary, Syllabus, Activities, Exams, Progress, Messages, Meetings, Complaints, My Attendance/Leave/Salary, Profile
- [ ] Mark attendance for own section (W + A); on Android also with no internet → syncs when back online.
- [ ] Cannot open another section's students or another teacher's payslip.
- [ ] Post diary/homework with an attachment; parent sees it.
- [ ] Enter marks for an assigned subject; update syllabus progress.
- [ ] Reply to a parent message; publish meeting slots.

**Helper** — menu: Dashboard, Classes, Attendance, Diary, Activities, Complaints, My Attendance/Leave/Salary, Profile
- [ ] Draft attendance/diary is not visible to parents until the teacher finalises it.
- [ ] No access to fees, results approval or salaries.

**Accountant** — menu: Dashboard, Students, Fees, Payroll, Expenses, Inventory, Complaints, Reports, My Attendance/Leave/Salary, Profile
- [ ] Generate invoices for a month; record a cash payment (allocates oldest dues first); print the receipt.
- [ ] Verify a parent's uploaded payment proof; reverse a payment with a reason.
- [ ] Opening balances match the old records for five students.
- [ ] Run payroll for the month; payslips visible to each staff member only.
- [ ] Export a fee report (XLSX/PDF).

**Parent** — menu: Home, Child Profile, Diary, Attendance, Progress & Results, Syllabus, Timetable/Calendar/Activities, Fees/Dues/Receipts, Certificates, Messages/Notices/Requests, Meetings, Complaints, Profile
- [ ] Sign in with email code (W + A); wrong code is refused; email/password sign-in still works.
- [ ] Child switcher shows only own children; each screen follows the selected child.
- [ ] See today's attendance and diary, fee dues, download a receipt, upload a payment proof.
- [ ] Message the class teacher; book a meeting slot; file a complaint and see its status.
- [ ] Push notification arrives on Android for a new notice (if push is configured).

## 6. Go-live checklist
Technical lead:
- [ ] HTTPS works on both domains; uptime checks alerting to the technical lead's phone.
- [ ] Email and SMS providers live (not `log`); test messages arrive; SMS sender ID approved.
- [ ] Nightly backup ran and is DONE; weekly restore check passed once; off-site copy present; restore drill done once.
- [ ] `BACKUP_ENCRYPTION_KEY` and all secrets in the school's password manager (two people can open it).
- [ ] Super admin and principal have 2FA on; the demo/seed admin password was changed.
- [ ] Android release build points at the production API and is installed on the champions' phones.
- [ ] CI green on the deployed commit; commit id written in the feedback log.

School:
- [ ] Principal signed off the data check (section 3) and UAT (section 5).
- [ ] Every staff member has signed in once and changed their password.
- [ ] Parent handout printed; help-desk person and hours announced (e.g. office, 8 AM – 2 PM).
- [ ] Paper fallback agreed for the first week (attendance register kept in parallel).
- [ ] Old system stays read-only (not switched off) until the exit decision.

## 7. First-week support routine
Daily (technical lead, ~15 min, before 9 AM):
- [ ] Uptime: no alerts overnight. Settings & Backups → Support: health green, last backup today, no failed jobs.
- [ ] Failed notifications: resend or fix the provider/number.
- [ ] Read new entries in the feedback log; reply to the reporter the same day.

Daily (office person):
- [ ] Help parents who cannot sign in (wrong phone on record → fix guardian phone; locked → ask super admin to unlock).
- [ ] Note every question that came up twice in the feedback log ("training gap").

End of week 1 (30 min, principal + technical lead + champions): go through the feedback log, choose what to fix
first, decide whether to invite all parents (week 4).

From week 2: daily check becomes weekly (Monday), plus the monthly restore drill (infra/scripts/restore-drill.md).

## 8. Feedback log
Keep one shared sheet (Google Sheet / Excel on a shared drive). One row per issue or idea:

| # | Date | Who (role) | Web / Android | Screen | What happened / what they wanted | Screenshot | Severity | Owner | Status | Fixed in (version/commit) |
|---|---|---|---|---|---|---|---|---|---|---|

Severity: **S1** blocks school work or wrong money/attendance data (fix within 1 day, may pause the pilot) ·
**S2** a task is hard but has a workaround (this week) · **S3** cosmetic / idea (backlog).
Also log: each update (date, commit), each restore drill (date, file, pass/fail), each incident (deployment.md §10).

## 9. Exit criteria (end of week 6)
Continue to more branches when all are true:
- [ ] No open S1; ≤ 5 open S2, each with a plan.
- [ ] Attendance marked in the system for ≥ 95 % of school days by every section for the last 3 weeks.
- [ ] Fee collections in the system match the bank/cash book for the last month (accountant sign-off).
- [ ] ≥ 70 % of families signed in at least once; ≥ 50 % active in the last 2 weeks.
- [ ] No data loss; nightly backups every day; restore drill passed; uptime ≥ 99 % during school hours.
- [ ] Principal and accountant agree the old system / paper register can stop.

If not met: agree the fixes and extend the pilot by 2–4 weeks; do not add branches yet.
