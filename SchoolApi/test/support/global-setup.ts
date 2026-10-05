import { execSync } from 'node:child_process';
import EmbeddedPostgres from 'embedded-postgres';
import { Client } from 'pg';
import { LOCAL_DB } from '../../scripts/local-db-config';
import { TEST_DATABASE_URL } from './e2e-db';

async function canConnect(): Promise<boolean> {
  const client = new Client({ connectionString: TEST_DATABASE_URL });
  try {
    await client.connect();
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** Starts the embedded cluster from `npm run db:local` when nothing is listening. */
async function startEmbedded(): Promise<void> {
  const pg = new EmbeddedPostgres({
    databaseDir: LOCAL_DB.dataDir,
    port: LOCAL_DB.port,
    user: LOCAL_DB.user,
    password: LOCAL_DB.password,
    persistent: true,
    onLog: () => undefined,
  });
  await pg.start();
  (globalThis as { __E2E_PG__?: unknown }).__E2E_PG__ = pg;
}

async function resetSchema(): Promise<void> {
  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  await client.query(
    'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;',
  );
  await client.end();
}

export default async function globalSetup(): Promise<void> {
  if (!(await canConnect())) await startEmbedded();
  if (!(await canConnect())) {
    throw new Error(
      `Test database unreachable: run "npm run db:local" (${TEST_DATABASE_URL})`,
    );
  }
  await resetSchema();
  const env = {
    ...process.env,
    DATABASE_URL: TEST_DATABASE_URL,
    NODE_ENV: 'test',
  };
  execSync('npx prisma migrate deploy', { env, stdio: 'pipe' });
  execSync('npx tsx prisma/seed.ts', { env, stdio: 'pipe' });
}
