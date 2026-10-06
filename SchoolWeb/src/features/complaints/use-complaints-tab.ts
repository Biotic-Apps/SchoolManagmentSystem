import { useMemo } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { useComplaints } from "./api";
import { complaintColumns } from "./complaint-columns";
import type { ComplaintBox } from "./types";

type ComplaintFilters = { status?: string; category?: string };

export function useComplaintsTab(box: ComplaintBox) {
  const list = useListState<ComplaintFilters>({});
  const query = useComplaints({ ...list.params, box });
  const columns = useMemo(() => complaintColumns(), []);

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
  };
}
