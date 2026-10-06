"use client";

import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/cn";
import type { Invoice, InvoiceLine } from "../../types";

function Row({ label, amountMinor, currency, strong }: { label: string; amountMinor: number; currency: string; strong?: boolean }) {
  return (
    <li className={cn("flex items-start justify-between gap-4 py-2 text-fg", strong && "font-semibold")}>
      <span>{label}</span>
      <MoneyText amountMinor={amountMinor} currency={currency} className="shrink-0 text-right" />
    </li>
  );
}

/** Fee lines, then concession / late fee adjustments and the total. */
export function ParentInvoiceLines({ invoice, lines }: { invoice: Invoice; lines: InvoiceLine[] }) {
  const currency = invoice.currency;
  return (
    <div className="flex flex-col gap-2">
      <SectionHeading title="Fee details" />
      <ul className="flex flex-col divide-y divide-border text-label">
        {lines.map((line) => (
          <Row key={line.id} label={line.description || line.feeHead?.name || "Fee"} amountMinor={line.amountMinor} currency={currency} />
        ))}
        {invoice.concessionMinor > 0 && <Row label="Concession" amountMinor={-invoice.concessionMinor} currency={currency} />}
        {invoice.lateFeeMinor > 0 && <Row label="Late fee" amountMinor={invoice.lateFeeMinor} currency={currency} />}
        <Row label="Total" amountMinor={invoice.totalMinor} currency={currency} strong />
      </ul>
    </div>
  );
}
