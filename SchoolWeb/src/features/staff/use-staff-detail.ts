import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useSession } from "@/features/auth/session-context";
import { useActiveBranches } from "@/features/branches/api";
import { useDialogState } from "@/lib/use-dialog-state";
import { useStaffMember } from "./api";
import { LEAVING_STATUSES } from "./options";
import type { StaffSummary } from "./types";

export type StaffTabId = "profile" | "assignments" | "workload" | "documents";

const PROBATION_ROLES = ["PRINCIPAL", "SUPER_ADMIN"];

/** StaffSummary.branchId is not in the contract; fall back to matching the branch name. */
export function useStaffBranchId(staff: Pick<StaffSummary, "branchId" | "branchName"> | undefined): string | null {
  const { branches } = useActiveBranches();
  if (!staff) return null;
  if (staff.branchId) return staff.branchId;
  return branches.find((branch) => branch.name === staff.branchName)?.id ?? null;
}

export function useStaffDetail(staffId: string) {
  const can = useCan();
  const { session } = useSession();
  const query = useStaffMember(staffId);
  const branchId = useStaffBranchId(query.data);
  const [tab, setTab] = useState<StaffTabId>("profile");
  const edit = useDialogState<true>();
  const status = useDialogState<true>();
  const probation = useDialogState<true>();
  const createSignIn = useDialogState<true>();
  const resetPassword = useDialogState<true>();

  const staff = query.data;
  const canEdit = can("staff.edit");
  const isActiveRecord = !!staff && !LEAVING_STATUSES.includes(staff.status);

  return {
    query,
    staff,
    branchId,
    tab,
    setTab: (value: string) => setTab(value as StaffTabId),
    canEdit,
    canEditAssignments: canEdit && isActiveRecord,
    canSetProbation: canEdit && PROBATION_ROLES.includes(session?.activeRole ?? ""),
    canCreateSignIn: canEdit && can("users.add") && isActiveRecord && !staff?.userId,
    canResetPassword: canEdit && can("users.edit") && !!staff?.userId,
    edit,
    status,
    probation,
    createSignIn,
    resetPassword,
  };
}
