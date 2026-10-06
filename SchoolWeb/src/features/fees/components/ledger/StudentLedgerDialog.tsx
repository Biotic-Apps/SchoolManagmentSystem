"use client";

import { DataTable } from "@/components/shared/DataTable";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { errorMessage } from "@/lib/error-messages";
import { useLedgerDialog } from "../../use-ledger-dialog";
import { FeeSummaryCards } from "./FeeSummaryCards";

interface StudentLedgerDialogProps {
  student: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentLedgerDialog({ student, open, onOpenChange }: StudentLedgerDialogProps) {
  const { ledger, summary, columns } = useLedgerDialog(open ? (student?.id ?? null) : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Ledger · {student?.name}</DialogTitle>
          <DialogDescription>Every invoice, concession, payment and correction with the running balance.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {summary.error ? (
            <InlineNotice tone="error">{errorMessage(summary.error)}</InlineNotice>
          ) : (
            <FeeSummaryCards summary={summary.data} loading={summary.isLoading} />
          )}
          <DataTable
            columns={columns}
            rows={ledger.data}
            getRowId={(row) => row.id}
            loading={ledger.isLoading}
            error={ledger.error}
            onRetry={() => ledger.refetch()}
            emptyTitle="No ledger entries"
            emptyDescription="Issued invoices and payments appear here."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
