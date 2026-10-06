import { useMemo } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { useGuardians } from "./api";
import { guardianColumns } from "./guardian-columns";

export function useGuardiansTab(branchId: string) {
  const list = useListState({});
  const query = useGuardians({ ...list.params, branchId });
  const columns = useMemo(() => guardianColumns(), []);

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
  };
}
