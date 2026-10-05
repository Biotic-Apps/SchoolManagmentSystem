import type { ApprovalDecision } from "@/components/shared/ApprovalActions";
import { useCan, useCurrentUserId } from "@/features/auth/use-can";
import { useDecideApproval } from "./api";
import type { ApprovalRequest } from "./types";

/** Who may decide: pending, holds approvals.approve, and is not the requester. */
export function useApprovalDecision(request: ApprovalRequest | null | undefined) {
  const can = useCan();
  const userId = useCurrentUserId();
  const mutation = useDecideApproval();

  const pending = request?.status === "PENDING";
  const ownRequest = !!request && request.requestedBy.id === userId;
  const allowed = pending && can("approvals.approve");

  const decide = (decision: ApprovalDecision, comment: string) => {
    if (!request) return;
    mutation.mutate({ id: request.id, input: { decision, ...(comment ? { comment } : {}) } });
  };

  return {
    showActions: allowed && !ownRequest,
    showOwnNotice: allowed && ownRequest,
    decide,
    pendingDecision: mutation.isPending ? (mutation.variables?.input.decision ?? null) : null,
  };
}
