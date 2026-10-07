#!/usr/bin/env bash
# Updates the production stack to the latest code on the current git branch.
#   sudo /opt/eschool/infra/scripts/update.sh            # pull + build + migrate + restart + health check
#   sudo /opt/eschool/infra/scripts/update.sh --no-pull  # rebuild what is checked out (e.g. after `git checkout <tag>`)
# Steps: pre-update database dump -> git pull -> keep current images as :previous -> build -> restart api/web
# (the api container runs `prisma migrate deploy` on start) -> wait for healthy -> print the result / rollback hint.
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$INFRA_DIR/.." && pwd)"
DUMP_DIR="${PRE_UPDATE_DUMP_DIR:-/var/backups/eschool}"
KEEP_DUMPS=5
WAIT_SECONDS=300
PULL=1
[ "${1:-}" = "--no-pull" ] && PULL=0

cd "$INFRA_DIR"
[ -f .env ] || { echo "Missing infra/.env" >&2; exit 1; }
dc() { docker compose -f docker-compose.prod.yml "$@"; }

env_value() {
  local line
  line="$(grep -E "^$1=" .env | tail -n 1 || true)"
  line="${line#*=}"; line="${line%\"}"; line="${line#\"}"
  printf '%s' "${line:-$2}"
}
TAG="$(env_value IMAGE_TAG latest)"
PG_SUPER="$(env_value POSTGRES_SUPERUSER postgres)"
PG_DB="$(env_value POSTGRES_DB eschool)"

health() { docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$(dc ps -q "$1")" 2>/dev/null || echo missing; }

wait_healthy() {
  local service="$1" waited=0 status
  while [ "$waited" -lt "$WAIT_SECONDS" ]; do
    status="$(health "$service")"
    [ "$status" = "healthy" ] && { echo "  $service: healthy"; return 0; }
    sleep 5; waited=$((waited + 5))
  done
  echo "  $service: $(health "$service") after ${WAIT_SECONDS}s" >&2
  return 1
}

echo "== 1/6 Pre-update database dump -> $DUMP_DIR"
install -d -m 700 "$DUMP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
dc exec -T postgres pg_dump -U "$PG_SUPER" -d "$PG_DB" -Fc > "$DUMP_DIR/pre-update-$STAMP.dump"
chmod 600 "$DUMP_DIR/pre-update-$STAMP.dump"
ls -1t "$DUMP_DIR"/pre-update-*.dump | tail -n +$((KEEP_DUMPS + 1)) | xargs -r rm -f
echo "  saved pre-update-$STAMP.dump"

PREV_COMMIT="$(git -C "$REPO_DIR" rev-parse --short HEAD)"
if [ "$PULL" = 1 ]; then
  echo "== 2/6 git pull"
  git -C "$REPO_DIR" pull --ff-only
else
  echo "== 2/6 git pull skipped"
fi
NEW_COMMIT="$(git -C "$REPO_DIR" rev-parse --short HEAD)"
echo "  $PREV_COMMIT -> $NEW_COMMIT"

echo "== 3/6 Keep current images as :previous"
for image in eschool-api eschool-web; do
  if docker image inspect "$image:$TAG" >/dev/null 2>&1; then
    docker tag "$image:$TAG" "$image:previous"
  fi
done

echo "== 4/6 Build"
dc build api web

echo "== 5/6 Restart (api applies migrations first)"
dc up -d --no-deps api
wait_healthy api || {
  echo "API did not become healthy. Logs:  docker compose -f docker-compose.prod.yml logs --tail=200 api" >&2
  ROLLBACK=1
}
if [ "${ROLLBACK:-0}" = 0 ]; then
  dc up -d --no-deps web
  wait_healthy web || ROLLBACK=1
fi
dc up -d caddy >/dev/null

if [ "${ROLLBACK:-0}" = 1 ]; then
  cat >&2 <<EOF

== UPDATE FAILED ($PREV_COMMIT -> $NEW_COMMIT). Rollback:
  cd $INFRA_DIR
  docker tag eschool-api:previous eschool-api:$TAG && docker tag eschool-web:previous eschool-web:$TAG
  docker compose -f docker-compose.prod.yml up -d --no-build api web
  git -C $REPO_DIR checkout $PREV_COMMIT     # keep the code in step with the running images
If a migration had already run, the old API may not match the new schema: restore the pre-update dump
($DUMP_DIR/pre-update-$STAMP.dump) as described in infra/scripts/restore-drill.md ("Full restore").
EOF
  exit 1
fi

echo "== 6/6 Done: $NEW_COMMIT is live"
dc ps
