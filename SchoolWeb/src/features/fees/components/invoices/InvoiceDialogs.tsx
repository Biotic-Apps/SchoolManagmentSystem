"use client";

import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { StudentLedgerDialog } from "@/features/fees/components/ledger/StudentLedgerDialog";
import { RecordPaymentDialog } from "@/features/fees/components/payments/RecordPaymentDialog";
import type { Invoice } from "../../types";
import type { InvoiceDetail } from "../../use-invoice-detail";

export function InvoiceDialogs({ detail, invoice }: { detail: InvoiceDetail; invoice: Invoice }) {
  const onOpenChange = (open: boolean) => !open && detail.closeDialog();
  return (
    <>
      <ReasonDialog
        open={detail.dialog === "cancel"}
        onOpenChange={onOpenChange}
        title={`Cancel ${invoice.invoiceNo}`}
        description={
          invoice.status === "ISSUED"
            ? "Issued invoices are cancelled only after approval."
            : "The draft is cancelled straight away."
        }
        submitLabel="Cancel invoice"
        submitting={detail.cancelling}
        error={detail.cancelError}
        onSubmit={detail.cancelInvoice}
      />
      <RecordPaymentDialog
        open={detail.dialog === "payment"}
        onOpenChange={onOpenChange}
        student={detail.student}
        invoiceId={invoice.id}
      />
      <StudentLedgerDialog student={detail.student} open={detail.dialog === "ledger"} onOpenChange={onOpenChange} />
    </>
  );
}
