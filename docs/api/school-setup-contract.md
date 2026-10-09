# School setup contract (one-form provisioning + setup checklist)

User request (2026-10-07): the super admin should not have to create school → branch → principal → session → classes one by one. One "New school" form creates everything; the principal then only adds teachers and students.

## 1. `POST /api/v1/schools/setup`

Super admin only (`schools.add` + `branches.add` + `users.add`, and the caller must hold SUPER_ADMIN — same rule as granting PRINCIPAL). One DB transaction: everything is created or nothing is.

Request:

```json
{
  "school": { "code": "BSS", "name": "Bright School", "phone": "+92...", "email": "...", "website": "...", "address": "...", "logoFileId": "uuid?" },
  "branch": {
    "name": "Main Branch",            // optional, default "Main Branch"
    "code": "MAIN",                   // optional, default "MAIN"
    "address": "?", "phone": "?", "email": "?",
    "timings": { "opensAt": "08:00", "closesAt": "14:00", "attendanceLockAt": "10:00",
                 "staffArrivesAt": "07:30", "staffLeavesAt": "14:00" },  // optional, these defaults; staff times optional inside (arrive = opensAt − 30 min, leave = closesAt; arrive ≤ opensAt, leave ≥ closesAt)
    "workingDays": [1,2,3,4,5,6]       // optional, default Mon–Sat
  },
  "principal": { "name": "Ayesha Khan", "email": "?", "phone": "?", "password": "?" },  // email or phone required; no password → temporary one generated
  "academics": {
    "createSession": true,            // default true
    "sessionName": "2026-27",         // default from dates
    "startDate": "2026-04-01",        // default: 1 April of current school year (Asia/Karachi)
    "endDate": "2027-03-31",          // default: 31 March next year
    "classesPreset": "STANDARD",      // STANDARD | NONE, default STANDARD
    "sectionsPerClass": 1,            // 1–4, default 1 → "A" (2 → A, B …)
    "subjectsPreset": "STANDARD"      // STANDARD | NONE, default STANDARD
  }
}
```

Presets (editable later by the principal):
- STANDARD classes, in order: Playgroup, Nursery, Prep, Class 1 … Class 10.
- STANDARD subjects: English, Urdu, Mathematics, General Science, Islamiat, Social Studies, Computer Science, Nazra Quran.

What it creates:
1. School row; school settings row with defaults (primary colour #0B7F74).
2. Branch with timings / working days; branch settings defaults.
3. Principal user (`mustChangePassword: true` when the password was generated), BRANCH-scoped PRINCIPAL role assignment, and `branch.principalUserId` set — both links in sync, exactly like `PUT /branches/:id/principal`.
4. If `createSession`: academic session ACTIVE for the branch; classes per preset; `sectionsPerClass` sections per class in that session; subjects per preset.
5. Audit entry per created entity; a welcome notification to the principal (email/SMS through the existing channels) with sign-in instructions — never the password in the notification log.

Response `201`:

```json
{ "data": {
  "school": { "id": "", "code": "", "name": "" },
  "branch": { "id": "", "code": "", "name": "" },
  "principal": { "id": "", "name": "", "email": "", "phone": "", "temporaryPassword": "only when generated, shown once" },
  "session": { "id": "", "name": "", "startDate": "", "endDate": "" } ,
  "counts": { "classes": 13, "sections": 13, "subjects": 8 }
} }
```

Errors (standard error envelope): `400 VALIDATION_FAILED` (field errors keyed `school.code`, `principal.email` …), `409 SCHOOL_CODE_TAKEN`, `409 USER_EMAIL_TAKEN` / `USER_PHONE_TAKEN`, `403` for non super admin.

The old separate endpoints (`POST /schools`, `/branches`, `/users`, `PUT /branches/:id/principal`) stay unchanged for adding extra branches later.

## 2. `GET /api/v1/setup/checklist?branchId=`

Principal (own branch; `branchId` optional for them) and super admin (`branchId` required). Response:

```json
{ "data": { "branchId": "", "complete": false, "items": [
  { "key": "session",   "done": true,  "count": 1 },
  { "key": "classes",   "done": true,  "count": 13 },
  { "key": "subjects",  "done": true,  "count": 8 },
  { "key": "teachers",  "done": false, "count": 0 },
  { "key": "students",  "done": false, "count": 0 },
  { "key": "timetable", "done": false, "count": 0 },
  { "key": "feePlan",   "done": false, "count": 0 }
] } }
```

`done` = count > 0 in the branch's active session (teachers = active staff with a TEACHER assignment in the branch). Cheap counts only.

## 3. Web

- Schools page: "New school" opens a 3-step wizard (School → Main branch → Principal & academics), then a review step, then a success screen showing the principal's sign-in (email/phone + temporary password with copy button, "shown once" warning) and links "Open branch" / "Done". Branch step is pre-filled with the defaults; academics step shows the preset classes/subjects as chips the admin can untick. Field errors from the API land on the right step.
- "Add branch" for an existing school stays as it is.
- Dashboard (principal, and super admin per selected branch): "Set up your school" card from the checklist — each item with done tick, count, and a link to the page that completes it (teachers → staff, students → admissions/students, timetable, fee plan). Hidden when `complete`, and dismissible per user (localStorage).

## 4. Android

- Principal dashboard shows the same "Set up your school" card (read-only, items link to the screens that exist in the app; others just show status). Hidden when complete.
- Super admin school creation stays web-only (the app is read-only for organisation).

## Deviations

API implementation notes (2026-10-07); web/Android please adapt:

- **400 field errors**: the standard envelope is kept — `error.details` is an array of strings, each starting with the dotted field path, e.g. `"school.code must be 2-12 uppercase letters or digits"`, `"principal.email or principal.phone is required"`, `"academics.endDate must be after academics.startDate"`. Map a message to a field by its first token. Note `""` is not "absent": send no key (or omit) for empty optional fields, otherwise `principal.email must be an email` etc.
- **Principal** in the 201 response: `email` / `phone` are `null` when not given. `temporaryPassword` is present only when generated; a chosen password gives `mustChangePassword: false` (it must still meet the baseline policy: 8+ chars, letter + digit). A principal with a temporary password gets `403 PASSWORD_CHANGE_REQUIRED` on every call (also `/setup/checklist`) until `POST /auth/password/change`.
- **`createSession: false`**: `session` is `null` and `counts` are all 0 (no classes/subjects either).
- **Defaults**: `startDate` given without `endDate` → end = start + 1 year − 1 day; `sessionName` from the years (`2026-27`, or `2026` when both dates are in one year). Preset subjects are not linked to classes (class → subjects stays a principal task). The branch's `attendance.lockTime` setting is saved equal to `timings.attendanceLockAt`.
- **Welcome notification**: category `ROLE`, in-app + EMAIL/SMS (whichever contact exists), sent after commit; no password in it.
- **Checklist counting** (all in the branch's ACTIVE session unless noted): `session` 1/0; `classes` = active classes with an active section in the session; `subjects` = active subjects of the school (school-wide); `teachers` = ACTIVE staff of the branch whose login holds an active TEACHER role assignment in that branch (not session-bound); `students` = ACTIVE enrollments; `timetable` = section timetables that are PUBLISHED (or DRAFT_REVISION of a published one); `feePlan` = APPROVED fee plans. No active session → everything but `subjects`/`teachers` is 0.
- **Checklist errors**: Super Admin without `branchId` → `400 VALIDATION_FAILED`; principal asking for another branch → `403 FORBIDDEN_SCOPE`; any other active role → `403 FORBIDDEN`; unknown branch → `404`. Route permission is the existing `dashboard.view` (no new permission key).
- `academics.classNames` / `academics.subjectNames` (optional string arrays): a partial pick from the STANDARD class / subject names. When sent they replace `classesPreset` / `subjectsPreset`; preset order (and `levelOrder`) is kept. Unknown names → 400 on that field. The web wizard sends them only when some tiles are unticked.
