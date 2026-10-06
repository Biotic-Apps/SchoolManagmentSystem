import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { useCancelInvoice, useInvoice, useIssueInvoices } from "./invoices-api";
import { isCancellable, isPayable } from "./invoice-options";

export type InvoiceDialog = "cancel" | "payment" | "ledger";

export function useInvoiceDetail(id: string | null) {
  const can = useCan();
  const query = useInvoice(id);
  const issue = useIssueInvoices();
  const cancel = useCancelInvoice();
  const [dialog, setDialog] = useState<InvoiceDialog | null>(null);

  const invoice = query.data ?? null;
  const status = invoice?.status;

  return {
    query,
    invoice,
    student: invoice ? { id: invoice.student.id, name: invoice.student.name } : null,
    rights: {
      issue: can("fees.approve") && status === "DRAFT",
      pay: can("fees.add") && !!status && isPayable(status) && (invoice?.balanceMinor ?? 0) > 0,
      cancel: can("fees.edit") && !!status && isCancellable(status),
    },
    dialog,
    openDialog: setDialog,
    closeDialog: () => {
      setDialog(null);
      cancel.reset();
    },
    issuing: issue.isPending,
    issueInvoice: () => invoice && issue.mutate([invoice.id]),
    cancelling: cancel.isPending,
    cancelError: cancel.error ? errorMessage(cancel.error) : null,
    cancelInvoice: (reason: string) => {
      if (!invoice) return;
      const needsApproval = invoice.status === "ISSUED";
      cancel.mutate(
        { id: invoice.id, reason },
        {
          onSuccess: () => {
            if (needsApproval) toast.info("Sent for approval");
            else toast.success("Invoice cancelled");
            setDialog(null);
          },
        },
      );
    },
  };
}

export type InvoiceDetail = ReturnType<typeof useInvoiceDetail>;
