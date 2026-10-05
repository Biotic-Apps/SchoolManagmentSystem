import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { subjectColumns } from "./subject-columns";
import { useSubjects } from "./subjects-api";
import type { Subject } from "./types";

export function useSubjectsTab(schoolId: string) {
  const can = useCan();
  const list = useListState({});
  const query = useSubjects({ ...list.params, schoolId });
  const form = useDialogState<Subject>();
  const canEdit = can("classes.edit");

  const columns = useMemo(() => subjectColumns(canEdit ? form.show : undefined), [canEdit, form.show]);

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd: can("classes.add"),
    form,
  };
}
