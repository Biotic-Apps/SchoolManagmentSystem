import type { Prisma } from '../../../generated/prisma/client';
import { adjustmentSign } from '../calculation/payroll-calc';
import type { AdjustmentDto } from './dto/adjustment.dto';

export const ADJUSTMENT_INCLUDE = {
  staff: { select: { id: true, name: true } },
} satisfies Prisma.PayrollAdjustmentInclude;

export type AdjustmentRow = Prisma.PayrollAdjustmentGetPayload<{
  include: typeof ADJUSTMENT_INCLUDE;
}>;

export function toAdjustmentDto(row: AdjustmentRow): AdjustmentDto {
  return {
    id: row.id,
    staffId: row.staffId,
    staff: row.staff,
    branchId: row.branchId,
    month: row.month,
    kind: row.kind,
    amountMinor: Number(row.amountMinor),
    signedMinor: Number(adjustmentSign(row.kind) * row.amountMinor),
    reason: row.reason,
    status: row.status,
    runId: row.runId,
    createdAt: row.createdAt.toISOString(),
  };
}
