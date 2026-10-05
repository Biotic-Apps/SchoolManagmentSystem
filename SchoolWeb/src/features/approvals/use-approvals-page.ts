import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useApprovals } from "./api";
import type { ApprovalRequest } from "./types";

type ApprovalFilters = { status?: string; type?: string };

export function useApprovalsPage() {
  const list = useListState<ApprovalFilters>({ status: "PENDING", type: undefined });
  const query = useApprovals(list.params);
  const detail = useDialogState<ApprovalRequest>();

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    detail,
  };
}
