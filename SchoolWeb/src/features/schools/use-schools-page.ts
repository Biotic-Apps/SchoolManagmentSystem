import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useSchools } from "./api";
import { schoolColumns } from "./school-columns";
import type { School } from "./types";

export function useSchoolsPage() {
  const can = useCan();
  const list = useListState<{ status?: string }>({ status: undefined });
  const query = useSchools(list.params);
  const form = useDialogState<School>();
  const statusTarget = useDialogState<School>();
  const detail = useDialogState<School>();

  const canAdd = can("schools.add");
  const canEdit = can("schools.edit");
  const canArchive = can("schools.delete");

  const columns = useMemo(
    () =>
      schoolColumns({
        onView: detail.show,
        onEdit: canEdit ? form.show : undefined,
        onToggleStatus: statusTarget.show,
        canArchive,
        canActivate: canEdit,
      }),
    [detail.show, form.show, statusTarget.show, canEdit, canArchive],
  );

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd,
    canEdit,
    form,
    statusTarget,
    detail,
  };
}
