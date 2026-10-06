import { parseDate } from '../../../core/common/dates';
import { ageBalances } from './aging-buckets';

describe('ageBalances', () => {
  const today = parseDate('2026-10-06');
  const due = (date: string, studentId: string, balance: bigint) => ({
    studentId,
    dueDate: parseDate(date),
    balanceMinor: balance,
  });

  it('buckets balances by days past due per student', () => {
    const rows = ageBalances(
      [
        due('2026-10-20', 'a', 100n), // not yet due → 0-30
        due('2026-09-06', 'a', 200n), // 30 days
        due('2026-08-07', 'a', 300n), // 60 days
        due('2026-07-07', 'a', 400n), // 91 days
        due('2026-07-08', 'b', 50n), // 90 days
        due('2026-01-01', 'c', 0n), // settled
      ],
      today,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      studentId: 'a',
      d0_30: 300n,
      d31_60: 300n,
      d61_90: 0n,
      d90plus: 400n,
      total: 1000n,
      maxDays: 91,
      invoices: 4,
    });
    expect(rows[0].oldestDue).toEqual(parseDate('2026-07-07'));
    expect(rows[1]).toMatchObject({ studentId: 'b', d61_90: 50n, maxDays: 90 });
  });
});
