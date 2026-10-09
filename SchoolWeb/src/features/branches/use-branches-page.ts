import { useMemo } from "react";
import { useSchoolOptions } from "@/features/schools/api";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useBranches } from "./api";
import { branchColumns } from "./branch-columns";
import type { Branch } from "./types";
import { useBranchDeepLink } from "./use-branch-deep-link";
import { useBranchPermissions } from "./use-branch-permissions";

export function useBranchesPage() {
  const perms = useBranchPermissions();
  const list = useListState<{ status?: string; schoolId?: string }>({ status: undefined, schoolId: undefined });
  const query = useBranches(list.params);
  const schools = useSchoolOptions(perms.canFilterSchools);
  const form = useDialogState<Branch>();
  const statusTarget = useDialogState<Branch>();
  const principal = useDialogState<Branch>();
  const settings = useDialogState<Branch>();
  const timings = useDialogState<Branch>();
  const detail = useDialogState<Branch>();
  useBranchDeepLink(detail.show);

  const showSchool = schools.options.length > 1;
  const columns = useMemo(
    () =>
      branchColumns(
        {
          onView: detail.show,
          onEdit: perms.canEdit ? form.show : undefined,
          onEditTimings: perms.canEditTimings ? timings.show : undefined,
          onToggleStatus: statusTarget.show,
          onChangePrincipal: perms.canChangePrincipal ? principal.show : undefined,
          onSettings: perms.canEditSettings ? settings.show : undefined,
          canArchive: perms.canArchive,
          canActivate: perms.canEdit,
        },
        showSchool,
      ),
    [detail.show, form.show, timings.show, statusTarget.show, principal.show, settings.show, perms, showSchool],
  );

  const rows = query.data?.data;
  // A principal usually runs one branch: offer "Edit timings" right in the page header.
  const ownBranch = perms.canEditTimings && rows?.length === 1 ? rows[0] : null;

  return {
    perms,
    list,
    query,
    rows,
    ownBranch,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    schoolOptions: schools.options,
    showSchoolFilter: showSchool,
    form,
    statusTarget,
    principal,
    settings,
    timings,
    detail,
  };
}

export type BranchesPageState = ReturnType<typeof useBranchesPage>;
