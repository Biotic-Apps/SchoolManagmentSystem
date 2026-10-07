import type { InventoryItem, StockRow } from "./types";

export interface StockLine {
  itemId: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number | null;
  low: boolean;
}

/** Flattens a stock row, filling item details from the catalog when only an id came back. */
export function toStockLine(row: StockRow, catalog: Map<string, InventoryItem>): StockLine {
  // The API nests the item ({ item: { id, ... } }); older payloads send a flat itemId.
  const itemId = row.itemId ?? row.item?.id ?? "";
  const item = { ...catalog.get(itemId), ...row.item };
  const quantity = Number(row.quantity) || 0;
  const reorderRaw = row.reorderLevel ?? item.reorderLevel;
  const reorderLevel = reorderRaw === undefined || reorderRaw === null ? null : Number(reorderRaw);
  return {
    itemId,
    name: row.name ?? item.name ?? "",
    sku: row.sku ?? item.sku ?? "",
    category: row.category ?? item.category ?? "",
    unit: row.unit ?? item.unit ?? "",
    quantity,
    reorderLevel,
    low: row.lowStock ?? (reorderLevel !== null && quantity <= reorderLevel),
  };
}
