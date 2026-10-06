import { quoteIdent } from '../dump/sql-ident';
import { withClient, withDatabase, type PgTarget } from '../dump/pg-target';

const MAX_IDENT = 63;

export function scratchName(sourceDatabase: string): string {
  const name = `${sourceDatabase}_restore_check`;
  if (name.length > MAX_IDENT) {
    throw new Error('Database name too long for a restore-check database');
  }
  return name;
}

async function dropIfExists(source: PgTarget, name: string): Promise<void> {
  await withClient(source, async (client) => {
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [name],
    );
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(name)}`);
  });
}

/**
 * Creates `<db>_restore_check` (dropping leftovers), runs `work` against it
 * and always drops it afterwards. Needs the CREATEDB privilege.
 */
export async function withScratchDatabase<T>(
  source: PgTarget,
  work: (scratch: PgTarget) => Promise<T>,
): Promise<T> {
  const name = scratchName(source.database);
  if (name === source.database) throw new Error('Refusing to use the source');
  await dropIfExists(source, name);
  await withClient(source, (client) =>
    client.query(`CREATE DATABASE ${quoteIdent(name)} TEMPLATE template0`),
  );
  try {
    return await work(withDatabase(source, name));
  } finally {
    await dropIfExists(source, name);
  }
}
