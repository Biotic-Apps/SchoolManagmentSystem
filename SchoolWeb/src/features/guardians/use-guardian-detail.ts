import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useGuardian } from "./api";
import type { GuardianChild } from "./types";
import { useUnlink } from "./use-unlink";

export function useGuardianDetail(guardianId: string | null) {
  const can = useCan();
  const query = useGuardian(guardianId);
  const edit = useDialogState<true>();
  const linkChild = useDialogState<true>();
  const unlink = useUnlink();
  const guardian = query.data ?? null;
  const canEdit = can("guardians.edit");

  const children = (guardian?.children ?? []).filter((child) => child.status !== "REVOKED");

  const removeChild = (child: GuardianChild) => {
    if (!guardian) return;
    unlink.show({
      studentId: child.studentId,
      studentName: child.name,
      guardianId: guardian.id,
      guardianName: guardian.name,
      linkId: child.linkId,
    });
  };

  return {
    query,
    guardian,
    children,
    canEdit,
    canLinkChild: can("students.edit"),
    onUnlink: canEdit ? removeChild : undefined,
    edit,
    linkChild,
    unlink,
  };
}
