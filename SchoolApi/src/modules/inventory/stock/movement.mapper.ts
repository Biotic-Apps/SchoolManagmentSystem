import type { Prisma } from '../../../generated/prisma/client';
import type { MovementDto } from '../dto/stock.dto';

export const ITEM_REF_SELECT = {
  id: true,
  sku: true,
  name: true,
  unit: true,
  category: true,
} satisfies Prisma.InventoryItemSelect;

export const MOVEMENT_INCLUDE = {
  item: { select: ITEM_REF_SELECT },
} satisfies Prisma.StockMovementInclude;

export type MovementRow = Prisma.StockMovementGetPayload<{
  include: typeof MOVEMENT_INCLUDE;
}>;

export function toMovementDto(
  row: MovementRow,
  names: ReadonlyMap<string, string>,
  balanceAfter?: number,
): MovementDto {
  const name = names.get(row.createdById);
  return {
    id: row.id,
    branchId: row.branchId,
    item: row.item,
    type: row.type,
    quantity: row.quantity,
    issuedTo: row.issuedTo,
    studentId: row.studentId,
    reason: row.reason,
    refType: row.refType,
    refId: row.refId,
    performedBy: name ? { id: row.createdById, name } : null,
    balanceAfter,
    createdAt: row.createdAt.toISOString(),
  };
}
