import {
  adjustmentSign,
  calculateLine,
  leaveDeduction,
  type LineInput,
} from './payroll-calc';
import { unpaidHalfDays, type DayStatus } from './unpaid-days';

const base: LineInput = {
  basicMinor: 3_000_000n,
  allowances: [
    { name: 'House rent', amountMinor: 500_000 },
    { name: 'Conveyance', amountMinor: 200_000 },
  ],
  deductions: [{ name: 'Provident fund', amountMinor: 150_000 }],
  workingDays: 20,
  unpaidHalfDays: 0,
  adjustments: [],
};

describe('payroll calculation', () => {
  it('sums basic + allowances − deductions without leave or adjustments', () => {
    const line = calculateLine(base);
    expect(line.allowancesMinor).toBe(700_000n);
    expect(line.deductionsMinor).toBe(150_000n);
    expect(line.grossMinor).toBe(3_700_000n);
    expect(line.leaveDeductionMinor).toBe(0n);
    expect(line.netMinor).toBe(3_550_000n);
  });

  it('deducts unpaid leave pro rata on basic over working days', () => {
    // 2 full days of 20: 3,000,000 × 4 / 40 = 300,000
    const line = calculateLine({ ...base, unpaidHalfDays: 4 });
    expect(line.leaveDeductionMinor).toBe(300_000n);
    expect(line.netMinor).toBe(3_250_000n);
  });

  it('counts a half day as half of a day', () => {
    // 3,000,000 × 1 / 40 = 75,000
    expect(leaveDeduction(3_000_000n, 1, 20)).toBe(75_000n);
  });

  it('rounds the leave deduction half-up to whole minor units', () => {
    // 1,000 × 1 / 44 = 22.727… → 23
    expect(leaveDeduction(1_000n, 1, 22)).toBe(23n);
    // 10 × 1 / 4 = 2.5 → 3
    expect(leaveDeduction(10n, 1, 2)).toBe(3n);
    // 10 × 1 / 8 = 1.25 → 1
    expect(leaveDeduction(10n, 1, 4)).toBe(1n);
  });

  it('never deducts more than the basic for the month', () => {
    expect(leaveDeduction(3_000_000n, 100, 20)).toBe(3_000_000n);
    expect(leaveDeduction(3_000_000n, 3, 0)).toBe(0n);
  });

  it('applies adjustment signs: bonus/arrear add, deduction/advance subtract', () => {
    expect(adjustmentSign('BONUS')).toBe(1n);
    expect(adjustmentSign('ARREAR')).toBe(1n);
    expect(adjustmentSign('DEDUCTION')).toBe(-1n);
    expect(adjustmentSign('ADVANCE')).toBe(-1n);
    const line = calculateLine({
      ...base,
      adjustments: [
        { id: 'a', kind: 'BONUS', amountMinor: 100_000n, reason: 'Eid' },
        { id: 'b', kind: 'ARREAR', amountMinor: 50_000n, reason: 'March' },
        { id: 'c', kind: 'ADVANCE', amountMinor: 200_000n, reason: 'Loan' },
        { id: 'd', kind: 'DEDUCTION', amountMinor: 25_000n, reason: 'Fine' },
      ],
    });
    expect(line.adjustmentsMinor).toBe(-75_000n);
    expect(line.netMinor).toBe(3_475_000n);
  });

  it('clamps net at zero and keeps the uncapped figure', () => {
    const line = calculateLine({
      ...base,
      adjustments: [
        { id: 'a', kind: 'ADVANCE', amountMinor: 5_000_000n, reason: 'Loan' },
      ],
    });
    expect(line.netMinor).toBe(0n);
    expect(line.uncappedNetMinor).toBe(-1_450_000n);
  });
});

describe('unpaid half days', () => {
  const days = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'];
  const att = (entries: [string, DayStatus][]) => new Map(entries);

  it('counts absences as full days and half days as one half', () => {
    const marks = att([
      ['2026-09-01', 'ABSENT'],
      ['2026-09-02', 'HALF_DAY'],
      ['2026-09-03', 'PRESENT'],
    ]);
    expect(unpaidHalfDays(days, [], marks)).toBe(3);
  });

  it('counts approved unpaid leave even without attendance', () => {
    const leaves = [{ from: '2026-09-02', to: '2026-09-03', unpaid: true }];
    expect(unpaidHalfDays(days, leaves, att([]))).toBe(4);
  });

  it('excuses absences covered by approved paid leave', () => {
    const leaves = [{ from: '2026-08-30', to: '2026-09-02', unpaid: false }];
    const marks = att([
      ['2026-09-01', 'ABSENT'],
      ['2026-09-02', 'HALF_DAY'],
      ['2026-09-04', 'ABSENT'],
    ]);
    expect(unpaidHalfDays(days, leaves, marks)).toBe(2);
  });

  it('ignores days that are not working days', () => {
    const marks = att([['2026-09-06', 'ABSENT']]);
    expect(unpaidHalfDays(days, [], marks)).toBe(0);
  });
});
