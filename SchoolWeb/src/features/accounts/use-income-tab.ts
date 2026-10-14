import { useMemo } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { incomeColumns } from "./income-columns";
import { useIncomeList } from "./income-api";
import { useIncomeLookups } from "./use-income-lookups";

type IncomeFilters = { categoryId?: string; from?: string; to?: string };

export function useIncomeTab(branchId: string | null, schoolId: string | null) {
  const list = useListState<IncomeFilters>({});
  const query = useIncomeList({ ...list.params, branchId }, !!branchId);
  const lookups = useIncomeLookups(schoolId);
  const columns = useMemo(() => incomeColumns(lookups), [lookups]);
  const composer = useDialogState<true>();

  const rows = query.data?.data;

  return {
    list,
    query,
    rows,
    columns,
    lookups,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer,
  };
}
