import { useState } from "react";
import { useIsParent } from "@/features/auth/use-active-child";
import { useCan } from "@/features/auth/use-can";
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
  const isParent = useIsParent();
  const action = useCertificateAction(certificate.id);
  const [dialog, setDialog] = useState<CertificateDialog | null>(null);
  const [clearance, setClearance] = useState<ClearanceDetails | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const staff = !isParent;
  const status = certificate.status;
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
      approve: staff && can("certificates.approve") && status === "REQUESTED",
      issue: staff && can("certificates.add") && status === "APPROVED",
      reissue: staff && can("certificates.add") && status === "ISSUED",
    },
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
