import { formatDate } from '../../../core/common/dates';
import { formatMinor } from '../../finance-core/money';
import { PdfBuilder } from '../../generated-docs/pdf-builder';

export interface ReceiptData {
  schoolName: string;
  branchLine: string;
  receiptNo: string;
  receivedOn: Date;
  studentName: string;
  admissionNo: string;
  method: string;
  reference: string | null;
  amountMinor: bigint;
  advanceMinor: bigint;
  refundedMinor: bigint;
  currency: string;
  receivedBy: string;
  allocations: { invoiceNo: string; amountMinor: bigint; reversed: boolean }[];
  reversed: boolean;
  reversalReason: string | null;
  footer: string;
}

/** Payment receipt (contract B3); a reversed payment carries a REVERSED watermark. */
export async function renderReceipt(data: ReceiptData): Promise<Buffer> {
  const money = (value: bigint) => formatMinor(value, data.currency);
  const pdf = new PdfBuilder().header(
    data.schoolName,
    data.branchLine,
    'Payment Receipt',
  );
  if (data.reversed) pdf.watermark('REVERSED');
  pdf.fields([
    ['Receipt no', data.receiptNo],
    ['Date', formatDate(data.receivedOn)],
    ['Student', data.studentName],
    ['Admission no', data.admissionNo],
    ['Method', data.method],
    ['Reference', data.reference ?? '-'],
    ['Amount received', money(data.amountMinor)],
    ['Received by', data.receivedBy],
  ]);
  pdf.heading('Applied to invoices');
  const rows = data.allocations.map((a) => [
    a.invoiceNo,
    a.reversed ? `${money(a.amountMinor)} (reversed)` : money(a.amountMinor),
  ]);
  rows.push(['Advance credit', money(data.advanceMinor)]);
  if (data.refundedMinor > 0n)
    rows.push(['Refunded from advance', money(data.refundedMinor)]);
  rows.push(['Total', money(data.amountMinor)]);
  pdf.table(
    [
      { header: 'Invoice', weight: 2 },
      { header: 'Amount', weight: 1, align: 'right' },
    ],
    rows,
    { boldLastRow: true },
  );
  if (data.reversed) {
    pdf.paragraph(
      `This payment was reversed${data.reversalReason ? `: ${data.reversalReason}` : '.'}`,
    );
  }
  if (data.footer) pdf.footer(data.footer);
  return pdf.toBuffer();
}
