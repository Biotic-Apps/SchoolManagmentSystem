"use client";

import { FilePlus2, Plus, Printer } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { Button } from "@/components/ui/Button";
import { invoiceColumns } from "../../invoice-columns";
import { feesKeys } from "../../keys";
import { useInvoicesTab } from "../../use-invoices-tab";
import { ChallanPrintNotice } from "./ChallanPrintNotice";
import { GenerateInvoicesDialog } from "./GenerateInvoicesDialog";
import { InvoiceDetailDrawer } from "./InvoiceDetailDrawer";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceFormDialog } from "./InvoiceFormDialog";
import { InvoiceSelectionBar } from "./InvoiceSelectionBar";
import { PrintChallansDialog } from "./PrintChallansDialog";

interface InvoicesTabProps {
  branchId: string | null;
  schoolId: string | null;
}

export function InvoicesTab({ branchId, schoolId }: InvoicesTabProps) {
  const tab = useInvoicesTab({ branchId, schoolId });
  const columns = invoiceColumns(tab.canIssue ? tab.selection : null);

  if (!branchId) return <InlineNotice>Choose a branch to see its invoices.</InlineNotice>;

  return (
    <div className="flex flex-col gap-4">
      {(tab.canAdd || tab.canPrint) && (
        <div className="flex flex-wrap justify-end gap-2">
          {tab.canPrint && (
            <Button variant="secondary" onClick={() => tab.printDialog.show()}>
              <Printer />
              Print challans
            </Button>
          )}
          {tab.canAdd && (
            <>
              <Button variant="secondary" onClick={() => tab.createDialog.show()}>
                <Plus />
                New invoice
              </Button>
              <Button onClick={() => tab.generateDialog.show()}>
                <FilePlus2 />
                Generate invoices
              </Button>
            </>
          )}
        </div>
      )}
      <ChallanPrintNotice key={tab.printJob?.jobId} job={tab.printJob} />
      <JobProgressNotice
        jobId={tab.jobId}
        label="Generating invoices"
        doneLabel="Invoices generated. New drafts are in the list."
        invalidate={[feesKeys.all]}
      />
      <InvoiceFilters tab={tab} />
      {tab.canIssue && <InvoiceSelectionBar tab={tab} />}
      <DataTable
        columns={columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        onRowClick={(row) => tab.openInvoice(row.id)}
        pagination={tab.pagination}
        emptyTitle="No invoices for this month"
        emptyDescription="Generate invoices from the approved fee plans, or create one for a single student."
      />
      {tab.generateDialog.open && (
        <GenerateInvoicesDialog
          branchId={branchId}
          sessionId={tab.activeSessionId}
          period={tab.period}
          sessionOptions={tab.sessionOptions}
          classOptions={tab.classOptions}
          onStarted={tab.onGenerated}
          onClose={tab.generateDialog.close}
        />
      )}
      {tab.printDialog.open && (
        <PrintChallansDialog
          branchId={branchId}
          sessionId={tab.activeSessionId}
          period={tab.period}
          classId={tab.list.filters.classId}
          classOptions={tab.classOptions}
          onStarted={tab.onPrintStarted}
          onClose={tab.printDialog.close}
        />
      )}
      {tab.createDialog.open && (
        <InvoiceFormDialog
          branchId={branchId}
          schoolId={schoolId}
          onCreated={(invoice) => tab.openInvoice(invoice.id)}
          onClose={tab.createDialog.close}
        />
      )}
      <InvoiceDetailDrawer invoiceId={tab.openId} onClose={tab.closeInvoice} />
    </div>
  );
}
