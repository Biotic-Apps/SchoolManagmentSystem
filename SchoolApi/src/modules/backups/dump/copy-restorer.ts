import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import type { Client } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import {
  readHeader,
  readTable,
  type ArchiveHeader,
} from '../archive/copy-archive';
import { FrameReader } from '../archive/frame-reader';
import { COPY_SESSION_SQL, quoteIdent } from './sql-ident';

export const MIGRATIONS_DIR = join(process.cwd(), 'prisma', 'migrations');

interface ForeignKey {
  tbl: string;
  name: string;
  def: string;
}

export interface CopyRestoreResult {
  header: ArchiveHeader;
  /** Foreign keys that could not be re-added (referential errors). */
  foreignKeyErrors: string[];
  foreignKeys: number;
}

async function applyMigrations(client: Client, names: string[], dir: string) {
  for (const name of names) {
    if (!/^[\w-]+$/.test(name)) throw new Error(`Bad migration name ${name}`);
    const sql = await readFile(join(dir, name, 'migration.sql'), 'utf8').catch(
      () => {
        throw new Error(`Migration ${name} is not part of this build`);
      },
    );
    await client.query(sql);
  }
}

async function dropForeignKeys(client: Client): Promise<ForeignKey[]> {
  const { rows } = await client.query<ForeignKey>(
    `SELECT conrelid::regclass::text AS tbl, conname::text AS name,
       pg_get_constraintdef(oid) AS def
     FROM pg_constraint
     WHERE contype = 'f' AND connamespace = 'public'::regnamespace
       AND conparentid = 0
     ORDER BY conname`,
  );
  for (const fk of rows) {
    await client.query(
      `ALTER TABLE ${fk.tbl} DROP CONSTRAINT ${quoteIdent(fk.name)}`,
    );
  }
  return rows;
}

async function addForeignKeys(
  client: Client,
  keys: ForeignKey[],
): Promise<string[]> {
  const errors: string[] = [];
  for (const fk of keys) {
    try {
      await client.query(
        `ALTER TABLE ${fk.tbl} ADD CONSTRAINT ${quoteIdent(fk.name)} ${fk.def}`,
      );
    } catch (error) {
      errors.push(`${fk.name}: ${(error as Error).message}`);
    }
  }
  return errors;
}

/**
 * Restores a decrypted copy-format archive into an empty database: the
 * header's migrations, FKs dropped, COPY per table, FKs re-added (which
 * validates every reference).
 */
export async function restoreCopyArchive(
  client: Client,
  archiveFile: string,
  migrationsDir = MIGRATIONS_DIR,
): Promise<CopyRestoreResult> {
  const file = createReadStream(archiveFile);
  const gunzip = createGunzip();
  file.on('error', (error) => gunzip.destroy(error));
  const reader = new FrameReader(file.pipe(gunzip));
  try {
    const header = await readHeader(reader);
    // Throwaway database: no need to wait for WAL flushes per statement.
    await client.query('SET synchronous_commit = off');
    await applyMigrations(client, header.migrations, migrationsDir);
    await client.query(COPY_SESSION_SQL);
    const keys = await dropForeignKeys(client);
    for (const table of header.tables) {
      const columns = table.columns.map(quoteIdent).join(', ');
      const copy = client.query(
        copyFrom(`COPY ${quoteIdent(table.name)} (${columns}) FROM STDIN`),
      );
      await pipeline(Readable.from(readTable(reader, table.name)), copy);
      if (copy.rowCount !== table.rows) {
        throw new Error(
          `${table.name}: restored ${copy.rowCount} rows, archive has ${table.rows}`,
        );
      }
    }
    if (!(await reader.atEnd())) throw new Error('Archive has trailing data');
    const foreignKeyErrors = await addForeignKeys(client, keys);
    return { header, foreignKeyErrors, foreignKeys: keys.length };
  } finally {
    gunzip.destroy();
    file.destroy();
  }
}
