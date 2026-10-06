import { useState } from "react";
import { errorMessage } from "@/lib/error-messages";
import { useServerForm } from "@/lib/use-server-form";
import { toVerifyInput, verifyProofDefaults, verifyProofSchema, type VerifyProofValues } from "./proof-schemas";
import { useRejectProof, useVerifyProof } from "./proofs-api";
import type { PaymentProof } from "./types";

export type ProofReviewDialog = "verify" | "reject";

/** Verify (creates the payment) or reject one submitted proof. */
export function useProofReview(proof: PaymentProof | null, onDone: () => void) {
  const [dialog, setDialog] = useState<ProofReviewDialog | null>(null);
  const verify = useVerifyProof();
  const reject = useRejectProof();

  const finish = () => {
    setDialog(null);
    onDone();
  };

  const verifyForm = useServerForm<VerifyProofValues>({
    schema: verifyProofSchema,
    defaultValues: verifyProofDefaults,
    onSubmit: (values) => verify.mutateAsync({ id: proof?.id ?? "", ...toVerifyInput(values) }),
    onSuccess: finish,
  });

  const closeDialog = (open: boolean) => {
    if (open) return;
    setDialog(null);
    reject.reset();
    verifyForm.form.reset(verifyProofDefaults);
  };

  return {
    dialog,
    openDialog: setDialog,
    closeDialog,
    verifyForm,
    reject: {
      submitting: reject.isPending,
      error: reject.error ? errorMessage(reject.error) : null,
      submit: (reason: string) => proof && reject.mutate({ id: proof.id, reason }, { onSuccess: finish }),
    },
    pending: proof?.status === "SUBMITTED",
  };
}
