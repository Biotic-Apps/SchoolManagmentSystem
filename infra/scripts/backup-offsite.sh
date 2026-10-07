#!/usr/bin/env bash
# Copies the encrypted nightly backups (and optionally uploaded files) to a second location with rclone.
# Run from cron after the 02:00 backup, e.g. (server clock in school time):
#   30 3 * * *  /opt/eschool/infra/scripts/backup-offsite.sh >> /var/log/eschool-offsite.log 2>&1
#
# Needs: docker, an rclone.conf with the remotes named in infra/.env (OFFSITE_REMOTE, optional OFFSITE_FILES_REMOTE).
# Uses `rclone copy` (never deletes off-site); expire old copies with a bucket lifecycle rule (e.g. 400 days).
# With STORAGE_DRIVER=s3 the backups already live in the bucket: set OFFSITE_SOURCE to an rclone remote path for it.
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$INFRA_DIR/.env"
PROJECT="eschool-prod"
RCLONE_IMAGE="rclone/rclone:1"

# Reads KEY from infra/.env without sourcing it (values may contain shell characters).
env_value() {
  local line
  line="$(grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n 1 || true)"
  line="${line#*=}"
  line="${line%\"}"; line="${line#\"}"
  line="${line%\'}"; line="${line#\'}"
  printf '%s' "$line"
}

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE" >&2; exit 1; }
REMOTE="${OFFSITE_REMOTE:-$(env_value OFFSITE_REMOTE)}"
FILES_REMOTE="${OFFSITE_FILES_REMOTE:-$(env_value OFFSITE_FILES_REMOTE)}"
SOURCE="${OFFSITE_SOURCE:-$(env_value OFFSITE_SOURCE)}"
CONFIG_DIR="${RCLONE_CONFIG_DIR:-$(env_value RCLONE_CONFIG_DIR)}"
CONFIG_DIR="${CONFIG_DIR:-$HOME/.config/rclone}"

[ -n "$REMOTE" ] || { echo "Set OFFSITE_REMOTE in infra/.env" >&2; exit 1; }
[ -f "$CONFIG_DIR/rclone.conf" ] || { echo "Missing $CONFIG_DIR/rclone.conf (run: docker run --rm -it -v $CONFIG_DIR:/config/rclone $RCLONE_IMAGE config)" >&2; exit 1; }

rclone() {
  docker run --rm \
    -v "$CONFIG_DIR:/config/rclone" \
    -v "${PROJECT}_apistorage:/data:ro" \
    "$RCLONE_IMAGE" "$@"
}

echo "$(date -Is) off-site copy start"

if [ -n "$SOURCE" ]; then
  # Backups already in object storage: bucket-to-bucket copy.
  rclone copy "$SOURCE/backups" "$REMOTE" --checksum --stats-one-line --stats 0
else
  # Local storage volume: backups/<year>/<month>/<id>.esbk (already AES-256-GCM encrypted).
  rclone copy /data/backups "$REMOTE" --stats-one-line --stats 0
fi

if [ -n "$FILES_REMOTE" ] && [ -z "$SOURCE" ]; then
  # Uploaded files are stored unencrypted: FILES_REMOTE must be an rclone *crypt* remote.
  rclone copy /data "$FILES_REMOTE" --exclude "/backups/**" --exclude "/test/**" --stats-one-line --stats 0
fi

# Proof for the weekly check: newest backup present off-site.
LATEST="$(rclone lsf "$REMOTE" --recursive --files-only --format tp 2>/dev/null | sort | tail -n 1 || true)"
echo "$(date -Is) off-site copy done; newest off-site file: ${LATEST:-NONE}"
[ -n "$LATEST" ] || { echo "No backup found off-site" >&2; exit 1; }
