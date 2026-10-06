import { Client, type ClientConfig } from 'pg';

/** Connection parts of DATABASE_URL (never logged). */
export interface PgTarget {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  sslmode: string | null;
}

export function parseDatabaseUrl(url: string): PgTarget {
  const parsed = new URL(url);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL has no database name');
  return {
    host: decodeURIComponent(parsed.hostname) || 'localhost',
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    sslmode: parsed.searchParams.get('sslmode'),
  };
}

export const withDatabase = (target: PgTarget, database: string): PgTarget => ({
  ...target,
  database,
});

function clientConfig(target: PgTarget): ClientConfig {
  const ssl =
    target.sslmode && !['disable', 'prefer', 'allow'].includes(target.sslmode);
  return {
    host: target.host,
    port: target.port,
    user: target.user,
    password: target.password,
    database: target.database,
    ssl: ssl ? { rejectUnauthorized: target.sslmode !== 'require' } : undefined,
    application_name: 'eschool-backup',
  };
}

/** Opens a client, runs `work`, always closes it. */
export async function withClient<T>(
  target: PgTarget,
  work: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client(clientConfig(target));
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** libpq environment for pg_dump/pg_restore: the password never hits argv. */
export function pgToolEnv(target: PgTarget): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PGHOST: target.host,
    PGPORT: String(target.port),
    PGUSER: target.user,
    PGPASSWORD: target.password,
    PGDATABASE: target.database,
    ...(target.sslmode ? { PGSSLMODE: target.sslmode } : {}),
  };
}
