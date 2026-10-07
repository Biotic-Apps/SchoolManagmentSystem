# Phase 5 Contract (Hardening & Parity)

Same conventions as phase1–4 contracts incl. all **Deviations**. Goal: make the system safe to pilot — settings and branding, operational visibility, backups that are proven restorable, data import for onboarding a real school, web/app parity, security review, and the carry-over items listed in docs/PROGRESS.md.

## A. Settings and branding
| Method | Path | Permission |
|---|---|---|
| GET | `/settings/school/:schoolId` | `settings.view` (principal: own school read-only) → `SchoolSettings` |
| PATCH | `/settings/school/:schoolId` | `settings.edit` (SUPER_ADMIN) |
| GET | `/branding?schoolId=` | public (login page) or any user → `{ schoolName, logoUrl, primaryColor, accentSoftColor, appName }` |
| GET/PATCH | `/settings/notifications?schoolId=` | `settings.view` / `settings.edit` → channel switches `{ email: { enabled, fromName }, sms: { enabled, senderId }, push: { enabled } }` + per-category defaults |
| GET/PATCH | `/settings/policies?schoolId=` | view / edit → `{ attendanceLockTime, diaryModeration, gradingDefault, feeLateFeeDefault, approvalLimits, passwordPolicy: { minLength, requireDigit }, sessionTimeoutMinutes, twoFactorRequiredFor: RoleKey[] }` (branch settings still override per branch) |
```ts
SchoolSettings = { schoolId, displayName, logoFileId, logoUrl, primaryColor /*hex*/, receiptFooter, reportCardFooter, timezone, currency, locale: "en-PK" }
```
Rules: `primaryColor` must be a hex with WCAG AA contrast ≥ 4.5 against white (else 400 with a message) — default `#0B7F74`. Web and Android read `/branding` and apply the school's logo/colour to the login screen and top bar; everything else keeps the design tokens.

## B. Account recovery and 2FA (carry-over)
- Web + Android screens for `POST /auth/password/forgot` and `/auth/password/reset` (Phase 1 endpoints): identifier → "if the account exists, instructions were sent" → token entry + new password.
- Optional TOTP 2FA (security.md §1): `POST /auth/2fa/setup` → `{ otpauthUrl, secret }` (QR on web), `POST /auth/2fa/enable { code }`, `POST /auth/2fa/disable { password, code }`, login returns `{ twoFactorRequired: true, challengeId }` → `POST /auth/2fa/verify { challengeId, code }` → tokens. Recovery codes (10, hashed, shown once). Enforced for roles in `twoFactorRequiredFor`.
- Admin "unlock account" `POST /users/:id/unlock` (`users.edit`).

## C. Operations visibility (Settings › Support)
| Method | Path | Permission |
|---|---|---|
| GET | `/support/notifications/failed?schoolId=&channel=&from=&to=` | `settings.view` → failed deliveries (recipient, channel, category, attempts, lastError, at) |
| POST | `/support/notifications/failed/:id/resend` · `/resend-all` | `settings.edit` |
| GET | `/support/jobs?queue=&status=FAILED&from=` | `settings.view` → job_runs |
| POST | `/support/jobs/:id/retry` | `settings.edit` |
| GET | `/support/health` | SUPER_ADMIN → `{ db: ok, queue: { driver, waiting, failed }, storage: { driver, ok }, lastBackup, lastRestoreVerified, version }` |

## D. Backups and restore verification
| Method | Path | Permission |
|---|---|---|
| GET | `/backups` | SUPER_ADMIN → `BackupRun[]` |
| POST | `/backups` | SUPER_ADMIN → `{ jobId }` (manual backup) |
| POST | `/backups/:id/verify` | SUPER_ADMIN → `{ jobId }` (restore into scratch DB + checks) |
| GET | `/backups/:id/download` | SUPER_ADMIN → signed URL |
```ts
BackupRun = { id, startedAt, finishedAt, status: "RUNNING"|"DONE"|"FAILED", sizeBytes, checksumSha256, encrypted: true, storageKey,
  verify: { status: "NOT_RUN"|"RUNNING"|"PASSED"|"FAILED", at, checks: { name, expected, actual, ok }[] } }
```
- Backup job: `pg_dump -Fc` (use the binaries shipped with embedded-postgres in dev; `PG_DUMP_PATH` env in prod) → AES-256-GCM encrypt with `BACKUP_ENCRYPTION_KEY` (32-byte base64, required in production) → storage driver. Nightly schedule + retention (30 daily, 12 monthly).
- Verify job: decrypt → `pg_restore` into a scratch database (`<db>_restore_check`) → checks: row counts of key tables equal the source at backup time (stored in the run), ledger sum per student equals, latest audit id present → drop scratch DB. Failure notifies SUPER_ADMIN.
- Weekly scheduled verify of the latest backup.

## E. Data import (onboarding a real school)
| Method | Path | Permission |
|---|---|---|
| GET | `/imports/templates/:kind` | `settings.edit` or principal → XLSX template with headers + an instructions sheet |
| POST | `/imports` | multipart `file` + `{ kind, branchId, sessionId }` → `{ importId }` (validate job) |
| GET | `/imports/:id` | → `{ status: "VALIDATING"|"READY"|"INVALID"|"COMMITTING"|"COMMITTED"|"REVERTED"|"FAILED", totals: { rows, valid, invalid }, errors: { row, column, message }[] (first 500), preview: first 20 parsed rows }` |
| POST | `/imports/:id/commit` | → applies all valid rows in one transaction (all-or-nothing; refuses if any invalid row unless `{ skipInvalid: true }`) |
| POST | `/imports/:id/revert` | → deletes what this import created if nothing references it yet (409 otherwise) |
| GET | `/imports?branchId=` | history |
Kinds: `STUDENTS` (with section, roll no, admission no optional → generated), `GUARDIANS` (linked by admission no; creates VERIFIED links and optional parent accounts), `STAFF` (with role + assignments by class/section/subject codes), `OPENING_BALANCES` (admission no, amount, as-of date → ledger CHARGE `OPENING_BALANCE` + an invoice "Opening balance"), `FEE_PLANS`. Validation: required columns, formats (dates `YYYY-MM-DD` or `DD/MM/YYYY`, PK phone normalisation, CNIC format), duplicates within file and against DB, referenced codes exist. Unicode (Urdu) names allowed. Reconciliation report after OPENING_BALANCES: total imported vs file total.

## F. Storage and files (carry-over)
- S3-compatible storage driver (`STORAGE_DRIVER=s3`, AWS SDK v3, works with MinIO/R2/S3) with signed URLs; local driver stays default for dev.
- Image uploads re-encoded with `sharp` (strip EXIF, max 2048 px, webp/jpeg); `scan_status` set by an `AntivirusScanner` interface (ClamAV TCP implementation when `CLAMAV_HOST` set, else `SKIPPED`) — files with `INFECTED` are never served (410).

## G. Android carry-over
- Branded launcher icon (adaptive icon: burgundy background, white graduation-cap mark) + Android 12+ SplashScreen API with the same mark on cream; fix the 5–7 s debug cold start (move heavy init off main/startup: lazy Hilt, WorkManager on-demand init, baseline profile for release).
- Forgot/reset password + 2FA verify screens; pull-to-refresh on organisation screens; release certificate pinning configured from Gradle properties (pins + host) — disabled when not provided; `FLAG_SECURE` already on salary.
- Branding from `/branding` on login + top bar.

## H. Parity and security review (deliverables)
- `docs/parity.md`: per role, every menu entry and key action on web vs Android, marked Same / Web-only (by design) / Gap; every Gap fixed or justified.
- `docs/security-review.md`: checklist from security.md §1–10 with evidence (test names, files) and findings; all High/Medium findings fixed in this phase.
- Dependency audit: `npm audit` (API, web) and Gradle dependency updates reviewed; no known High vulnerabilities in runtime dependencies (document any dev-only ones).

## I. New env vars
`BACKUP_ENCRYPTION_KEY`, `BACKUP_RETENTION_DAILY` (30), `BACKUP_RETENTION_MONTHLY` (12), `PG_DUMP_PATH`, `PG_RESTORE_PATH`, `STORAGE_DRIVER` (`local`|`s3`), `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `CLAMAV_HOST`, `CLAMAV_PORT`, `TOTP_ISSUER` ("eSchool").

## Deviations (as implemented in SchoolApi)
Paths and documented fields are unchanged unless listed. Additions and clarifications:
- **Migration** `phase5_hardening`:
  - New tables: `school_settings`, `user_two_factor`, `two_factor_recovery_codes`, `two_factor_challenges`, `backup_runs`, `import_batches`.
  - New columns `job_runs.data/retried_at/retried_by_id`; payroll adjustment cancel columns.
  - New enum values: FilePurpose `IMPORT`, InvoiceSource `OPENING`.
  - `audit_logs` is now range-partitioned by UTC month (`audit_logs_YYYY_MM` + `audit_logs_default`). Existing rows were copied, and the append-only triggers are kept on every partition.
  - Daily job `maintenance.auditPartitions` keeps the current and next two months prepared. It fails visibly if rows already reached the default partition.
- **Permissions**:
  - PRINCIPAL now holds `settings.view`: read-only own-school settings, notifications and policies. Not backups or support.
  - PRINCIPAL also holds the new special permission `settings.import` (imports for managed branches).
- **Settings access (§A)**:
  - GETs need `settings.view` plus membership of the school. Other schools give 403 FORBIDDEN_SCOPE; an unknown school gives 404.
  - Every PATCH needs `settings.edit` and the SUPER_ADMIN active role.
  - `SchoolSettings` adds `accentSoftColor` (default `#E6F5F2`) and `appName` (default "eSchool").
  - PATCH fields are optional; `null` clears `logoFileId` and the footers.
  - Field rules:
    - `primaryColor`: `#RRGGBB` with contrast ≥ 4.5 against white, else 400 with the ratio in the message. Stored upper case.
    - `accentSoftColor`: hex only.
    - `appName`: 1–40 characters. Footers: ≤ 300.
    - `timezone`: IANA. `currency`: 3 capital letters. `locale`: BCP-47.
    - `logoFileId`: must be a usable SCHOOL_LOGO file of that school. School.logoFileId is updated in the same transaction.
- **Branding**:
  - Without `schoolId`, the oldest ACTIVE school is used. Archived or unknown schools give 404.
  - `schoolName` = displayName, falling back to the school name.
  - `logoUrl` is a 5-minute signed URL, only for non-archived, servable SCHOOL_LOGO files.
- **Notification settings**:
  - `categories[]` items are `{ category, email, sms, push, inApp }`. GET lists every known category with its effective value.
  - PATCH replaces the `email` / `sms` / `push` blocks and each listed category. 400 for: unknown or repeated categories; `inApp: false` on a critical category (HEALTH, PICKUP); `fromName` > 60; `senderId` > 20.
  - Delivery uses a channel only when it is enabled in at least one school of the recipient. The recipient's schools are those of their active assignments; GLOBAL users and users without assignments use all active schools. Switched-off channels are not created.
  - A category with in-app off stores the notification already read, with an IN_APP delivery `SKIPPED`, so it is hidden from the inbox. Nothing is stored when no channel remains.
  - Critical categories always keep in-app.
- **Policies**:
  - PATCH merges at the top level. `approvalLimits` replaces the whole map: keys CONCESSION|REFUND|EXPENSE|PURCHASE_ORDER, whole numbers ≥ 0. `passwordPolicy` merges per field.
  - Ranges and checks:
    - `minLength` 8–64.
    - `sessionTimeoutMinutes` 5–1440.
    - `gradingDefault` must be a grading scheme of that school.
    - `feeLateFeeDefault.afterDays` 0–365.
    - `twoFactorRequiredFor` accepts any RoleKey.
  - A branch without its own `attendance.lockTime`, `diary.moderation` or `approval.limits.<TYPE>` uses the school policy before the built-in default. `approvalLimits[TYPE]` is read as `{ PRINCIPAL: n }`.
  - `gradingDefault`, `feeLateFeeDefault`, `receiptFooter` and `reportCardFooter` are stored but not yet used by results, fees or PDFs. The branch setting `fees.receiptFooter` still drives receipts.
- **2FA (§B)**:
  - **Login**: `POST /auth/login` returns either tokens or `{ twoFactorRequired: true, challengeId }`.
  - **Verify**: `POST /auth/2fa/verify { challengeId, code }` (public, auth throttle).
    - `code` is a 6-digit TOTP or a recovery code `xxxxx-xxxxx`; case, spaces and dashes are ignored.
    - Wrong code, or unknown / expired / used challenge → 401 INVALID_CREDENTIALS. Locked account → 423.
    - Challenges last 5 minutes and allow 5 attempts; each attempt is reserved before the code is checked.
  - **Lockout**: wrong codes at verify, disable and regenerate share the account lockout counter with passwords (5 failures → 15 min). Only a completed verify resets it.
  - **Code reuse**: a TOTP time step is accepted once per user. There are 10 recovery codes, each single use, stored as HMAC-SHA256.
  - **Extra endpoints**: `GET /auth/2fa` → `{ enabled, required }` and `POST /auth/2fa/recovery-codes/regenerate { code }`.
  - **Setup, enable, disable**:
    - `setup` → 409 when 2FA is already enabled.
    - `enable` needs a TOTP (a recovery code is not accepted). It returns `{ recoveryCodes }` once and revokes the user's other sessions.
    - `disable { password, code }` → 403 when the user's role requires 2FA.
  - **Secret storage**: AES-256-GCM with `TWO_FACTOR_ENCRYPTION_KEY`; without it, a key derived by HKDF from `JWT_REFRESH_SECRET`.
  - **Enforcement**: users whose role is in `twoFactorRequiredFor` and who have not enabled 2FA get `403 TWO_FACTOR_SETUP_REQUIRED` on everything except `/auth/*` and `/me`. Policy changes apply within about 60 s (cache).
  - **`/me`** adds `twoFactor: { enabled, required }`, `sessionTimeoutMinutes`, and `user.twoFactorEnabled` / `user.twoFactorRequired`.
- **Password policy and session timeout**:
  - Reset and change use the strictest policy across the user's schools.
  - Admin-chosen passwords at creation use the target schools' policy.
  - Generated temporary passwords meet only the baseline; a change is forced on first login.
  - `POST /auth/password/change` uses the auth throttle, and wrong current passwords count toward the account lockout.
  - `sessionTimeoutMinutes` is enforced on `POST /auth/refresh` for WEB sessions only:
    - Idle time is measured from the current refresh row.
    - Effective limit = max(timeout, access-token TTL) + 1 min.
    - On timeout: 401 SESSION_REVOKED "Session timed out", and the session family is revoked.
  - ANDROID sessions are not idle-limited (the app lock covers this).
- **Unlock**:
  - `POST /users/:id/unlock` needs `users.edit` and the same scope as editing the user. Unlocking yourself → 403.
  - Returns `UserDetailDto`. User DTOs add `lockedUntil` (null when not locked).
  - Audit action: `user.unlock`.
- **Support (§C)**:
  - Every `/support/*` endpoint needs `settings.edit` and the SUPER_ADMIN active role.
  - **Failed notifications**:
    - Shape: `{ id (delivery id), recipient: { userId, name, contact (masked) }, channel, category, title, status, attempts, lastError, at }`.
    - Paged, newest first. `schoolId` filters recipients assigned to that school; `from` / `to` are UTC dates.
  - **Resend**:
    - Only FAILED deliveries, claimed atomically (else 409), sent to the user's current address.
    - Inactive recipients are recorded as FAILED "Recipient is not active".
    - School channel switches are not applied to a manual resend.
    - Resend-all takes the list filters in the body, handles at most 500, and returns `{ resent, failed }`.
  - **Jobs**:
    - Status is RUNNING|DONE|FAILED. Adds `retriedAt` and `retryable`. Job data is never returned.
    - Retry works only for FAILED runs with stored data, not yet retried, on an active queue (else 409).
    - Job data of `notifications.direct` (reset codes, OTPs) is never stored, so those runs cannot be retried.
  - **Health**:
    - `lastBackup` = `{ id, finishedAt, status }` of the latest DONE backup.
    - With the inline driver, `queue.failed` = FAILED job_runs in the last 24 h.
    - Every read is audited (`support.health_read`).
- **Backups (§D)**:
  - **Access and DTO**: SUPER_ADMIN active role + `settings.edit`. `BackupRun` adds `format` (`pg_dump`|`copy`), `trigger` (`MANUAL`|`SCHEDULED`) and `error`; `sizeBytes` is a number.
  - **Endpoints**:
    - `POST /backups` → 201 `{ jobId }`; one running backup at a time (409).
    - Verify → 200 `{ jobId }`; only DONE, non-pruned backups, one at a time (409).
    - `GET /backups/:id/download` → `{ url, expiresAt }`: an S3 presigned URL, or with the local driver a public HMAC-signed `GET /backups/:id/content?exp=&sig=` (5 min). Either way it streams the **encrypted** file (`ESBK` header, AES-256-GCM).
  - **pg_dump vs built-in dump**: the embedded-postgres package used in development ships no `pg_dump` / `pg_restore`.
    - When `PG_DUMP_PATH` (or `pg_dump` on PATH) exists: `pg_dump -Fc` with a snapshot exported by the stats transaction, restored with `pg_restore --no-owner --no-privileges`.
    - Otherwise, outside production only: a built-in COPY dump (all public tables in one REPEATABLE READ snapshot, gzip). It is restored by applying the backup's recorded migrations to the scratch DB, loading the data, then re-adding all foreign keys (an extra `foreign keys` check).
    - In production without pg_dump, the backup fails.
  - **Verify checks**:
    - File checksum, decrypt, restore, foreign keys (copy format only).
    - Row counts: users, schools, branches, students, enrollments, guardians, student_guardians, staff, invoices, payments, ledger_entries, payroll_runs, audit_logs.
    - Ledger total, per-student ledger hash, latest audit id, migrations.
    - The scratch DB `<db>_restore_check` is always dropped.
  - **Schedules**: nightly backup at 02:00 followed by retention; weekly verify on Sunday at 03:30 (server time).
  - **Retention**: keeps the newest `BACKUP_RETENTION_DAILY` backups plus the newest one of each of the last `BACKUP_RETENTION_MONTHLY` months. Other stored objects are deleted and the run gets `prunedAt`; rows are kept.
  - Failures notify active super admins.
- **Imports (§E)**:
  - **Access**: `@RequirePermission('settings.edit', 'settings.import')`. Non-global callers need management scope over the import's branch (else 404).
  - **Upload**:
    - `.xlsx` or `.csv` (UTF-8, BOM allowed), ≤ 5 MB, ≤ 5000 rows, file signature checked.
    - The original is stored as a `File` with purpose IMPORT, which can never be uploaded via `/files`.
    - Validation runs on the `imports` queue. Row numbers are spreadsheet rows (first data row = 2).
  - **Commit**:
    - Synchronous: 200, returns the import.
    - Re-validates against the DB inside the single transaction. If rows became invalid meanwhile → 409 with `details.errors` and status INVALID, nothing applied. Any other error → FAILED, nothing applied.
  - **Accounts**: logins created by GUARDIANS / STAFF imports never store or return temporary passwords; users sign in via "forgot password".
  - **OPENING_BALANCES**:
    - Per student: one ISSUED invoice (source OPENING, fee head `OPENING` created on demand, due on the as-of date) plus a ledger CHARGE `OPENING_BALANCE`.
    - Existing advance credit is applied as on invoice issue.
    - Negative amounts are refused (record advances as payments). One row per student; duplicates are errors.
    - `reconciliation = { fileTotalMinor, importedTotalMinor, students, matches }`.
  - **Revert**:
    - 409 when anything references the created data; otherwise deletes the created records.
    - For OPENING_BALANCES the append-only ledger gets `CANCELLATION` entries and the invoices are CANCELLED, only when nothing was paid or allocated.
  - **STAFF assignments** use the syntax `CLASS_TEACHER:5-A; SUBJECT_TEACHER:5-B:MATH` (see the template's Instructions sheet).
- **Files (§F)**:
  - **Scan status**: there is no `SKIPPED`. Without `CLAMAV_HOST`, uploads stay `PENDING` (not scanned). With ClamAV they are scanned before storage and stored as `CLEAN`.
  - **Infected or failed scans**:
    - INFECTED uploads are never stored: 400 "File rejected by antivirus", audited as `file.infected`.
    - Scanner errors fail closed: 503, nothing stored.
    - Files with status `INFECTED` or `FAILED` → 410 `FILE_UNAVAILABLE` on `/files/:id/url` and `/files/:id/content`, and cannot be attached to records.
  - **Images**: re-encoded to JPEG (q85), or PNG when transparent. Not WebP, because the PDF renderers embed only JPEG/PNG. EXIF is stripped, output ≤ 2048 px, input ≤ 40 MP. Stored mime, size, sha256 and extension reflect the output.
  - **Signed URLs**: `/files/:id/url` keeps API-signed URLs with both drivers, so the scan-status check stays server-side.
  - **Who may get `/files/:id/url`** (anyone else gets 404):
    - Uploader: always.
    - SCHOOL_LOGO: any school member.
    - Parents, teachers, helpers: only their own uploads.
    - REPORT: the requester only.
    - PAYSLIP: `payroll.view` + management scope.
    - IMPORT: `settings.edit` or `settings.import`, plus management of the import's branch.
    - Everything else: management scope over the file's school.
  - **Attaching files**: `FileRefService` accepts only the caller's own upload, or a file of a school the caller manages.
  - **Diary**: archived or quarantined diary attachments are no longer signed.
- **Student calendar** (new; parent calendar in docs/parity.md): `GET /students/:studentId/calendar?from=&to=` (`timetable.view`) → `CalendarEventDto[]`, the same DTO as `GET /calendar`.
  - Events of the branch of the student's current enrollment (ACTIVE, else the latest) plus whole-school events: ACTIVE only, overlapping the range, oldest first, at most 500. No enrollment → `[]`.
  - Range: `from` defaults to today (APP_TIMEZONE), `to` to `from` + 90 days. `to` before `from`, or more than 366 days → 400.
  - Parents: verified children only, else 404. Staff: the student must be in scope (else 403), as for `GET /students/:id`.
- **ID card**: `POST /students/:id/id-card` now needs `students.edit` and management scope over the student's branch (was `students.view`). `GET` is unchanged.
- **Carry-overs**:
  - **Payroll adjustment cancel**: `POST /payroll/adjustments/:id/cancel { reason (3–500) }` (`payroll.edit`, 200).
    - Errors: not PENDING → 409; own salary → 403; run APPROVED or later → 409 `RUN_APPROVED`; run awaiting approval → 409 `RUN_IN_APPROVAL`.
    - A CALCULATED / REVIEWED run containing the adjustment returns to DRAFT (`payroll.run_invalidated`).
    - Adjustment rows add `cancelledAt`, `cancelReason`, `cancelledBy`.
  - **Fee plan archive**: `POST /fee-plans/:id/archive { reason? }` (`fees.edit|fees.approve`; plans that were ever approved need `fees.approve`).
    - DRAFT / APPROVED → ARCHIVED. This is final: repeating it → 409, PATCH / approve → 409.
    - `GET /fee-plans` hides archived plans unless `includeArchived=true` or `status=ARCHIVED`.
  - **Promotion capacity**: promotion apply checks section capacity (null = unlimited) before applying → 409 `details.sections[{sectionId, capacity, current, incoming}]`. The check runs outside the per-student transactions.
- **Security hardening** (see docs/security-review.md):
  - `TRUSTED_PROXIES` sets Express `trust proxy`. Unset = loopback in dev, none in production. `req.ip` = right-most untrusted X-Forwarded-For entry, used by throttling, audit and sessions.
  - The general throttler keys authenticated calls per token; the auth throttler stays per IP.
  - Parents now get 404 (not an empty page) for `?studentId=` of another family's child on `/certificates`, `/concessions`, `/invoices` and `/messages/threads`.
  - Oversized or malformed JSON → 413 / 400 instead of 500.
  - Reads of another staff member's salary structure are audited (`payroll.salary_structure_read`).
- **New env**:
  - As §I, plus `TRUSTED_PROXIES` and `TWO_FACTOR_ENCRYPTION_KEY`.
  - `S3_*` are optional unless `STORAGE_DRIVER=s3`.
  - `BACKUP_ENCRYPTION_KEY` must be 32 base64 bytes and is required in production.
