"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPeriod } from "@/lib/period";
import { useInvoiceDetail } from "../../use-invoice-detail";
import { InvoiceChallan } from "./InvoiceChallan";
import { InvoiceDetailActions } from "./InvoiceDetailActions";
import { InvoiceDialogs } from "./InvoiceDialogs";
import { InvoiceLinesTable } from "./InvoiceLinesTable";
import { InvoicePaymentsList } from "./InvoicePaymentsList";
import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceTotals } from "./InvoiceTotals";

interface InvoiceDetailDrawerProps {
  invoiceId: string | null;
  onClose: () => void;
}

export function InvoiceDetailDrawer({ invoiceId, onClose }: InvoiceDetailDrawerProps) {
  const detail = useInvoiceDetail(invoiceId);
  const { invoice, query } = detail;

  return (
    <DetailDrawer
      open={!!invoiceId}
      onOpenChange={(next) => {
        if (next) return;
        detail.closeDialog();
        onClose();
      }}
      title={invoice?.invoiceNo ?? "Invoice"}
      description={
        invoice && (
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={invoice.status} />
            <span>{formatPeriod(invoice.period)}</span>
          </span>
        )
      }
      actions={invoice && <InvoiceDetailActions detail={detail} />}
    >
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {invoice && (
        <>
          <InvoiceSummary invoice={invoice} />
          <section className="flex flex-col gap-3">
            <SectionHeading title="Lines" />
            <InvoiceLinesTable invoice={invoice} />
            <InvoiceTotals invoice={invoice} />
          </section>
          <section className="flex flex-col gap-3">
            <SectionHeading title="Payments" />
            <InvoicePaymentsList invoice={invoice} />
          </section>
          {invoice.status !== "CANCELLED" && (
            <section className="flex flex-col gap-3">
              <SectionHeading title="Challan" />
              <InvoiceChallan key={invoice.id} invoiceId={invoice.id} />
            </section>
          )}
          <InvoiceDialogs detail={detail} invoice={invoice} />
        </>
      )}
    </DetailDrawer>
  );
}
