import { existsSync } from 'node:fs';
import { join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import { LOCAL_DB } from './local-db-config';

async function ensureDatabases(pg: EmbeddedPostgres): Promise<void> {
  const client = pg.getPgClient('postgres');
  await client.connect();
  try {
    for (const name of LOCAL_DB.databases) {
      const found = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [name],
      );
      if (found.rowCount === 0) await client.query(`CREATE DATABASE "${name}"`);
    }
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const pg = new EmbeddedPostgres({
    databaseDir: LOCAL_DB.dataDir,
    port: LOCAL_DB.port,
    user: LOCAL_DB.user,
    password: LOCAL_DB.password,
    persistent: true,
    onLog: () => undefined,
    onError: (message) => console.error(String(message)),
  });

  if (!existsSync(join(LOCAL_DB.dataDir, 'PG_VERSION'))) {
    console.log(`Initialising cluster in ${LOCAL_DB.dataDir}`);
    await pg.initialise();
  }
  await pg.start();
  await ensureDatabases(pg);

  console.log(
    `PostgreSQL ready on port ${LOCAL_DB.port} (databases: ${LOCAL_DB.databases.join(', ')}). Ctrl+C or "npm run db:local:stop" to stop.`,
  );
  // Exit when the cluster is stopped from elsewhere (npm run db:local:stop).
  const pidFile = join(LOCAL_DB.dataDir, 'postmaster.pid');
  setInterval(() => {
    if (!existsSync(pidFile)) process.exit(0);
  }, 3000);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
