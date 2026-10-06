import type { Prisma } from '../../../generated/prisma/client';
import { parseSnapshot } from '../shared/plan-snapshot';
import type { FeePlanDto } from './dto/fee-plan.dto';

export const FEE_PLAN_INCLUDE = {
  items: {
    include: { feeHead: { select: { id: true, name: true } } },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.FeePlanInclude;

export type FeePlanRow = Prisma.FeePlanGetPayload<{
  include: typeof FEE_PLAN_INCLUDE;
}>;

export interface FeePlanNames {
  classNames: Map<string, string>;
  userNames: Map<string, string>;
}

export function toFeePlanDto(row: FeePlanRow, names: FeePlanNames): FeePlanDto {
  const snapshot = parseSnapshot(row.approvedSnapshot);
  return {
    id: row.id,
    branchId: row.branchId,
    sessionId: row.sessionId,
    classId: row.classId,
    className: names.classNames.get(row.classId) ?? '',
    name: row.name,
    status: row.status,
    revision: row.revision,
    items: row.items.map((item) => ({
      id: item.id,
      feeHead: item.feeHead,
      amountMinor: Number(item.amountMinor),
      frequency: item.frequency,
      dueDay: item.dueDay,
    })),
    lateFee:
      row.lateFeeMinor !== null && row.lateFeeAfterDays !== null
        ? {
            amountMinor: Number(row.lateFeeMinor),
            afterDays: row.lateFeeAfterDays,
          }
        : null,
    approved: snapshot
      ? {
          revision: snapshot.revision,
          approvedAt: row.approvedAt?.toISOString() ?? null,
          approvedBy: row.approvedById
            ? {
                id: row.approvedById,
                name: names.userNames.get(row.approvedById) ?? '',
              }
            : null,
        }
      : null,
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
