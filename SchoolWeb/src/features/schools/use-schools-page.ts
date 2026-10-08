import { useCallback, useMemo } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useSchools } from "./api";
import { schoolColumns } from "./school-columns";
import type { School } from "./types";

export function useSchoolsPage() {
  const can = useCan();
  const isSuperAdmin = useSession().session?.activeRole === "SUPER_ADMIN";
  const list = useListState<{ status?: string }>({ status: undefined });
  const query = useSchools(list.params);
  const form = useDialogState<School>();
  const statusTarget = useDialogState<School>();
  const detail = useDialogState<School>();
  const deleteTarget = useDialogState<School>();
  const setup = useDialogState<never>();

  // One-form provisioning creates the branch and principal too, so it needs all three grants.
  const canSetup = isSuperAdmin && can("schools.add") && can("branches.add") && can("users.add");
  const canEdit = can("schools.edit");
  const canArchive = can("schools.delete");
  const canDelete = isSuperAdmin && canArchive;

  const columns = useMemo(
    () =>
      schoolColumns({
        onView: detail.show,
        onEdit: canEdit ? form.show : undefined,
        onToggleStatus: statusTarget.show,
        onDelete: canDelete ? deleteTarget.show : undefined,
        canArchive,
        canActivate: canEdit,
      }),
    [detail.show, form.show, statusTarget.show, deleteTarget.show, canEdit, canArchive, canDelete],
  );

  const closeDetail = detail.close;
  const closeDelete = deleteTarget.close;
  const onDeleted = useCallback(() => {
    closeDelete();
    closeDetail();
  }, [closeDelete, closeDetail]);

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canSetup,
    canEdit,
    canDelete,
    setup,
    form,
    statusTarget,
    detail,
    deleteTarget,
    onDeleted,
  };
}
