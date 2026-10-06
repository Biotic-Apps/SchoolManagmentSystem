# SchoolApi

NestJS 11 + Prisma 7 (PostgreSQL 16) + BullMQ (Redis) API for the eSchool Management System.
Design: [../docs/architecture.md](../docs/architecture.md) §5, [databaseManagement.md](../docs/databaseManagement.md), [security.md](../docs/security.md). Phase 1 API: [../docs/api/phase1-contract.md](../docs/api/phase1-contract.md); Phase 2 API: [../docs/api/phase2-contract.md](../docs/api/phase2-contract.md).

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
Demo data: 40 students in Class 4–5 with guardians, staff assignments, bell schedule and published 5-A/5-B timetables, Class 5 book list, 5-A syllabus plans, an admissions pipeline. The local database uses the WIN1252 encoding, so keep stored text ASCII-safe in dev.
Production seeds only the catalogue, system roles and the super admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Drivers
| Env | Values | Notes |
|---|---|---|
| `JOBS_DRIVER` | `bullmq` (default) / `inline` | `inline` runs the same processors after the response, no Redis; rejected in production. Runs are recorded in `job_runs`. |
| `CACHE_DRIVER` | `redis` (default) / `memory` | Token-version, session and assignment caches plus throttling counters; `memory` rejected in production. |
| `STORAGE_DRIVER` | `local` (default) / `s3` | Only `local` is implemented (files under `STORAGE_LOCAL_DIR`, served via HMAC-signed 5-minute URLs). The `StorageDriver` interface is in place; selecting `s3` fails at startup until the S3 driver is written. |

Push, email and SMS channels log messages in development and mark deliveries `FAILED` ("provider not configured") in production until real providers are added.

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
prisma/schema/        base, identity, organisation, audit, jobs, people, staff, documents, admissions, academics-plan
prisma/migrations/    phase1_init (+ partial unique indexes), phase1_integrity (audit append-only trigger, CHECKs),
                      phase2_people_academics (+ partial uniques: one active enrollment, one primary guardian, one class teacher; CHECKs)
prisma/seed*          seed entry + small seed steps
scripts/              embedded PostgreSQL start/stop
src/config/           zod-validated env + typed AppConfigService
src/core/common/      errors, envelope, pagination, request context, swagger helpers
src/core/auth/        login, refresh rotation + reuse detection, lockout, password reset/change, sessions, JwtAuthGuard
src/core/rbac/        permission catalogue, default role permissions, access context (X-Active-Role), Scope, PolicyGuard
src/core/audit/       AuditService + interceptor (append-only audit_logs), GET /audit
src/core/approvals/   generic approval engine (handler registry, steps, amount limits), inbox, reassign job
src/core/notifications/ in-app rows + delivery rows, channel adapters, jobs
src/core/files/       upload policy, local storage, signed URLs
src/core/jobs/        JobDispatcher + JobScheduler (BullMQ | inline), processor registry, JobRunner
src/core/outbox/      transactional outbox (domain_events) published after commit; sequences/ numbered ids
src/core/probation/   ProbationGate + PROBATION_REVIEW handler (reviewable action registry)
src/core/otp/, accounts/  one-time codes; login provisioning for staff/guardians
src/core/cache/       CacheStore (Redis | memory)
src/modules/          me, roles, schools, branches (+settings, principal), users (+assignments),
                      academic-sessions (sessions, terms, calendar), academics (classes, subjects, rooms, sections), dashboard,
                      documents, students (+enrollment, transfers, ID card PDF job), guardians (+child links, contact change),
                      admissions, staff (+assignments, probation, expiry job), timetable, syllabus (+book lists, delay report job)
```
Each module: `controller` (routes + permission) → `service` (rules, scope checks, audit) → `repository` (Prisma, takes a `Scope`).
Responses are `{ data, meta? }`; errors are `{ error: { code, message, details? } }` with codes from `ErrorCode`.
