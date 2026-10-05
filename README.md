# eSchool Management System

Multi-school, multi-branch school management: one web panel and one Android app, with the UI driven by the logged-in account's role and scope.

| Folder | What |
|---|---|
| [docs/](docs/) | Architecture, backend flows, database, security, progress |
| [SchoolApi/](SchoolApi/) | NestJS + Prisma + PostgreSQL API |
| [SchoolWeb/](SchoolWeb/) | Next.js web panel |
| [SchoolApp/](SchoolApp/) | Android app (Kotlin, Jetpack Compose) |
| [infra/](infra/) | Local services (PostgreSQL, Redis, MinIO, Mailpit) |

## Local services
With Docker: `docker compose -f infra/docker-compose.yml up -d`.
Without Docker: install PostgreSQL 16 and Redis (Memurai on Windows) and set `DATABASE_URL` / `REDIS_URL` in `SchoolApi/.env`.

See [docs/PROGRESS.md](docs/PROGRESS.md) for what is built.
