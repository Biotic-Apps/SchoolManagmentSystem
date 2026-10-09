import { PdfBuilder } from '../../generated-docs/pdf-builder';
import { formatMinor } from '../../finance-core/money';
import { hoursText } from './breakdown';
import type { BreakdownItemDto, PayslipDto } from './dto/payslip.dto';

export interface PayslipHeader {
  schoolName: string;
  branchLine: string;
  version: number;
}

const money = (value: number) => formatMinor(BigInt(value));

const COLUMNS = [
  { header: 'Item', weight: 1.6 },
  { header: 'How it was worked out', weight: 3.4 },
  { header: 'Amount', weight: 1.2, align: 'right' as const },
];

const rows = (items: BreakdownItemDto[], label: string, total: number) => [
  ...items.map((i) => [i.label, i.note ?? '', money(i.amountMinor)]),
  [label, '', money(total)],
];

function attendanceFields(slip: PayslipDto): [string, string][] {
  const a = slip.breakdown.attendance;
  if (!a) {
    return [
      ['Working days', String(slip.workingDays)],
      ['Unpaid leave days', slip.unpaidLeaveDays.toFixed(1)],
    ];
  }
  return [
    ['Working days', String(a.payDays)],
    ['Present', String(a.present)],
    ['Late', String(a.late)],
    ['Absent', String(a.absent)],
    ['Half days', String(a.halfDays)],
    ['Paid leave', String(a.paidLeave)],
    ['Unpaid leave', String(a.unpaidLeave)],
    ['Overtime (approved)', hoursText(slip.overtimeMinutes)],
  ];
}

/** Draws one payslip on the current page. Payment status is not printed (it changes after issue). */
function drawPayslip(
  pdf: PdfBuilder,
  slip: PayslipDto,
  header: PayslipHeader,
  draft = false,
) {
  const b = slip.breakdown;
  if (draft) pdf.watermark('DRAFT - NOT APPROVED');
  pdf
    .header(header.schoolName, header.branchLine, `Payslip — ${slip.month}`)
    .fields([
      ['Name', slip.staff.name],
      ['Employee no.', slip.staff.employeeNo ?? '-'],
      ['Designation', slip.staff.designation.replace(/_/g, ' ')],
      ['Month', slip.month],
      ...attendanceFields(slip),
    ])
    .heading('Earnings')
    .table(COLUMNS, rows(b.earnings, 'Total earnings', b.totalEarningsMinor), {
      boldLastRow: true,
    })
    .heading('Deductions')
    .table(
      COLUMNS,
      rows(b.deductions, 'Total deductions', b.totalDeductionsMinor),
      { boldLastRow: true },
    )
    .heading(`Net pay: ${money(slip.netMinor)}`)
    .footer(
      `Computer-generated payslip, version ${header.version}. No signature required.`,
    );
}

/** A4 salary slip of one staff member. */
export function renderPayslip(
  slip: PayslipDto,
  header: PayslipHeader,
): Promise<Buffer> {
  const pdf = new PdfBuilder();
  drawPayslip(pdf, slip, header);
  return pdf.toBuffer();
}

/** All payslips of a run, one per page (bulk print); unapproved runs print as drafts. */
export function renderPayslips(
  slips: PayslipDto[],
  header: PayslipHeader,
  draft: boolean,
): Promise<Buffer> {
  const pdf = new PdfBuilder();
  slips.forEach((slip, index) => {
    if (index > 0) pdf.doc.addPage();
    drawPayslip(pdf, slip, header, draft);
  });
  return pdf.toBuffer();
}
