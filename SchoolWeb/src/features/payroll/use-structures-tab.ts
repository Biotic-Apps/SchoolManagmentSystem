import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useStaffList } from "@/features/staff/api";
import type { StaffSummary } from "@/features/staff/types";

/** Staff of the branch; selecting one opens their salary structure. */
export function useStructuresTab(branchId: string | null) {
  const list = useListState<{ status?: string }>({ status: "ACTIVE" });
  const query = useStaffList({ ...list.params, branchId }, !!branchId);
  const drawer = useDialogState<StaffSummary>();
  return {
    list,
    query,
    rows: query.data?.data,
    loading: !branchId || query.isLoading,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    drawer,
  };
}
