import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useActivity, useChangeActivityStatus, useDecideActivity, type ActivityStatusChange } from "./api";
import { activityStepper } from "./options";

type ReasonAction = "reject" | "cancel" | null;

/** Detail drawer: review (approve/reject) and lifecycle (ongoing/completed/cancelled). */
export function useActivityDetail(id: string | null) {
  const can = useCan();
  const query = useActivity(id);
  const decide = useDecideActivity();
  const change = useChangeActivityStatus();
  const [reasonFor, setReasonFor] = useState<ReasonAction>(null);
  const activity = query.data ?? null;
  const status = activity?.status;
  const canEditStatus = can("activities.edit");

  const setStatus = (next: ActivityStatusChange, reason?: string) =>
    id && change.mutate({ id, status: next, reason }, { onSuccess: () => setReasonFor(null) });

  return {
    query,
    activity,
    stepper: status ? activityStepper(status) : null,
    canReview: can("activities.approve") && status === "PROPOSED",
    canEdit: can("activities.add") && status === "PROPOSED",
    canStart: canEditStatus && (status === "ANNOUNCED" || status === "APPROVED"),
    canComplete: canEditStatus && status === "ONGOING",
    canCancel: canEditStatus && !!status && !["COMPLETED", "CANCELLED", "REJECTED"].includes(status),
    showParticipants: !!status && ["ANNOUNCED", "APPROVED", "ONGOING", "COMPLETED"].includes(status),
    canEditParticipants: canEditStatus,
    pending: decide.isPending || change.isPending,
    approve: () => id && decide.mutate({ id, action: "approve" }),
    start: () => setStatus("ONGOING"),
    complete: () => setStatus("COMPLETED"),
    reasonFor,
    openReject: () => setReasonFor("reject"),
    openCancel: () => setReasonFor("cancel"),
    closeReason: () => setReasonFor(null),
    confirmReason: (reason: string) => {
      if (!id) return;
      if (reasonFor === "cancel") setStatus("CANCELLED", reason);
      else decide.mutate({ id, action: "reject", reason }, { onSuccess: () => setReasonFor(null) });
    },
  };
}

export type ActivityDetailState = ReturnType<typeof useActivityDetail>;
