"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { PaymentForm } from "../../use-payment-form";

/** Where the payment goes: open invoices oldest due first, the rest kept as advance credit. */
export function PaymentAllocationPreview({ payment }: { payment: PaymentForm }) {
  const { invoices, invoicesQuery, preview, manual } = payment;
  if (!payment.hasStudent) return null;
  if (invoicesQuery.isLoading) return <Skeleton className="h-24 w-full" />;
  if (invoicesQuery.error) {
    return <InlineNotice tone="warning">Open invoices could not be loaded. The payment is allocated oldest due first.</InlineNotice>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-label font-medium text-fg">Allocation</span>
        {invoices.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox id="payment-manual" checked={manual} onCheckedChange={(checked) => payment.setManual(checked === true)} />
            <Label htmlFor="payment-manual">Allocate manually</Label>
          </div>
        )}
      </div>
      {invoices.length === 0 ? (
        <InlineNotice>No open invoices. The whole amount is kept as advance credit.</InlineNotice>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className={NUMERIC_COLUMN}>Balance</TableHead>
                <TableHead className={NUMERIC_COLUMN}>Allocated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.rows.map((row, index) => (
                <TableRow key={row.invoice.id}>
                  <TableCell className="whitespace-nowrap font-medium">{row.invoice.invoiceNo}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(row.invoice.dueDate)}</TableCell>
                  <TableCell className={NUMERIC_COLUMN}>
                    <MoneyText amountMinor={row.invoice.balanceMinor} />
                  </TableCell>
                  <TableCell className={NUMERIC_COLUMN}>
                    {manual ? (
                      <MoneyField name={`allocations.${index}.amount`} label={`Amount for ${row.invoice.invoiceNo}`} className="min-w-36 [&_label]:sr-only" />
                    ) : (
                      <MoneyText amountMinor={row.allocatedMinor} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 text-label">
        <span className="text-fg-muted">
          Allocated <MoneyText amountMinor={payment.allocatedMinor} className="font-medium text-fg" />
        </span>
        <span className="text-fg-muted">
          Advance credit <MoneyText amountMinor={payment.advanceMinor} className="font-medium text-fg" />
        </span>
      </div>
    </div>
  );
}
