import { PdfBuilder } from '../../generated-docs/pdf-builder';
import { formatMinor } from '../../finance-core/money';
import type { PayslipDto } from './dto/payslip.dto';

export interface PayslipHeader {
  schoolName: string;
  branchLine: string;
  version: number;
}

const money = (value: number) => formatMinor(BigInt(value));

/** A4 salary slip. Payment status is not printed (it changes after issue). */
export function renderPayslip(
  slip: PayslipDto,
  header: PayslipHeader,
): Promise<Buffer> {
  const pdf = new PdfBuilder()
    .header(header.schoolName, header.branchLine, `Payslip — ${slip.month}`)
    .fields([
      ['Name', slip.staff.name],
      ['Employee no.', slip.staff.employeeNo ?? '-'],
      ['Designation', slip.staff.designation],
      ['Month', slip.month],
      ['Working days', String(slip.workingDays)],
      ['Unpaid leave days', slip.unpaidLeaveDays.toFixed(1)],
    ]);

  const earnings: string[][] = [
    ['Basic salary', money(slip.basicMinor)],
    ...slip.allowances.map((a) => [a.name, money(a.amountMinor)]),
    ...slip.adjustments
      .filter((a) => a.signedMinor > 0)
      .map((a) => [
        `${a.kind.toLowerCase()}: ${a.reason}`,
        money(a.amountMinor),
      ]),
  ];
  const deductions: string[][] = [
    ...slip.deductions.map((d) => [d.name, money(d.amountMinor)]),
    ...(slip.leaveDeductionMinor > 0
      ? [['Unpaid leave', money(slip.leaveDeductionMinor)]]
      : []),
    ...slip.adjustments
      .filter((a) => a.signedMinor < 0)
      .map((a) => [
        `${a.kind.toLowerCase()}: ${a.reason}`,
        money(a.amountMinor),
      ]),
  ];
  const columns = [
    { header: 'Item', weight: 3 },
    { header: 'Amount', weight: 1, align: 'right' as const },
  ];
  const total = (rows: string[][], label: string, sum: number) => [
    ...rows,
    [label, money(sum)],
  ];
  const sum = (rows: { signedMinor: number }[]) =>
    rows.reduce((acc, r) => acc + Math.abs(r.signedMinor), 0);
  const earned =
    slip.grossMinor + sum(slip.adjustments.filter((a) => a.signedMinor > 0));
  const deducted =
    slip.deductions.reduce((acc, d) => acc + d.amountMinor, 0) +
    slip.leaveDeductionMinor +
    sum(slip.adjustments.filter((a) => a.signedMinor < 0));

  pdf
    .heading('Earnings')
    .table(columns, total(earnings, 'Total earnings', earned), {
      boldLastRow: true,
    })
    .heading('Deductions')
    .table(columns, total(deductions, 'Total deductions', deducted), {
      boldLastRow: true,
    })
    .heading(`Net pay: ${money(slip.netMinor)}`)
    .footer(
      `Computer-generated payslip, version ${header.version}. No signature required.`,
    );
  return pdf.toBuffer();
}
