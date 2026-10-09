import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import { inventoryKeys } from "./keys";
import type { InventoryItem, InventoryItemInput } from "./types";

export function useItems(params: Query, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.items(params),
    queryFn: () => http.get<InventoryItem[]>("/inventory/items", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Every item of the branch, for pickers and name lookups. */
export function useItemCatalog(branchId: string | null) {
  const query = useItems({ branchId, page: 1, pageSize: 100 }, !!branchId);
  return { ...query, items: query.data?.data ?? [] };
}

export function useCreateItem() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: InventoryItemInput) => (await http.post<InventoryItem>("/inventory/items", input)).data,
      (item) => item.id,
    ),
    invalidate: [inventoryKeys.all],
    success: (item) => `${item.name} added`,
    toastError: false,
  });
}
