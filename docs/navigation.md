# Navigation Catalogue (shared contract: API, Web, Android)

Both clients keep the same catalogue. Ids, labels and permission keys must be identical everywhere.

**Menu rule** — permissions and menus are different things:
- For a **system role**, the menu = that role's default list below, filtered by the permissions the user holds. Permissions outside the list (e.g. a teacher's `guardians.view`, `health.view`, `sessions.view`) are used *inside* other screens (messages, attendance, profile) and never add a menu entry.
- For a **custom role** (created in Roles & Permissions), the menu = every catalogue entry whose `.view` permission the role holds, in catalogue order.
- With multiple roles, the menu follows the **active** role context only.

## Role keys
`SUPER_ADMIN, PRINCIPAL, COORDINATOR, HEAD_TEACHER, TEACHER, HELPER, ACCOUNTANT, PARENT`

## Catalogue

| id | Label | Permission | Icon (lucide / material) |
|---|---|---|---|
| dashboard | Dashboard | `dashboard.view` | layout-dashboard / Dashboard |
| schools | Schools | `schools.view` | school / School |
| branches | Branches | `branches.view` | building-2 / Apartment |
| users | Principals & Admin Users | `users.view` | user-cog / ManageAccounts |
| roles | Roles & Permissions | `roles.view` | shield-check / AdminPanelSettings |
| sessions | Sessions & Calendar | `sessions.view` | calendar-days / CalendarMonth |
| classes | Classes, Sections & Subjects | `classes.view` | layers / Layers |
| admissions | Admissions | `admissions.view` | clipboard-list / Assignment |
| students | Students | `students.view` | graduation-cap / School |
| guardians | Parents & Guardians | `guardians.view` | users / FamilyRestroom |
| staff | Teachers & Helpers | `staff.view` | id-card / Badge |
| timetable | Timetable | `timetable.view` | clock / Schedule |
| syllabus | Syllabus & Books | `syllabus.view` | book-open / MenuBook |
| diary | Daily Diary & Homework | `diary.view` | notebook-pen / EditNote |
| activities | Activities & Events | `activities.view` | trophy / EmojiEvents |
| notices | Notices | `notices.view` | megaphone / Campaign |
| attendance | Attendance & Leave | `attendance.view` | calendar-check / FactCheck |
| exams | Exams & Results | `exams.view` | file-check / Grading |
| progress | Student Progress | `progress.view` | trending-up / TrendingUp |
| fees | Fees & Dues | `fees.view` | wallet / AccountBalanceWallet |
| payroll | Salary & Payroll | `payroll.view` | banknote / Payments |
| expenses | Expenses & Vendors | `expenses.view` | receipt / ReceiptLong |
| inventory | Inventory & Purchasing | `inventory.view` | package / Inventory2 |
| health | Health & Safety | `health.view` | heart-pulse / HealthAndSafety |
| pickup | Pickup & Departure | `pickup.view` | door-open / DirectionsWalk |
| messages | Messages | `messages.view` | message-square / Chat |
| meetings | Meetings & Appointments | `meetings.view` | calendar-clock / EventAvailable |
| complaints | Complaints | `complaints.view` | message-square-warning / ReportProblem |
| certificates | Certificates | `certificates.view` | award / WorkspacePremium |
| approvals | Approvals | `approvals.view` | check-circle / TaskAlt |
| reports | Reports & History | `reports.view` | bar-chart-3 / BarChart |
| my_salary | My Attendance, Leave & Salary | `self.payroll.view` | wallet-cards / AccountBalance |
| settings | Settings & Backups | `settings.view` | settings / Settings |
| profile | Profile & Security | `profile.view` | user-circle / AccountCircle |

## Default menus by role (order)

- **SUPER_ADMIN**: dashboard, schools, branches, users, roles, sessions, classes, students, admissions, guardians, staff, timetable, syllabus, diary, activities, notices, attendance, exams, fees, payroll, expenses, inventory, health, pickup, complaints, certificates, approvals, reports, settings, profile
- **PRINCIPAL**: dashboard, branches (label "Branch & Calendar"), classes, students, admissions, guardians, staff, timetable, attendance, diary, syllabus, activities, notices, exams, fees, payroll, expenses, inventory, health, pickup, messages, meetings, complaints, certificates, approvals, reports, profile
- **COORDINATOR / HEAD_TEACHER**: dashboard, classes, students, staff, timetable, attendance, diary, syllabus, activities, exams, progress, health, pickup, messages, meetings, complaints, approvals, my_salary, profile
- **TEACHER**: dashboard, classes (label "My Classes & Students"), timetable, attendance, diary, syllabus, activities, exams, progress, messages, meetings, complaints, my_salary, profile
- **HELPER**: dashboard, classes, attendance, diary, activities, complaints, my_salary, profile
- **ACCOUNTANT**: dashboard, students, fees, payroll, expenses, inventory, complaints, reports, my_salary, profile
- **PARENT** (child switcher on top): dashboard (label "Home"), students (label "Child Profile"), diary, attendance, progress (label "Progress & Results"), syllabus, timetable (label "Timetable, Calendar & Activities"), fees (label "Fees, Dues & Receipts"), messages (label "Messages, Notices & Requests"), meetings, complaints, profile

Label overrides per role live next to the catalogue in each client (`labelFor(role, id)`).
