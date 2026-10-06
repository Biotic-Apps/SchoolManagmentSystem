import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useApplications } from "./api";
import { applicationColumns } from "./application-columns";

type ApplicationFilters = { status?: string };

export function useApplicationsTab(scope: AcademicScope) {
  const can = useCan();
  const list = useListState<ApplicationFilters>({});
  const { branchId, sessionId, classId } = scope;
  const query = useApplications({ ...list.params, branchId, sessionId, classId }, !!branchId && !!sessionId);
  const form = useDialogState<true>();
  const columns = useMemo(() => applicationColumns(), []);

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd: can("admissions.add") && !!sessionId,
    form,
    formContext: branchId && sessionId ? { branchId, sessionId, classId } : null,
  };
}
