import type { PurchaseOrderStatus } from '../../../generated/prisma/client';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { sumMinor } from '../../finance-core/money';

export interface PricedLine {
  quantity: number;
  unitPriceMinor: bigint;
}

export interface OrderLineState extends PricedLine {
  itemId: string;
  receivedQty: number;
}

export interface QtyLine {
  itemId: string;
  quantity: number;
}

export const lineTotal = (line: PricedLine): bigint =>
  BigInt(line.quantity) * line.unitPriceMinor;

/** Σ quantity × unit price (ordered or estimated). */
export const orderTotal = (lines: readonly PricedLine[]): bigint =>
  sumMinor(lines.map(lineTotal));

/** Σ received quantity × unit price: the amount a vendor bill may claim. */
export const receivedTotal = (lines: readonly OrderLineState[]): bigint =>
  sumMinor(lines.map((l) => lineTotal({ ...l, quantity: l.receivedQty })));

/** Each item at most once per request/order/receipt (400). */
export function assertUniqueItems(lines: readonly { itemId: string }[]): void {
  const seen = new Set<string>();
  for (const line of lines) {
    if (seen.has(line.itemId)) {
      throw invalid('Each item may appear only once', { itemId: line.itemId });
    }
    seen.add(line.itemId);
  }
}

export interface ReceiptPlan {
  /** Quantity received now per item (only positive entries). */
  received: Map<string, number>;
  status: Extract<PurchaseOrderStatus, 'PARTIALLY_RECEIVED' | 'RECEIVED'>;
}

/**
 * Validates a goods receipt against the order: known items (400) and never
 * more than the remaining quantity per line (409).
 */
export function planReceipt(
  lines: readonly OrderLineState[],
  receipt: readonly QtyLine[],
): ReceiptPlan {
  assertUniqueItems(receipt);
  const byItem = new Map(lines.map((l) => [l.itemId, l]));
  const received = new Map<string, number>();
  for (const entry of receipt) {
    const line = byItem.get(entry.itemId);
    if (!line) {
      throw invalid('Item is not on this order', { itemId: entry.itemId });
    }
    const remaining = line.quantity - line.receivedQty;
    if (entry.quantity > remaining) {
      throw conflict('Received quantity exceeds the remaining quantity', {
        itemId: entry.itemId,
        remaining,
        requested: entry.quantity,
      });
    }
    if (entry.quantity > 0) received.set(entry.itemId, entry.quantity);
  }
  if (received.size === 0) throw invalid('Nothing to receive');
  const complete = lines.every(
    (l) => l.receivedQty + (received.get(l.itemId) ?? 0) >= l.quantity,
  );
  return { received, status: complete ? 'RECEIVED' : 'PARTIALLY_RECEIVED' };
}
