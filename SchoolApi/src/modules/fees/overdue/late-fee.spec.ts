import { lateFeeDue, type LateFeeCandidate } from './late-fee';

const day = (d: string) => new Date(`${d}T00:00:00.000Z`);
const base: LateFeeCandidate = {
  status: 'OVERDUE',
  dueDate: day('2026-04-10'),
  totalMinor: 10_000n,
  paidMinor: 0n,
  lateFeeMinor: 0n,
  lateFeeRule: { amountMinor: 500, afterDays: 5 },
};

describe('lateFeeDue', () => {
  it('is due only after dueDate + afterDays', () => {
    expect(lateFeeDue(base, day('2026-04-15'))).toBe(0n);
    expect(lateFeeDue(base, day('2026-04-16'))).toBe(500n);
  });

  it('applies with zero grace days the day after the due date', () => {
    const rule = { amountMinor: 200, afterDays: 0 };
    expect(lateFeeDue({ ...base, lateFeeRule: rule }, day('2026-04-10'))).toBe(
      0n,
    );
    expect(lateFeeDue({ ...base, lateFeeRule: rule }, day('2026-04-11'))).toBe(
      200n,
    );
  });

  it('is added only once', () => {
    expect(lateFeeDue({ ...base, lateFeeMinor: 500n }, day('2026-05-01'))).toBe(
      0n,
    );
  });

  it('needs an open balance', () => {
    expect(lateFeeDue({ ...base, paidMinor: 10_000n }, day('2026-05-01'))).toBe(
      0n,
    );
    expect(lateFeeDue({ ...base, status: 'PAID' }, day('2026-05-01'))).toBe(0n);
    expect(lateFeeDue({ ...base, status: 'DRAFT' }, day('2026-05-01'))).toBe(
      0n,
    );
    expect(
      lateFeeDue({ ...base, status: 'CANCELLED' }, day('2026-05-01')),
    ).toBe(0n);
  });

  it('applies to partially paid invoices', () => {
    expect(
      lateFeeDue(
        { ...base, status: 'PARTIALLY_PAID', paidMinor: 4_000n },
        day('2026-05-01'),
      ),
    ).toBe(500n);
  });

  it('ignores missing or malformed rules', () => {
    expect(lateFeeDue({ ...base, lateFeeRule: null }, day('2026-05-01'))).toBe(
      0n,
    );
    expect(
      lateFeeDue(
        { ...base, lateFeeRule: { amountMinor: 1.5, afterDays: 1 } },
        day('2026-05-01'),
      ),
    ).toBe(0n);
  });
});
