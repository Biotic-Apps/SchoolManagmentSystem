import { invalid } from '../../../core/common/errors/errors';

export interface SaleItem {
  id: string;
  name: string;
  saleable: boolean;
  salePriceMinor: bigint | null;
}

export interface PricedSaleLine<T extends SaleItem> {
  item: T;
  quantity: number;
  amountMinor: bigint;
  description: string;
}

/**
 * Prices sale lines: items must be saleable with a price (400); lines are
 * returned in item-id order so stock locks are always taken in one order.
 */
export function priceSaleLines<T extends SaleItem>(
  items: ReadonlyMap<string, T>,
  lines: readonly { itemId: string; quantity: number }[],
): PricedSaleLine<T>[] {
  const priced = lines.map((line) => {
    const item = items.get(line.itemId);
    if (!item) throw invalid('Unknown item', { itemId: line.itemId });
    if (!item.saleable || item.salePriceMinor === null) {
      throw invalid(`${item.name} is not for sale`, { itemId: item.id });
    }
    return {
      item,
      quantity: line.quantity,
      amountMinor: BigInt(line.quantity) * item.salePriceMinor,
      description: `${item.name} x ${line.quantity}`,
    };
  });
  return priced.sort((a, b) => a.item.id.localeCompare(b.item.id));
}
