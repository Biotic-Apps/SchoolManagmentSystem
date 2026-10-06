import { useMemo } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { assignmentColumns } from "./assignment-columns";
import { useEndStaffAssignment, useStaffAssignments } from "./api";
import type { StaffAssignment } from "./types";
import { useStaffSession } from "./use-staff-session";

export function useAssignmentsTab(staffId: string, branchId: string | null, canEdit: boolean) {
  const session = useStaffSession(branchId);
  const query = useStaffAssignments(staffId, session.sessionId);
  const add = useDialogState<true>();
  const endTarget = useDialogState<StaffAssignment>();
  const end = useEndStaffAssignment(staffId);

  const columns = useMemo(() => assignmentColumns(canEdit ? endTarget.show : undefined), [canEdit, endTarget.show]);

  const confirmEnd = () => {
    if (endTarget.item) end.mutate(endTarget.item.id, { onSuccess: endTarget.close });
  };

  return {
    session,
    query,
    rows: session.sessionId ? query.data : [],
    loading: session.isLoading || query.isLoading,
    hasSessions: session.options.length > 0,
    columns,
    canAdd: canEdit && !!branchId && !!session.sessionId,
    add,
    endTarget,
    confirmEnd,
    ending: end.isPending,
  };
}
