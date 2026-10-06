import {
  cashDifference,
  closingNoteRequired,
  dailyTotals,
  type CollectedPayment,
} from './daily-totals';

const p = (
  method: CollectedPayment['method'],
  amount: number,
  cashier: string,
  status: CollectedPayment['status'] = 'RECORDED',
): CollectedPayment => ({
  method,
  amountMinor: BigInt(amount),
  receivedById: cashier,
  status,
});

describe('dailyTotals', () => {
  it('sums per method and per cashier', () => {
    const totals = dailyTotals([
      p('CASH', 5000, 'c1'),
      p('CASH', 2500, 'c2'),
      p('BANK', 10000, 'c1'),
      p('ONLINE', 700, 'c2', 'REVERSAL_PENDING'),
    ]);
    expect(totals.count).toBe(4);
    expect(totals.totalMinor).toBe(18200n);
    expect(totals.cashMinor).toBe(7500n);
    expect(totals.byMethod.get('CASH')).toEqual({
      count: 2,
      amountMinor: 7500n,
    });
    expect(totals.byMethod.get('BANK')).toEqual({
      count: 1,
      amountMinor: 10000n,
    });
    expect(totals.byCashier.get('c1')).toEqual({
      count: 2,
      amountMinor: 15000n,
    });
    expect(totals.byCashier.get('c2')).toEqual({
      count: 2,
      amountMinor: 3200n,
    });
  });

  it('keeps reversed payments out of the totals', () => {
    const totals = dailyTotals([
      p('CASH', 5000, 'c1'),
      p('CASH', 3000, 'c1', 'REVERSED'),
    ]);
    expect(totals.totalMinor).toBe(5000n);
    expect(totals.cashMinor).toBe(5000n);
    expect(totals.count).toBe(1);
    expect(totals.reversed).toEqual({ count: 1, amountMinor: 3000n });
  });

  it('is all zero for an empty day', () => {
    const totals = dailyTotals([]);
    expect(totals.totalMinor).toBe(0n);
    expect(totals.byMethod.size).toBe(0);
  });
});

describe('cash closing difference', () => {
  it('is counted minus expected and may be negative', () => {
    expect(cashDifference(7500n, 7500n)).toBe(0n);
    expect(cashDifference(7000n, 7500n)).toBe(-500n);
    expect(cashDifference(8000n, 7500n)).toBe(500n);
  });

  it('needs a note only when the cash does not match', () => {
    expect(closingNoteRequired(0n)).toBe(false);
    expect(closingNoteRequired(-500n)).toBe(true);
    expect(closingNoteRequired(1n)).toBe(true);
  });
});
