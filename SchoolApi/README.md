# SchoolApi

NestJS 11 + Prisma 7 (PostgreSQL 16) + BullMQ (Redis) API for the eSchool Management System.
Design: [../docs/architecture.md](../docs/architecture.md) §5, [databaseManagement.md](../docs/databaseManagement.md), [security.md](../docs/security.md). Phase 1 API: [../docs/api/phase1-contract.md](../docs/api/phase1-contract.md); Phase 2 API: [../docs/api/phase2-contract.md](../docs/api/phase2-contract.md); Phase 3 API: [../docs/api/phase3-contract.md](../docs/api/phase3-contract.md); Phase 4 API: [../docs/api/phase4-contract.md](../docs/api/phase4-contract.md); Phase 5 API: [../docs/api/phase5-contract.md](../docs/api/phase5-contract.md). Security review: [../docs/security-review.md](../docs/security-review.md).

## Local run (no Docker, Postgres or Redis install needed)
```bash
npm install                 # also runs `prisma generate` (client → src/generated/prisma)
cp .env.example .env        # dev defaults: DB on 5433, JOBS_DRIVER=inline, CACHE_DRIVER=memory; set real secrets
npm run db:local            # terminal 1: embedded PostgreSQL 16 in .pgdata on :5433 (user/pass/db eschool), keeps running
npx prisma migrate deploy   # terminal 2: apply migrations (or `npm run prisma:migrate` while developing the schema)
npm run db:seed             # catalogue, system roles, super admin, demo data (non-production)
npm run start:dev           # API on http://localhost:3000, Swagger UI at /docs
```
Stop the database with Ctrl+C in terminal 1 or `npm run db:local:stop`. The first `db:local` initialises the cluster and creates the `eschool` and `eschool_test` databases.

Demo accounts (password `Demo@1234`): `admin@`, `principal@`, `coordinator@`, `teacher@`, `teacher2@`, `teacher3@`, `newteacher@` (on probation, reviewed by the coordinator), `accountant@`, `parent@` (2 children), `teacherparent@eschool.local`.
Demo data: 40 students in Class 4–5 with guardians, staff assignments, bell schedule and published 5-A/5-B timetables, Class 5 book list, 5-A syllabus plans, an admissions pipeline. The local database is UTF-8 (Urdu names work).
Production seeds only the catalogue, system roles and the super admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Drivers
| Env | Values | Notes |
|---|---|---|
| `JOBS_DRIVER` | `bullmq` (default) / `inline` | `inline` runs the same processors after the response, no Redis; rejected in production. Runs are recorded in `job_runs`. |
| `CACHE_DRIVER` | `redis` (default) / `memory` | Token-version, session and assignment caches plus throttling counters; `memory` rejected in production. |
| `STORAGE_DRIVER` | `local` (default) / `s3` | `local`: files under `STORAGE_LOCAL_DIR`. `s3`: AWS S3 / MinIO / R2 (`S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, optional `S3_ENDPOINT` + `S3_FORCE_PATH_STYLE`), SSE-AES256 on upload. Files are always served through HMAC-signed 5-minute API URLs; S3 presigned URLs are used for backup downloads. |
| `CLAMAV_HOST` / `CLAMAV_PORT` | unset / `3310` | When set, every upload is scanned via clamd INSTREAM before it is stored (infected → 400, scanner error → 503, nothing stored). Unset: files stay `scan_status=PENDING` (not scanned). Images are always re-encoded with sharp (EXIF stripped, max 2048 px, JPEG or PNG). |

| `EMAIL_DRIVER` | `log` (default) / `smtp` | `smtp` (nodemailer): `SMTP_HOST` (required), `SMTP_PORT` (587), `SMTP_SECURE` (`false` = STARTTLS required, `true` = implicit TLS on 465), `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` (required, `eSchool <no-reply@school.pk>`). The school's `notifications.email.fromName` replaces the display name. |
| `SMS_DRIVER` | `log` (default) / `twilio` / `http` | `twilio`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (Messages API over plain fetch). `http` (any local gateway): `SMS_HTTP_URL` (required; `{{to}}` etc. allowed, URL-encoded), `SMS_HTTP_METHOD` (`POST` / `PUT` / `GET`; GET sends no body), `SMS_HTTP_HEADERS` (JSON object, e.g. `{"Authorization":"Bearer …"}`), `SMS_HTTP_BODY` template with `{{to}}`, `{{message}}`, `{{senderId}}` (escaped for the Content-Type; unset = JSON `{"to","message","senderId"}`). Success = any 2xx. `senderId` = school `notifications.sms.senderId`. |
| `ALLOW_LOG_CHANNELS` | `false` | Production refuses to start with `EMAIL_DRIVER=log` or `SMS_DRIVER=log` unless this is `true` (staging boxes); the log driver then logs title + user id only, never the body. |
| `DEFAULT_PHONE_COUNTRY` | `+92` | Numbers without a country code are normalised to E.164 with it (`0300-1234567` → `+923001234567`) for SMS and phone sign-in. |
| `FCM_SERVICE_ACCOUNT_JSON` | unset | Firebase service account JSON (or a path). Set = real FCM HTTP v1 push; unset = push is logged in development and fails in production. |

In development the log drivers print messages (incl. codes) to the console. Provider failures are thrown, so deliveries end up `FAILED` (retry + Settings › Support); the stored error is cut to 300 characters with configured secrets, auth headers and full phone numbers removed. `POST /support/test-message { channel: EMAIL|SMS, to }` (super admin) sends one message synchronously and answers `{ ok, error? }`.

## Phase 5 operations
- **Settings & branding**: `GET /branding` (public) feeds the login screen; `/settings/school|notifications|policies` (principal read-only, super admin edits). Policies drive password rules, the web session idle timeout (`sessionTimeoutMinutes`, enforced on WEB refresh) and `twoFactorRequiredFor`.
- **Two-factor sign-in**: TOTP (`/auth/2fa/setup|enable|disable|verify`, 10 single-use recovery codes). Secrets are encrypted with `TWO_FACTOR_ENCRYPTION_KEY` (32 bytes base64; unset = derived from `JWT_REFRESH_SECRET`, so rotating that secret resets 2FA). Locked accounts: `POST /users/:id/unlock`.
- **Backups**: nightly 02:00 (`maintenance.backupNightly`), weekly restore check Sunday 03:30, retention `BACKUP_RETENTION_DAILY` daily + `BACKUP_RETENTION_MONTHLY` monthly. Every dump is AES-256-GCM encrypted with `BACKUP_ENCRYPTION_KEY` (required in production; store it separately from the backup bucket). Format `pg_dump -Fc` when `PG_DUMP_PATH`/`pg_dump` exists; otherwise (development only — embedded-postgres ships no `pg_dump`) a built-in COPY dump. Verify restores into `<db>_restore_check` (needs CREATEDB) and compares row counts, ledger totals, per-student ledger hash, latest audit id and migrations. Manual: `POST /backups`, `POST /backups/:id/verify` (super admin).
- **Imports**: `GET /imports/templates/:kind` (XLSX with an Instructions sheet) → `POST /imports` (xlsx/csv) → `GET /imports/:id` (errors + preview) → `POST /imports/:id/commit` (`skipInvalid`) → `POST /imports/:id/revert` while nothing references the data. Kinds: STUDENTS, GUARDIANS, STAFF, OPENING_BALANCES, FEE_PLANS. Sample: `prisma/seed/fixtures/students.xlsx`.
- **Support**: `/support/notifications/failed` (+resend), `/support/jobs` (+retry), `/support/health` — super admin only.
- **Proxies**: set `TRUSTED_PROXIES` (IPs/CIDRs) to the web BFF / load balancer so rate limits and audit see the real client IP (unset = loopback in dev, nobody in production).
- **audit_logs** is range-partitioned by month; `maintenance.auditPartitions` (daily) keeps the next two months ready.

## Phase 6 pilot
- **Parent phone sign-in**: `POST /auth/otp/request { phone }` (always `{ ok, resendAfterSeconds: 60 }`) → SMS with a 6-digit code (5 minutes, 5 attempts, HMAC-SHA256 in `login_otps`) → `POST /auth/otp/verify { phone, code, platform }` → same answer as `/auth/login` (tokens or a 2FA challenge). Only ACTIVE users with an active PARENT role get a code; wrong codes count toward the account lockout. Demo: `parent@eschool.local` has phone `+923001112233`; with the log driver the code is printed in the API console.
- **Demo calendar**: the seed adds a holiday, a mid-term exam week and a parent-teacher day 18–55 days after the seed date.

## Scripts
| Script | What |
|---|---|
| `npm run db:local` / `db:local:stop` | Start (foreground) / stop the embedded PostgreSQL |
| `npm run db:seed` | `prisma db seed` |
| `npm run start:dev` | Watch mode on `PORT` (default 3000) |
| `npm run build` / `npm run start:prod` | Compile to `dist/` and run |
| `npm run lint` | ESLint + Prettier (with `--fix`) |
| `npm test` | Unit tests |
| `npm run test:e2e` | HTTP tests against database `eschool_test` (reset, migrated and seeded on each run; starts the embedded cluster itself if nothing listens on 5433) |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run openapi` | Writes `openapi.json` (no DB needed) |

## Layout
```
prisma/schema/        base, identity, organisation, audit, jobs, people, staff, documents, admissions, academics-plan,
                      attendance (+leave, staff attendance), engagement (diary, activities, notices, messaging), welfare,
                      results, finance, payroll, procurement, certificates (+generated documents, async tasks)
prisma/migrations/    phase1_init (+ partial unique indexes), phase1_integrity (audit append-only trigger, CHECKs),
                      phase2_people_academics (+ partial uniques: one active enrollment, one primary guardian, one class teacher; CHECKs),
                      phase3_daily_operations (+ partial uniques: one pending correction per entry, one scheduled meeting per slot),
                      phase4_finance_results (append-only triggers on ledger_entries + stock_movements, money CHECKs,
                      partial uniques: one generated invoice per student+period, one recurring expense copy per month, original certificate serials),
                      phase5_hardening (settings, 2FA, backups, imports; audit_logs monthly partitions + audit_logs_ensure_partition())
prisma/seed*          seed entry + small seed steps
scripts/              embedded PostgreSQL start/stop
src/config/           zod-validated env + typed AppConfigService
src/core/common/      errors, envelope, pagination, request context, swagger helpers
src/core/auth/        login, refresh rotation + reuse detection, lockout, password reset/change, sessions, JwtAuthGuard
src/core/rbac/        permission catalogue, default role permissions, access context (X-Active-Role), Scope, PolicyGuard
src/core/audit/       AuditService + interceptor (append-only audit_logs), GET /audit
src/core/approvals/   generic approval engine (handler registry, steps, amount limits), inbox, reassign job
src/core/notifications/ in-app rows + delivery rows, channel adapters (FCM push when FCM_SERVICE_ACCOUNT_JSON is set), preferences, jobs
src/core/idempotency/ clientRequestId store for offline (Android) writes
src/core/files/       upload policy, local storage, signed URLs
src/core/jobs/        JobDispatcher + JobScheduler (BullMQ | inline), processor registry, JobRunner
src/core/outbox/      transactional outbox (domain_events) published after commit; sequences/ numbered ids
src/core/probation/   ProbationGate + PROBATION_REVIEW handler (reviewable action registry)
src/core/otp/, accounts/  one-time codes; login provisioning for staff/guardians
src/core/cache/       CacheStore (Redis | memory)
src/modules/          me, roles, schools, branches (+settings, principal), users (+assignments),
                      academic-sessions (sessions, terms, calendar), academics (classes, subjects, rooms, sections), dashboard,
                      documents, students (+enrollment, transfers, ID card PDF job), guardians (+child links, contact change),
                      admissions, staff (+assignments, probation, expiry job), timetable, syllabus (+book lists, delay report job),
                      school-day (shared helpers), attendance (+corrections, lock job), staff-attendance, leave, diary (+missing job),
                      activities, notices (+expiry job), messaging, complaints (+SLA job), meetings (+reminder job), health, pickup,
                      tasks (GET /jobs/:id), generated-docs (versioned PDFs on the documents queue), finance-core (ledger, allocation,
                      invoice money events, approval limits), results (grading, exams, marks, results, report cards, progress, promotions),
                      fees (+invoice generator, overdue/late-fee job), payments (+proofs, receipts, reversal, refunds, gateways, collections,
                      finance dashboard), payroll (+calculate job, payslips), expenses (+recurring job), inventory (+purchasing, sales,
                      low-stock job), certificates (+public verify), reports (catalog, CSV/XLSX/PDF jobs), settings (+branding),
                      support, backups (+nightly/weekly jobs), imports
```
Money is stored as BigInt minor units (`amount_minor`) and returned as JSON numbers; the student ledger and stock movements
are append-only (DB triggers) and corrections are new entries with a reason.
Each module: `controller` (routes + permission) → `service` (rules, scope checks, audit) → `repository` (Prisma, takes a `Scope`).
Responses are `{ data, meta? }`; errors are `{ error: { code, message, details? } }` with codes from `ErrorCode`.
