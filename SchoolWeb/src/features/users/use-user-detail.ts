import { useCan, useCurrentUserId } from "@/features/auth/use-can";
import type { Assignment } from "@/features/auth/types";
import { useDialogState } from "@/lib/use-dialog-state";
import { useEndAssignment, useUser } from "./api";
import type { UserSummary } from "./types";

export function useUserDetail(user: UserSummary | null) {
  const can = useCan();
  const meId = useCurrentUserId();
  const query = useUser(user?.id ?? null);
  const endTarget = useDialogState<Assignment>();
  const addOpen = useDialogState<true>();
  const endAssignment = useEndAssignment(user?.id ?? "");

  const isSelf = !!user && user.id === meId;
  // Nobody edits their own assignments (contract §6).
  const canManageAssignments = can("users.edit") && !isSelf;

  const confirmEnd = () => {
    if (endTarget.item) endAssignment.mutate(endTarget.item.id, { onSuccess: endTarget.close });
  };

  const now = new Date().toISOString();
  const activeAssignments = (query.data?.assignments ?? []).filter(
    (assignment) => !assignment.validUntil || assignment.validUntil > now,
  );

  return {
    query,
    data: query.data,
    activeAssignments,
    canManageAssignments,
    endTarget,
    addOpen,
    confirmEnd,
    ending: endAssignment.isPending,
  };
}
