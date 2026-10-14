import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
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

/** The create carries `branchId` in the body (CreateAssetDto); edits never move an asset. */
export function useSaveAsset(branchId: string, assetId: string | null) {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: AssetInput) => {
        const result = assetId
          ? await http.patch<Asset>(`/assets/${assetId}`, input)
          : await http.post<Asset>("/assets", { ...input, branchId });
        return result.data;
      },
      (asset) => assetId ?? asset.id,
    ),
    invalidate: [inventoryKeys.all],
    success: assetId ? "Asset updated" : "Asset added",
    toastError: false,
  });
}
