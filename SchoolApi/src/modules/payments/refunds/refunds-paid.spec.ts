import { schoolDateTime } from '../../../core/common/school-time';
import { expectedCash } from '../collections/daily-totals';
import {
  nextDate,
  refundsPaidWhere,
  refundTotals,
  schoolDaysRange,
} from './refunds-paid';

describe('refunds paid', () => {
  it('totals refunds and the cash part', () => {
    const totals = refundTotals([
      { method: 'CASH', amountMinor: 49950n },
      { method: 'BANK', amountMinor: 10000n },
    ]);
    expect(totals).toEqual({
      count: 2,
      totalMinor: 59950n,
      cashMinor: 49950n,
    });
  });

  it('nets cash refunds off the expected cash at closing', () => {
    // Rs 2,000 cash in, Rs 499.50 cash refunded → Rs 1,500.50 in the drawer.
    expect(expectedCash({ cashMinor: 200000n }, 49950n)).toBe(150050n);
  });

  it('covers whole school days, month ends included', () => {
    expect(nextDate('2026-11-30')).toBe('2026-12-01');
    expect(nextDate('2026-12-31')).toBe('2027-01-01');
    expect(schoolDaysRange('2026-11-01', '2026-11-30')).toEqual({
      gte: schoolDateTime('2026-11-01', '00:00'),
      lt: schoolDateTime('2026-12-01', '00:00'),
    });
  });

  it('only counts approved refunds, dated by approval', () => {
    const where = refundsPaidWhere({ branchId: 'b1' }, '2026-11-27');
    expect(where).toEqual({
      AND: [{ branchId: 'b1' }],
      status: 'APPROVED',
      decidedAt: schoolDaysRange('2026-11-27', '2026-11-27'),
    });
  });
});
