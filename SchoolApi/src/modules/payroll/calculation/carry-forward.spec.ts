import { carryForwards } from './carry-forward';

const run = { schoolId: 's1', branchId: 'b1', month: '2026-12' };

describe('carryForwards', () => {
  it('moves an unrecovered deduction to next month', () => {
    const rows = carryForwards(
      run,
      [
        { staffId: 'a', detail: { uncappedNetMinor: -500000 } },
        { staffId: 'b', detail: {} },
      ],
      'approver',
    );
    expect(rows).toEqual([
      expect.objectContaining({
        staffId: 'a',
        month: '2027-01',
        kind: 'DEDUCTION',
        amountMinor: 500000n,
        createdById: 'approver',
      }),
    ]);
  });

  it('carries nothing when every line covered its deductions', () => {
    expect(
      carryForwards(run, [{ staffId: 'a', detail: { grossMinor: 1 } }], 'x'),
    ).toEqual([]);
  });
});
