"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { InvoicesTab } from "../../use-invoices-tab";

/** Bulk issue of the DRAFT invoices on the current page. */
export function InvoiceSelectionBar({ tab }: { tab: InvoicesTab }) {
  const { selection } = tab;
  if (selection.draftCount === 0) return null;
  const count = selection.selectedIds.length;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-label text-fg-muted">
        {count > 0 ? `${count} draft ${count === 1 ? "invoice" : "invoices"} selected` : "Select draft invoices to issue them"}
      </span>
      <div className="flex flex-wrap gap-2">
        {count > 0 ? (
          <Button variant="ghost" size="sm" onClick={selection.clear}>
            Clear
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={selection.selectAll}>
            Select all drafts ({selection.draftCount})
          </Button>
        )}
        <Button size="sm" disabled={count === 0} loading={tab.issuing} onClick={tab.issueSelected}>
          <Send />
          Issue selected
        </Button>
      </div>
    </div>
  );
}
