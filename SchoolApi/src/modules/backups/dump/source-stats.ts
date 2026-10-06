import type { Client } from 'pg';
import { quoteIdent } from './sql-ident';

/** Tables whose row counts must survive a restore unchanged. */
export const KEY_TABLES = [
  'users',
  'schools',
  'branches',
  'students',
  'enrollments',
  'guardians',
  'student_guardians',
  'staff',
  'invoices',
  'payments',
  'ledger_entries',
  'payroll_runs',
  'audit_logs',
] as const;

export interface SourceStats {
  counts: Record<string, number>;
  /** Sum of ledger_entries.amount_minor (string: bigint). */
  ledgerTotal: string;
  /** md5 over "student:sum" pairs ordered by student. */
  ledgerPerStudentMd5: string;
  latestAuditId: string | null;
  migrations: string[];
}

const LEDGER_SQL = `
  SELECT coalesce(sum(s), 0)::text AS total,
    md5(coalesce(string_agg(student_id::text || ':' || s::text, ','
      ORDER BY student_id), '')) AS md5
  FROM (SELECT student_id, sum(amount_minor) AS s
        FROM ledger_entries GROUP BY student_id) per_student`;

/** Applied Prisma migrations, oldest first (empty when the table is absent). */
export async function appliedMigrations(client: Client): Promise<string[]> {
  const exists = await client.query<{ t: string | null }>(
    `SELECT to_regclass('public._prisma_migrations')::text AS t`,
  );
  if (!exists.rows[0]?.t) return [];
  const rows = await client.query<{ name: string }>(
    `SELECT migration_name AS name FROM _prisma_migrations
     WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
     ORDER BY migration_name`,
  );
  return rows.rows.map((r) => r.name);
}

/**
 * Snapshot of what a restore must reproduce. Run inside the same
 * REPEATABLE READ transaction as the dump so both see the same data.
 */
export async function collectStats(
  client: Client,
  migrations?: string[],
): Promise<SourceStats> {
  const countSql = KEY_TABLES.map(
    (t) => `(SELECT count(*) FROM ${quoteIdent(t)})::text AS ${quoteIdent(t)}`,
  ).join(', ');
  const counts = await client.query<Record<string, string>>(
    `SELECT ${countSql}`,
  );
  const ledger = await client.query<{ total: string; md5: string }>(LEDGER_SQL);
  const audit = await client.query<{ id: string }>(
    'SELECT id::text AS id FROM audit_logs ORDER BY at DESC, id DESC LIMIT 1',
  );
  return {
    counts: Object.fromEntries(
      KEY_TABLES.map((t) => [t, Number(counts.rows[0][t])]),
    ),
    ledgerTotal: ledger.rows[0].total,
    ledgerPerStudentMd5: ledger.rows[0].md5,
    latestAuditId: audit.rows[0]?.id ?? null,
    migrations: migrations ?? (await appliedMigrations(client)),
  };
}
