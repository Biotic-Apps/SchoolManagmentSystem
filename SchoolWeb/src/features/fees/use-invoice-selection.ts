import { useState } from "react";
import type { Invoice } from "./types";

/** Checkbox selection of the DRAFT invoices on the current page (for bulk issue). */
export function useInvoiceSelection(rows: Invoice[] | undefined) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const draftIds = (rows ?? []).filter((row) => row.status === "DRAFT").map((row) => row.id);
  const selectedIds = draftIds.filter((id) => picked.has(id));

  const toggle = (id: string, checked: boolean) =>
    setPicked((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  return {
    selectedIds,
    draftCount: draftIds.length,
    isSelected: (id: string) => picked.has(id),
    toggle,
    selectAll: () => setPicked(new Set(draftIds)),
    clear: () => setPicked(new Set()),
  };
}

export type InvoiceSelection = ReturnType<typeof useInvoiceSelection>;
