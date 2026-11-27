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
  // Unpaid invoices a parent can settle, oldest due date first.
  const payable = rows
    .filter((invoice) => invoice.balanceMinor > 0 && invoice.status !== "CANCELLED" && invoice.status !== "DRAFT")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const onlineGateway = summary.data?.onlineGatewayEnabled ? (summary.data.onlineGateway ?? null) : null;
  return {
    child,
    summary,
    invoices,
    rows,
    hasOpenInvoice: payable.length > 0,
    payable,
    /** The branch's wallet (JAZZCASH, EASYPAISA, MANUAL), or null when online payment is off. */
    onlineGateway,
    invoiceColumns,
    proofs,
    proofCols,
    // null: the API keeps the proof list to staff, so the section is hidden.
    showProofs: proofs.data !== null && !proofs.isLoading,
    detail,
    upload,
  };
}
