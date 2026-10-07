# Restore drill (monthly) and full restore

The API already restores the latest backup into a scratch database every Sunday 03:30 and records the result
(Settings & Backups → Backups, "Restore verified"). The **monthly drill** proves something the weekly check cannot:
that a person with only the off-site copy and the key from the password manager can bring the data back.

Time needed: about 30 minutes. Run it on the production server (it uses a separate database and never touches
`eschool`) or on any machine with Docker.

## Before you start
- [ ] Shell on the server, in `/opt/eschool/infra` (or wherever the repo lives).
- [ ] `BACKUP_ENCRYPTION_KEY` taken **from the password manager** (not from `infra/.env`; the drill also proves the stored copy is right).
- [ ] rclone configured (`backup-offsite.sh` works).

## 1. Fetch the newest backup from the off-site copy
```bash
cd /opt/eschool/infra
mkdir -p /tmp/drill && chmod 700 /tmp/drill
REMOTE=offsite:eschool-backups            # = OFFSITE_REMOTE in infra/.env
LATEST=$(docker run --rm -v ~/.config/rclone:/config/rclone rclone/rclone:1 \
  lsf "$REMOTE" --recursive --files-only --format tp | sort | tail -n 1 | cut -d';' -f2)
echo "$LATEST"                            # e.g. 2026/10/0199....esbk
docker run --rm -v ~/.config/rclone:/config/rclone -v /tmp/drill:/drill rclone/rclone:1 \
  copyto "$REMOTE/$LATEST" /drill/latest.esbk
```

## 2. Decrypt it
```bash
read -rs BACKUP_ENCRYPTION_KEY && export BACKUP_ENCRYPTION_KEY     # paste the key, press Enter
docker run --rm -e BACKUP_ENCRYPTION_KEY -v /tmp/drill:/drill -v "$PWD/scripts":/scripts:ro \
  node:24-bookworm-slim node /scripts/decrypt-backup.mjs /drill/latest.esbk /drill/latest.dump
unset BACKUP_ENCRYPTION_KEY
```
"Integrity check failed" = wrong key or damaged file → **stop and raise it**; backups are useless until fixed.

## 3. Restore into a throw-away database
```bash
dc() { docker compose -f docker-compose.prod.yml "$@"; }
dc exec -T postgres dropdb -U postgres --if-exists eschool_drill
dc exec -T postgres createdb -U postgres eschool_drill
dc exec -T postgres pg_restore -U postgres -d eschool_drill --no-owner --no-privileges --exit-on-error < /tmp/drill/latest.dump
```
(Use the `POSTGRES_SUPERUSER` name from `.env` if it is not `postgres`.)

## 4. Compare with production
```bash
Q="SELECT (SELECT count(*) FROM students) students, (SELECT count(*) FROM users) users,
          (SELECT count(*) FROM invoices) invoices, (SELECT count(*) FROM payments) payments,
          (SELECT coalesce(sum(amount_minor),0) FROM ledger_entries) ledger_total,
          (SELECT max(migration_name) FROM _prisma_migrations) last_migration"
dc exec -T postgres psql -U postgres -d eschool_drill -c "$Q"
dc exec -T postgres psql -U postgres -d eschool       -c "$Q"
```
Production may be slightly ahead (work done since 02:00). The drill passes when the restore finished without
errors, the numbers are equal or plausibly smaller, and `last_migration` matches.

## 5. Clean up and record
```bash
dc exec -T postgres dropdb -U postgres eschool_drill
rm -rf /tmp/drill
```
Write one line in the pilot log (docs/pilot.md → Feedback log): date, backup file name, row counts, pass/fail, who.

---

## Full restore (disaster recovery)
Use only when the live database is lost or corrupted. Announce downtime first.

1. Get and decrypt the backup as in steps 1–2 (or use `/var/backups/eschool/pre-update-*.dump` after a failed update — that file is already a plain dump).
2. Stop the apps (database stays up):
   ```bash
   dc stop caddy web api
   ```
3. Keep the broken database for investigation, then restore into a fresh one owned by the app role:
   ```bash
   dc exec -T postgres psql -U postgres -c "ALTER DATABASE eschool RENAME TO eschool_broken_$(date +%Y%m%d)"
   dc exec -T postgres createdb -U postgres -O eschool_app eschool
   dc exec -T postgres pg_restore -U postgres -d eschool --no-owner --role=eschool_app --exit-on-error < /tmp/drill/latest.dump
   ```
   (`eschool_app` / `eschool` = `APP_DB_USER` / `POSTGRES_DB` in `.env`.)
4. Start again; the API applies any newer migrations on start:
   ```bash
   dc up -d
   dc logs --tail=100 api
   ```
5. Check: sign in as super admin, open a student and a fee ledger, Settings & Backups → Support → health.
6. Tell users which time the data goes back to (backup time) and what to re-enter.
7. Uploaded files: if the server disk was lost too, copy them back from `OFFSITE_FILES_REMOTE` into the
   `eschool-prod_apistorage` volume (`rclone copy <remote> /data` with the volume mounted read-write).
8. After a week without problems: `dc exec -T postgres dropdb -U postgres eschool_broken_YYYYMMDD`.
