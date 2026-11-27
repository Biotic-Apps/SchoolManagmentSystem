import { useMemo } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { refundColumns } from "./collection-columns";
import { useRefunds } from "./refunds-api";

type RefundFilters = { status?: string };

/** Refund requests with their approval status (refunds are requested from a payment). */
export function useRefundsTab(branchId: string | null) {
  const list = useListState<RefundFilters>({});
  const query = useRefunds({ ...list.params, branchId }, !!branchId);
  const columns = useMemo(() => refundColumns({ withStatus: true }), []);

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
  };
}
