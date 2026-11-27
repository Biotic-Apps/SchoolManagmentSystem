import { toLineDto, type LineRow } from './run.mapper';

const line = (detail: object) =>
  ({
    id: 'l1',
    runId: 'r1',
    staffId: 'st1',
    designation: 'HELPER',
    basicMinor: 2_000_000n,
    allowancesMinor: 0n,
    deductionsMinor: 2_500_000n,
    workingDays: 26,
    unpaidLeaveDays: 0,
    leaveDeductionMinor: 0n,
    adjustmentsMinor: 0n,
    overtimeMinutes: 0,
    overtimeMinor: 0n,
    netMinor: 0n,
    paidMinor: 0n,
    status: 'UNPAID',
    route: 'BRANCH',
    approvalId: null,
    detail,
    staff: { id: 'st1', name: 'Rashid', employeeNo: null, userId: 'u9' },
  }) as unknown as LineRow;

describe('toLineDto', () => {
  it('shows the recovery carried to next month when net stopped at zero', () => {
    const dto = toLineDto(
      line({ grossMinor: 2_000_000, uncappedNetMinor: -500_000 }),
    );
    expect(dto.netMinor).toBe(0);
    expect(dto.carriedForwardMinor).toBe(500_000);
    expect(dto.userId).toBe('u9');
  });

  it('carries nothing on a normal line', () => {
    expect(toLineDto(line({ grossMinor: 2_000_000 })).carriedForwardMinor).toBe(
      0,
    );
  });
});
