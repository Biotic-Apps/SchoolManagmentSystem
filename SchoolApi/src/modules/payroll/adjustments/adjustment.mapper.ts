import type { Prisma } from '../../../generated/prisma/client';
import { adjustmentSign } from '../calculation/payroll-calc';
import type { IdNameDto } from '../../../core/common/dto/id-name.dto';
import type { AdjustmentDto } from './dto/adjustment.dto';

export const ADJUSTMENT_INCLUDE = {
  staff: { select: { id: true, name: true } },
} satisfies Prisma.PayrollAdjustmentInclude;

export type AdjustmentRow = Prisma.PayrollAdjustmentGetPayload<{
  include: typeof ADJUSTMENT_INCLUDE;
}>;

/** `cancelledBy` users by id (no relation on the model). */
export type CancellerNames = ReadonlyMap<string, IdNameDto>;

export function toAdjustmentDto(
  row: AdjustmentRow,
  cancellers: CancellerNames = new Map(),
): AdjustmentDto {
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
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    cancelReason: row.cancelReason,
    cancelledBy: row.cancelledById
      ? (cancellers.get(row.cancelledById) ?? {
          id: row.cancelledById,
          name: '',
        })
      : null,
  };
}
