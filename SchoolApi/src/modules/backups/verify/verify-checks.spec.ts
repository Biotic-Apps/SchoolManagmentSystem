import type { SourceStats } from '../dump/source-stats';
import { allPassed, check, compareStats } from './verify-checks';

const stats = (over: Partial<SourceStats> = {}): SourceStats => ({
  counts: { users: 10, audit_logs: 50 },
  ledgerTotal: '12345',
  ledgerPerStudentMd5: 'abc',
  latestAuditId: '0199-a',
  migrations: ['m1', 'm2'],
  ...over,
});

describe('compareStats', () => {
  it('passes when the restore matches', () => {
    const checks = compareStats(stats(), stats());
    expect(checks.map((c) => c.name)).toEqual([
      'rows: users',
      'rows: audit_logs',
      'ledger total',
      'ledger per student',
      'latest audit id',
      'migrations',
    ]);
    expect(allPassed(checks)).toBe(true);
  });

  it('flags each difference', () => {
    const checks = compareStats(
      stats(),
      stats({
        counts: { users: 9, audit_logs: 50 },
        ledgerTotal: '1',
        latestAuditId: null,
        migrations: ['m1'],
      }),
    );
    const failed = checks.filter((c) => !c.ok).map((c) => c.name);
    expect(failed).toEqual([
      'rows: users',
      'ledger total',
      'latest audit id',
      'migrations',
    ]);
    expect(checks.find((c) => c.name === 'migrations')).toMatchObject({
      expected: '2 (last m2)',
      actual: '1 (last m1)',
    });
    expect(allPassed(checks)).toBe(false);
  });

  it('treats a missing table count as a failure', () => {
    const checks = compareStats(stats(), stats({ counts: { users: 10 } }));
    expect(checks[1]).toEqual(check('rows: audit_logs', 50, null, false));
  });

  it('never passes an empty check list', () => {
    expect(allPassed([])).toBe(false);
  });
});
