import { useState } from "react";
import { useIsParent } from "@/features/auth/use-active-child";
import { useCan, useCurrentUserId } from "@/features/auth/use-can";
import { ApiError, hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { useCertificateAction } from "./api";
import { clearanceFrom } from "./clearance";
import type { Certificate, ClearanceDetails } from "./types";

export type CertificateDialog = "reject" | "reissue" | "issue";

function jobIdOf(result: unknown): string | null {
  const jobId = (result as { jobId?: unknown } | null)?.jobId;
  return typeof jobId === "string" ? jobId : null;
}

/** Drawer actions for one certificate; keyed by id so state starts clean per certificate. */
export function useCertificateDetail(certificate: Certificate) {
  const can = useCan();
  const userId = useCurrentUserId();
  const isParent = useIsParent();
  const action = useCertificateAction(certificate.id);
  const [dialog, setDialog] = useState<CertificateDialog | null>(null);
  const [clearance, setClearance] = useState<ClearanceDetails | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const staff = !isParent;
  const status = certificate.status;
  // The API refuses a decision on your own request (four-eyes); say so instead of offering Approve.
  const mayDecide = staff && can("certificates.approve") && status === "REQUESTED";
  const ownRequest = mayDecide && !!userId && certificate.requestedBy?.id === userId;
  const onJob = (result: unknown) => {
    setDialog(null);
    setJobId(jobIdOf(result));
  };
  // Clearance blocks show in the drawer; anything else is a toast.
  const onBlocked = (error: unknown) => {
    setDialog(null);
    if (hasErrorCode(error, "CLEARANCE_REQUIRED")) {
      setClearance(clearanceFrom(error instanceof ApiError ? error.details : null));
    } else toast.error(errorMessage(error));
  };

  return {
    rights: {
      approve: mayDecide && !ownRequest,
      issue: staff && can("certificates.add") && status === "APPROVED",
      reissue: staff && can("certificates.add") && status === "ISSUED",
    },
    ownRequest,
    dialog,
    openDialog: setDialog,
    closeDialog: () => {
      setDialog(null);
      action.reset();
    },
    acting: action.isPending,
    pendingAction: action.isPending ? action.variables?.action : undefined,
    dialogError: dialog && action.error ? errorMessage(action.error) : null,
    clearance,
    jobId,
    approve: () => action.mutate({ action: "approve" }, { onSuccess: () => setClearance(null), onError: onBlocked }),
    reject: (reason: string) => action.mutate({ action: "reject", reason }, { onSuccess: () => setDialog(null) }),
    issue: () => action.mutate({ action: "issue" }, { onSuccess: onJob, onError: onBlocked }),
    reissue: (reason: string) => action.mutate({ action: "reissue", reason }, { onSuccess: onJob }),
  };
}

export type CertificateDetail = ReturnType<typeof useCertificateDetail>;
