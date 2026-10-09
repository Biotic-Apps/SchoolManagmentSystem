import { formatMinor } from '../../finance-core/money';

/** The two halves of an A4 receipt page, top then bottom. */
export const RECEIPT_COPIES = ['School copy', 'Student copy'];

export interface ReceiptData {
  schoolName: string;
  branchLine: string;
  receiptNo: string;
  /** Already formatted, e.g. `09-Oct-2026`. */
  receivedOn: string;
  studentName: string;
  admissionNo: string;
  classLabel: string;
  method: string;
  reference: string | null;
  amountMinor: bigint;
  advanceMinor: bigint;
  refundedMinor: bigint;
  /** Student ledger balance when printed (negative = advance credit). */
  balanceMinor: bigint;
  currency: string;
  receivedBy: string;
  allocations: {
    invoiceNo: string;
    period: string;
    amountMinor: bigint;
    reversed: boolean;
  }[];
  reversed: boolean;
  reversalReason: string | null;
  amountInWords: string;
  footer: string;
}

export type ReceiptRow = [label: string, amount: string];

/**
 * What the money paid for: invoice rows, advance and refunds (shared by both
 * layouts). Invoices beyond `maxInvoices` fold into one "N more" row.
 */
export function receiptRows(
  data: ReceiptData,
  maxInvoices = Infinity,
): ReceiptRow[] {
  const money = (value: bigint) => formatMinor(value, data.currency);
  const fold = data.allocations.length > maxInvoices;
  const shown = fold
    ? data.allocations.slice(0, maxInvoices - 1)
    : data.allocations;
  const rows: ReceiptRow[] = shown.map((a) => [
    [a.invoiceNo, a.period].filter(Boolean).join(' · ') +
      (a.reversed ? ' (reversed)' : ''),
    money(a.amountMinor),
  ]);
  if (fold) {
    const rest = data.allocations.slice(maxInvoices - 1);
    const total = rest
      .filter((a) => !a.reversed)
      .reduce((sum, a) => sum + a.amountMinor, 0n);
    rows.push([`${rest.length} more invoices`, money(total)]);
  }
  if (data.advanceMinor > 0n)
    rows.push(['Advance credit', money(data.advanceMinor)]);
  if (data.refundedMinor > 0n)
    rows.push(['Refunded from advance', money(data.refundedMinor)]);
  return rows;
}

/** "Balance due" line under the total (credit shows as advance). */
export function balanceLine(data: ReceiptData): ReceiptRow {
  const money = (value: bigint) => formatMinor(value, data.currency);
  return data.balanceMinor < 0n
    ? ['Advance credit left', money(-data.balanceMinor)]
    : ['Balance due', money(data.balanceMinor)];
}
