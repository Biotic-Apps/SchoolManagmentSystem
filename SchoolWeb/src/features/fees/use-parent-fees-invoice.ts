import { useChildInvoice } from "./parent-api";
import type { Invoice } from "./types";

/** Full invoice (lines, payments) for the drawer; the list row shows until it loads. */
export function useParentFeesInvoice(listed: Invoice | null) {
  const query = useChildInvoice(listed?.id ?? null);
  const invoice = query.data ?? listed;
  return {
    invoice,
    query,
    lines: invoice?.lines ?? [],
    payments: invoice?.payments ?? [],
    canUploadProof: !!invoice && invoice.balanceMinor > 0 && invoice.status !== "CANCELLED",
  };
}
