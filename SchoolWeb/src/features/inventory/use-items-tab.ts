import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { itemColumns } from "./item-columns";
import { useItems } from "./items-api";

export function useItemsTab(branchId: string, schoolId: string | null) {
  const can = useCan();
  const list = useListState<{ category?: string }>({});
  const query = useItems({ ...list.params, branchId });
  const columns = useMemo(() => itemColumns(), []);

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer: useDialogState<true>(),
    canAdd: can("inventory.add") && !!schoolId,
  };
}
