import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { concessionColumns } from "./concession-columns";
import { useConcessions } from "./concessions-api";

type ConcessionFilters = { status?: string };

export function useConcessionsTab(branchId: string | null) {
  const can = useCan();
  const list = useListState<ConcessionFilters>({});
  const query = useConcessions({ ...list.params, branchId }, !!branchId);
  const columns = useMemo(() => concessionColumns(), []);
  const request = useDialogState<null>();

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    request,
    canAdd: can("fees.add"),
  };
}
