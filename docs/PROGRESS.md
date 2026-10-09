# Progress Tracker

> Retired 2026-10-10: Syllabus & Books, Live classes — removed by owner decision. Menus, screens, API endpoints, permissions and demo seed are gone (web, Android, API); live-class tables were dropped (migration `20261010120000_retire_live_classes_syllabus`), syllabus/book-list tables are kept with their data.

Legend: `[x]` done (meets Definition of Done) · `[~]` in progress · `[ ]` remaining

Definition of Done per module: schema + migration · API with permission/scope guard · audit · approvals hook · jobs/notifications · seed · tests · web screens · Android screens · docs updated.

## Phase 0 — Planning & scaffolding
- [x] docs: architecture.md, backendFlows.md, databaseManagement.md, security.md
- [x] infra/docker-compose.yml
- [x] SchoolApi scaffold (NestJS 11, Prisma 7 multi-file schema: identity/organisation/audit, config, envelope + errors, PolicyGuard deny-by-default, BullMQ connection, /health, OpenAPI export)
- [x] SchoolWeb scaffold (Next 16, Tailwind 4 tokens, ui + shared components, portal shell, navigation catalogue; demo-role preview removed — real sign-in only)
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
- [x] Admissions pipeline (enquiry → confirmation, waiting list, entrance test)
- [x] Documents & verification
- [x] Students & enrollment (withdraw, transfer)
- [x] Student ID card
- [x] Guardians + verified child links + child switcher
- [x] Staff (teachers, helpers, coordinators, head teachers, probation, substitutes)
- [x] Timetable
- [x] ~~Syllabus & books~~ (retired 2026-10-10)

## Phase 3 — Daily operations
- [x] Student attendance (offline Android)
- [x] Staff attendance
- [x] Leave
- [x] Daily diary & homework (offline drafts)
- [x] Supervisor proxy + probation review
- [x] Activities, sports, trips, competitions, consent
- [x] Notices
- [x] Parent–teacher messaging
- [x] Complaints
- [x] Meetings & appointments
- [x] Health & incidents
- [x] Pickup & early leave
- [x] Principal dashboard & pending lists
- [x] Push notifications (FCM)

## Phase 4 — Finance & results
- [x] Exams & grading
- [x] Marks entry & results approval
- [x] Report cards
- [x] Pass/repeat & promotion
- [x] Fee structures & invoices
- [x] Payments, proof verification, receipts, gateway adapter
- [x] Concessions, refunds, reversals
- [x] Dues & daily collections
- [x] Payroll & payslips
- [x] Expenses & vendors
- [x] Inventory & purchasing
- [x] Certificates
- [x] Reports & exports

## Phase 5 — Hardening & parity
- [x] Settings & branding
- [x] Failed notifications
- [x] Backups + restore verification
- [x] Data import
- [x] Web/app parity check
- [x] Security review

## Phase 6 — Pilot & rollout
- [x] Real delivery: SMTP email, SMS driver (log | twilio | http), FCM push check
- [x] Parent email + one-time code sign-in (API, web, Android); replaced the phone/SMS code flow on 2026-10-08 (migration email_login_otp)
- [x] Production deploy kit: Dockerfiles, docker-compose.prod.yml, Caddy TLS, prod env template
- [x] CI (GitHub Actions): API build/lint/unit/e2e, web tsc/lint/build, Android build + unit tests
- [x] Production bootstrap (first super admin, no demo data) + docs/deployment.md (backups off-site, restore drill, updates/rollback, monitoring)
- [x] docs/pilot.md: school onboarding runbook, UAT checklist per role, go-live checklist, support process
- [x] Android: optional biometric/PIN app lock, merge staff-attendance Hilt modules
- [ ] Android: phone check of Phase 5/6 screens, release cold start (needs a connected phone)
- [x] Demo seed: calendar events
- [ ] Pilot branch live (needs: server, domain, SMS/email provider, Firebase project, pilot school data)

## Phase 6 notes (code part done 2026-10-07)
- API: EMAIL_DRIVER log|smtp (nodemailer), SMS_DRIVER log|twilio|http, production refuses log channels unless ALLOW_LOG_CHANNELS=true; POST /support/test-message; parent phone + OTP sign-in (/auth/otp/request, /auth/otp/verify; migration phase6_pilot adds login_otps); demo calendar events; production seed forces the first super admin to change password. 697 unit + 150 e2e tests. Deviations in docs/api/phase6-contract.md.
- Web: "Sign in with phone code" (verified in Chrome: SMS code from API log → dashboard), Support "Send test message" card.
- Android: phone + OTP sign-in, optional biometric/device-credential app lock (Profile), Hilt modules merged. 474 unit tests; assembleDebug + assembleRelease pass.
- Deploy kit: SchoolApi/SchoolWeb Dockerfiles, infra/docker-compose.prod.yml (postgres, redis, clamav, api, web, caddy; minio optional), Caddy TLS, infra/.env.production.example, infra/scripts (off-site backup, update with rollback, decrypt, restore drill), .github/workflows/ci.yml. NOT yet run: Docker is not installed on this machine, and CI first runs after push.
- Docs: docs/deployment.md, docs/pilot.md (6-week pilot plan, onboarding runbook, UAT per role, go-live checklist).
- Waiting on user: server, domains, SMTP + SMS provider, Firebase project, off-site backup target, pilot school + data, Play Store vs APK.

## Phase 5 notes (complete 2026-10-07)
- API: settings & branding, notification switches, policies, support tools, TOTP 2FA + recovery codes, unlock, password policy, encrypted backups + restore verify, XLSX/CSV data import, S3 driver, image re-encode, ClamAV hook, audit_logs monthly partitions, trusted proxy, security e2e suites, parent school calendar `GET /students/:id/calendar`. 642 unit + 137 e2e tests; npm audit 0 vulnerabilities. Real backup on dev DB restore-verified (PASSED). Deviations in docs/api/phase5-contract.md.
- Web: Settings & Backups, forgot/reset password, 2FA setup + login step (verified end-to-end), unlock user, teacher roster, parent school calendar, idle logout from policy `sessionTimeoutMinutes`. Fixed in integration: principal saw super-admin-only Support tab; import size 10→5 MB; timeout range 480→1440.
- Android: branded icon + splash, forgot/reset + 2FA verify, branding, pull-to-refresh, release pinning, staff attendance marking, meeting slot publishing, parent homework tab, attachments on incidents/complaint updates, complaint assign, parent Timetable tabs (Timetable / Calendar / Activities). 431 unit tests; assembleDebug + assembleRelease pass.
- Parity: docs/parity.md (web) and docs/parity-android.md — every gap Fixed or Justified. Security review in docs/security-review.md.
- Carry to Phase 6: new Android screens not yet checked on a phone (no device connected 2026-10-07); release cold start not measured; optional Android app lock (security.md §8) not built; staff-attendance Hilt modules could be merged into the main modules; demo seed has no calendar events; parent phone + OTP sign-in not built (no API endpoint).

## Phase 4 notes
- API: 324 unit + 62 e2e tests; migration phase4_finance_results (43 tables, append-only triggers on ledger_entries/stock_movements, money CHECKs). GET /jobs/:id for all background jobs. Deviations in docs/api/phase4-contract.md.
- Verified live: parent fee summary/invoices/results, cash payment allocates oldest-first (due 6,200 → 5,200), teacher cannot read others' payslips (403), finance dashboard.
- Integration fixes: accountant lacked branches.view/staff.view (fees/payroll pages unusable); principal given exams.submit (proxy marks); next-due amount read from balanceMinor (web + Android); Android fee flags aligned to proofUploadEnabled/onlineGatewayEnabled; results seed used subject codes instead of names; parent Progress page double header.
- Parent menu now includes Certificates (docs/navigation.md, web, Android).
- Android: 291 unit tests; FLAG_SECURE on salary screens; installed on phone without crash.
- Not yet: real online gateways (JazzCash/Easypaisa — only ManualGateway), fee plan archiving, payroll adjustment cancel, mid-month salary pro-rata, section capacity check on promotion apply, end-to-end e2e for results compute→publish.

## Phase 3 notes
- API: 150 unit + 47 e2e tests; migration phase3_daily_operations. School date/time now follow APP_TIMEZONE (default Asia/Karachi) instead of UTC/server time.
- Principal default permissions extended to do teacher work by proxy (attendance/diary/syllabus/progress edit+submit); verified proxy submit records performedBy + onBehalfOf.
- Web: all Phase 3 screens verified against API; added shared UnsavedChangesGuard (attendance register), /messages/recipients for parent targets; fixed tile/sidebar label truncation, summary table overflow, duplicate parent notices.
- Android: 202 unit tests; Room DB v1→v2 migration verified on phone (no crash). Push uses a no-op PushTokenProvider until Firebase is configured.
- Not yet: FCM project setup, staff slot publishing on Android, attachments on incident reports/complaint updates on Android, trip fees → invoices (Phase 4).

## Phase 2 notes
- API: 94 unit + 40 e2e tests; migration phase2_people_academics; scope by staff assignments (teacher sees only own sections) and verified guardian links (parent 404 otherwise). Deviations in docs/api/phase2-contract.md.
- Local DB recreated as UTF-8 (was WIN1252 — Urdu names failed); scripts/db-local.ts now passes initdb --encoding=UTF8. Urdu name round-trip verified.
- Web: all Phase 2 screens verified against API (admissions, students, staff, timetable 12h, syllabus). Fixed: input double focus stroke, timetable time wrapping.
- Android: 96 unit tests; installed on phone, invalid old session correctly returns to login.
- Not yet: offer-letter PDF, waitlist auto-expiry, photo re-encode, transfer certificate (Phase 4 certificates).

## Phase 1 notes
- API: 67 unit + 28 e2e tests pass; local DB via `npm run db:local` (embedded Postgres :5433). Contract deviations listed in docs/api/phase1-contract.md.
- Android: 69 unit tests; verified on real phone against the API (principal login, dashboard, branch with 12-hour timings, session kept across reinstall). Phone reaches the PC API via `adb reverse tcp:3000 tcp:3000` + `-Pschoolapp.apiBaseUrl.debug=http://localhost:3000/api/v1/` (no firewall change needed).
- Web verified end-to-end against API (login via BFF cookie, refresh rotation, route guard, admin/principal/teacher menus, real data on dashboard, schools, branches, users, roles, sessions, classes).
- Fixed in integration: BFF ignored empty API_URL; "All role/status" filter labels.
- Android follow-ups: branded launcher icon + splash (still default Android icon), debug cold start ~5–7 s, forgot/reset password screens, FCM device registration, pull-to-refresh on organisation screens.
- Not yet: S3 storage driver, image re-encode/EXIF strip, AV scan, audit partitioning, forgot/reset password web screens, FCM device registration on web.

## Carry-over notes (from Phase 0)
- API: no migrations yet (needs PostgreSQL); raw-SQL items pending — one ACTIVE session per branch, audit partitioning, append-only triggers.
- API: align DEFAULT_ROLE_PERMISSIONS with security.md §2.1 (Phase 1 RBAC).
- Web: refresh-cookie BFF route, /me reload on role switch, logout call, CSP, inactivity logout (Phase 1 auth).
- Android: custom (non-system) roles in menuFor, /me refresh on app start, FLAG_SECURE screens, cert pinning, OutboxProcessor/TokenAuthenticator tests, release API_BASE_URL (Gradle prop `schoolapp.apiBaseUrl.release`).
