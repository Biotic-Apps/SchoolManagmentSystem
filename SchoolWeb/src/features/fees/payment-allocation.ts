import type { Invoice } from "./types";

export interface AllocationRow {
  invoice: Invoice;
  allocatedMinor: number;
}

export interface AllocationPreview {
  rows: AllocationRow[];
  allocatedMinor: number;
  advanceMinor: number;
}

/** Oldest due date first; a chosen invoice always goes to the front. */
export function orderForAllocation(invoices: Invoice[], firstInvoiceId?: string): Invoice[] {
  return [...invoices].sort((a, b) => {
    if (a.id === firstInvoiceId) return -1;
    if (b.id === firstInvoiceId) return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/** Mirrors the API default: fill each invoice's balance in order, keep the rest as advance credit. */
export function allocateOldestFirst(invoices: Invoice[], amountMinor: number, firstInvoiceId?: string): AllocationPreview {
  let left = Math.max(0, amountMinor);
  const rows = orderForAllocation(invoices, firstInvoiceId).map((invoice) => {
    const allocatedMinor = Math.min(left, invoice.balanceMinor);
    left -= allocatedMinor;
    return { invoice, allocatedMinor };
  });
  return { rows, allocatedMinor: Math.max(0, amountMinor) - left, advanceMinor: left };
}
