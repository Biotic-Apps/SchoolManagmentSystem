# eSchool: everything required

A single checklist of what you need to develop, build, test, and host eSchool. Each section links to the detailed
guide. **This repository is public: never put a real secret, password, private key, or server login in any file.**

| Topic | Detailed guide |
|---|---|
| Local setup, Render deployment, CI | [../README.md](../README.md) |
| Self-hosted production stack (Docker, Caddy, backups) | [deployment.md](deployment.md) |
| Android app | [../SchoolApp/README.md](../SchoolApp/README.md) |
| API | [../SchoolApi/README.md](../SchoolApi/README.md) |
| Web panel | [../SchoolWeb/README.md](../SchoolWeb/README.md) |
| Security model | [security.md](security.md) |
| Module status | [PROGRESS.md](PROGRESS.md) |

---

## 1. Software on a developer machine

| Tool | Version | Needed for |
|---|---|---|
| Git | any recent | everything |
| Node.js | 24+ (LTS) | API (`SchoolApi`) and web panel (`SchoolWeb`) |
| PostgreSQL | 16 | API database (or run it with Docker) |
| Redis | 7+ (Memurai on Windows) | jobs, cache, rate limits (or run it with Docker) |
| Docker + Compose plugin | Docker Engine 26+ / Docker Desktop | local services, production images (optional for dev) |
| JDK | 17 | Android build |
| Android Studio / Android SDK | compile and target SDK 37, min SDK 24 | Android app |
| Gradle | 9.6 (the wrapper `gradlew` downloads it) | Android build |
| OpenSSL | any | generating secrets (`openssl rand -hex 32`) |
| OCI CLI | optional | creating the Oracle server from your PC (Cloud Shell works without it) |

Main framework versions: NestJS + Prisma (API), Next.js (web), Kotlin 2.2 + Jetpack Compose with AGP 9.4 (Android).

## 2. Accounts and services

| Service | Cost | Used for |
|---|---|---|
| GitHub (repository `Biotic-Apps/SchoolManagmentSystem`) | free (public repo) | code, CI, deploy workflow, native ARM runners |
| GitHub Container Registry (GHCR) | free (public repo) | API and web Docker images (`ghcr.io/<owner>/eschool-api`, `eschool-web`) |
| Oracle Cloud, Always Free tier | free | the server: Ampere A1 ARM VM, 2 OCPU / 12 GB, Ubuntu 24.04 |
| DuckDNS (or any DNS provider) | free | domain names for the web panel and API |
| Let's Encrypt (through Caddy) | free | HTTPS certificates, issued automatically |
| SMTP provider | optional | real email (staging uses `EMAIL_DRIVER=log`) |
| SMS provider (Twilio or HTTP gateway) | optional | real SMS (staging uses `SMS_DRIVER=log`) |
| Off-site storage (rclone remote) | optional | copies of encrypted backups (`OFFSITE_REMOTE`) |
| Render | paid plans | alternative hosting through [render.yaml](../render.yaml) |

Stay on the Always Free shapes. Anything else on Oracle (bigger VM, block volumes over the free limit, upgrading to
Pay-As-You-Go resources) can start charging.

## 3. Configuration files (never committed)

Every `.env` is git-ignored. Copy the template next to it and fill it in.

| Template | Copy to | Where it lives |
|---|---|---|
| `SchoolApi/.env.example` | `SchoolApi/.env` | developer machine |
| `SchoolWeb/.env.example` | `SchoolWeb/.env` | developer machine |
| `infra/.env.production.example` | `infra/.env` | **only on the server** (`chmod 600`) |

Variables in `infra/.env` (the template explains each and how to generate it):

- **Domains:** `APP_DOMAIN`, `API_DOMAIN`, `ACME_EMAIL`
- **Database:** `POSTGRES_DB`, `POSTGRES_SUPERUSER`, `POSTGRES_SUPERUSER_PASSWORD`, `APP_DB_USER`, `APP_DB_PASSWORD`
- **Redis:** `REDIS_PASSWORD`
- **Auth secrets:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `REFRESH_TTL_DAYS`, `FILE_URL_SECRET`, `TOTP_ISSUER`
- **Backups:** `BACKUP_ENCRYPTION_KEY`, `BACKUP_RETENTION_DAILY`, `BACKUP_RETENTION_MONTHLY`, `OFFSITE_REMOTE`
- **Email:** `EMAIL_DRIVER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`
- **SMS:** `SMS_DRIVER`, `SMS_HTTP_URL`, `SMS_HTTP_METHOD`, `SMS_HTTP_HEADERS`
- **Behaviour:** `APP_TIMEZONE`, `DEFAULT_PHONE_COUNTRY`, `THROTTLE_LIMIT`, `AUTH_THROTTLE_LIMIT`, `STORAGE_DRIVER`, `WEB_IDLE_TIMEOUT_MINUTES`

Keep a copy of every secret in a password manager. **`BACKUP_ENCRYPTION_KEY` is the most important:** without it
no backup can be restored. The API refuses to start in production with placeholder secrets, so `docker compose logs api`
tells you which value is wrong.

## 4. GitHub repository settings

Settings → Secrets and variables → Actions. The **Deploy** workflow ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)) reads:

| Kind | Name | Value |
|---|---|---|
| Secret | `SSH_HOST` | server public IP or hostname |
| Secret | `SSH_USER` | login user (`ubuntu` on Oracle Ubuntu images) |
| Secret | `SSH_KEY` | private key of the deploy key pair (its `.pub` is in the server's `authorized_keys`) |
| Secret | `SSH_KNOWN_HOSTS` | output of `ssh-keyscan <host>`, taken once from a trusted machine |
| Variable | `API_DOMAIN` | e.g. `api.futurelearning.duckdns.org` (compiled into the web bundle) |
| Variable | `APP_DOMAIN` | e.g. `futurelearning.duckdns.org` |
| Variable | `WEB_IDLE_TIMEOUT_MINUTES` | optional, default 30 |
| Variable | `WEB_ASSET_ORIGINS` | optional |

`GITHUB_TOKEN` is provided automatically. The workflow needs `packages: write` (already set in the file).

## 5. Server setup (one time)

1. **Create the VM.** Run [infra/scripts/oci-create-server.sh](../infra/scripts/oci-create-server.sh) in OCI Cloud Shell
   with your SSH public key. It makes the network, opens ports 22/80/443, launches the Ampere A1 VM, and prints the IP.
   If Oracle says "Out of host capacity", run it again later; it reuses what it already created.
2. **DNS.** Point `APP_DOMAIN` and `API_DOMAIN` at the server's public IP **before** the first start, so Caddy can get certificates.
3. **Prepare Ubuntu.** Run [infra/scripts/server-bootstrap.sh](../infra/scripts/server-bootstrap.sh) on the server
   (updates, swap, Docker, host firewall rules for Oracle images).
4. **Copy the app.** Put the repository's `infra/` folder in `/opt/eschool/infra` and create `infra/.env` there from the template.
5. **Add the GitHub secrets and variables** from section 4.
6. **Deploy.** GitHub → Actions → **Deploy** → Run workflow (choose a branch, tag, or commit).
7. **Create the first admin** once, inside the API container, with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` set
   and `npm run db:seed` (see [deployment.md](deployment.md)).

## 6. How a deploy works

1. GitHub Actions builds the API and web images on a native `arm64` runner (the server is too small to build them).
2. It pushes them to GHCR, tagged with the short commit hash.
3. It connects to the server over SSH and runs [infra/scripts/deploy-images.sh](../infra/scripts/deploy-images.sh):
   database dump, pull images, start the API (runs Prisma migrations), wait until it is healthy, then start the web panel.
4. To go back to the previous version, run `deploy-images.sh --rollback` on the server.

Images must be multi-arch or `arm64`. For example, ClamAV uses `clamav/clamav-debian` because `clamav/clamav` has no `arm64` build.

## 7. Android app

- Build: `gradlew.bat assembleDebug testDebugUnitTest` (Windows) or `./gradlew assembleDebug testDebugUnitTest`.
- API address per build type, set in your **user** Gradle properties (`%USERPROFILE%\.gradle\gradle.properties`), not in the repo:
  - `schoolapp.apiBaseUrl.debug` (default `http://10.0.2.2:3000/api/v1/`, the emulator's view of your PC)
  - `schoolapp.apiBaseUrl.release` (set it to `https://<API_DOMAIN>/api/v1/`)
- A real phone needs your PC's LAN IP, the same Wi-Fi network, and TCP 3000 allowed in Windows Firewall.
- Release builds need your own signing keystore, kept outside the repository.

## 8. Checks before you push

| Part | Command |
|---|---|
| API | `cd SchoolApi && npm run lint && npm test && npm run test:e2e` (e2e needs PostgreSQL) |
| Web | `cd SchoolWeb && npm run lint && npm run build` |
| Android | `cd SchoolApp && ./gradlew assembleDebug testDebugUnitTest` |

CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) runs the same checks on every push and pull request to `main`.

## 9. Never commit

- `.env` files, real passwords, API keys, JWT or backup keys
- SSH private keys, `SSH_KNOWN_HOSTS` contents, Android keystores
- `local.properties`, a personal IP in `SchoolApp/gradle.properties`
- Database dumps or backups
