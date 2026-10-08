import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useClassesOverview } from "./overview-api";
import { subjectColumns } from "./subject-columns";
import { useSubjects } from "./subjects-api";
import type { Subject } from "./types";

export function useSubjectsTab(schoolId: string, branchId: string, sessionId: string | null) {
  const can = useCan();
  const list = useListState({});
  const query = useSubjects({ ...list.params, schoolId });
  const overview = useClassesOverview(branchId, sessionId);
  const form = useDialogState<Subject>();
  const canEdit = can("classes.edit");

  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of overview.data ?? []) {
      for (const subject of item.subjects) counts.set(subject.id, (counts.get(subject.id) ?? 0) + 1);
    }
    return counts;
  }, [overview.data]);

  const columns = useMemo(() => subjectColumns(canEdit ? form.show : undefined, usage), [canEdit, form.show, usage]);

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
