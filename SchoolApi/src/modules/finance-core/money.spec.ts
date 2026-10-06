import {
  formatMinor,
  mulDivRound,
  percentOf,
  sumMinor,
  toMinor,
} from './money';
import {
  addMonths,
  dayInPeriod,
  isPeriod,
  monthsBetween,
  periodInRange,
} from './period';
import { settledStatus } from './invoice-state';

describe('money', () => {
  it('rounds percent shares half-up to whole minor units', () => {
    expect(percentOf(10_000n, 15)).toBe(1_500n);
    expect(percentOf(333n, 50)).toBe(167n); // 166.5 → 167
    expect(percentOf(331n, 50)).toBe(166n); // 165.5 → 166
    expect(percentOf(1n, 33)).toBe(0n); // 0.33 → 0
    expect(percentOf(2n, 25)).toBe(1n); // 0.5 → 1
    expect(percentOf(999_999n, 100)).toBe(999_999n);
  });

  it('pro-rates deterministically', () => {
    expect(mulDivRound(50_000n, 3n, 26n)).toBe(5_769n); // 5769.23
    expect(mulDivRound(50_000n, 1n, 52n)).toBe(962n); // 961.54
    expect(() => mulDivRound(1n, 1n, 0n)).toThrow();
    expect(() => mulDivRound(-1n, 1n, 2n)).toThrow();
  });

  it('sums and converts safely', () => {
    expect(sumMinor([1n, 2n, 3n])).toBe(6n);
    expect(toMinor(1234)).toBe(1234n);
    expect(() => toMinor(1.5)).toThrow();
  });

  it('formats for documents', () => {
    expect(formatMinor(123456789n)).toBe('PKR 1,234,567.89');
    expect(formatMinor(-5n)).toBe('-PKR 0.05');
  });
});

describe('period', () => {
  it('validates and walks months', () => {
    expect(isPeriod('2026-02')).toBe(true);
    expect(isPeriod('2026-13')).toBe(false);
    expect(addMonths('2026-11', 3)).toBe('2027-02');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(monthsBetween('2026-04', '2027-03')).toBe(11);
  });

  it('clamps due days to the month', () => {
    expect(dayInPeriod('2026-02', 31).toISOString().slice(0, 10)).toBe(
      '2026-02-28',
    );
    expect(dayInPeriod('2028-02', 30).toISOString().slice(0, 10)).toBe(
      '2028-02-29',
    );
  });

  it('checks open-ended ranges', () => {
    expect(periodInRange('2026-05', '2026-04', null)).toBe(true);
    expect(periodInRange('2026-05', '2026-06', null)).toBe(false);
    expect(periodInRange('2026-07', '2026-04', '2026-06')).toBe(false);
  });
});

describe('settledStatus', () => {
  const today = new Date('2026-05-15T00:00:00.000Z');
  const base = {
    status: 'ISSUED' as const,
    totalMinor: 1_000n,
    dueDate: new Date('2026-05-20T00:00:00.000Z'),
  };

  it('follows the paid amount and the due date', () => {
    expect(settledStatus({ ...base, paidMinor: 0n }, today)).toBe('ISSUED');
    expect(settledStatus({ ...base, paidMinor: 400n }, today)).toBe(
      'PARTIALLY_PAID',
    );
    expect(settledStatus({ ...base, paidMinor: 1_000n }, today)).toBe('PAID');
    const late = { ...base, dueDate: new Date('2026-05-01T00:00:00.000Z') };
    expect(settledStatus({ ...late, paidMinor: 400n }, today)).toBe('OVERDUE');
    expect(settledStatus({ ...late, paidMinor: 1_000n }, today)).toBe('PAID');
  });

  it('never moves drafts or cancelled invoices', () => {
    expect(
      settledStatus({ ...base, status: 'DRAFT', paidMinor: 0n }, today),
    ).toBe('DRAFT');
    expect(
      settledStatus({ ...base, status: 'CANCELLED', paidMinor: 0n }, today),
    ).toBe('CANCELLED');
  });
});
