# Academics & timetable contract (class setup, allocation, bell schedule, timetable builder)

Status: design, 2026-10-08. Three implementation agents (API, Web, Android) build from this file. It extends
`school-setup-contract.md`, `phase2-contract.md` (academics) and the timetable section of `backendFlows.md` §5.
Anything marked **(optional)** can be skipped in this pass without breaking the rest.

User problems this fixes (owner of a Pakistani school, set up via "New school"):

1. Every class gets the same sections; Class 9/10 may have only A, B while Playgroup has A–D.
2. Every class gets the same subjects, and in fact **no** subject is linked to any class, so the lesson dialog's
   Subject list is empty.
3. Rooms can only be made on another page; too many screens ("UI mein zyada ghumna na pade").
4. Periods were named after subjects ("english, urdu, math …"). Periods are time slots, not subjects.
5. Roles are unclear (who builds, who publishes, who only views).
6. Fresh timetable shows "Draft · Version 0", Save draft is disabled, Publish is enabled and fails with
   "There is no draft to publish". Lessons added in the dialog live only in browser memory until "Save draft".
7. /classes lists classes with unexplained number columns (Level order, subject count), the header scrolls away,
   and the Sections tab repeats each class 4 times ("Playgroup A, Playgroup B …") with empty columns and an
   "Active" badge on every row.

---

## 1. Audit: what is broken today (root causes)

### 1.1 Empty subject dropdown (main root cause)

- `SchoolApi/src/modules/school-setup/steps/academics.step.ts:179-193` creates subjects but **never creates
  `class_subjects` rows**. `presets.ts:251-263` has one flat subject list for the whole school.
- The lesson dialog loads subjects with `useClassSubjects(section.classId)`
  (`SchoolWeb/src/features/timetable/use-cell-dialog.ts:13`) → `GET /classes/:id/subjects`, which only returns
  subjects linked to the class (`classes.repository.ts:66-71`). No links → empty list.
- Knock-on: subject-teacher assignments require the link too (`staff-assignments.service.ts:175-180`
  "Subject is not taught in this class"), so the principal can't allocate teachers either, and the conflict check
  then reports every lesson as `TEACHER_NOT_ASSIGNED` (`conflict-checker.ts:74-82`) so nothing can be published.
- The only fix path is Classes → Classes tab → row menu → "Subjects" dialog, one class at a time
  (`ClassSubjectsDialog.tsx`), with no periods/week, and the dialog's empty state sends the user to another tab.

### 1.2 Sections

- `academics.step.ts:155` uses one `sectionsPerClass` (1–4) for every class (`presets.ts:274-279`). The wizard has
  one select for it (`SchoolWeb/src/features/school-setup/components/AcademicsFields.tsx:36`).
- Per-class sections are possible via `POST /sections` but only from the flat Sections tab.
- `sections.service.ts:95-102` archives a section even when students are enrolled or a timetable exists.
- No notion of a Matric group (Science/Arts) on a section.

### 1.3 Class subjects API

- `PUT /classes/:id/subjects` takes only `subjectIds` (`set-class-subjects.dto.ts`); `periodsPerWeek` and
  `isOptional` exist in the schema (`organisation.prisma` `ClassSubject`) but can never be set.
- `classes.service.ts:66-71` checks only `assertReadSchool` before editing (any `classes.edit` holder who can
  read the school edits school-wide data).
- `classes.repository.ts:79-89` hard-deletes links even when lessons/assignments use the subject.

### 1.4 Teacher list in the lesson dialog

- `use-cell-dialog.ts:15` → `useStaffOptions(branchId, "TEACHER")` (`staff/api.ts:41-46`): first 100 active staff
  of the branch (`config/options.ts:14`), filtered by **login role keys** (`staff.mapper.ts:51`, from
  `user.roleAssignments`). So: staff added without a login (`createAccount: false`) never appear; a head teacher /
  coordinator / principal who also teaches never appears; over 100 staff are cut off.
- `cell-options.ts:9-30` lists section-assigned teachers first, but assignments rarely exist (see 1.1).
- Nothing shows a teacher's load or that the teacher is busy in another section at that period.

### 1.5 Bell schedule / periods

- `BranchPeriod` (`academics-plan.prisma:36-54`) has one schedule per branch; no Friday/short-day variant
  (Pakistani schools close ~12:30 on Fridays).
- `label` is free text on every row (`BellPeriodRow.tsx:28`, placeholder "e.g. Lunch"); the grid shows the label
  as the row title (`grid.ts:83`), so the user's labels "english / urdu / math" look like subjects.
- Breaks are rows with their own index, so "Period 6" in the UI can be the 5th teaching period.
- `periods.service.ts:156-191` replaces all rows even when draft/published slots use removed indexes (orphans).
- The wizard creates no bell schedule; the timetable shows "No bell schedule yet" first.

### 1.6 Draft / publish lifecycle (user report 6)

- `timetables.service.ts:167-175` returns `status: 'DRAFT', version: 0` when **no timetable row exists**, so the
  web never shows its "Not created yet" branch (`TimetableToolbar.tsx:23-31`) and shows "Draft · Version 0".
- `TimetableToolbar.tsx:52-57`: Publish is always enabled for `timetable.publish`; Save draft is enabled only when
  dirty. With nothing saved, publish → `409 "There is no draft to publish"` (`timetables.service.ts:253-254`).
  Same for an already-published timetable with no changes.
- Lessons applied in the dialog only change React state (`use-timetable-editor.ts:71-88`); switching section
  (editor is keyed by section id, `SectionTimetableTab.tsx`), tab, page or closing the browser loses them.
  The dialog even says "Changes stay in the draft until you save".
- `conflictsOf` compares the draft only with other sections' **published** slots
  (`timetables.repository.ts:30-38`), so two drafts can double-book a teacher until the second publish fails.
- `validateSlots` (`timetables.service.ts:348-389`) does not check that the subject belongs to the class, that the
  staff member is in the branch/active, or the day's period exists.
- Grid falls back to Mon–Fri (`options.ts` `SCHOOL_DAYS`) while branches default to Mon–Sat.

### 1.7 Roles

- `default-role-permissions.ts`: PRINCIPAL has `timetable.view/add/edit/approve/publish`; COORDINATOR and
  HEAD_TEACHER only `timetable.view` (line 66) although navigation.md gives them the Timetable menu; TEACHER only
  view. SUPER_ADMIN all. Teachers can't build; that is right, but nothing lets a school delegate building to a
  head teacher/coordinator.
- `staff-assignments.service.ts:51-52`: nobody can change their own assignments (a principal who teaches cannot
  allocate themselves; keep, but the message must say who can).

### 1.8 Classes page (user report 7)

- `ClassesPage.tsx:44-63`: four tabs Classes / Sections / Subjects / Rooms.
- `class-columns.tsx:15-16`: "Level order" (internal sort key) and "Subjects" (count) as bare numbers; no
  sections, students or class teachers; header not sticky.
- Sections tab: one row per section with Capacity/Room often "—" and Status "Active" on every row.
- Allocation (teacher ↔ subject ↔ section) lives elsewhere: Teachers & Helpers → staff → Assignments → one dialog
  per assignment (`staff/components/AssignmentFormDialog.tsx`), staff-centric instead of class-centric.

### 1.9 Android (read-only, OK but must follow)

- `feature/timetable/ScheduleRow.kt:60` uses the label only for breaks (fine). Needs day variants and the new
  period numbering; `TimetableViewModel.kt:138-140` mode by role is fine.

---

## 2. Research summary (how others do it)

- **aSc Timetables**: you first enter *lessons* = class × subject × teacher × count/week, then place cards; cards
  are distributed over the week, not more than one per day by default. A lesson without a teacher is flagged.
  (help.asctimetables.com, "Lessons" topics.)
- **Fedena**: "class timing sets" (periods/day with durations) assigned per weekday — i.e. a short Friday is a
  separate timing set; subjects of the batch show "max weekly classes" as a guide while allocating; "work
  allotment" assigns subjects to employees before building. (support.fedena.com: "How to create class timing
  sets", "How can I create a timetable?")
- **Gibbon**: timetable *columns* = reusable day structures (rows = Period 1, Period 2, Lunch …); schools with a
  different Friday make a second column. (docs.gibbonedu.org/administrators/timetable)
- **Pakistan**: classes Playgroup/Nursery/Prep (KG), Class 1–5 primary, 6–8 middle, 9–10 Matric with Science
  vs Humanities (Arts) groups set by the board's scheme of studies; e.g. Punjab 2025-26 scheme for Class 9:
  Urdu 5, Islamiat 6, Mathematics 6, Science/optional subjects 6 periods/week (ilmkidunya / Pakistan Observer
  reports on the PCTB scheme). Fridays commonly end ~12:30 (Punjab/Sindh school-timing notifications).
  Matric groups are usually run as separate sections (9-A Science, 9-B Arts) in small/medium private schools.

Pragmatic takeaways used below: allocation grid before placement; class-wise subjects with periods/week as a
guide (not a hard rule); bell schedule = time slots with a Friday variant; conflicts shown live; section-level
group for Matric (parallel electives inside one section are out of scope).

---

## 3. Target model and decisions

| # | Decision |
|---|----------|
| D1 | Classes stay school-wide; `ClassSubject` is the class's curriculum: subject, `periodsPerWeek`, `isOptional`, new `group`, new `sortOrder`. |
| D2 | Sections get `group` (e.g. "Science", "Arts"; null = no group). A class subject with `group = null` applies to all sections; with a group, only to sections of that group. |
| D3 | Allocation = existing `StaffAssignment` (`SUBJECT_TEACHER` per section+subject, `CLASS_TEACHER` per section). No new table. Edited from the class screen, not the staff screen. |
| D4 | Bell schedule rows get `day` (0 = default for every working day, 1–7 = that weekday's own schedule). Wizard and editor keep the break at the same position for variants so grid rows line up. |
| D5 | Period `label` only means something on breaks ("Break", "Assembly", "Lunch"). Teaching periods are always shown as "Period N" where N = ordinal among teaching periods of that day (API returns `number`). Migration clears labels on non-break rows. |
| D6 | Timetable edits are saved per cell immediately to the server draft (autosave). No "Save draft" button. Publish is one step and is disabled with a reason when there is nothing to publish. |
| D7 | Conflicts have severity: `error` blocks publish, `warning` doesn't. Draft-vs-draft clashes become warnings. |
| D8 | Teacher candidates come from a new API list (all active branch staff with a teaching designation/assignment, login or not), each with load. |
| D9 | COORDINATOR / HEAD_TEACHER get `timetable.edit` (build drafts, allocate teachers, add rooms, substitutions). Publishing stays PRINCIPAL / SUPER_ADMIN. Teachers view only; a school that wants a teacher to build gives them a HEAD_TEACHER/COORDINATOR assignment. |
| D10 | Classes page = one "Classes" overview (one card per class) + one "Class setup" screen per class (sections, subjects, teachers). Sections tab removed; Subjects & Rooms become one secondary "Subjects & rooms" tab for renaming/archiving master data. |

### 3.1 Role matrix

| Capability | SUPER_ADMIN | PRINCIPAL (branch) | COORDINATOR / HEAD_TEACHER (branch scope) | TEACHER | HELPER | PARENT |
|---|---|---|---|---|---|---|
| School setup wizard | ✔ | – | – | – | – | – |
| Classes overview | all schools/branches | own branch | view | "My Classes" (existing) | existing | – |
| Add/rename/reorder/archive class, class subjects (curriculum) | ✔ | ✔ (school-wide data; audited) | view | – | – | – |
| Sections add/archive, capacity, room, group | ✔ | ✔ | view | – | – | – |
| Class teacher + subject teacher allocation | ✔ | ✔ | ✔ (`timetable.edit`) | – | – | – |
| Bell schedule edit | ✔ | ✔ | ✔ | view | view | view (times only) |
| Rooms create (inline) | ✔ | ✔ | ✔ (`timetable.edit`) | – | – | – |
| Timetable draft edit, auto-fill, check | ✔ | ✔ | ✔ | – | – | – |
| Publish / discard draft | ✔ | ✔ | – | – | – | – |
| Substitutions | ✔ | ✔ | ✔ | sees own | – | sees child's |
| View timetables | all | branch (drafts too) | branch (drafts too) | own week + published timetables of sections they teach | own week | child's published week |

Coordinator/head teacher assigned at **section** scope: view only (they don't manage the branch). Nobody edits
their own assignments (existing rule; error message: "Ask the principal to change your own assignments").

---

## 4. Data model changes (Prisma) — one migration `20261008_academics_timetable`

```prisma
model Section {            // organisation.prisma
  // + new
  group String? @db.VarChar(30)   // "Science", "Arts", null = none
}

model ClassSubject {       // organisation.prisma
  // existing: isOptional, periodsPerWeek, status
  group     String? @db.VarChar(30)   // null = all sections of the class
  sortOrder Int     @default(0) @map("sort_order")
}

model BranchPeriod {       // academics-plan.prisma
  day Int @default(0) @db.SmallInt   // 0 = default schedule, 1..7 = weekday-specific schedule
  // @@unique([branchId, index])  →  @@unique([branchId, day, index])
}
```

Branch setting (existing `BranchSetting` key/value, no schema change): `timetable.maxPeriodsPerDay` (default 7)
used for the teacher-day-limit warning. **(optional)**

Rules:
- A weekday uses its own rows if any `day = d` rows exist, else the `day = 0` rows.
- A slot `(day, periodIndex)` is valid only if that index exists and is not a break **in that day's schedule**.
- `Section.classTeacherStaffId` stays in sync with the `CLASS_TEACHER` assignment (already done on add; also
  clear it on end — verify `assignment-ender.ts`).

### 4.1 Data migration (SQL in the same migration, idempotent)

1. `ALTER TABLE branch_periods ADD COLUMN day smallint NOT NULL DEFAULT 0;` replace unique index.
2. `UPDATE branch_periods SET label = NULL WHERE is_break = false;` (teaching periods are numbered, not named).
   Count of cleared rows is logged by the migration script; the web shows the one-time hint in §6.4.
3. Add `sections.group`, `class_subjects.group`, `class_subjects.sort_order`.
4. **Link subjects to classes**: for each class that has **zero** active `class_subjects`, insert every ACTIVE
   subject of its school (`periods_per_week` NULL). Classes already curated are untouched. Then
   `sort_order` = alphabetical index.
5. Permissions: insert `timetable.edit` and `timetable.add` into `role_permissions` for the system COORDINATOR
   and HEAD_TEACHER roles if absent (seed only re-applies defaults on reset — `prisma/seed/system-roles.ts:19`),
   and add them to `SUPERVISOR` in `default-role-permissions.ts`.
6. No timetable data changes. Existing slots on indexes that are now breaks stay and surface as `BREAK_PERIOD`
   errors in the builder.

---

## 5. API (all under `/api/v1`, standard envelope `{ data }`, errors `{ error: { code, message, details } }`)

### 5.1 School setup — `POST /schools/setup` (extends school-setup-contract §1)

New optional fields in `academics` (legacy `classesPreset`, `sectionsPerClass`, `classNames`, `subjectNames`,
`subjectsPreset` still accepted when `classes` is absent):

```jsonc
"academics": {
  "classes": [                                   // max 30; order = levelOrder
    { "name": "Playgroup", "level": "EARLY",     // EARLY | PRIMARY | MIDDLE | MATRIC | CUSTOM
      "sections": [{ "name": "A" }, { "name": "B" }, { "name": "C" }],
      "subjects": [{ "name": "English", "periodsPerWeek": 6 }, { "name": "Urdu", "periodsPerWeek": 6 }] },
    { "name": "Class 9", "level": "MATRIC",
      "sections": [{ "name": "A", "group": "Science" }, { "name": "B", "group": "Arts" }],
      "subjects": [{ "name": "English", "periodsPerWeek": 6 },
                   { "name": "Physics", "periodsPerWeek": 6, "group": "Science" },
                   { "name": "Civics",  "periodsPerWeek": 6, "group": "Arts" }] }
  ],
  "bellSchedule": {                               // optional; default below
    "startTime": "08:00", "periodMinutes": 40, "periodsPerDay": 8,
    "breakAfter": 4, "breakMinutes": 30,
    "friday": { "periodMinutes": 35, "periodsPerDay": 6, "breakMinutes": 15 }   // optional; breakAfter reused
  }
}
```

Validation: class names unique (case-insensitive), 1–40 chars; sections 1–8 per class, names 1–10 chars unique per
class; subject names 1–40 chars (catalogue names map to fixed codes, custom names get an auto code: initials
upper-case, suffixed `2`, `3` … on clash); `periodsPerWeek` 0–20; `group` must match a section group of that
class; bell: `periodsPerDay` 1–12, `breakAfter` 0 (no break)…periodsPerDay-1, end time ≤ 23:59;
Friday variant is applied only if 5 is a working day. Errors keyed like `academics.classes.3.sections`.

Creates: subjects = union of all subject names; `class_subjects` per class with `periodsPerWeek`, `group`,
`sortOrder`; sections with `group`; `branch_periods` rows (day 0, plus day 5 when `friday` given).
**Legacy path fix**: when `classes` is absent, every created subject is linked to every created class, and the
default bell schedule is generated — so old clients also get a working dropdown.

Default bell schedule: Mon–Sat 08:00, 8 × 40 min, break 30 min after period 4 (P1 8:00–8:40 … P4 10:00–10:40,
Break 10:40–11:10, P5 11:10–11:50 … P8 1:10–1:50 PM). Friday: 6 × 35 min, 15-min break after period 4
(P4 ends 10:20, break to 10:35, P6 ends 11:45).

Response `counts` gains `classSubjects` and `periods`.

Level presets (served to the wizard by `GET /setup/presets`, editable starting points; boards differ):

| Level | Classes | Subjects (periods/week) |
|---|---|---|
| EARLY | Playgroup, Nursery, Prep | English 6, Urdu 6, Mathematics 6, Nazra Quran 4, General Knowledge 3, Art & Drawing 3 |
| PRIMARY | Class 1–5 | English 6, Urdu 6, Mathematics 6, General Science 4, Islamiat 3, Social Studies 3, Nazra Quran 3, Computer Science 2 |
| MIDDLE | Class 6–8 | English 6, Urdu 6, Mathematics 6, General Science 6, Islamiat 3, Social Studies 4, Computer Science 3, Tarjuma-tul-Quran 2 |
| MATRIC | Class 9–10 | Core: English 6, Urdu 5, Mathematics 6, Islamiat 3, Pakistan Studies 3, Tarjuma-tul-Quran 2 · Science group: Physics 6, Chemistry 6, Biology 6, Computer Science (optional, `isOptional`) · Arts group: General Science 6, Civics 6, Economics 6 |

Catalogue codes: ENG, URDU, MATH, SCI, ISL, SST, CS, QURAN, TQ, GK, ART, PST, PHY, CHEM, BIO, CIV, ECO.
Matric default sections: A (Science), B (Arts).

`GET /setup/presets` (`schools.add`): `{ levels: [{ key, label, classNames, subjects: [{ code, name, periodsPerWeek, group?, isOptional? }] }], bellSchedule: {…defaults} }`.
Web may hard-code the same table instead **(optional endpoint)**.

Checklist (`GET /setup/checklist`): add items `bellSchedule` (periods count in branch) and `allocation`
(count of section×subject pairs without a subject teacher; `done` when 0 and sections > 0). Order: session,
classes, subjects, bellSchedule, teachers, allocation, students, timetable, feePlan.

### 5.2 Classes overview and class setup

`GET /classes/overview?branchId=&sessionId=` — `classes.view`. sessionId defaults to the branch's ACTIVE session.
Teachers/helpers: use existing "My classes".

```jsonc
{ "data": [ {
  "id": "", "name": "Class 9", "levelOrder": 12, "status": "ACTIVE",
  "studentCount": 58, "capacity": 80,                // capacity = sum of section capacities, null if none set
  "sections": [ { "id": "", "name": "A", "group": "Science", "studentCount": 30, "capacity": 40,
                  "room": { "id": "", "name": "R-12" } | null,
                  "classTeacher": { "id": "", "name": "Ms Sana" } | null,
                  "timetable": "EMPTY" | "DRAFT" | "PUBLISHED" | "PUBLISHED_WITH_CHANGES" } ],
  "subjects": [ { "id": "", "name": "English", "periodsPerWeek": 6, "group": null } ],
  "issues": [ "NO_SECTIONS" | "NO_SUBJECTS" | "NO_CLASS_TEACHER" | "SUBJECTS_WITHOUT_TEACHER" | "NO_TIMETABLE" ],
  "unallocated": 3                                     // section×subject pairs without teacher
} ] }
```

`GET /classes/:id/setup?branchId=&sessionId=` — `classes.view`. Everything the Class setup screen needs:

```jsonc
{ "data": {
  "class": { "id": "", "name": "", "levelOrder": 0, "status": "ACTIVE" },
  "sections": [ /* as overview */ ],
  "subjects": [ { "subjectId": "", "code": "ENG", "name": "English", "periodsPerWeek": 6,
                  "isOptional": false, "group": null, "sortOrder": 0 } ],
  "allocation": [ { "sectionId": "", "subjectId": "", "staff": { "id": "", "name": "" } | null,
                    "assignmentId": "" | null, "placed": 4 } ],     // placed = draft slots of that subject
  "groups": ["Science", "Arts"],                                    // distinct section groups
  "canEditStructure": true,   // classes.edit + manage scope
  "canAllocate": true         // timetable.edit (or staff.edit) + manage branch
} }
```

`PUT /classes/:id/subjects` — `classes.edit`, caller must manage the school or a branch of it (fix scope check).
New body (old `{ subjectIds }` still accepted → keeps existing periods/group of kept links):

```json
{ "items": [ { "subjectId": "", "periodsPerWeek": 6, "isOptional": false, "group": null } ] }
```
Order of `items` = `sortOrder`. Removing a subject that is used by an active assignment or any draft/published slot
of this class's sections → `409 SUBJECT_IN_USE` with `details: ["English: 2 teacher assignments, 11 lessons"]`.
Response: the `subjects` array as in setup.

`POST /subjects` — `classes.add`. Add optional `code` (auto when missing) and `classIds?: string[]` +
`periodsPerWeek?`, so "Create subject 'Pak Studies'" inline also links it to the current class in one call.
Response: `SubjectDto`.

`PUT /classes/order` — `classes.edit`: `{ "classIds": ["…"] }` (all classes of the school) → levelOrder 1..n.

Sections: keep `POST /sections`, `PATCH /sections/:id`, `POST /sections/:id/archive`; add `group` to create/update
DTOs and response. Archive → `409 SECTION_IN_USE` when the section has active enrollments
(`details: ["30 students enrolled"]`); archiving also ends its active assignments and deletes draft slots.

### 5.3 Allocation (teachers per section)

`PUT /sections/:id/subject-teachers/:subjectId` — `timetable.edit` or `staff.edit`, manage branch, session open.
Body `{ "staffId": "uuid" | null }`. Ends the current non-substitute `SUBJECT_TEACHER` assignment (if any) and
creates the new one through `StaffAssignmentsService` (role sync). `null` = remove. Errors: `400 SUBJECT_NOT_IN_CLASS`,
`400 SUBJECT_NOT_IN_GROUP`, `409 STAFF_LEFT`, `403 OWN_ASSIGNMENT`. Response: allocation row.

`PUT /sections/:id/class-teacher` — same permissions. Body `{ "staffId": "uuid" | null }`. Same replace semantics
for `CLASS_TEACHER`; updates `section.classTeacherStaffId`.

`GET /branches/:id/teaching-staff?sessionId=&all=false` — `classes.view` (manage scope). Candidates: ACTIVE staff
of the branch whose designation is TEACHER/HEAD_TEACHER/COORDINATOR, or who hold any active teaching
assignment, or whose user has PRINCIPAL in the branch; `all=true` returns every active staff member. No 100 cap.

```json
{ "data": [ { "id": "", "name": "", "designation": "TEACHER", "hasLogin": true,
              "allocatedPeriods": 28,   // Σ periodsPerWeek of their SUBJECT_TEACHER allocations
              "placedPeriods": 24,      // draft slots in the session (all sections)
              "sections": 5 } ] }
```

### 5.4 Bell schedule

`GET /branches/:id/bell-schedule` — `timetable.view` (parents allowed, as today).

```jsonc
{ "data": {
  "workingDays": [1,2,3,4,5,6],
  "default": [ { "index": 1, "number": 1, "startTime": "08:00", "endTime": "08:40", "isBreak": false, "label": null },
               { "index": 5, "number": null, "startTime": "10:40", "endTime": "11:10", "isBreak": true, "label": "Break" } ],
  "days": { "5": [ /* Friday rows, same shape */ ] }
} }
```

`PUT /branches/:id/bell-schedule` — `timetable.edit`, manage branch. Body `{ "default": PeriodInput[], "days": { "5": PeriodInput[] } }`
(`PeriodInput` = `{ index, startTime, endTime, isBreak, label? }`; `label` ignored unless `isBreak`).
Validation per day as `assertBellSchedule` today. If any draft or published slot would land on a removed index or
a break → `409 PERIODS_IN_USE` with `details: ["Mon P6: 9-A English", …]` unless body has `"dropLessons": true`
(then those slots are deleted, audited).

`POST /branches/:id/bell-schedule/generate` — same permission; body = the wizard's `bellSchedule` object; returns the
generated schedule **without saving** (preview), so web and setup share one generator. **(optional; web may
generate client-side)**

Old `GET/PUT /branches/:id/periods` stay: GET returns `default` rows (with new `number`), PUT writes `day = 0` only.

### 5.5 Timetable

`GET /timetables?sectionId=` (existing) — response gains fields; old ones unchanged except `status` semantics:

```jsonc
{ "data": {
  "sectionId": "", "sessionId": "",
  "state": "EMPTY" | "DRAFT" | "PUBLISHED" | "PUBLISHED_WITH_CHANGES",
  "status": "DRAFT" | "PUBLISHED" | "DRAFT_REVISION" | null,     // null when no timetable row exists (was "DRAFT")
  "version": 0,                     // number of publishes; UI shows it only when > 0
  "publishedAt": null, "draftUpdatedAt": null,
  "draftSlotCount": 0, "publishedSlotCount": 0,
  "canPublish": false, "publishBlockedReason": "Add at least one lesson first" | "No changes since the last publish" | "Fix 2 conflicts first" | null,
  "slots": [ { "day": 1, "periodIndex": 1, "subject": {}, "staff": {}, "room": {} } ],
  "periods": [ /* default rows */ ],
  "dayPeriods": { "5": [ /* Friday rows */ ] }
} }
```
Editors (`timetable.edit` + manage branch) get draft slots when state is DRAFT/PUBLISHED_WITH_CHANGES; others get
published slots only (EMPTY/DRAFT look like "Not published yet" to them, no slots).

`GET /timetables/:sectionId/builder` — `timetable.edit`. One call for the builder:

```jsonc
{ "data": {
  "timetable": { /* as above, draft view */ },
  "section": { "id": "", "name": "A", "group": "Science", "class": { "id": "", "name": "Class 9" }, "branchId": "" },
  "lessons": [ { "subject": { "id": "", "name": "Physics" }, "periodsPerWeek": 6, "placed": 4,
                 "teacher": { "id": "", "name": "" } | null } ],          // the class's subjects for this section's group
  "rooms": [ { "id": "", "name": "" } ],
  "busy": [ { "staffId": "", "day": 1, "periodIndex": 2, "sectionName": "Class 8 B", "published": true },
            { "roomId": "", "day": 1, "periodIndex": 2, "sectionName": "Class 8 B", "published": false } ],
  "conflicts": [ /* Conflict[] for the whole draft */ ],
  "maxPeriodsPerDay": 7
} }
```
`busy` covers every allocated teacher of this section and all branch rooms, from other sections' published **and**
draft slots, so the dialog can warn instantly without a round trip.

`PUT /timetables/:sectionId/slots/:day/:periodIndex` — `timetable.edit`, manage branch, session open. Autosave of one cell:

```json
{ "subjectId": "", "staffId": "", "roomId": null, "allocate": true }
```
- Creates the `Timetable` row if missing (status DRAFT); PUBLISHED → DRAFT_REVISION.
- `allocate: true` and the section has no teacher for that subject → creates the SUBJECT_TEACHER assignment
  (same rules as §5.3). If another teacher is already allocated, nothing changes (the lesson then shows
  `TEACHER_NOT_ASSIGNED`).
- Validates: subject in class (and group) → `400 SUBJECT_NOT_IN_CLASS`; staff active in school → `400 UNKNOWN_STAFF`;
  room in branch → `400 UNKNOWN_ROOM`; period exists on that day and is not a break → `400 PERIOD_NOT_ON_DAY` / `BREAK_PERIOD`;
  day in working days → `400 NON_WORKING_DAY`.
- Response: `{ "slot": {…}, "conflicts": Conflict[] /* this cell */, "lesson": { subjectId, placed, periodsPerWeek }, "state": "...", "canPublish": bool, "publishBlockedReason": "..." }`.

`DELETE /timetables/:sectionId/slots/:day/:periodIndex` — same permission; removes the draft cell; same response
minus `slot`. Idempotent.

`PUT /timetables/:sectionId/slots` (existing bulk) stays for auto-fill/copy and old clients.

`POST /timetables/:sectionId/check` — returns `{ conflicts }` with severities (below).

`POST /timetables/:sectionId/publish` — `timetable.publish`. `409 NOTHING_TO_PUBLISH` when state is EMPTY or
PUBLISHED (message "Add lessons first" / "No changes since the last publish"); `409 TIMETABLE_CONFLICTS`
(`details` = error-severity conflicts). Runs inside a transaction holding a Postgres advisory lock on
`sessionId` so two sections can't publish a teacher clash at the same time. Notifies teachers whose lessons changed.

`POST /timetables/:sectionId/discard` — `timetable.publish`. Draft := published copy; status PUBLISHED
(or deletes draft and row when never published). `409 NOTHING_TO_DISCARD`.

`POST /timetables/:sectionId/autofill` — `timetable.edit`. **(optional)** Body `{ "overwrite": false }`. Greedy:
for each lesson with remaining periods (most-constrained teacher first), place into empty teaching cells, at most
one per day per subject (two if periodsPerWeek > working days), skipping cells where the teacher/room is busy in
`busy`. Returns `{ timetable, unplaced: [{ subjectId, remaining, reason }] }`. Never publishes.

`POST /timetables/:sectionId/copy-from` — **(optional)** `{ "sectionId": "" }` copies another section's draft
(same class) without rooms; teachers swapped to this section's allocation where present.

Conflict shape: `{ type, severity: "error" | "warning", day, periodIndex, message, otherSectionId? }`.

| type | severity |
|---|---|
| TEACHER_DOUBLE_BOOKED (vs published) | error |
| ROOM_DOUBLE_BOOKED (vs published) | error |
| TEACHER_NOT_ASSIGNED | error |
| NON_WORKING_DAY, BREAK_PERIOD, PERIOD_NOT_ON_DAY, SUBJECT_NOT_IN_CLASS | error |
| TEACHER_DRAFT_CLASH, ROOM_DRAFT_CLASH (vs other drafts) | warning |
| WEEKLY_PERIODS_EXCEEDED (placed > periodsPerWeek) | warning |
| WEEKLY_PERIODS_SHORT (placed < periodsPerWeek; reported once per subject, day/periodIndex 0) | warning |
| TEACHER_DAY_LIMIT (> maxPeriodsPerDay across sections) | warning |

Week views (`/timetables/me`, `/timetables/teacher/:id`) compute `startTime/endTime` from the day's schedule and add
`periodNumber`.

Overrides (substitutions): validate `periodIndex` against that date's weekday schedule; otherwise unchanged.

### 5.6 Rooms inline

`POST /rooms` accepts `classes.add` **or** `timetable.edit` (decorator is any-of). Body unchanged `{ branchId, name, capacity? }`.
Duplicate name → `409 ROOM_NAME_TAKEN` (field `name`).

---

## 6. Web (Next.js)

Shared rules: 12-hour times, teal theme, existing `FormDialog` / `SelectField` / `DataTable`. Add a `stickyHeader`
prop to `DataTable` (sticky `thead`, `top: 0`, within the page scroll container) and use it on every list in this area.
Status badges show only when not ACTIVE ("Archived").

### 6.1 Setup wizard (School setup dialog)

Steps: School → Branch → Principal → **Classes & subjects** → **Bell schedule** → Review → Success.

Classes & subjects step:
- Table, one row per class (preset list ticked; "+ Add class" for custom names like "O Level 1"). Columns:
  ☑ include · Class name · Level (select; pre-set by preset) · Sections: chips **A B C D** toggles + "+" for more
  (A on by default; Matric rows show a group select per active chip, default A=Science, B=Arts) · Subjects:
  "8 subjects · Edit" button.
- "Subjects" opens a matrix panel (inside the step, not a new dialog): rows = included classes grouped by level,
  columns = subjects (union of presets + custom "+ Add subject"), checkbox cells; per level a "Use Primary preset"
  button; a periods/week number shows next to each ticked cell (editable, default from preset). Matric group
  subjects show their group tag.
- Top hint: "You can change all of this later in Classes."

Bell schedule step: Start time, Period length (min), Periods per day, Break after period N (0 = none),
Break length; toggle "Friday is shorter" → Friday period length, periods. Live preview list:
"Period 1 · 8:00 – 8:40 AM … Break · 10:40 – 11:10 AM". Hint: "Periods are time slots. Subjects are chosen when
you build the timetable."

Review shows per class: "Class 9 · A (Science), B (Arts) · 11 subjects", and the day's last bell time.
`to-setup-input.ts` sends `academics.classes` + `academics.bellSchedule`.

### 6.2 Classes page (`/classes`) — replaces the 4 tabs

Tabs: **Classes** (default) · **Subjects & rooms**.

Classes overview (from `GET /classes/overview`): branch + session picker as today; then a list of class cards
(one per class, in level order; grid 1 col mobile / 2–3 cols desktop) or a sticky-header table on wide screens:

```
Class 9                                   58 students · 2 sections         [Set up ›]
Sections:  [A · Science · Ms Sana]  [B · Arts · — no class teacher]
Subjects:  11 (hover/tap: English, Urdu, Physics …)
⚠ 3 subjects without a teacher   ·   Timetable: A published, B draft
```
- Issue chips from `issues` ("No subjects yet", "No class teacher", "No timetable"), each linking to the Class setup
  section that fixes it.
- No Level order column; reorder via "Reorder" mode with up/down buttons (and drag on desktop) → `PUT /classes/order`.
- "+ Add class" (name only, appended last) then opens Class setup.
- Clicking a card opens Class setup. Teachers keep "My Classes".

Subjects & rooms tab: two compact sticky-header tables (Subjects: name, code, used by N classes, archive; Rooms:
name, capacity, archive) for renaming/archiving master data. Creating them normally happens inline elsewhere.

### 6.3 Class setup (`/classes/[classId]?branchId=&sessionId=`) — one screen per class

Header: class name (inline rename), back to Classes, "Open timetable" (goes to Timetable with this class's first
section selected), archive in an overflow menu. Three cards, all autosaving (toast on error only, "Saved" tick):

1. **Sections** — one row per section: name chip, group select (only if the class has group subjects or Matric
   level), capacity, room (select with "+ New room"), class teacher (select from teaching-staff, shows load),
   students count. "+ Add section" adds the next letter. Remove → confirm; 409 SECTION_IN_USE shows the reason.
   Empty columns are hidden when every row is empty (e.g. no rooms in branch → no Room column, with a small
   "+ Add rooms" link).
2. **Subjects** — rows in sortOrder: subject name, periods/week stepper, group select (when groups exist),
   optional checkbox, remove (409 SUBJECT_IN_USE shown inline), up/down. Footer combobox "Add subject…" listing
   school subjects not yet in the class plus "Create 'X'" (→ `POST /subjects` with `classIds`). Footer total
   "Periods planned: 44 of 46 teaching periods per week" (from bell schedule; warning colour if over).
   "Apply preset ▾" (Early/Primary/Middle/Matric) adds missing preset subjects.
3. **Teachers** — allocation grid: rows = subjects, columns = sections (group-filtered: a Science subject cell is
   blank for an Arts section). Each cell is a teacher select (teaching-staff list, sorted: already teaching this
   class → others; each option shows "Ms Sana · 24/30 periods"), saving with `PUT /sections/:id/subject-teachers/:subjectId`.
   "Same teacher for all sections" quick action per row. A "+ Add teacher" link opens the existing Add staff dialog
   and returns. Cells without a teacher are highlighted; header shows "3 left to assign".

Read-only for roles without `canEditStructure` / `canAllocate` (selects become text).

### 6.4 Timetable page (admin view)

Tabs stay: Section timetable · Bell schedule · Substitutions · Teacher week.

Section timetable:
- Section picker grouped by class ("Class 9 › A (Science)"), with state dot (empty/draft/published).
- Toolbar: state badge — "Not published yet" (EMPTY/DRAFT), "Published · v3 · 8 Oct, 9:10 AM", or "Published v3 ·
  unpublished changes"; "All changes saved" / "Saving…" indicator; buttons: **Publish** (disabled with tooltip /
  helper text = `publishBlockedReason`), **Discard changes** (only PUBLISHED_WITH_CHANGES), "Auto-fill" (optional),
  "Check" removed (conflicts are always live). No "Save draft", no "Version 0".
- Left (desktop) / top collapsible (mobile) **Lessons panel** from `lessons`: "English · Ms Sana · 4/6",
  red when over, grey when done, "No teacher" link → Class setup Teachers card.
- Grid: columns = branch working days (not a Mon–Fri fallback); rows = union of period indexes; row header
  "Period 1 · 8:00 – 8:40 AM" (number from API; breaks show their label or "Break", greyed). If a day has its own
  schedule, cells in that column show their own time caption; indexes missing that day render as disabled "—".
  Cells show subject, teacher, room; conflict cells get a red (error) / amber (warning) edge with the message on hover.
- One-time info banner if any period of this branch had a label cleared by the migration (web can't know; show
  instead when `periods` contains no labels on teaching rows and the user has not dismissed it — simply a
  dismissible hint "Periods are time slots (Period 1, Period 2 …). Choose the subject for each lesson in the grid.")
  stored in localStorage.

Lesson dialog (click a cell) — title "Monday · Period 1 (8:00 – 8:40 AM)", description "Playgroup A":
- **Subject**: the section's lessons, each option "English — 2 left" (or "6/6 done"); empty state "This class has no
  subjects yet" with button "Add subjects" (opens Class setup Subjects card in a new tab/back-link).
- **Teacher**: pre-filled from the allocation; options = teaching-staff with tags "(teaches English here)",
  "(busy: Class 8 B)" disabled-looking but selectable, load "24/30". When the picked teacher is not allocated and
  no one is: checkbox "Make Ms Sana the English teacher of Playgroup A" (default on → `allocate: true`).
- **Room**: select, "No room" allowed, last option "+ New room" → inline name field + Add (`POST /rooms`), selects it.
- Inline warnings under the fields from `busy` (instant) and from the PUT response.
- Buttons: Save (writes the cell immediately; dialog closes; grid updates optimistically, reverts on error),
  Remove lesson (DELETE), Cancel. Footer text: "Saved to the draft right away. Teachers and parents see it after you publish."
- Keyboard: arrow keys move between cells, Enter opens dialog, Delete clears (desktop nicety, optional).

Bell schedule tab: day selector chips "All working days" / "Friday (own times)" (+ add a day variant); rows:
"Period N" auto-numbered (no label input) or Break (label input, default "Break"); "Generate…" helper
(start, length, count, break after) fills the rows; 409 PERIODS_IN_USE shows the affected lessons with a
"Remove these lessons and save" confirm (`dropLessons: true`).

Teacher views (`mine`): unchanged structure; use `periodNumber`/day times. Coordinator/head teacher now get the
admin view with edit; without publish they see "Ask the principal to publish" as the Publish reason.

### 6.5 Teachers & Helpers

Staff detail Assignments tab stays (class teacher, helper, coordinator, head teacher, substitutes). Add a note +
link: "Subject teachers are set per class in Classes › Class setup". Workload tab shows allocated vs placed.

---

## 7. Android (read-only)

- DTOs: `TimetableDto` + `state`, `dayPeriods`, period `number`; `TeacherSlotDto.periodNumber`. Default to old
  behaviour if fields are missing.
- `ScheduleBuilder.fromTimetable`: per day use `dayPeriods[day]` when present, else `periods`; row title for
  teaching periods = "Period N" when empty, never the raw label; breaks keep the label.
- Teacher (MY_WEEK): unchanged screen, now correct Friday times; add a "My sections" segmented option listing the
  published timetables of sections they teach (uses `GET /timetables?sectionId=`; empty → "Not published yet").
- Parent (CHILD): unchanged; show "Not published yet" when `state` is EMPTY/DRAFT.
- Principal / coordinator / head teacher / super admin: existing section picker view; show state chip
  ("Draft — not published" for editors). No editing on Android.
- Organisation `ClassesScreen`: switch to `GET /classes/overview` and render one card per class (sections chips with
  class teacher, subject count, student count, issue chips). Read-only.

---

## 8. Ordered task list

### API
1. Prisma migration §4 + data migration §4.1 (+ `SUPERVISOR` permissions in `default-role-permissions.ts`).
   ✔ Existing school with no class links: every class now returns its subjects from `GET /classes/:id/subjects`.
2. Bell schedule: `day` support in `PeriodsService` (`forDay(branchId, day)`), `number` field, new
   `GET/PUT /branches/:id/bell-schedule`, `PERIODS_IN_USE` guard; old `/periods` endpoints compatible.
   ✔ Friday rows returned in `days["5"]`; PUT that removes a used index → 409 with lesson list.
3. Class subjects: new PUT body, sortOrder/group, `SUBJECT_IN_USE`, manage-scope fix; `POST /subjects` with
   `classIds` + auto code; `PUT /classes/order`; section `group`; archive guard.
4. `GET /classes/overview`, `GET /classes/:id/setup`.
5. Allocation endpoints §5.3 + `GET /branches/:id/teaching-staff` (no 100 cap, includes staff without login).
6. Timetable: `state`/`canPublish`/`publishBlockedReason`/`status null` in `get`; per-cell PUT/DELETE with
   `allocate`; validation additions; conflict severities incl. draft clashes and weekly counts; `builder` endpoint;
   publish `NOTHING_TO_PUBLISH` + advisory lock; `discard`. ✔ Fresh section: state EMPTY, canPublish false; one cell
   saved → state DRAFT, canPublish true; publish → PUBLISHED v1; edit → PUBLISHED_WITH_CHANGES; discard → PUBLISHED.
7. Week views + overrides use day schedules.
8. Setup: `academics.classes`, `academics.bellSchedule`, legacy path links all subjects to all classes and creates the
   default bell schedule; `GET /setup/presets` (optional); checklist `bellSchedule` + `allocation`.
   ✔ Wizard payload with Class 9 = A(Science), B(Arts) creates 2 sections with groups and group-scoped class subjects.
9. Rooms POST any-of permission. 10. Optional: autofill, copy-from, teacher day limit setting.
11. Tests: conflict-checker severities, bell generator, setup service (per-class sections/subjects), per-cell
    autosave state transitions, SUBJECT_IN_USE, migration linking. Update `openapi.json`.

### Web
1. `DataTable` sticky header prop; hide all-empty columns helper.
2. Classes page: overview cards/table, reorder mode, "Subjects & rooms" tab; remove Sections tab.
3. Class setup screen (sections, subjects, teachers grid) with autosave and inline create subject/room/teacher link.
4. Timetable: builder endpoint, lessons panel, autosaving lesson dialog (subject remaining counts, teacher prefill +
   allocate checkbox, inline room), state badge + Publish reason, Discard, live conflicts, working-day columns,
   per-day times, period numbering, hint banner. Remove Save draft / Check.
5. Bell schedule tab: day variants, generator, label only on breaks, PERIODS_IN_USE confirm.
6. Setup wizard: Classes & subjects step (chips + matrix), Bell schedule step, review, payload.
7. Timetable view selection: coordinator/head teacher edit; teachers mine.
   ✔ Acceptance: new school via wizard → open Timetable → Playgroup A → click Mon P1 → Subject list shows Playgroup's
   subjects with "6 left", room can be created in the dialog, closing the browser and reopening keeps the lesson,
   Publish is disabled on an empty grid with "Add at least one lesson first".

### Android
1. DTO + mapper updates (state, dayPeriods, number), "Period N" titles, Friday times.
2. Teacher "My sections" view; parent/teacher "Not published yet" state.
3. ClassesScreen on `/classes/overview` (cards, chips, issues).
   ✔ Acceptance: teacher's Friday shows Friday times; principal sees one card per class with sections and class teachers.

---

## 9. Out of scope / known limits

- Parallel electives inside one section (e.g. 9-A: Biology for some, Computer for others in the same period).
  Workaround: separate group sections. Future: allow several lessons per cell with student subsets.
- Rotating (Day A/B) cycles, double periods as a single card, room types/labs.
- Class subjects are school-wide; a principal of one branch editing them affects other branches (audited). Per-branch
  curricula would need `branchId` on `ClassSubject` later.

Sources: help.asctimetables.com (lessons); support.fedena.com (class timing sets, timetable creation);
docs.gibbonedu.org/administrators/timetable (columns/rows, Friday column); Pakistan Observer / ilmkidunya on the
PCTB 2025-26 Matric scheme of studies; Punjab/Sindh school-timing notifications (Friday ~12:30 close).

## User decision (2026-10-08): timetable editing rights

Supersedes the role matrix above for timetable editing.

| Role | Timetable |
|---|---|
| Teacher | Can create/edit the DRAFT only for sections where they are the **class teacher** (section.classTeacher). Cannot publish or discard others' work. Read-only for every other section. |
| Coordinator / Head Teacher | Draft for all sections of their branch. No publish. |
| Principal | Draft + publish/discard, own branch. |
| Super Admin | Draft + publish/discard, all branches. |

Conflict checks still run across all sections (a teacher editing their own section still sees clashes with other sections' drafts/published lessons). The API enforces this (403 `FORBIDDEN_SCOPE` outside the teacher's class-teacher sections); web and Android show edit controls only where allowed.

## Deviations (API, 2026-10-08)

Implemented by the API agent; clients please adapt.

- **Migrations**: `20261008120000_academics_timetable` (schema + data, §4.1) and `20261008130000_teacher_timetable_drafts`
  (adds `timetable.add/edit` to the system TEACHER role for the user decision above).
- **Edit rights** (user decision): `timetable.edit` + (manages the branch **or** holds an active CLASS_TEACHER assignment
  of the section). Teachers get `timetable.add/edit` by default; everything else that needs `timetable.edit` (bell
  schedule, rooms, allocation, substitutions) still requires managing the branch → 403 `FORBIDDEN_SCOPE` for teachers.
  `allocate: true` is ignored for non-managers.
- **`GET /timetables` additions**: `canEdit` (caller may edit this section's draft) and `workingDays`. For viewers
  (`canEdit: false`) `state` never shows `PUBLISHED_WITH_CHANGES` (they see `PUBLISHED`), `draftSlotCount` is 0,
  `canPublish` false and `publishBlockedReason` null.
- **`publishBlockedReason`** order: "Add at least one lesson first" → "No changes since the last publish" → "Fix N
  conflict(s) first" → "Ask the principal to publish" (editor without `timetable.publish` / not managing the branch).
- **Publish 409 `TIMETABLE_CONFLICTS`**: `details` is the array of error-severity conflicts (previously
  `{ conflicts }`).
- **Cell PUT/DELETE response** adds `allocated: boolean`. When `allocate` hits `OWN_ASSIGNMENT` the lesson is still
  saved (`allocated: false`). A never-published draft whose last lesson is deleted disappears (state `EMPTY`); a published
  timetable whose draft equals the published week returns to `PUBLISHED` automatically.
- **Builder `busy`** lists every teacher (not only allocated ones) and all rooms of other sections; each entry also has
  `sectionId`. Draft entries identical to that section's published lesson are omitted.
- **`PUT /classes/:id/subjects`** response items also carry `id` (= `subjectId`). **`PUT /classes/order`** returns 204.
- **`GET /classes/overview` / `GET /classes/:id/setup`**: `branchId` is optional only when the caller reaches exactly one
  branch (else 400 "branchId is required"); section-limited callers (teachers) see only their sections. Setup response
  adds `branchId` and `sessionId` (null when the branch has no active session). Issue `NO_TIMETABLE` = some section not
  published yet (EMPTY or DRAFT).
- **`PERIODS_IN_USE`** only counts lessons the change would newly orphan (lessons already on a missing period/break stay
  as conflicts). Old `PUT /branches/:id/periods` has the same guard and accepts `dropLessons`.
- **Sections**: `capacity` is optional on `POST /sections`; `group: null`/blank clears the group.
- **`POST /subjects`**: `code` optional. Custom codes = word initials ("Pak Studies" → `PS`); a single word uses its
  first 3 letters ("Geography" → `GEO`); suffix 2, 3 … on clash.
- **`POST /rooms`** duplicate: `409 ROOM_NAME_TAKEN`, `details: { field: "name" }` (also on `PATCH /rooms/:id`).
- **Checklist `allocation`**: `count` = section×subject pairs still without a teacher; `done` = count 0 and the session has sections.
- **New error codes**: `SUBJECT_IN_USE`, `SECTION_IN_USE`, `PERIODS_IN_USE`, `NOTHING_TO_PUBLISH`, `NOTHING_TO_DISCARD`,
  `TIMETABLE_CONFLICTS`, `STAFF_LEFT`, `ROOM_NAME_TAKEN` (409); `OWN_ASSIGNMENT` (403); `SUBJECT_NOT_IN_CLASS`,
  `SUBJECT_NOT_IN_GROUP`, `UNKNOWN_STAFF`, `UNKNOWN_ROOM`, `PERIOD_NOT_ON_DAY`, `BREAK_PERIOD`, `NON_WORKING_DAY` (400).
- **Optional items**: done: `GET /setup/presets` (levels also carry default `sections`), `POST /branches/:id/bell-schedule/generate`,
  branch setting `timetable.maxPeriodsPerDay` (default 7, TEACHER_DAY_LIMIT warning). Not done: `autofill`, `copy-from`.
- **Audit action keys**: `timetable.lesson.update`, `timetable.lesson.remove`, `timetable.draft.replace`, `timetable.publish`,
  `timetable.discard`, `bell-schedule.update`, `class.subjects.update`, `class.order.update`,
  `section.subject-teacher.update`, `section.class-teacher.update` (existing keys unchanged).
