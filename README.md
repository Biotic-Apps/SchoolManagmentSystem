# eSchool Management System

Multi-school, multi-branch school management: one web panel and one Android app, with the UI driven by the logged-in account's role and scope.

| Folder | What |
|---|---|
| [docs/](docs/) | Architecture, backend flows, database, security, progress |
| [SchoolApi/](SchoolApi/) | NestJS + Prisma + PostgreSQL API |
| [SchoolWeb/](SchoolWeb/) | Next.js web panel |
| [SchoolApp/](SchoolApp/) | Android app (Kotlin, Jetpack Compose) |
| [infra/](infra/) | Docker Compose stacks (local and production) |

See [docs/PROGRESS.md](docs/PROGRESS.md) for the current module status.

---

## Prerequisites

- **Node.js** 24+ (LTS recommended)
- **PostgreSQL** 16
- **Redis** 7+ (or [Memurai](https://www.memurai.com/) on Windows)
- **Docker** (optional but recommended for production builds and local services)
- **Git**

---

## Quick start (local development)

### 1. Clone the repository

```bash
git clone https://github.com/Biotic-Apps/SchoolManagmentSystem.git
cd SchoolManagmentSystem
```

### 2. Start local services

**With Docker** (recommended):

```bash
docker compose -f infra/docker-compose.yml up -d
```

**Without Docker**: install PostgreSQL 16 and Redis manually, then configure `DATABASE_URL` and `REDIS_URL` in each `.env` file.

### 3. Set up the API

```bash
cd SchoolApi
cp .env.example .env          # review and adjust values
npm install                    # runs prisma generate via postinstall
npx prisma migrate dev         # apply migrations and create the database
npm run db:seed                # seed demo data (SEED_DEMO=true in .env)
npm run start:dev              # http://localhost:3000
```

### 4. Set up the web panel

```bash
cd SchoolWeb
cp .env.example .env           # set NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
npm install
npm run dev                    # http://localhost:3001
```

Default demo credentials (when `SEED_DEMO=true`):
- **Email**: `admin@eschool.local`
- **Password**: `Demo@1234`

---

## Environment variables

All secrets and configuration are loaded from `.env` files that are **git-ignored**. The repository includes `.env.example` templates with documentation for every variable:

| File | Purpose |
|---|---|
| `SchoolApi/.env.example` | API: database, Redis, JWT secrets, email/SMS, storage, backups |
| `SchoolWeb/.env.example` | Web: API URL, session settings, CSP origins |
| `infra/.env.production.example` | Production compose stack: domains, all secrets in one file |

**Never commit `.env` files or real secrets.** The `.gitignore` blocks `.env` and `.env.*` (except `.env.example`).

---

## Building for production

### API

```bash
cd SchoolApi
npm ci --no-audit
npx prisma generate
npm run build                  # outputs to dist/
```

The production entry point is `node dist/main.js`. Before starting, run database migrations:

```bash
npx prisma migrate deploy
```

### Web panel

The web panel requires `NEXT_PUBLIC_API_URL` at build time (it is compiled into the browser bundle):

```bash
cd SchoolWeb
npm ci --no-audit
NEXT_PUBLIC_API_URL=https://your-api-domain.onrender.com/api/v1 npm run build
```

On Windows (PowerShell):

```powershell
cd SchoolWeb
npm ci --no-audit
$env:NEXT_PUBLIC_API_URL="https://your-api-domain.onrender.com/api/v1"; npm run build
```

The build produces a standalone server in `.next/standalone/` (configured via `output: "standalone"` in `next.config.ts`). Run it with:

```bash
node .next/standalone/server.js
```

### Docker images

```bash
# API
docker build -t eschool-api SchoolApi/

# Web (NEXT_PUBLIC_API_URL is required at build time)
docker build -t eschool-web \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api-domain.onrender.com/api/v1 \
  SchoolWeb/
```

---

## Deploying on Render

This repository includes a [`render.yaml`](render.yaml) Blueprint for Render deployment. The setup creates:

- **eschool-api** — Docker web service (NestJS API)
- **eschool-web** — Docker web service (Next.js standalone)
- **eschool-db** — Managed PostgreSQL 16 database

### Step-by-step

1. **Create a PostgreSQL database** on Render (Starter plan or higher). Note the **Internal Database URL**.

2. **Create a Redis instance** on Render. Note the **Internal Redis URL**.

3. **Deploy the API** as a new Web Service:
   - **Environment**: Docker
   - **Docker Build Context**: `SchoolApi`
   - **Dockerfile Path**: `SchoolApi/Dockerfile`
   - **Health Check Path**: `/health`
   - Set these environment variables:

     | Variable | Value |
     |---|---|
     | `NODE_ENV` | `production` |
     | `PORT` | `3000` |
     | `DATABASE_URL` | Internal Database URL from step 1 |
     | `REDIS_URL` | Internal Redis URL from step 2 |
     | `APP_URL` | `https://eschool-api.onrender.com` (your API service URL) |
     | `CORS_ORIGINS` | `https://eschool-web.onrender.com` (your Web service URL) |
     | `JOBS_DRIVER` | `bullmq` |
     | `CACHE_DRIVER` | `redis` |
     | `STORAGE_DRIVER` | `local` |
     | `JWT_ACCESS_SECRET` | Generate: `openssl rand -hex 32` |
     | `JWT_REFRESH_SECRET` | Generate: `openssl rand -hex 32` |
     | `FILE_URL_SECRET` | Generate: `openssl rand -hex 32` |
     | `BACKUP_ENCRYPTION_KEY` | Generate: `openssl rand -base64 32` |
     | `JWT_ACCESS_TTL` | `15m` |
     | `REFRESH_TTL_DAYS` | `30` |
     | `APP_TIMEZONE` | `Asia/Karachi` |
     | `DEFAULT_PHONE_COUNTRY` | `+92` |
     | `THROTTLE_LIMIT` | `300` |
     | `AUTH_THROTTLE_LIMIT` | `10` |
     | `TOTP_ISSUER` | `eSchool` |
     | `EMAIL_DRIVER` | `log` (or `smtp` with SMTP_* vars for real emails) |
     | `SMS_DRIVER` | `log` (or `twilio`/`http` with provider vars) |
     | `ALLOW_LOG_CHANNELS` | `true` (staging only; set `false` for production with real SMTP/SMS) |

   - **Start Command** (override Docker CMD):
     ```
     sh -c "./node_modules/.bin/prisma migrate deploy && exec node dist/main.js"
     ```

4. **Deploy the Web panel** as a new Web Service:
   - **Environment**: Docker
   - **Docker Build Context**: `SchoolWeb`
   - **Dockerfile Path**: `SchoolWeb/Dockerfile`
   - **Docker Build Args**: `NEXT_PUBLIC_API_URL=https://eschool-api.onrender.com/api/v1`
   - **Health Check Path**: `/login`
   - Set these environment variables:

     | Variable | Value |
     |---|---|
     | `NODE_ENV` | `production` |
     | `PORT` | `3000` |
     | `HOSTNAME` | `0.0.0.0` |
     | `API_URL` | Internal URL of the API service (e.g. `http://eschool-api:3000/api/v1` or the Render internal URL) |
     | `REFRESH_TTL_DAYS` | `30` |

5. **Seed the first admin** (run once via Render Shell on the API service):
   ```bash
   SEED_ADMIN_EMAIL='admin@yourschool.pk' SEED_ADMIN_PASSWORD='YourStrongPassword1!' npm run db:seed
   ```

6. **Verify**: visit `https://your-web-service.onrender.com/login` and sign in.

### Security notes for Render

- All secrets are set as **environment variables** in the Render dashboard — never in code or `render.yaml`.
- The PostgreSQL database is private (no public access by default on Render).
- `CORS_ORIGINS` restricts API access to only the web panel's domain.
- HTTPS is automatic on Render (all `.onrender.com` domains get TLS).
- The API refuses to start with placeholder secrets (`change-me...`) in production mode.

---

## CI / testing

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

- **API**: PostgreSQL 16 service, `npm ci`, build, lint, unit tests, e2e tests, `prisma validate`
- **Web**: `npm ci`, TypeScript check, lint, build
- **Android**: Gradle debug build + unit tests

Run locally:

```bash
# API
cd SchoolApi && npm test           # unit tests
cd SchoolApi && npm run test:e2e   # end-to-end (needs PostgreSQL)
cd SchoolApi && npm run lint       # ESLint

# Web
cd SchoolWeb && npm run lint       # ESLint
cd SchoolWeb && npm run build      # type check + build
```

---

## Project structure

```
SchoolManagmentSystem/
├── SchoolApi/           # NestJS REST API
│   ├── prisma/          #   Prisma schema + migrations
│   ├── src/             #   Application source
│   ├── test/            #   E2E tests
│   ├── Dockerfile       #   Production Docker image
│   └── .env.example     #   Environment template
├── SchoolWeb/           # Next.js web panel
│   ├── src/             #   App source (features/, components/, lib/)
│   ├── public/          #   Static assets
│   ├── Dockerfile       #   Production Docker image (standalone)
│   └── .env.example     #   Environment template
├── SchoolApp/           # Android app (Kotlin + Jetpack Compose)
├── infra/               # Infrastructure
│   ├── docker-compose.yml           # Local dev services
│   ├── docker-compose.prod.yml      # Full production stack
│   ├── .env.production.example      # Production env template
│   ├── caddy/                       # Reverse proxy config
│   ├── postgres/                    # DB init scripts
│   └── scripts/                     # Backup, restore, update scripts
├── docs/                # Architecture, flows, security, progress
├── render.yaml          # Render Blueprint deployment spec
└── .github/workflows/   # CI pipeline
```

---

## Self-hosted deployment

For a self-hosted (VPS / bare-metal) deployment using the full Docker Compose stack with Caddy, PostgreSQL, Redis, ClamAV, and automatic HTTPS, see [docs/deployment.md](docs/deployment.md).

---

## License

Private — all rights reserved.
