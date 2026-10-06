"use client";

import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { errorMessage } from "@/lib/error-messages";
import { useReversePayment } from "../../payments-api";
import type { Payment } from "../../types";

interface ReversePaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReversePaymentDialog({ payment, open, onOpenChange }: ReversePaymentDialogProps) {
  const reverse = useReversePayment();
  const change = (next: boolean) => {
    if (!next) reverse.reset();
    onOpenChange(next);
  };
  return (
    <ReasonDialog
      open={open}
      onOpenChange={change}
      title={`Reverse ${payment?.receiptNo ?? "payment"}`}
      description="The payment stays on record; after approval a reversing entry restores the invoice balances."
      submitLabel="Send for approval"
      submitting={reverse.isPending}
      error={reverse.error ? errorMessage(reverse.error) : null}
      onSubmit={(reason) => payment && reverse.mutate({ id: payment.id, reason }, { onSuccess: () => change(false) })}
    />
  );
}
