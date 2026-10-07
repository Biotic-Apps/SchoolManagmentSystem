# syntax=docker/dockerfile:1
# eSchool API image. Build context: SchoolApi/
#   docker build -t eschool-api SchoolApi
# Debian slim (glibc) so argon2 / sharp prebuilt binaries and the Prisma schema engine work as-is.

ARG NODE_IMAGE=node:24-bookworm-slim

# ---------- build: install all deps, generate Prisma client, compile ----------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1
# openssl: Prisma picks its engine build from it; python/make/g++: fallback if a native module has no prebuild.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# postinstall runs `prisma generate` (schema + prisma.config.ts are already here).
RUN npm ci --no-audit --no-fund

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM ${NODE_IMAGE} AS runtime
# PostgreSQL 16 client (pg_dump / pg_restore must match the server major version) from the PGDG repo.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl openssl tzdata \
 && install -d /usr/share/postgresql-common/pgdg \
 && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
 && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client-16 \
 && apt-get purge -y curl \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3000 \
    STORAGE_LOCAL_DIR=/app/storage \
    PG_DUMP_PATH=/usr/lib/postgresql/16/bin/pg_dump \
    PG_RESTORE_PATH=/usr/lib/postgresql/16/bin/pg_restore \
    CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1
WORKDIR /app

# Full node_modules on purpose: the prisma CLI (`migrate deploy`) and tsx (`npm run db:seed`) are devDependencies.
# Files stay root-owned (read-only for the app); only /app/storage is writable.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/package.json /app/package-lock.json /app/prisma.config.ts /app/tsconfig.json ./
COPY --from=build /app/prisma ./prisma
RUN mkdir -p /app/storage && chown node:node /app/storage

USER node
EXPOSE 3000
VOLUME ["/app/storage"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# docker-compose.prod.yml runs `prisma migrate deploy` before this.
CMD ["node", "dist/main.js"]
