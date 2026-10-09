# Phase 1 API Contract (Admin Foundation)

Base URL `/api/v1`. All responses use the envelope: success `{ "data": ..., "meta"?: {...} }`, error `{ "error": { "code", "message", "details"? } }`.
Auth header `Authorization: Bearer <accessToken>`; optional `X-Active-Role: <RoleKey>` (defaults to the user's first assignment by priority SUPER_ADMIN > PRINCIPAL > COORDINATOR > HEAD_TEACHER > ACCOUNTANT > TEACHER > HELPER > PARENT).
Lists accept `?page=1&pageSize=20&search=&status=` and return `meta: { page, pageSize, total }`. `pageSize` max 100.
Dates `YYYY-MM-DD`; timestamps ISO UTC. IDs are UUID strings.

Error codes: `VALIDATION_FAILED`(400) `UNAUTHENTICATED`(401) `FORBIDDEN`(403) `FORBIDDEN_SCOPE`(403) `NOT_FOUND`(404) `CONFLICT`(409) `RECORD_LOCKED`(423) `RATE_LIMITED`(429) plus new: `INVALID_CREDENTIALS`(401) `ACCOUNT_DISABLED`(403) `ACCOUNT_LOCKED`(423) `PASSWORD_CHANGE_REQUIRED`(403, only for non-auth routes while `mustChangePassword`), `SESSION_REVOKED`(401).

## 1. Auth (public unless noted)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ identifier, password, platform: "WEB"\|"ANDROID", deviceName? }` | `AuthTokens` |
| POST | `/auth/refresh` | `{ refreshToken }` | `AuthTokens` (rotated; reuse of an old token revokes the session family → 401 `SESSION_REVOKED`) |
| POST | `/auth/logout` (auth) | `{ refreshToken? }` | `{ ok: true }` — revokes current session |
| POST | `/auth/logout-all` (auth) | – | `{ ok: true }` — bumps tokenVersion, revokes all |
| POST | `/auth/password/forgot` | `{ identifier }` | `{ ok: true }` always (no user enumeration); token sent via notification channel (dev: logged) |
| POST | `/auth/password/reset` | `{ token, newPassword }` | `{ ok: true }`, revokes all sessions |
| POST | `/auth/password/change` (auth) | `{ currentPassword, newPassword }` | `{ ok: true }`, clears mustChangePassword, revokes other sessions |
| GET | `/auth/sessions` (auth) | – | `DeviceSession[]` |
| DELETE | `/auth/sessions/:id` (auth) | – | `{ ok: true }` |

```ts
AuthTokens = { accessToken, refreshToken, accessExpiresIn /*seconds*/, mustChangePassword: boolean }
DeviceSession = { id, deviceName, platform, ip, createdAt, lastUsedAt, current: boolean }
```
Password rules: min 8 chars, at least one letter and one digit. Lockout: 5 failures → 15 min (`ACCOUNT_LOCKED`).

## 2. Me
`GET /me` (auth) →
```ts
Me = {
  user: { id, name, email, phone, mustChangePassword },
  activeRole: RoleKey,
  roles: RoleKey[],                       // distinct roles the user holds (for the switcher)
  permissions: string[],                  // for the active role only
  assignments: { id, role: RoleKey, roleName, scopeType, schoolId, schoolName, branchId, branchName, validUntil }[],
  children: { id, name, className, sectionName, branchName }[]   // PARENT only; [] until Phase 2
}
```
`PATCH /me` `{ name?, email?, phone? }` → `Me.user` (email/phone uniqueness → `CONFLICT`).

## 3. Permission catalogue and roles
| Method | Path | Permission |
|---|---|---|
| GET | `/permissions` | `roles.view` → `{ key, module, action, description }[]` |
| GET | `/roles` | `roles.view` → `Role[]` |
| POST | `/roles` | `roles.add` `{ name, schoolId?, permissions: string[] }` (custom role, key auto `CUSTOM_<slug>`) |
| PATCH | `/roles/:id` | `roles.edit` `{ name?, permissions? }` — system roles: permissions editable only by SUPER_ADMIN, key immutable |
| DELETE | `/roles/:id` | `roles.delete` — custom roles with no active assignments only |
```ts
Role = { id, key, name, isSystem, schoolId, permissions: string[], assignmentCount }
```

## 4. Schools (SUPER_ADMIN)
| Method | Path | Permission |
|---|---|---|
| GET | `/schools` | `schools.view` (principals see only their school) |
| POST | `/schools` | `schools.add` `{ code, name, address?, phone?, email?, website?, logoFileId? }` |
| GET | `/schools/:id` | `schools.view` |
| PATCH | `/schools/:id` | `schools.edit` |
| POST | `/schools/:id/archive` · `/schools/:id/activate` | `schools.delete` / `schools.edit` |
```ts
School = { id, code, name, address, phone, email, website, logoUrl, status: "ACTIVE"|"ARCHIVED", branchCount, createdAt }
```
`code`: 2–12 uppercase letters/digits, unique → `CONFLICT`.

## 5. Branches
| Method | Path | Permission |
|---|---|---|
| GET | `/branches?schoolId=` | `branches.view` (scoped) |
| POST | `/branches` | `branches.add` `{ schoolId, code, name, address?, phone?, email?, timings?, workingDays? }` |
| GET | `/branches/:id` | `branches.view` |
| PATCH | `/branches/:id` | `branches.edit` (principal may edit contacts/timings/workingDays of own branch only) |
| POST | `/branches/:id/archive` · `/activate` | `branches.delete` / `branches.edit` |
| PUT | `/branches/:id/principal` | `users.edit` (SUPER_ADMIN) `{ userId }` — ends previous principal assignment, revokes their sessions for that role, reassigns their pending approvals |
| GET | `/branches/:id/settings` | `branches.view` → `Record<string, unknown>` merged with defaults |
| PATCH | `/branches/:id/settings` | `settings.edit` or principal of branch `{ key: value }` |
```ts
Branch = { id, schoolId, schoolName, code, name, address, phone, email,
           timings: { opensAt: "08:00", closesAt: "14:00", attendanceLockAt: "11:00",
                      staffArrivesAt: "07:30", staffLeavesAt: "14:00" } | null,
           workingDays: number[] /* 1=Mon..7=Sun */, principal: { id, name } | null, status, createdAt }
```
Timings are 24-hour `HH:mm`. `opensAt`/`closesAt` are the students' day; `staffArrivesAt`/`staffLeavesAt` are the teachers' day. On create/update the two staff fields are optional: `staffArrivesAt` defaults to 30 minutes before `opensAt` (never before `00:00`), `staffLeavesAt` defaults to `closesAt`. Validation (400 `VALIDATION_FAILED`, details strings): `staffArrivesAt must be at or before opensAt`, `staffLeavesAt must be at or after closesAt`. Sending `timings` also saves the branch setting `attendance.lockTime = timings.attendanceLockAt`. Rows saved before these fields existed were back-filled by migration `20261008160000_branch_staff_timings` (same defaults).

Default settings keys: `attendance.lockTime "11:00"`, `diary.moderation false`, `diary.closingTime "15:00"`, `messaging.officeHours {from:"08:00",to:"16:00"}`, `approval.limits {}`.

## 6. Users (staff/admin accounts) and role assignments
| Method | Path | Permission |
|---|---|---|
| GET | `/users?role=&branchId=&status=&search=` | `users.view` (principal: users assigned in own branches, excluding SUPER_ADMIN and other PRINCIPALs) |
| POST | `/users` | `users.add` `{ name, email?, phone?, password?, assignments: AssignmentInput[] }` (one of email/phone required; no password → generated temp password returned once in response `temporaryPassword`; `mustChangePassword=true`) |
| GET | `/users/:id` | `users.view` |
| PATCH | `/users/:id` | `users.edit` `{ name?, email?, phone? }` |
| POST | `/users/:id/disable` · `/enable` | `users.edit` — disable bumps tokenVersion + revokes sessions immediately; cannot disable self |
| POST | `/users/:id/reset-password` | `users.edit` → `{ temporaryPassword }` |
| POST | `/users/:id/assignments` | `users.edit` `AssignmentInput` |
| DELETE | `/users/:id/assignments/:assignmentId` | `users.edit` — sets validUntil=now (history kept) |
```ts
AssignmentInput = { roleKey: string, scopeType: "GLOBAL"|"SCHOOL"|"BRANCH"|"SECTION"|"SUBJECT_SECTION"|"SELF"|"GUARDIAN",
                    schoolId?, branchId?, sectionId?, subjectId?, validUntil? }
UserSummary = { id, name, email, phone, status: "ACTIVE"|"DISABLED", roles: RoleKey[], branchNames: string[], lastLoginAt }
UserDetail  = UserSummary & { assignments: Me["assignments"], mustChangePassword, createdAt }
```
Rules: only SUPER_ADMIN grants SUPER_ADMIN/PRINCIPAL; principals grant roles only inside their branches; nobody edits their own assignments.

## 7. Academic sessions, terms, calendar
| Method | Path | Permission |
|---|---|---|
| GET | `/sessions?branchId=` | `sessions.view` |
| POST | `/sessions` | `sessions.add` `{ branchId, name "2026-27", startDate, endDate }` (DRAFT) |
| PATCH | `/sessions/:id` | `sessions.edit` (DRAFT/ACTIVE only) |
| POST | `/sessions/:id/activate` | `sessions.edit` — 409 if another ACTIVE in branch |
| POST | `/sessions/:id/close` | `sessions.edit` — read-only afterwards (`RECORD_LOCKED` on edits) |
| GET/POST | `/sessions/:id/terms` | view/edit `{ name, startDate, endDate }` (within session dates, no overlap) |
| PATCH/DELETE | `/terms/:id` | `sessions.edit` |
| GET | `/calendar?branchId=&from=&to=` | `sessions.view` |
| POST | `/calendar` | `sessions.edit` `{ branchId? (null = whole school), schoolId, type, title, startDate, endDate, description? }` |
| PATCH/DELETE | `/calendar/:id` | `sessions.edit` |
```ts
AcademicSession = { id, branchId, name, startDate, endDate, status: "DRAFT"|"ACTIVE"|"CLOSED", termCount }
Term = { id, sessionId, name, startDate, endDate }
CalendarEvent = { id, schoolId, branchId, type: "HOLIDAY"|"VACATION"|"DEADLINE"|"EVENT", title, startDate, endDate, description }
```

## 8. Classes, sections, subjects, rooms
| Method | Path | Permission |
|---|---|---|
| GET/POST | `/classes?schoolId=` | `classes.view` / `classes.add` `{ schoolId, name, levelOrder }` |
| PATCH | `/classes/:id` | `classes.edit` |
| GET/POST | `/subjects?schoolId=` | `classes.view` / `classes.add` `{ schoolId, code, name }` |
| PATCH | `/subjects/:id` | `classes.edit` |
| GET/PUT | `/classes/:id/subjects` | view / edit `{ subjectIds: string[] }` |
| GET/POST | `/rooms?branchId=` | `classes.view` / `classes.add` `{ branchId, name, capacity? }` |
| PATCH | `/rooms/:id` | `classes.edit` |
| GET | `/sections?branchId=&sessionId=&classId=` | `classes.view` |
| POST | `/sections` | `classes.add` `{ branchId, sessionId, classId, name, capacity, roomId? }` — duplicate (session, class, name) → `CONFLICT`; closed session → `RECORD_LOCKED` |
| PATCH | `/sections/:id` | `classes.edit` `{ name?, capacity?, roomId? }` (class teacher assignment arrives in Phase 2 with staff) |
| POST | `/sections/:id/archive` | `classes.delete` |
```ts
SchoolClass = { id, schoolId, name, levelOrder, subjectCount }
Subject = { id, schoolId, code, name }
Room = { id, branchId, name, capacity }
Section = { id, branchId, sessionId, classId, className, name, capacity, room: {id,name}|null, studentCount /*0 until Phase 2*/, status }
```

## 9. Dashboard
`GET /dashboard/summary?schoolId=&branchId=&sessionId=` (`dashboard.view`, scoped) →
`{ schools, branches, users, activeSessions, sections, pendingApprovals }` (counts; modules from later phases are added to this object as they ship).

## 10. Approvals (engine core)
| Method | Path | Permission |
|---|---|---|
| GET | `/approvals?status=PENDING&type=` | `approvals.view` — only requests the caller can decide or requested |
| GET | `/approvals/:id` | same, with steps |
| POST | `/approvals/:id/decide` | `approvals.approve` `{ decision: "APPROVED"\|"REJECTED"\|"RETURNED", comment? }` — requester ≠ approver |
```ts
ApprovalRequest = { id, type, entityType, entityId, branchId, title, requestedBy: {id,name}, status, currentStep, createdAt,
                    steps?: { order, approverRole, approverUserId, decision, comment, decidedAt, decidedBy }[] }
```

## 11. Notifications
| Method | Path |
|---|---|
| GET | `/notifications?unread=true` → `{ id, category, title, body, data, readAt, createdAt }[]` |
| GET | `/notifications/unread-count` → `{ count }` |
| POST | `/notifications/:id/read` · `/notifications/read-all` |
| POST | `/devices` `{ token, platform }` (FCM token registration) |

## 12. Audit
`GET /audit?entityType=&entityId=&actorId=&branchId=&from=&to=` (`audit.view`) →
`{ id, action, entityType, entityId, actor: {id,name}, onBehalfOf, before, after, at }[]`

## 13. Files
| Method | Path |
|---|---|
| POST | `/files` multipart `file` + `purpose` (`SCHOOL_LOGO`, `DOCUMENT`, `ATTACHMENT`) → `{ id, url, mime, size }` |
| GET | `/files/:id/url` → `{ url, expiresAt }` (signed, 5 min) |
Dev uses `STORAGE_DRIVER=local` (files under `SchoolApi/storage/`); production uses S3.

## 14. Seeded demo accounts (dev only, password `Demo@1234`)
| Identifier | Role | Scope |
|---|---|---|
| `admin@eschool.local` | SUPER_ADMIN | GLOBAL |
| `principal@eschool.local` | PRINCIPAL | Bright School › Main Branch |
| `coordinator@eschool.local` | COORDINATOR | Main Branch |
| `headteacher@eschool.local` | HEAD_TEACHER | Main Branch |
| `teacher@eschool.local` | TEACHER | Main Branch |
| `accountant@eschool.local` | ACCOUNTANT | Main Branch |
| `parent@eschool.local` | PARENT | GUARDIAN |
| `teacherparent@eschool.local` | TEACHER + PARENT | Main Branch (tests role switch) |

## Deviations (as implemented in SchoolApi)
Paths and documented fields are unchanged. Additions and clarifications:
- **Status codes**: create endpoints return `201`; action endpoints (`/archive`, `/activate`, `/decide`, `/auth/*`, `/read`, `/devices`) return `200`.
- **Auth errors per request**: disabled user → `403 ACCOUNT_DISABLED` (checked before anything else, also on refresh); revoked session, logout, logout-all or bumped tokenVersion → `401 SESSION_REVOKED`; bad/expired access token → `401 UNAUTHENTICATED`. `X-Active-Role` naming a role the user does not hold → `403 FORBIDDEN`. Login of a user with no active assignment → `403 FORBIDDEN`.
- **Password**: wrong `currentPassword` on change → `401 INVALID_CREDENTIALS`; invalid/expired/used reset token → `400 VALIDATION_FAILED`. Password policy also rejects a short list of common passwords. Accounts created by admins always get `mustChangePassword=true`, also when a password is supplied (security.md §1). `PASSWORD_CHANGE_REQUIRED` is not raised for `/auth/*` and `/me` (GET and PATCH).
- **`POST /auth/logout`**: if `refreshToken` is given and belongs to the caller, its session is revoked too.
- **Sessions are not role-bound**: `PUT /branches/:id/principal` and `DELETE /users/:id/assignments/:id` revoke all sessions of the affected user and bump their tokenVersion (they log in again and keep their other roles).
- **`ApprovalRequest`** adds `amountMinor: number | null`; steps add `amountLimitMinor`; `decidedBy` is `{ id, name } | null`. `GET /approvals` also returns requests whose later step awaits the caller; `decide` only accepts the current step. Approving above a step's limit escalates to the next step, or fails with `409 APPROVAL_REQUIRED` when none exists.
- **Lists without pagination**: `GET /sessions/:id/terms`, `GET /calendar` (max 500, includes whole-school events of the branch's school), `GET /classes/:id/subjects`, `GET /roles`, `GET /permissions`, `GET /auth/sessions` return plain arrays. `GET /notifications` is paged (`meta`).
- **Files**: `url` values point to `GET /files/:id/content?exp=&sig=` (public, HMAC-signed, 5 min). Images are served `inline`, other types as `attachment`. Allowed: jpg/jpeg, png, webp (≤5 MB), pdf, docx (≤10 MB), content signature must match; `SCHOOL_LOGO` must be an image.
- **Branch settings PATCH**: only known keys; values validated (`HH:mm` strings, booleans, `{from,to}`, `approval.limits` = `{ [type]: amountMinor }`) → `400 VALIDATION_FAILED`.
- **Scope rules**: classes/subjects (school-wide) may be created/edited by holders of `classes.add/edit` who belong to the school; rooms, sections, sessions, terms and branch calendar events need management scope over the branch; whole-school calendar events need school-level scope. Branch archive/activate need school-level scope.
- **`DELETE /roles/:id`**: a custom role with assignment history is archived (hidden) instead of deleted; with active assignments → `409 CONFLICT`. Non-super-admins can only put permissions they hold into a custom role.
- **Default permissions** follow security.md §2.1: e.g. PRINCIPAL also has `schools.view`, `branches.edit`, `users.view/add/edit`, `roles.view`, `classes.delete`; TEACHER/COORDINATOR/HEAD_TEACHER have `sessions.view`, `guardians.view`, `health.view`, `students.view` (in-screen only, no menu entry).
