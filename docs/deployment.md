# eSchool — Deployment & operations

For the technical person running the pilot. The school team's side is in [pilot.md](pilot.md).

Stack on one Linux server, all in Docker (`infra/docker-compose.prod.yml`):

| Service | Image | Role |
|---|---|---|
| caddy | `caddy:2-alpine` | Only public entry (80/443). Automatic HTTPS for `APP_DOMAIN` (web) and `API_DOMAIN` (API + Android), gzip/zstd, default security headers, JSON access log |
| web | built from `SchoolWeb/Dockerfile` | Next.js standalone server (BFF for login cookies) |
| api | built from `SchoolApi/Dockerfile` | NestJS API + BullMQ workers + nightly jobs. Runs `prisma migrate deploy` on every start |
| postgres | `postgres:16-bookworm` | Database (volume `pgdata`) |
| redis | `redis:7-alpine` | Job queue, cache, rate limits (AOF on, password, `noeviction`) |
| clamav | `clamav/clamav:stable` | Virus scan of every upload (clamd on 3310) |
| minio | `minio/minio` | Optional (`--profile minio`) S3 storage; not needed for the pilot |

Everything except Caddy is on the private network `eschool` (`DOCKER_SUBNET`, default `172.30.0.0/24`), which the
API trusts for `X-Forwarded-For` (`TRUSTED_PROXIES`). Logs, rate limits and audit rows therefore see the real client IP.

## 1. Server

| | Pilot (1 branch, ≤ 1,000 students, ≤ 100 staff) | Notes |
|---|---|---|
| CPU / RAM | **4 vCPU / 8 GB** | ClamAV alone needs ~1.5–2.5 GB. Without ClamAV, 2 vCPU / 4 GB works. |
| Disk | 80 GB SSD (+ growth for photos/documents) | Backups (30 daily + 12 monthly) are stored on the same volume as uploads when `STORAGE_DRIVER=local`; they are also copied off-site. |
| OS | Ubuntu 24.04 LTS or Debian 12, x86-64 | Docker Engine 26+ with the compose plugin. |
| Location | A region close to the school (low latency) | Data-protection: check the school's policy on where children's data may be hosted. |

Hardening (once):
```bash
adduser --disabled-password deploy && usermod -aG docker deploy   # day-to-day user
ufw default deny incoming && ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443 && ufw enable
# SSH: keys only (PasswordAuthentication no), unattended-upgrades for security patches, disk encryption if the host offers it.
timedatectl set-timezone Asia/Karachi    # cron/off-site jobs read the host clock; the API uses TZ=APP_TIMEZONE itself
```
Docker's published ports bypass ufw; that is fine here because only Caddy publishes 80/443.

## 2. DNS
Two records pointing at the server's public IP (A, plus AAAA if it has IPv6), e.g.:

| Name | Use | `.env` |
|---|---|---|
| `portal.school.pk` | Web panel | `APP_DOMAIN` |
| `api.school.pk` | API (web browser calls + Android app) | `API_DOMAIN` |

Create them **before** the first start: Caddy requests Let's Encrypt certificates immediately (HTTP-01 on port 80).
Keep TTL low (300 s) during the pilot so a server move is quick.

## 3. Secrets
`infra/.env` (copied from `infra/.env.production.example`) holds everything; the file lists how to generate each
value. Rules:
- `chmod 600 infra/.env`, owned by root/deploy. Never commit it (git-ignored).
- Every secret also goes into the school's password manager, **especially `BACKUP_ENCRYPTION_KEY`** — without it
  no backup can be restored, and it must not live only on the server or in the backup bucket.
- Optional settings stay commented out; a blank value (`SMTP_USER=`) fails validation at startup.
- The API refuses to start in production with placeholder (`change-me…`) JWT/file secrets, `JOBS_DRIVER=inline`,
  `CACHE_DRIVER=memory`, a missing `BACKUP_ENCRYPTION_KEY`, or `EMAIL_DRIVER`/`SMS_DRIVER=log` (unless
  `ALLOW_LOG_CHANNELS=true`, staging only). `docker compose logs api` shows which variable is wrong.
- Rotation: `JWT_*` → everyone signs in again (and 2FA resets unless `TWO_FACTOR_ENCRYPTION_KEY` is set);
  `FILE_URL_SECRET` → open download links stop working; `BACKUP_ENCRYPTION_KEY` → **old backups need the old key**
  (keep it in the password manager with the date range it covers).

Providers to arrange before go-live (choices to confirm with the school):
- **Email**: any SMTP service (school's Google Workspace/Microsoft 365 SMTP relay, Brevo, Mailgun, SES…) with SPF/DKIM
  set for the sending domain.
- **SMS**: Twilio, or a local Pakistani gateway through the generic `http` driver (`SMS_HTTP_*`). Parent phone sign-in
  depends on SMS. Register the sender ID with the provider.
- **Push** (optional): a Firebase project; service-account JSON in `infra/secrets/fcm.json`, mounted read-only
  (see the commented lines in the compose file) and `FCM_SERVICE_ACCOUNT_JSON=/run/secrets/fcm.json`.
- **Off-site backup target**: an S3-compatible bucket (Backblaze B2, Cloudflare R2, AWS S3, Wasabi) or Google Drive via rclone.

After the stack is up, test both channels from **Settings & Backups → Support → Send test message** (super admin).

## 4. First deploy
```bash
sudo mkdir -p /opt/eschool && sudo chown deploy: /opt/eschool
git clone https://github.com/Biotic-Apps/SchoolManagmentSystem.git /opt/eschool && cd /opt/eschool/infra
cp .env.production.example .env && chmod 600 .env && nano .env          # fill every value
docker compose -f docker-compose.prod.yml build                         # ~5–10 min the first time
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps                            # wait until api/web are "healthy"
docker compose -f docker-compose.prod.yml logs -f api                   # "All migrations have been successfully applied"
```
On the first start Postgres creates the app role `APP_DB_USER` (owner of the database, `CREATEDB` for the weekly
restore check, not a superuser) from `infra/postgres/init-app-user.sh`. That script runs only on an empty `pgdata`
volume: to change `APP_DB_PASSWORD` later, run `ALTER ROLE … PASSWORD …` as the superuser and update `.env`.
ClamAV downloads its signatures on first start (a few minutes); uploads fail with 503 until it is ready.

### Bootstrap the first super admin (once)
Production seeding creates only the permission catalogue, the system roles and one super admin — no demo data —
and that account must change its password at first sign-in:
```bash
docker compose -f docker-compose.prod.yml run --rm --no-deps \
  -e SEED_ADMIN_EMAIL='owner@school.pk' -e SEED_ADMIN_PASSWORD='<temporary strong password>' \
  api npm run db:seed
```
The password must pass the password policy (≥ 8 characters, not a common password). Re-running the seed is safe: it
adds new permissions from later releases and never resets an existing admin's password or customised role
permissions (`SEED_RESET_ROLE_PERMISSIONS=true` would restore the default permissions of system roles).
Then sign in at `https://APP_DOMAIN`, change the password, and enable 2FA (Profile & Security).

### Android app
Release builds read Gradle properties (SchoolApp/README.md → Release hardening):
`-Pschoolapp.apiBaseUrl.release=https://API_DOMAIN/api/v1/`, `-Pschoolapp.pin.host=API_DOMAIN` and
`-Pschoolapp.pin.sha256=sha256/…=,sha256/…=` (at least two pins). Caddy gets a **new key at every renewal**
(~every 60 days), so do not pin the leaf certificate: pin the Let's Encrypt roots (ISRG Root X1 and ISRG Root X2
SPKI hashes), which OkHttp matches anywhere in the chain. Distribute the signed build through Play Console internal
testing (or a direct APK link) during the pilot.

## 5. TLS
Caddy obtains and renews certificates automatically (stored in volume `caddydata` — keep it, or Let's Encrypt rate
limits may bite on rebuilds). HTTP is redirected to HTTPS. HSTS is sent by the web app (with `preload`) and by Caddy
as a default for the API. Check: `curl -I https://API_DOMAIN/health` and an SSL Labs test (expect A/A+).
If certificates fail: DNS not pointing at the server, port 80 blocked, or `ACME_EMAIL` missing — see `docker compose logs caddy`.

## 6. Backups
| What | When | Where |
|---|---|---|
| Nightly database backup (`pg_dump -Fc`, AES-256-GCM with `BACKUP_ENCRYPTION_KEY`) + retention (30 daily, 12 monthly) | 02:00 school time (API job) | `backups/YYYY/MM/<id>.esbk` in file storage (volume `apistorage` or the S3 bucket) |
| Automatic restore check into `<db>_restore_check` (row counts, ledger totals, migrations) | Sunday 03:30 | Result in Settings & Backups → Backups; failure alerts the super admin |
| Off-site copy (`infra/scripts/backup-offsite.sh`, rclone) | 03:30 daily (host cron) | `OFFSITE_REMOTE`; uploads to `OFFSITE_FILES_REMOTE` (must be an rclone **crypt** remote) |
| Restore drill by a person | Monthly | [`infra/scripts/restore-drill.md`](../infra/scripts/restore-drill.md) |
| Pre-update dump | Every `update.sh` | `/var/backups/eschool/pre-update-*.dump` (last 5, root-only) |

Off-site setup:
```bash
docker run --rm -it -v ~/.config/rclone:/config/rclone rclone/rclone:1 config   # create the remote(s)
bash /opt/eschool/infra/scripts/backup-offsite.sh                              # first run by hand
crontab -e   # 30 3 * * * bash /opt/eschool/infra/scripts/backup-offsite.sh >> /var/log/eschool-offsite.log 2>&1
```
Give the off-site bucket a lifecycle rule (e.g. delete after 400 days) and, if the provider supports it, object lock /
versioning so a compromised server cannot delete the copies. Manual backup: Settings & Backups → Backups → "Run backup".

Uploaded files (photos, documents) are **not** in the database dump: with `STORAGE_DRIVER=local` they are only on the
`apistorage` volume until copied by `OFFSITE_FILES_REMOTE`. Set that up before go-live.

## 7. Monitoring
- **Uptime check** (UptimeRobot / Better Stack / Healthchecks.io free tier), every 5 min, alerts by email + SMS/WhatsApp to the technical person:
  - `https://API_DOMAIN/health` → `200 {"status":"ok","version":…}`
  - `https://APP_DOMAIN/login` → `200`
- **Settings & Backups → Support** (super admin): database / job queue / file storage status, last backup, last verified
  restore, version, failed jobs (retry) and failed notifications (resend). Look daily during the first two weeks, then weekly.
- **Off-site job**: alert if `/var/log/eschool-offsite.log` has no "off-site copy done" line for > 26 h
  (e.g. a Healthchecks.io ping appended to the cron line: `… && curl -fsS https://hc-ping.com/<uuid>`).
- **Server**: disk usage < 80 % (`df -h`, `docker system df`), memory, certificate expiry (the uptime tool can check it).
- Containers restart automatically (`restart: unless-stopped`); `docker compose ps` shows health.

## 8. Logs and retention
| Log | Retention |
|---|---|
| Container stdout (API, web, Caddy access log in JSON, Postgres, Redis, ClamAV) | json-file driver, 10 × 20 MB per container (rotated by Docker) |
| Audit trail (`audit_logs`, append-only, monthly partitions) | Kept in the database (and every backup) — this is the record of who did what |
| Job runs, notification deliveries | Database; visible in Support |

```bash
docker compose -f docker-compose.prod.yml logs --since 1h api
docker compose -f docker-compose.prod.yml logs caddy | grep '"status":5'
```
The API never logs passwords, tokens or OTP codes in production. If logs are shipped elsewhere (Loki, Better Stack),
keep them ≤ 90 days: they contain IPs and user ids.

## 9. Updates and rollback
```bash
cd /opt/eschool && bash infra/scripts/update.sh
```
`update.sh` = pre-update dump → `git pull --ff-only` → tag current images `:previous` → build → restart API (migrations
run) → wait for healthy → restart web → print the result. On failure it prints the exact rollback commands
(retag `:previous`, `up -d --no-build`, `git checkout <previous commit>`).

- Update outside school hours (after 17:00 or on weekends); tell the school beforehand.
- Migrations are forward-only. Rolling back images after a migration ran works only if the release notes say the
  migration is backward-compatible; otherwise restore the pre-update dump (restore-drill.md → Full restore).
- To deploy a specific version: `git checkout <tag>` then `bash infra/scripts/update.sh --no-pull`.
- Changing `WEB_IDLE_TIMEOUT_MINUTES`, `WEB_ASSET_ORIGINS` or a domain needs a web rebuild (`update.sh --no-pull`);
  other `.env` changes need only `docker compose -f docker-compose.prod.yml up -d`.
- Base images (Postgres/Redis/Caddy/ClamAV): `docker compose -f docker-compose.prod.yml pull && … up -d` monthly.
  Postgres stays on major version 16 (a major upgrade needs dump/restore).

CI (`.github/workflows/ci.yml`) must be green on `main` before updating the server.

## 10. Incident checklist
1. **Is it down?** `docker compose -f docker-compose.prod.yml ps` → which service is not healthy → `logs --tail=200 <service>`.
2. **Disk full?** `df -h`; prune old images `docker image prune -a` (keeps running ones); check `apistorage` growth.
3. **API restarting?** Usually a bad `.env` value (validation message in the log) or a failed migration (`prisma migrate deploy` output). Fix, then `up -d api`.
4. **Messages not arriving?** Support → Failed notifications (provider error is shown, secrets removed) → fix provider settings → "Send test message" → Resend.
5. **Backups failing?** Support / Backups shows the error; common causes: disk full, key missing, `pg_dump` error. Click "Run backup" after fixing.
6. **Suspected account compromise**: Users → disable the account (revokes all sessions immediately) → review Audit (filter by user) → reset password, re-enable, require 2FA.
7. **Suspected data exposure**: preserve logs (`docker compose logs > incident-<date>.log`), list affected records from Audit, inform the principal; the school notifies guardians per its policy.
8. **Server lost**: new server → §4 first deploy (same `.env` from the password manager) → restore-drill.md "Full restore" from the off-site copy → restore uploads → DNS to the new IP.
9. Afterwards: one-paragraph note in the pilot feedback log (what happened, impact, fix, follow-up).

## 11. CI
`.github/workflows/ci.yml` runs on every push and pull request to `main`:
- **api**: Postgres 16 service (database `eschool_test`, exposed through `E2E_DATABASE_URL` for `test/support/e2e-db.ts`), `npm ci` (Prisma generate), build, lint (fails if `eslint --fix` changes files), unit tests, e2e tests, `prisma validate`.
- **web**: `npm ci`, `next typegen` + `tsc --noEmit`, lint, build.
- **android**: JDK 17 (+ JDK 25 for the Gradle daemon toolchain), Gradle cache, `./gradlew assembleDebug testDebugUnitTest`; the debug APK is attached to runs on `main`.

## 12. Optional: object storage instead of the local volume
Set `STORAGE_DRIVER=s3` and `S3_*` (R2/B2/S3; bucket private, versioning on). Uploads and backups then go to the bucket,
the server disk holds only the database. Backup downloads use presigned bucket URLs, so `S3_ENDPOINT` must be reachable
from the super admin's browser — with the bundled MinIO (`--profile minio`) that means publishing it through Caddy on
its own domain; for the pilot prefer local storage or a hosted bucket. For off-site copies set `OFFSITE_SOURCE` to the
rclone path of the bucket.
