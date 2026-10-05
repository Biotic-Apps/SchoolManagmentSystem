# Progress Tracker

Legend: `[x]` done (meets Definition of Done) · `[~]` in progress · `[ ]` remaining

Definition of Done per module: schema + migration · API with permission/scope guard · audit · approvals hook · jobs/notifications · seed · tests · web screens · Android screens · docs updated.

## Phase 0 — Planning & scaffolding
- [x] docs: architecture.md, backendFlows.md, databaseManagement.md, security.md
- [x] infra/docker-compose.yml
- [x] SchoolApi scaffold (NestJS 11, Prisma 7 multi-file schema: identity/organisation/audit, config, envelope + errors, PolicyGuard deny-by-default, BullMQ connection, /health, OpenAPI export)
- [x] SchoolWeb scaffold (Next 16, Tailwind 4 tokens, ui + shared components, portal shell, navigation catalogue, demo roles)
- [x] SchoolApp restructure (build-logic convention plugins, core:model/common/designsystem/navigation/network/datastore/database/data/sync, feature:auth, feature:home role shell, debug demo roles)

## Phase 1 — Admin foundation
- [x] Auth (login, refresh rotation, logout, reset, sessions, /me)
- [x] RBAC + scope guard + permission catalogue + role assignments (align DEFAULT_ROLE_PERMISSIONS with security.md §2.1: teacher guardians/health/sessions view as in-screen permissions; RBAC test to follow navigation.md menu rule)
- [x] Audit log
- [x] Approval engine core + inbox
- [x] Notifications core
- [x] Files service
- [x] Schools
- [x] Branches + branch settings
- [x] Users / Principals / Admin users
- [x] Roles & permissions UI
- [x] Academic sessions, terms, calendar
- [x] Classes, sections, subjects, rooms
- [x] Android: login, role shell, role-based navigation, profile

## Phase 2 — People & academics
- [ ] Admissions pipeline (enquiry → confirmation, waiting list, entrance test)
- [ ] Documents & verification
- [ ] Students & enrollment (withdraw, transfer)
- [ ] Student ID card
- [ ] Guardians + verified child links + child switcher
- [ ] Staff (teachers, helpers, coordinators, head teachers, probation, substitutes)
- [ ] Timetable
- [ ] Syllabus & books

## Phase 3 — Daily operations
- [ ] Student attendance (offline Android)
- [ ] Staff attendance
- [ ] Leave
- [ ] Daily diary & homework (offline drafts)
- [ ] Supervisor proxy + probation review
- [ ] Activities, sports, trips, competitions, consent
- [ ] Notices
- [ ] Parent–teacher messaging
- [ ] Complaints
- [ ] Meetings & appointments
- [ ] Health & incidents
- [ ] Pickup & early leave
- [ ] Principal dashboard & pending lists
- [ ] Push notifications (FCM)

## Phase 4 — Finance & results
- [ ] Exams & grading
- [ ] Marks entry & results approval
- [ ] Report cards
- [ ] Pass/repeat & promotion
- [ ] Fee structures & invoices
- [ ] Payments, proof verification, receipts, gateway adapter
- [ ] Concessions, refunds, reversals
- [ ] Dues & daily collections
- [ ] Payroll & payslips
- [ ] Expenses & vendors
- [ ] Inventory & purchasing
- [ ] Certificates
- [ ] Reports & exports

## Phase 5 — Hardening & parity
- [ ] Settings & branding
- [ ] Failed notifications
- [ ] Backups + restore verification
- [ ] Data import
- [ ] Web/app parity check
- [ ] Security review

## Phase 6 — Pilot & rollout
- [ ] Pilot branch

## Phase 1 notes
- API: 67 unit + 28 e2e tests pass; local DB via `npm run db:local` (embedded Postgres :5433). Contract deviations listed in docs/api/phase1-contract.md.
- Android: 69 unit tests; verified on real phone against the API (principal login, dashboard, branch with 12-hour timings, session kept across reinstall). Phone reaches the PC API via `adb reverse tcp:3000 tcp:3000` + `-Pschoolapp.apiBaseUrl.debug=http://localhost:3000/api/v1/` (no firewall change needed).
- Web verified end-to-end against API (login via BFF cookie, refresh rotation, route guard, admin/principal/teacher menus, real data on dashboard, schools, branches, users, roles, sessions, classes).
- Fixed in integration: BFF ignored empty API_URL; "All role/status" filter labels.
- Phase 2 follow-up: teacher dashboard counts all branch sections — restrict to assigned sections once staff assignments exist.
- Android follow-ups: branded launcher icon + splash (still default Android icon), debug cold start ~5–7 s, forgot/reset password screens, FCM device registration, pull-to-refresh on organisation screens.
- Not yet: S3 storage driver, image re-encode/EXIF strip, AV scan, audit partitioning, forgot/reset password web screens, FCM device registration on web.

## Carry-over notes (from Phase 0)
- API: no migrations yet (needs PostgreSQL); raw-SQL items pending — one ACTIVE session per branch, audit partitioning, append-only triggers.
- API: align DEFAULT_ROLE_PERMISSIONS with security.md §2.1 (Phase 1 RBAC).
- Web: refresh-cookie BFF route, /me reload on role switch, logout call, CSP, inactivity logout (Phase 1 auth).
- Android: custom (non-system) roles in menuFor, /me refresh on app start, FLAG_SECURE screens, cert pinning, OutboxProcessor/TokenAuthenticator tests, release API_BASE_URL (Gradle prop `schoolapp.apiBaseUrl.release`).
