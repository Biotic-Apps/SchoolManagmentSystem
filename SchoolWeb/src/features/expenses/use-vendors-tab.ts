import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { vendorColumns } from "./catalog-columns";
import { useVendors } from "./vendors-api";

export function useVendorsTab() {
  const can = useCan();
  const list = useListState({});
  const query = useVendors(list.params);
  const columns = useMemo(() => vendorColumns(), []);

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer: useDialogState<true>(),
    canAdd: can("expenses.add"),
  };
}
