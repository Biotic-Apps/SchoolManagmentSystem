# Phase 6 contract — pilot & rollout

Same conventions as the phase 1–5 contracts (envelope `{ data }` / `{ error: { code, message, details? } }`, `/api/v1` prefix, money in minor units, school time in APP_TIMEZONE). Each implementing side appends its own **Deviations** section below.

Goal: the system can run a real pilot branch — messages actually reach people, parents can sign in with their phone, and the stack can be deployed, updated, backed up and supported by a small team.

## A. Real delivery channels (API)
Today `EmailChannel` / `SmsChannel` only log. Make them real, provider-neutral, behind env switches. Development defaults stay "log".

| Env | Values | Notes |
|---|---|---|
| `EMAIL_DRIVER` | `log` (default) / `smtp` | `smtp` uses `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_SECURE` (false = STARTTLS), `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` ("eSchool <no-reply@…>"). School `notifications.email.fromName` overrides the display name. |
| `SMS_DRIVER` | `log` (default) / `twilio` / `http` | `twilio`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`. `http` (any local gateway): `SMS_HTTP_URL`, `SMS_HTTP_METHOD` (POST), `SMS_HTTP_HEADERS` (JSON), `SMS_HTTP_BODY` template with `{{to}}`, `{{message}}`, `{{senderId}}`; success = 2xx. |
| `FCM_SERVICE_ACCOUNT_JSON` | unchanged | Verify the real FCM path works when set; unset = log. |

- In production, `EMAIL_DRIVER=log` and `SMS_DRIVER=log` are refused at startup unless `ALLOW_LOG_CHANNELS=true` (explicit opt-out for a staging box).
- Send failures are thrown so the existing delivery retry / FAILED status / Support "Failed notifications" screens keep working. Provider errors are stored truncated (≤ 300 chars) with secrets and full phone numbers removed.
- Phone numbers are normalised to E.164 (default country `+92`, env `DEFAULT_PHONE_COUNTRY`).
- `POST /support/test-message { channel: EMAIL|SMS, to }` (SUPER_ADMIN + `settings.edit`, auth throttle) sends one test message synchronously and returns `{ ok, error? }`. Audited `support.test_message`. Web: a "Send test message" card on the Support tab.

## B. Parent email + one-time code sign-in (security.md §1)
- `POST /auth/otp/request { email }` — public, `@AuthThrottle`. Always `200 { data: { ok: true, resendAfterSeconds: 60 } }` (no enumeration). Sends an email only when the address (trimmed, lower-cased, matched case-insensitively) belongs to exactly one ACTIVE user holding an active PARENT assignment, and that user has no 2FA requirement problem. A new request within 60 s of the previous one for the same email is silently ignored. A new request invalidates older unused codes.
  - *Changed (2026-10-08)*: this endpoint took `{ phone }` and sent an SMS; the phone flow is removed.
- Code: 6 digits, expires in 5 minutes, at most 5 verify attempts per code, stored as HMAC-SHA256 (never logged in production; in development the code is logged like the reset token).
- `POST /auth/otp/verify { email, code, platform: WEB|ANDROID, deviceName? }` — public, `@AuthThrottle`. Success returns exactly the same `LoginResult` as `POST /auth/login` (tokens, or `{ twoFactorRequired, challengeId }` if the parent has 2FA on). Wrong / expired / used / unknown → `401 INVALID_CREDENTIALS` "Invalid or expired code"; wrong codes count toward the shared account lockout; locked → `423 ACCOUNT_LOCKED`. Audited `auth.login` with `method: 'otp'`.
- Table `login_otps (id, user_id, email, code_hash, expires_at, attempts, used_at, created_at)`: created by migration `phase6_pilot` with a `phone` column; migration `email_login_otp` retires all unused phone codes (`used_at` set), renames `phone` → `email` and replaces the `(phone, created_at)` index with `(email, created_at)`.
- Web: login page gets "Sign in with phone code" (parents) → phone → code → same post-login flow (incl. 2FA step). BFF route mirrors `/api/auth/login` cookie handling.
- Android: login screen gets the same option; same post-login flow.

## C. Deploy kit (infra/, no app logic)
- `SchoolApi/Dockerfile`, `SchoolWeb/Dockerfile` (multi-stage, non-root, Node 24 LTS alpine/slim; web uses Next standalone output), `.dockerignore` for both.
- `infra/docker-compose.prod.yml`: postgres 16, redis 7, clamav, api (runs `prisma migrate deploy` then starts), web, caddy (automatic HTTPS for `APP_DOMAIN` and `API_DOMAIN`, security headers, gzip). Optional minio profile. Named volumes; healthchecks; restart policies; only caddy exposes ports.
- `infra/.env.production.example` with every variable, grouped and commented; secrets generation commands.
- `infra/scripts/`: `backup-offsite.sh` (copy encrypted backups to a second location, e.g. rclone/S3), `restore-drill.md` steps, `update.sh` (pull, build, migrate, restart, health check, rollback hint).
- `.github/workflows/ci.yml`: jobs for API (postgres service; build, lint, unit, e2e), web (tsc, lint, build), Android (JDK 17; assembleDebug, testDebugUnitTest). Cache npm/Gradle. Runs on push + PR to main.
- Production bootstrap: `NODE_ENV=production npm run db:seed` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` creates catalogue, roles and the first super admin only (no demo data) and forces a password change on first login — verify, fix if needed.

## D. Docs
- `docs/deployment.md`: server sizing, DNS, first deploy, secrets, TLS, backups (nightly + off-site + monthly restore drill), monitoring (`/health`, Support → health, uptime check), log retention, updates and rollback, incident checklist.
- `docs/pilot.md`: pilot plan — onboarding runbook (school, branch, session, classes, staff, students/guardians via Data import, fee plans, opening balances), training per role, UAT checklist per role (from docs/navigation.md menus), go-live checklist, first-week support routine, feedback log, exit criteria.

## E. Android extras
- Optional app lock for staff roles (security.md §8): biometric with device-credential fallback; setting in Profile; lock after the app is in background > 5 min; parents unaffected unless they opt in. Never blocks sign-out.
- Merge the separate staff-attendance Hilt modules into the main network / repository modules.

## Deviations (as implemented in SchoolApi / SchoolWeb)
Paths and documented fields of §A and §B are unchanged. Additions and clarifications:
- **Migration** `phase6_pilot`: only the new table `login_otps` (columns as listed; indexes on `(phone, created_at)`, now `(email, created_at)` — see `email_login_otp`, `user_id`, `expires_at`; FK to `users` RESTRICT). The older `otp_codes` table (child-link OTPs) is untouched.
- **Env (§A)**:
  - Extra: `SMS_HTTP_METHOD` also accepts `PUT` and `GET` (GET sends no body). `SMS_HTTP_URL` may contain the placeholders too (URL-encoded). Body placeholders are escaped for the Content-Type in `SMS_HTTP_HEADERS` (JSON-escaped for `*json*`, URL-encoded for form bodies, raw otherwise). Unset `SMS_HTTP_BODY` = JSON `{"to","message","senderId"}` with `Content-Type: application/json`.
  - Required per driver (startup fails otherwise, in every environment): smtp → `SMTP_HOST`, `EMAIL_FROM`; twilio → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`; http → `SMS_HTTP_URL`. `SMS_HTTP_HEADERS` must be a JSON object of strings. `DEFAULT_PHONE_COUNTRY` must look like `+92`.
  - `SMTP_SECURE=false` requires STARTTLS (`requireTLS`), it never falls back to plain text.
  - With `ALLOW_LOG_CHANNELS=true` in production the log driver logs `channel + user id + title` only (no address, no body). In development it still logs the full message (incl. codes), like the reset token.
- **Delivery (§A)**:
  - Twilio always sends from `TWILIO_FROM`; the school `senderId` is only passed to the `http` driver (`{{senderId}}`, empty when unset).
  - SMS text = `title: body` (SMS has no subject). Email is plain text, subject = title.
  - School branding of a message comes from the first school of the recipient's active assignments; GLOBAL users, test messages without a school and unknown recipients use the oldest ACTIVE school.
  - Error sanitising: configured secrets (SMTP user/password, Twilio token, http headers/query parameters whose name contains auth/key/token/secret/pass/sign), `Bearer`/`Basic` values and digit runs that look like phone numbers (masked `+92*******233`) are removed; whitespace collapsed; 300 characters.
  - An invalid recipient phone (cannot be normalised) fails the delivery with "Phone number is not valid".
- **Test message (§A)**: `POST /support/test-message` needs `settings.edit` + the SUPER_ADMIN active role (403 otherwise), `@AuthThrottle`. 400 VALIDATION_FAILED for an invalid email / phone or a channel other than EMAIL|SMS. Response `{ ok: true }` or `{ ok: false, error }` (sanitised). Audit `support.test_message` (entityType `NotificationChannel`, entityId = channel) stores `{ channel, to (masked), driver, ok }`. Web: the card is shown on the Support tab to super admins with edit rights.
- **OTP request (§B)**:
  - "2FA requirement problem" = the user's school requires 2FA for their role (`twoFactorRequiredFor`) and they have not set it up: no code is sent (they would be stopped by `TWO_FACTOR_SETUP_REQUIRED` right after sign-in). Parents with 2FA on do get a code.
  - Email lookup: `users.email` equals the trimmed, lower-cased address (case-insensitive); exactly one ACTIVE match with an active PARENT assignment is required. The code is sent to the stored address.
  - The 60 s cooldown is per normalised email and counts only codes actually issued. Malformed addresses (DTO accepts 3–254 characters) also get the `200` answer.
  - Older unused codes are invalidated by setting their `used_at`.
  - Email (plain text, school "from name" as for other emails): subject `Your eSchool sign-in code`, body `Your eSchool sign-in code is: 123456` / `It is valid for 5 minutes. Enter it on the sign-in screen to continue.` / `If you didn't ask for this code, you can ignore this email. Never share this code with anyone.`
  - Delivery goes straight through the EMAIL channel (no queue hop) so it arrives right away; it is not awaited, so the answer and its timing do not depend on whether an email was sent. A failed send is logged (`LoginCodeMailer`, user id + sanitised reason, never the code). `EMAIL_DRIVER=log` prints the message (incl. the code) in development.
- **OTP verify (§B)**:
  - HMAC-SHA256 keyed by `JWT_REFRESH_SECRET` over `login-otp:<rowId>:<code>`, compared in constant time. Only the newest usable code of the email is checked. Spaces in the code are ignored; anything other than 6 digits is a wrong code. `code` accepts 1–12 characters at the DTO (longer → 400).
  - Order: no usable code → 401; locked → 423 (before an attempt is spent); attempt reserved; wrong code → shared lockout counter (401, or 423 on the 5th failure); disabled account → 403 ACCOUNT_DISABLED; PARENT role gone since the request → 401.
  - With 2FA on, the answer is the challenge; the OTP step is audited as `auth.otp_verified { platform, twoFactorRequired: true }` and `auth.login` is written by `/auth/2fa/verify` (as for password logins). Without 2FA: `auth.login { platform, deviceName, method: 'otp' }`.
- **Web (§B)**: the login card has a "Sign in with email code" button → email address → code step (resend countdown from `resendAfterSeconds`, "Change email") → same post-login flow incl. the 2FA step. `POST /auth/otp/request` is called directly; verify goes through the BFF `POST /api/auth/otp/verify` (same-origin check, `platform: WEB`, device name, refresh token → httpOnly cookie, 2FA challenge passed through).
- **Seed**: `parent@eschool.local` (demo email-code sign-in) also has phone `+923001112233`. Three school-wide calendar events are (re)placed relative to the seed date: "School holiday" (+18 days, HOLIDAY), "Mid-term exam week" (+35…+40, EVENT), "Parent-teacher day" (+55, EVENT).
