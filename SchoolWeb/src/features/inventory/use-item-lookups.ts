import { useMemo } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { EMPTY_VALUE } from "@/lib/format";
import { useItemCatalog } from "./items-api";
import type { InventoryItem } from "./types";

function itemOption(item: InventoryItem): Option {
  return { id: item.id, name: item.sku ? `${item.name} (${item.sku})` : item.name };
}

/** Branch item catalog as select options and an id → item lookup. */
export function useItemLookups(branchId: string | null) {
  const catalog = useItemCatalog(branchId);
  const { items } = catalog;

  return useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return {
      isLoading: catalog.isLoading,
      byId,
      itemOptions: items.map(itemOption),
      assetOptions: items.filter((item) => item.isAsset).map(itemOption),
      saleableOptions: items.filter((item) => item.saleable).map(itemOption),
      itemName: (itemId: string, nested?: { name?: string } | null) =>
        nested?.name ?? byId.get(itemId)?.name ?? EMPTY_VALUE,
    };
  }, [items, catalog.isLoading]);
}

export type ItemLookups = ReturnType<typeof useItemLookups>;
