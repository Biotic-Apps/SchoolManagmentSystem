# syntax=docker/dockerfile:1
# eSchool web image (Next.js standalone). Build context: SchoolWeb/
#   docker build -t eschool-web --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 SchoolWeb
# NEXT_PUBLIC_* values are compiled into the browser bundle and the CSP: changing them needs a rebuild.

ARG NODE_IMAGE=node:24-bookworm-slim

# ---------- deps ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- build ----------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES=30
ARG NEXT_PUBLIC_ASSET_ORIGINS=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES=${NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES} \
    NEXT_PUBLIC_ASSET_ORIGINS=${NEXT_PUBLIC_ASSET_ORIGINS} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public/ may be empty (and then absent in a git checkout); the runtime stage copies it.
RUN mkdir -p public
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "Build arg NEXT_PUBLIC_API_URL is required" >&2 && exit 1)
RUN npm run build

# ---------- runtime ----------
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Next writes its cache (.next/cache) at runtime.
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["node", "server.js"]
