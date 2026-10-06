import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { assetColumns } from "./asset-columns";
import { useAssets } from "./assets-api";
import type { Asset } from "./types";
import { useItemLookups } from "./use-item-lookups";

export function useAssetsTab(branchId: string) {
  const can = useCan();
  const list = useListState({});
  const query = useAssets({ page: list.page, pageSize: 20, branchId });
  const lookups = useItemLookups(branchId);
  const columns = useMemo(() => assetColumns(lookups), [lookups]);
  const canEdit = can("inventory.edit");

  return {
    query,
    rows: query.data?.data,
    columns,
    lookups,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer: useDialogState<Asset>(),
    canEdit,
  };
}
