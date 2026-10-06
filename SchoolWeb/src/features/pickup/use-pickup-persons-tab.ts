import { useMemo, useState } from "react";
import { useIsParent } from "@/features/auth/use-active-child";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { usePickupPersonAction, usePickupPersons } from "./api";
import { pickupPersonColumns } from "./pickup-person-columns";
import type { PickupPerson } from "./types";

/** Authorized pickup persons of a student: office verifies / revokes, parents add new ones. */
export function usePickupPersonsTab(studentId: string, readOnly: boolean) {
  const can = useCan();
  const isParent = useIsParent();
  const query = usePickupPersons(studentId);
  const action = usePickupPersonAction();
  const verifyTarget = useDialogState<PickupPerson>();
  const revokeTarget = useDialogState<PickupPerson>();
  const [adding, setAdding] = useState(false);

  const canManage = !readOnly && !isParent && can("pickup.edit");
  const { show: showVerify } = verifyTarget;
  const { show: showRevoke } = revokeTarget;
  const columns = useMemo(
    () => pickupPersonColumns(canManage ? { onVerify: showVerify, onRevoke: showRevoke } : null),
    [canManage, showVerify, showRevoke],
  );

  return {
    query,
    columns,
    canAdd: isParent,
    adding,
    setAdding,
    verifyTarget,
    revokeTarget,
    acting: action.isPending,
    confirmVerify: () => {
      if (verifyTarget.item) action.mutate({ id: verifyTarget.item.id, action: "verify" }, { onSuccess: verifyTarget.close });
    },
    confirmRevoke: (reason: string) => {
      if (revokeTarget.item)
        action.mutate({ id: revokeTarget.item.id, action: "revoke", reason }, { onSuccess: revokeTarget.close });
    },
  };
}
