import { agingBuckets, daysPastDue, oldestOverdueDays } from './aging';

const day = (d: string) => new Date(`${d}T00:00:00.000Z`);
const today = day('2026-10-06');
const inv = (due: string, balance: number) => ({
  dueDate: day(due),
  balanceMinor: BigInt(balance),
});

describe('aging', () => {
  it('counts whole days past due, 0 when not due', () => {
    expect(daysPastDue(day('2026-10-06'), today)).toBe(0);
    expect(daysPastDue(day('2026-10-20'), today)).toBe(0);
    expect(daysPastDue(day('2026-09-06'), today)).toBe(30);
  });

  it('puts balances in 0–30 / 31–60 / 61–90 / 90+ buckets at the edges', () => {
    const buckets = agingBuckets(
      [
        inv('2026-10-20', 100), // not due → 0–30
        inv('2026-09-06', 200), // 30
        inv('2026-09-05', 300), // 31
        inv('2026-08-07', 400), // 60
        inv('2026-08-06', 500), // 61
        inv('2026-07-08', 600), // 90
        inv('2026-07-07', 700), // 91
        inv('2025-01-01', 800),
      ],
      today,
    );
    expect(buckets).toEqual({
      d0_30: 300n,
      d31_60: 700n,
      d61_90: 1_100n,
      d90plus: 1_500n,
    });
  });

  it('ignores settled invoices', () => {
    expect(agingBuckets([inv('2025-01-01', 0)], today).d90plus).toBe(0n);
    expect(
      oldestOverdueDays([inv('2025-01-01', 0), inv('2026-10-01', 5)], today),
    ).toBe(5);
  });

  it('is 0 days overdue when nothing is past due', () => {
    expect(oldestOverdueDays([inv('2026-10-30', 100)], today)).toBe(0);
    expect(oldestOverdueDays([], today)).toBe(0);
  });
});
