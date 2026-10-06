import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDocuments, useRejectDocument, useVerifyDocument } from "./api";
import { documentColumns } from "./document-columns";
import { editPermission, verifyPermission } from "./options";
import type { DocumentOwnerType, SchoolDocument } from "./types";

interface PanelOptions {
  ownerType: DocumentOwnerType;
  ownerId: string;
  /** Force read-only (e.g. parent view, closed application). */
  readOnly?: boolean;
}

export function useDocumentsPanel({ ownerType, ownerId, readOnly }: PanelOptions) {
  const can = useCan();
  const query = useDocuments(ownerType, ownerId);
  const upload = useDialogState<true>();
  const verifyTarget = useDialogState<SchoolDocument>();
  const rejectTarget = useDialogState<SchoolDocument>();
  const verify = useVerifyDocument();
  const reject = useRejectDocument();
  const [rejectError, setRejectError] = useState<string | null>(null);

  const canUpload = !readOnly && can(editPermission(ownerType));
  const canVerify = !readOnly && can(verifyPermission(ownerType));

  const columns = useMemo(
    () =>
      documentColumns({
        onVerify: canVerify ? verifyTarget.show : undefined,
        onReject: canVerify ? rejectTarget.show : undefined,
      }),
    [canVerify, verifyTarget.show, rejectTarget.show],
  );

  const confirmVerify = (note: string) => {
    if (!verifyTarget.item) return;
    verify.mutate({ id: verifyTarget.item.id, note: note || undefined }, { onSuccess: verifyTarget.close });
  };

  const confirmReject = (reason: string) => {
    if (!rejectTarget.item) return;
    setRejectError(null);
    reject.mutate(
      { id: rejectTarget.item.id, reason },
      { onSuccess: rejectTarget.close, onError: (error) => setRejectError(errorMessage(error)) },
    );
  };

  return {
    query,
    rows: query.data,
    columns,
    canUpload,
    upload,
    verifyTarget,
    rejectTarget,
    confirmVerify,
    confirmReject,
    verifying: verify.isPending,
    rejecting: reject.isPending,
    rejectError,
  };
}
