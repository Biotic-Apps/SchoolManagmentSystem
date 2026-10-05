import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { LOCAL_DB, nativeBinDir } from './local-db-config';

if (!existsSync(join(LOCAL_DB.dataDir, 'postmaster.pid'))) {
  console.log('Local PostgreSQL is not running.');
  process.exit(0);
}

const pgCtl = join(
  nativeBinDir(),
  process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl',
);
execFileSync(pgCtl, ['stop', '-D', LOCAL_DB.dataDir, '-m', 'fast'], {
  stdio: 'inherit',
});
