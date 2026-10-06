import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, request, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { inventoryKeys } from "./keys";
import type { Asset, AssetInput } from "./types";

export function useAssets(params: Query, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.assets(params),
    queryFn: () => http.get<Asset[]>("/assets", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The contract scopes the create by `?branchId=` like the list. */
export function useSaveAsset(branchId: string, assetId: string | null) {
  return useApiMutation({
    mutationFn: async (input: AssetInput) => {
      const result = assetId
        ? await http.patch<Asset>(`/assets/${assetId}`, input)
        : await request<Asset>("/assets", { method: "POST", body: input, query: { branchId } });
      return result.data;
    },
    invalidate: [inventoryKeys.all],
    success: assetId ? "Asset updated" : "Asset added",
    toastError: false,
  });
}
