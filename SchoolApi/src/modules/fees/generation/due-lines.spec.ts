import type { FeeFrequency } from '../../../generated/prisma/client';
import type { PlanItem } from '../shared/plan-snapshot';
import { dueItems, invoiceDueDate, isDueInPeriod } from './due-lines';

const calendar = { sessionStart: '2026-04', termStarts: [] as string[] };
const item = (
  feeHeadId: string,
  frequency: FeeFrequency,
  dueDay = 10,
): PlanItem => ({ feeHeadId, amountMinor: 1_000n, frequency, dueDay });

describe('isDueInPeriod', () => {
  it('bills MONTHLY every month', () => {
    expect(isDueInPeriod('MONTHLY', '2026-04', calendar)).toBe(true);
    expect(isDueInPeriod('MONTHLY', '2027-02', calendar)).toBe(true);
  });

  it('bills QUARTERLY in the start month and every 3 months after', () => {
    const due = [
      '2026-04',
      '2026-05',
      '2026-07',
      '2026-10',
      '2027-01',
      '2027-03',
    ].filter((p) => isDueInPeriod('QUARTERLY', p, calendar));
    expect(due).toEqual(['2026-04', '2026-07', '2026-10', '2027-01']);
    expect(isDueInPeriod('QUARTERLY', '2026-01', calendar)).toBe(false);
  });

  it('bills TERM in term start months, or quarterly without terms', () => {
    const withTerms = { ...calendar, termStarts: ['2026-04', '2026-09'] };
    expect(isDueInPeriod('TERM', '2026-09', withTerms)).toBe(true);
    expect(isDueInPeriod('TERM', '2026-07', withTerms)).toBe(false);
    expect(isDueInPeriod('TERM', '2026-07', calendar)).toBe(true);
    expect(isDueInPeriod('TERM', '2026-09', calendar)).toBe(false);
  });

  it('bills YEARLY only in the session start month', () => {
    expect(isDueInPeriod('YEARLY', '2026-04', calendar)).toBe(true);
    expect(isDueInPeriod('YEARLY', '2026-05', calendar)).toBe(false);
  });
});

describe('dueItems', () => {
  const items = [
    item('tuition', 'MONTHLY', 10),
    item('admission', 'ONCE', 5),
    item('annual', 'YEARLY', 15),
  ];

  it('includes ONCE items not billed before', () => {
    expect(
      dueItems(items, '2026-04', calendar).map((i) => i.feeHeadId),
    ).toEqual(['tuition', 'admission', 'annual']);
  });

  it('drops ONCE items already billed in the session', () => {
    const billed = new Set(['admission']);
    expect(
      dueItems(items, '2026-05', calendar, billed).map((i) => i.feeHeadId),
    ).toEqual(['tuition']);
  });
});

describe('invoiceDueDate', () => {
  it('uses the earliest due day of the billed items', () => {
    const due = invoiceDueDate(
      [item('a', 'MONTHLY', 12), item('b', 'ONCE', 5)],
      '2026-04',
    );
    expect(due.toISOString().slice(0, 10)).toBe('2026-04-05');
  });

  it('clamps to the last day of short months', () => {
    expect(
      invoiceDueDate([item('a', 'MONTHLY', 31)], '2027-02')
        .toISOString()
        .slice(0, 10),
    ).toBe('2027-02-28');
  });

  it('defaults to day 10 without plan items', () => {
    expect(invoiceDueDate([], '2026-06').toISOString().slice(0, 10)).toBe(
      '2026-06-10',
    );
  });
});
