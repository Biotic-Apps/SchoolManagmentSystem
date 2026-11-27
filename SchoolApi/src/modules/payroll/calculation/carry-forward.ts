import { addMonths } from '../../finance-core/period';
import { parseLineDetail } from './line-detail';

export interface CarryLine {
  staffId: string;
  detail: unknown;
}

export interface CarryRun {
  schoolId: string;
  branchId: string;
  month: string;
}

export interface CarryForward {
  schoolId: string;
  branchId: string;
  staffId: string;
  month: string;
  kind: 'DEDUCTION';
  amountMinor: bigint;
  reason: string;
  createdById: string;
}

/**
 * Deductions a line could not recover (net clamped at zero) move to the next
 * month as a DEDUCTION adjustment, so no recovery is ever dropped silently.
 */
export function carryForwards(
  run: CarryRun,
  lines: readonly CarryLine[],
  actorId: string,
): CarryForward[] {
  return lines.flatMap((line) => {
    const uncapped = parseLineDetail(line.detail).uncappedNetMinor ?? 0;
    if (uncapped >= 0) return [];
    return [
      {
        schoolId: run.schoolId,
        branchId: run.branchId,
        staffId: line.staffId,
        month: addMonths(run.month, 1),
        kind: 'DEDUCTION' as const,
        amountMinor: BigInt(-uncapped),
        reason: `Carried forward from ${run.month}: deductions were more than that month's pay`,
        createdById: actorId,
      },
    ];
  });
}
