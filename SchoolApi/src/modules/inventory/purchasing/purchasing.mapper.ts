import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import type {
  PurchaseOrderDto,
  PurchaseRequestDto,
  ReceiptLineDto,
} from '../dto/purchasing.dto';
import { lineTotal, receivedTotal } from './po-math';

/** Line snapshot stored in `purchase_requests.lines` (JSON). */
export interface StoredRequestLine {
  itemId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  estimatedUnitMinor: number;
}

export interface ItemInfo {
  sku: string;
  name: string;
  unit: string;
}

export const ORDER_INCLUDE = {
  vendor: { select: { id: true, name: true } },
  lines: { orderBy: { id: 'asc' } },
  receipts: { orderBy: { createdAt: 'asc' } },
  request: { select: { requestNo: true } },
} satisfies Prisma.PurchaseOrderInclude;

export const REQUEST_INCLUDE = {
  order: {
    include: {
      vendor: { select: { id: true, name: true } },
      lines: { orderBy: { id: 'asc' } },
    },
  },
} satisfies Prisma.PurchaseRequestInclude;

export type OrderRow = Prisma.PurchaseOrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;
export type RequestRow = Prisma.PurchaseRequestGetPayload<{
  include: typeof REQUEST_INCLUDE;
}>;

const UNKNOWN: ItemInfo = { sku: '', name: 'Unknown item', unit: '' };

export const requestLines = (row: { lines: unknown }): StoredRequestLine[] =>
  row.lines as StoredRequestLine[];

export function toRequestDto(
  row: RequestRow,
  items: ReadonlyMap<string, ItemInfo>,
  names: ReadonlyMap<string, string>,
): PurchaseRequestDto {
  const requester = names.get(row.requestedById);
  return {
    id: row.id,
    requestNo: row.requestNo,
    branchId: row.branchId,
    reason: row.reason,
    lines: requestLines(row).map((l) => ({
      itemId: l.itemId,
      sku: l.sku,
      itemName: l.name,
      unit: l.unit,
      quantity: l.quantity,
      estimatedUnitMinor: l.estimatedUnitMinor,
      totalMinor: l.quantity * l.estimatedUnitMinor,
    })),
    estimatedTotalMinor: Number(row.estimatedTotalMinor),
    status: row.status,
    approvalId: row.approvalId,
    requestedBy: requester ? { id: row.requestedById, name: requester } : null,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    purchaseOrder: row.order
      ? {
          id: row.order.id,
          poNo: row.order.poNo,
          vendor: row.order.vendor,
          status: row.order.status,
          lines: row.order.lines.map((l) => ({
            itemId: l.itemId,
            itemName: (items.get(l.itemId) ?? UNKNOWN).name,
            orderedQty: l.quantity,
            receivedQty: l.receivedQty,
            unitPriceMinor: Number(l.unitPriceMinor),
          })),
        }
      : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toOrderDto(
  row: OrderRow,
  items: ReadonlyMap<string, ItemInfo>,
  expenseId: string | null,
): PurchaseOrderDto {
  return {
    id: row.id,
    poNo: row.poNo,
    branchId: row.branchId,
    requestId: row.requestId,
    requestNo: row.request.requestNo,
    vendor: row.vendor,
    status: row.status,
    totalMinor: Number(row.totalMinor),
    receivedTotalMinor: Number(receivedTotal(row.lines)),
    expectedOn: row.expectedOn ? formatDate(row.expectedOn) : null,
    lines: row.lines.map((l) => {
      const item = items.get(l.itemId) ?? UNKNOWN;
      return {
        id: l.id,
        itemId: l.itemId,
        sku: item.sku,
        itemName: item.name,
        unit: item.unit,
        orderedQty: l.quantity,
        receivedQty: l.receivedQty,
        remainingQty: l.quantity - l.receivedQty,
        unitPriceMinor: Number(l.unitPriceMinor),
        totalMinor: Number(lineTotal(l)),
      };
    }),
    receipts: row.receipts.map((r) => ({
      id: r.id,
      receivedOn: formatDate(r.receivedOn),
      lines: r.lines as unknown as ReceiptLineDto[],
      receivedById: r.receivedById,
      createdAt: r.createdAt.toISOString(),
    })),
    expenseId,
    createdAt: row.createdAt.toISOString(),
  };
}
