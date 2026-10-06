import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import type { Client } from 'pg';
import { to as copyTo } from 'pg-copy-streams';
import {
  ARCHIVE_VERSION,
  encodeHeader,
  tableFrames,
  type ArchiveHeader,
  type ArchiveTable,
} from '../archive/copy-archive';
import { withClient, type PgTarget } from './pg-target';
import { collectStats, type SourceStats } from './source-stats';
import { COPY_SESSION_SQL, quoteIdent } from './sql-ident';

/**
 * Base tables of `public` (partitioned parents, not their partitions), minus
 * Prisma's migration table, with insertable columns in order.
 */
const TABLES_SQL = `
  SELECT c.relname::text AS name,
    array_agg(a.attname::text ORDER BY a.attnum) AS columns
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0
    AND NOT a.attisdropped AND a.attgenerated = ''
  WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
    AND NOT c.relispartition AND c.relname <> '_prisma_migrations'
  GROUP BY c.relname
  ORDER BY c.relname`;

const selectSql = (table: { name: string; columns: string[] }) =>
  `SELECT ${table.columns.map(quoteIdent).join(', ')} FROM ${quoteIdent(table.name)}`;

async function listTables(client: Client): Promise<ArchiveTable[]> {
  const rows = await client.query<{ name: string; columns: string[] }>(
    TABLES_SQL,
  );
  const tables: ArchiveTable[] = [];
  for (const row of rows.rows) {
    const count = await client.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM ${quoteIdent(row.name)}`,
    );
    tables.push({ ...row, rows: Number(count.rows[0].n) });
  }
  return tables;
}

/** COPY text rows end in a newline; embedded newlines are escaped. */
async function* countRows(
  data: AsyncIterable<Buffer>,
  counter: { rows: number },
): AsyncGenerator<Buffer> {
  for await (const chunk of data) {
    for (let i = chunk.indexOf(10); i !== -1; i = chunk.indexOf(10, i + 1)) {
      counter.rows++;
    }
    yield chunk;
  }
}

async function* archiveChunks(
  client: Client,
  header: ArchiveHeader,
): AsyncGenerator<Buffer> {
  yield encodeHeader(header);
  for (const table of header.tables) {
    const stream = client.query(copyTo(`COPY (${selectSql(table)}) TO STDOUT`));
    const counter = { rows: 0 };
    yield* tableFrames(table.name, countRows(stream, counter));
    if (counter.rows !== table.rows) {
      throw new Error(
        `Row count of ${table.name} differs within the snapshot (${table.rows} vs ${counter.rows})`,
      );
    }
  }
}

/**
 * Built-in dump: one REPEATABLE READ READ ONLY transaction (stats + every
 * table see one snapshot), COPY text per table → framed archive → gzip.
 */
export async function dumpWithCopy(
  source: PgTarget,
  outFile: string,
): Promise<SourceStats> {
  return withClient(source, async (client) => {
    await client.query(COPY_SESSION_SQL);
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    try {
      const sourceStats = await collectStats(client);
      const header: ArchiveHeader = {
        formatVersion: ARCHIVE_VERSION,
        createdAt: new Date().toISOString(),
        migrations: sourceStats.migrations,
        tables: await listTables(client),
        sourceStats,
      };
      await pipeline(
        Readable.from(archiveChunks(client, header)),
        createGzip(),
        createWriteStream(outFile, { flags: 'wx' }),
      );
      await client.query('COMMIT');
      return sourceStats;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    }
  });
}
