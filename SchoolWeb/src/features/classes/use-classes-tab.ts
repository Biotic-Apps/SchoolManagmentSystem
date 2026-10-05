import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useClasses } from "./api";
import { classColumns } from "./class-columns";
import type { SchoolClass } from "./types";

export function useClassesTab(schoolId: string) {
  const can = useCan();
  const list = useListState({});
  const query = useClasses({ ...list.params, schoolId });
  const form = useDialogState<SchoolClass>();
  const subjects = useDialogState<SchoolClass>();
  const canEdit = can("classes.edit");

  const columns = useMemo(
    () => classColumns({ onEdit: canEdit ? form.show : undefined, onSubjects: canEdit ? subjects.show : undefined }),
    [canEdit, form.show, subjects.show],
  );

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd: can("classes.add"),
    form,
    subjects,
  };
}
