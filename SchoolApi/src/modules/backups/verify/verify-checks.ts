import type { SourceStats } from '../dump/source-stats';

export interface VerifyCheck {
  name: string;
  expected: string | number | null;
  actual: string | number | null;
  ok: boolean;
}

export const check = (
  name: string,
  expected: string | number | null,
  actual: string | number | null,
  ok = expected === actual,
): VerifyCheck => ({ name, expected, actual, ok });

const describeMigrations = (list: string[]) =>
  list.length ? `${list.length} (last ${list[list.length - 1]})` : '0';

/** Compares the restored database with the stats taken at backup time. */
export function compareStats(
  expected: SourceStats,
  actual: SourceStats,
): VerifyCheck[] {
  const checks = Object.entries(expected.counts).map(([table, rows]) =>
    check(`rows: ${table}`, rows, actual.counts[table] ?? null),
  );
  checks.push(
    check('ledger total', expected.ledgerTotal, actual.ledgerTotal),
    check(
      'ledger per student',
      expected.ledgerPerStudentMd5,
      actual.ledgerPerStudentMd5,
    ),
    check('latest audit id', expected.latestAuditId, actual.latestAuditId),
    check(
      'migrations',
      describeMigrations(expected.migrations),
      describeMigrations(actual.migrations),
      expected.migrations.join('\n') === actual.migrations.join('\n'),
    ),
  );
  return checks;
}

export const allPassed = (checks: VerifyCheck[]): boolean =>
  checks.length > 0 && checks.every((c) => c.ok);
