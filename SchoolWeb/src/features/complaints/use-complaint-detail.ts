import { useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan, useCurrentUserId } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { useComplaint, useComplaintAction, type ComplaintAction } from "./api";
import { MAX_ESCALATION_LEVEL, isOpen } from "./status";
import type { ComplaintBox } from "./types";

export type ComplaintDialog = "assign" | "update" | ComplaintAction;

/** Principal / super admin may see who a complaint is about. */
const REGARDING_ROLES = new Set(["PRINCIPAL", "SUPER_ADMIN"]);

export function useComplaintDetail(id: string | null, box: ComplaintBox) {
  const can = useCan();
  const me = useCurrentUserId();
  const role = useSession().session?.activeRole ?? "";
  const query = useComplaint(id);
  const action = useComplaintAction(id ?? "");
  const [dialog, setDialog] = useState<ComplaintDialog | null>(null);

  const complaint = query.data ?? null;
  const status = complaint?.status;
  // Anonymous complainants get complainant=null back, so "My complaints" marks it as theirs.
  const isComplainant = !!complaint && (box === "mine" || (!!me && complaint.complainant?.id === me));
  const isAssignee = !!complaint && !!me && complaint.assignee?.id === me;
  const party = isComplainant || isAssignee;
  const live = !!status && status !== "CLOSED";

  return {
    query,
    complaint,
    showRegarding: REGARDING_ROLES.has(role) && !!complaint?.against,
    rights: {
      assign: can("complaints.edit") && live,
      update: party && live,
      setStatus: isAssignee,
      escalate: party && !!status && isOpen(status) && (complaint?.escalationLevel ?? 0) < MAX_ESCALATION_LEVEL,
      close: party && live,
      reopen: isComplainant && status === "RESOLVED",
    },
    dialog,
    openDialog: setDialog,
    closeDialog: () => {
      setDialog(null);
      action.reset();
    },
    acting: action.isPending,
    actionError: action.error ? errorMessage(action.error) : null,
    runAction: (kind: ComplaintAction, reason: string) =>
      action.mutate({ action: kind, reason: reason || undefined }, { onSuccess: () => setDialog(null) }),
  };
}

export type ComplaintDetail = ReturnType<typeof useComplaintDetail>;
