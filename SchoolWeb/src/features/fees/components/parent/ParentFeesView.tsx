"use client";

import { CreditCard, Upload } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { errorMessage } from "@/lib/error-messages";
import { useDialogState } from "@/lib/use-dialog-state";
import type { Invoice } from "../../types";
import { useParentFees } from "../../use-parent-fees";
import { FeeSummaryCards } from "../ledger/FeeSummaryCards";
import { ParentInvoiceDrawer } from "./ParentInvoiceDrawer";
import { ParentProofsSection } from "./ParentProofsSection";
import { PayOnlineDialog } from "./PayOnlineDialog";
import { UploadProofDialog } from "./UploadProofDialog";

/** PARENT: invoices, receipts and payment proofs of the child picked in the Topbar. */
export function ParentFeesView() {
  const fees = useParentFees();
  const { child, summary, invoices, proofs, detail, upload } = fees;
  const payOnline = useDialogState<Invoice>();

  const { payable, onlineGateway } = fees;

  const actions = fees.hasOpenInvoice && (
    <div className="flex gap-2">
      {onlineGateway && (
        // Starts with the oldest unpaid invoice; the dialog lets the parent pick another.
        <Button variant="primary" onClick={() => payOnline.show(payable[0])}>
          <CreditCard />
          Pay Online
        </Button>
      )}
      <Button variant="secondary" onClick={() => upload.show()}>
        <Upload />
        Upload payment proof
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Fees, Dues & Receipts" description={child ? child.name : undefined} actions={actions} />
      {!child && <NoChildState description="Once your child link is verified, their fees and receipts appear here." />}
      {child && (
        <>
          {fees.hasOpenInvoice && summary.data && !onlineGateway && (
            <InlineNotice>
              Online payment is not available for this school yet. Pay at the school office or bank using the
              challan, then upload a payment proof.
            </InlineNotice>
          )}
          {summary.error ? (
            <InlineNotice tone="error">{errorMessage(summary.error)}</InlineNotice>
          ) : (
            <FeeSummaryCards summary={summary.data} loading={summary.isLoading} />
          )}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Invoices" />
            <DataTable
              columns={fees.invoiceColumns}
              rows={invoices.data}
              getRowId={(row) => row.id}
              loading={invoices.isLoading}
              error={invoices.error}
              onRetry={() => invoices.refetch()}
              onRowClick={detail.show}
              emptyTitle="No invoices yet"
              emptyDescription="Fee invoices issued by the school appear here."
            />
          </div>
          {fees.showProofs && (
            <ParentProofsSection
              rows={proofs.data ?? undefined}
              columns={fees.proofCols}
              loading={proofs.isLoading}
              error={proofs.error}
              onRetry={() => proofs.refetch()}
            />
          )}
        </>
      )}
      <ParentInvoiceDrawer
        invoice={detail.item}
        open={detail.open}
        onOpenChange={detail.onOpenChange}
        onlinePaymentEnabled={!!onlineGateway}
        onUploadProof={(invoiceId) => {
          detail.close();
          upload.show(invoiceId);
        }}
        onPayOnline={(invoice) => {
          detail.close();
          payOnline.show(invoice);
        }}
      />
      <UploadProofDialog
        invoices={fees.rows}
        invoiceId={upload.item ?? undefined}
        open={upload.open}
        onOpenChange={upload.onOpenChange}
      />
      <PayOnlineDialog
        invoice={payOnline.item}
        invoices={payable}
        gateway={onlineGateway}
        open={payOnline.open}
        onOpenChange={payOnline.onOpenChange}
      />
    </div>
  );
}
