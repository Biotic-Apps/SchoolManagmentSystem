import {
  dailyHoursFromTimings,
  hourlyRateMinor,
  overtimeMinutes,
  overtimePayMinor,
} from './overtime-pay';
import { lateHalfDays, tallyAttendance, type DayStatus } from './unpaid-days';

describe('attendance tally', () => {
  const days = [
    '2026-10-01',
    '2026-10-02',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07',
  ];

  it('counts each working day once; approved leave wins over the mark', () => {
    const marks = new Map<string, DayStatus>([
      ['2026-10-01', 'PRESENT'],
      ['2026-10-02', 'LATE'],
      ['2026-10-05', 'ABSENT'],
      ['2026-10-06', 'ABSENT'],
    ]);
    const leaves = [{ from: '2026-10-06', to: '2026-10-06', unpaid: false }];
    expect(tallyAttendance(days, leaves, marks)).toEqual({
      workingDays: 5,
      present: 1,
      late: 1,
      absent: 1,
      halfDays: 0,
      paidLeave: 1,
      unpaidLeave: 0,
      unmarked: 1,
    });
  });
});

describe('late rule', () => {
  it('deducts whole blocks only', () => {
    const rule = { latesPerDeduction: 3, lateDeductionDays: 1 };
    expect(lateHalfDays(2, rule)).toBe(0);
    expect(lateHalfDays(3, rule)).toBe(2);
    expect(lateHalfDays(7, rule)).toBe(4);
  });

  it('supports half-day blocks and can be switched off', () => {
    expect(
      lateHalfDays(4, { latesPerDeduction: 2, lateDeductionDays: 0.5 }),
    ).toBe(2);
    expect(
      lateHalfDays(9, { latesPerDeduction: 0, lateDeductionDays: 1 }),
    ).toBe(0);
  });
});

describe('overtime', () => {
  it('counts minutes after the leave time once past the grace', () => {
    expect(overtimeMinutes('17:00', '14:00', 15)).toBe(180);
    expect(overtimeMinutes('14:10', '14:00', 15)).toBe(0);
    expect(overtimeMinutes(null, '14:00', 15)).toBe(0);
  });

  it('derives daily hours from the staff timings', () => {
    expect(dailyHoursFromTimings('07:30', '14:00')).toBe(6.5);
  });

  it('rates an hour as basic ÷ (days × hours) × multiplier', () => {
    // 6,000,000 × 150 / (26 × 650) = 53,254.4… → 53,254
    const rate = hourlyRateMinor({
      basicMinor: 6_000_000n,
      workingDays: 26,
      dailyHours: 6.5,
      multiplier: 1.5,
    });
    expect(rate).toBe(53_254n);
    expect(overtimePayMinor(180, rate)).toBe(159_762n);
  });

  it('uses a fixed structure rate as is', () => {
    expect(
      hourlyRateMinor({
        basicMinor: 1n,
        workingDays: 26,
        dailyHours: 8,
        multiplier: 2,
        fixedRateMinor: 50_000n,
      }),
    ).toBe(50_000n);
  });
});
