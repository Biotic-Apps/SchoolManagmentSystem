"use client";

import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { formatDate } from "@/lib/format";
import type { InvoicePayment } from "../../types";
import { FileLinkButton } from "../payments/FileLinkButton";

/** Payments allocated to the invoice, each with its receipt. */
export function ParentInvoicePayments({ payments, currency }: { payments: InvoicePayment[]; currency: string }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionHeading title="Payments" />
      {payments.length === 0 ? (
        <p className="text-label text-fg-muted">No payments against this invoice yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border text-label">
          {payments.map((payment) => (
            <li key={payment.paymentId} className="flex flex-wrap items-center justify-between gap-3 py-2">
              <span className="flex flex-col">
                <span className="font-medium text-fg">{payment.receiptNo}</span>
                <span className="text-caption text-fg-muted">{formatDate(payment.paidOn)}</span>
              </span>
              <span className="flex items-center gap-3">
                <MoneyText amountMinor={payment.amountMinor} currency={currency} />
                <FileLinkButton path={`/payments/${payment.paymentId}/receipt`} label="Receipt" size="sm" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
