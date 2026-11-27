#!/usr/bin/env bash
# Deploys prebuilt images (built by .github/workflows/deploy.yml) on the server. Nothing is built here.
#   infra/scripts/deploy-images.sh <tag>        # e.g. the commit SHA the workflow pushed
#   infra/scripts/deploy-images.sh --rollback   # go back to the tag that ran before the last deploy
# Needs in infra/.env: API_IMAGE, WEB_IMAGE (registry paths). Writes IMAGE_TAG into .env so a plain
# `docker compose up -d` after a reboot or by hand keeps running the deployed version.
# Steps: pre-update dump (if the database is up) -> pull -> api (runs migrations) -> healthy? -> web -> caddy.
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DUMP_DIR="${PRE_UPDATE_DUMP_DIR:-$INFRA_DIR/../backups/pre-update}"
KEEP_DUMPS=5
WAIT_SECONDS=300

cd "$INFRA_DIR"
[ -f .env ] || { echo "Missing infra/.env" >&2; exit 1; }
dc() { docker compose -f docker-compose.prod.yml "$@"; }

env_value() {
  local line
  line="$(grep -E "^$1=" .env | tail -n 1 || true)"
  line="${line#*=}"; line="${line%\"}"; line="${line#\"}"
  printf '%s' "${line:-$2}"
}
set_env() {
  if grep -qE "^$1=" .env; then sed -i "s|^$1=.*|$1=$2|" .env; else printf '%s=%s\n' "$1" "$2" >> .env; fi
}

[ -n "$(env_value API_IMAGE '')" ] && [ -n "$(env_value WEB_IMAGE '')" ] \
  || { echo "Set API_IMAGE and WEB_IMAGE in infra/.env" >&2; exit 1; }

CURRENT="$(env_value IMAGE_TAG latest)"
case "${1:-}" in
  "") echo "Usage: $0 <tag> | --rollback" >&2; exit 1 ;;
  --rollback)
    NEW="$(env_value PREVIOUS_IMAGE_TAG '')"
    [ -n "$NEW" ] || { echo "No PREVIOUS_IMAGE_TAG in .env" >&2; exit 1; } ;;
  *) NEW="$1" ;;
esac
echo "== Deploy $CURRENT -> $NEW"

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

echo "== 1/5 Pre-update database dump"
if [ "$(health postgres)" = "healthy" ]; then
  install -d -m 700 "$DUMP_DIR"
  STAMP="$(date +%Y%m%d-%H%M%S)"
  dc exec -T postgres pg_dump -U "$(env_value POSTGRES_SUPERUSER postgres)" -d "$(env_value POSTGRES_DB eschool)" -Fc \
    > "$DUMP_DIR/pre-update-$STAMP.dump"
  chmod 600 "$DUMP_DIR/pre-update-$STAMP.dump"
  ls -1t "$DUMP_DIR"/pre-update-*.dump | tail -n +$((KEEP_DUMPS + 1)) | xargs -r rm -f
  echo "  saved $DUMP_DIR/pre-update-$STAMP.dump"
else
  echo "  database not running yet (first deploy): skipped"
fi

echo "== 2/5 Pull images"
export IMAGE_TAG="$NEW"
dc pull --quiet

echo "== 3/5 Start database, cache, antivirus"
dc up -d --no-build postgres redis clamav

echo "== 4/5 API (applies migrations on start), then web"
ok=1
dc up -d --no-build --no-deps api
wait_healthy api || ok=0
if [ "$ok" = 1 ]; then
  dc up -d --no-build --no-deps web
  wait_healthy web || ok=0
fi
dc up -d --no-build caddy >/dev/null

if [ "$ok" = 0 ]; then
  echo "== FAILED. Logs: docker compose -f docker-compose.prod.yml logs --tail=200 api web" >&2
  echo "   .env still says IMAGE_TAG=$CURRENT. Roll back with: $0 $CURRENT" >&2
  echo "   If a migration already ran, restore the pre-update dump (scripts/restore-drill.md, 'Full restore')." >&2
  exit 1
fi

echo "== 5/5 Record version, clean up old images"
if [ "$NEW" != "$CURRENT" ]; then
  set_env PREVIOUS_IMAGE_TAG "$CURRENT"
  set_env IMAGE_TAG "$NEW"
fi
# Keep only the live and the previous version of our images (disk space on a small server).
for image in "$(env_value API_IMAGE '')" "$(env_value WEB_IMAGE '')"; do
  docker images "$image" --format '{{.Tag}}' | grep -vxF -e "$NEW" -e "$CURRENT" -e latest \
    | xargs -r -I{} docker rmi "$image:{}" >/dev/null 2>&1 || true
done
docker image prune -f >/dev/null
echo "Live: $NEW"
dc ps
