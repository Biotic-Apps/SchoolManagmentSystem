"use client";

import { CreditCard, Upload } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { useOnlinePaymentsForInvoice } from "../../online-payments-api";
import type { Invoice } from "../../types";
import { useParentFeesInvoice } from "../../use-parent-fees-invoice";
import { OnlinePaymentHistory } from "./OnlinePaymentHistory";
import { FileLinkButton } from "../payments/FileLinkButton";
import { ParentInvoiceLines } from "./ParentInvoiceLines";
import { ParentInvoicePayments } from "./ParentInvoicePayments";

interface ParentInvoiceDrawerProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadProof: (invoiceId: string) => void;
  onPayOnline: (invoice: Invoice) => void;
}

export function ParentInvoiceDrawer({ invoice: listed, open, onOpenChange, onUploadProof, onPayOnline }: ParentInvoiceDrawerProps) {
  const { invoice, lines, payments, canUploadProof } = useParentFeesInvoice(open ? listed : null);
  const onlinePayments = useOnlinePaymentsForInvoice(open && invoice ? invoice.id : null);
  const canPayOnline = !!invoice && invoice.balanceMinor > 0 && invoice.status !== "CANCELLED";

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={invoice ? `Invoice ${invoice.invoiceNo}` : "Invoice"}
      description={invoice && <StatusBadge status={invoice.status} />}
      actions={
        invoice && (
          <>
            <FileLinkButton key={invoice.id} path={`/invoices/${invoice.id}/pdf`} label="Download challan" />
            {canPayOnline && (
              <Button variant="primary" onClick={() => onPayOnline(invoice)}>
                <CreditCard />
                Pay Online
              </Button>
            )}
            {canUploadProof && (
              <Button variant="secondary" onClick={() => onUploadProof(invoice.id)}>
                <Upload />
                Upload payment proof
              </Button>
            )}
          </>
        )
      }
    >
      {invoice && (
        <>
          <DetailList
            items={[
              { label: "Month", value: formatPeriod(invoice.period) },
              { label: "Due date", value: formatDate(invoice.dueDate) },
              { label: "Total", value: <MoneyText amountMinor={invoice.totalMinor} currency={invoice.currency} /> },
              { label: "Paid", value: <MoneyText amountMinor={invoice.paidMinor} currency={invoice.currency} /> },
              {
                label: "Balance",
                value: <MoneyText amountMinor={invoice.balanceMinor} currency={invoice.currency} className="font-semibold" />,
              },
            ]}
          />
          <ParentInvoiceLines invoice={invoice} lines={lines} />
          <ParentInvoicePayments payments={payments} currency={invoice.currency} />
          {onlinePayments.data && onlinePayments.data.length > 0 && (
            <OnlinePaymentHistory payments={onlinePayments.data} currency={invoice.currency} />
          )}
        </>
      )}
    </DetailDrawer>
  );
}
