import { useMemo } from "react";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useDialogState } from "@/lib/use-dialog-state";
import { useFeeSummary } from "./ledger-api";
import { useChildInvoices, useChildProofs } from "./parent-api";
import { parentInvoiceColumns } from "./parent-invoice-columns";
import { proofColumns } from "./proof-columns";
import type { Invoice } from "./types";

/** PARENT: fees of the child picked in the Topbar. */
export function useParentFees() {
  const child = useActiveChild();
  const studentId = child?.id ?? null;
  const summary = useFeeSummary(studentId);
  const invoices = useChildInvoices(studentId);
  const proofs = useChildProofs(studentId);

  const invoiceColumns = useMemo(() => parentInvoiceColumns(), []);
  const proofCols = useMemo(() => proofColumns({ withStudent: false }), []);
  const detail = useDialogState<Invoice>();
  const upload = useDialogState<string>();

  const rows = invoices.data ?? [];
  return {
    child,
    summary,
    invoices,
    rows,
    hasOpenInvoice: rows.some((invoice) => invoice.balanceMinor > 0),
    invoiceColumns,
    proofs,
    proofCols,
    // null: the API keeps the proof list to staff, so the section is hidden.
    showProofs: proofs.data !== null && !proofs.isLoading,
    detail,
    upload,
  };
}
