import type { InvoiceStatus } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { OPEN_STATUSES } from '../../finance-core/invoice-state';
import { maxBig, sumMinor } from '../../finance-core/money';
import { parseLateFeeRule } from '../shared/plan-snapshot';
import { amountInWords } from './amount-in-words';
import type { BankAccount } from './bank-account';

/** The three tear-off copies of a Pakistani bank challan, left to right. */
export const CHALLAN_COPIES = ['Bank copy', 'School copy', 'Parent copy'];

const MAX_FEE_ROWS = 10;
const DAY_MS = 86_400_000;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export interface ChallanSchool {
  schoolName: string;
  branchName: string;
  branchLine: string;
  logo: Buffer | null;
  bank: BankAccount | null;
  note: string;
}

/** One invoice as loaded for printing (money in minor units). */
export interface ChallanInvoice {
  invoiceNo: string;
  status: InvoiceStatus;
  period: string | null;
  issueDate: Date | null;
  dueDate: Date;
  currency: string;
  lines: { head: string; amountMinor: bigint }[];
  concessionMinor: bigint;
  siblingDiscountMinor: bigint;
  lateFeeMinor: bigint;
  totalMinor: bigint;
  paidMinor: bigint;
  lateFeeRule: unknown;
  student: {
    name: string;
    fatherName: string | null;
    admissionNo: string;
    classLabel: string;
  };
  /** Older open invoices of the same student still owing money. */
  arrears: { period: string | null; balanceMinor: bigint }[];
}

export interface ChallanView {
  school: ChallanSchool;
  challanNo: string;
  watermark: string | null;
  currency: string;
  month: string;
  issueDate: string;
  dueDate: string;
  student: ChallanInvoice['student'];
  /** Fee head rows (long lists fold into "Other fees"). */
  feeRows: [string, bigint][];
  arrearsLabel: string;
  arrearsMinor: bigint;
  concessionMinor: bigint;
  siblingDiscountMinor: bigint;
  lateFeeMinor: bigint;
  paidMinor: bigint;
  /** Due by the due date: this invoice's balance plus arrears. */
  payableMinor: bigint;
  /** Amount after the late-fee grace period, when a late fee can still apply. */
  afterDue: { date: string; amountMinor: bigint } | null;
  amountInWords: string;
  /** QR payload identifying the challan for the school's reconciliation. */
  reference: string;
}

/** `2026-10` → `Oct 2026`. */
export function monthLabel(period: string | null): string {
  if (!period) return '-';
  const [year, month] = period.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** `2026-10-09` → `09-Oct-2026` (the format banks stamp). */
export function printDate(date: Date): string {
  const [y, m, d] = formatDate(date).split('-');
  return `${d}-${MONTHS[Number(m) - 1]}-${y}`;
}

function feeRows(lines: ChallanInvoice['lines']): [string, bigint][] {
  // Same head twice (e.g. two activities) prints as one row.
  const byHead = new Map<string, bigint>();
  for (const line of lines)
    byHead.set(line.head, (byHead.get(line.head) ?? 0n) + line.amountMinor);
  const rows = [...byHead.entries()];
  if (rows.length <= MAX_FEE_ROWS) return rows;
  const kept = rows.slice(0, MAX_FEE_ROWS - 1);
  const other = sumMinor(rows.slice(MAX_FEE_ROWS - 1).map(([, a]) => a));
  return [...kept, ['Other fees', other]];
}

/** Late fee still to come: open, no late fee yet, and the invoice has a rule. */
function afterDue(
  invoice: ChallanInvoice,
  payableMinor: bigint,
): ChallanView['afterDue'] {
  const rule = parseLateFeeRule(invoice.lateFeeRule);
  const open =
    invoice.status === 'DRAFT' || OPEN_STATUSES.includes(invoice.status);
  if (!rule || !open || invoice.lateFeeMinor > 0n || payableMinor <= 0n)
    return null;
  const lastFreeDay = new Date(
    invoice.dueDate.getTime() + rule.afterDays * DAY_MS,
  );
  return {
    date: printDate(lastFreeDay),
    amountMinor: payableMinor + BigInt(rule.amountMinor),
  };
}

const WATERMARK: Partial<Record<InvoiceStatus, string>> = {
  DRAFT: 'DRAFT',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
};

/** Maps a loaded invoice to everything printed on its challan copies. */
export function toChallanView(
  invoice: ChallanInvoice,
  school: ChallanSchool,
): ChallanView {
  const arrears = invoice.arrears.filter((a) => a.balanceMinor > 0n);
  const arrearsMinor = sumMinor(arrears.map((a) => a.balanceMinor));
  const balance = maxBig(invoice.totalMinor - invoice.paidMinor, 0n);
  const payableMinor =
    invoice.status === 'CANCELLED' ? 0n : balance + arrearsMinor;
  const months = arrears
    .map((a) => monthLabel(a.period))
    .filter((m) => m !== '-');
  return {
    school,
    challanNo: invoice.invoiceNo,
    watermark: WATERMARK[invoice.status] ?? null,
    currency: invoice.currency,
    month: monthLabel(invoice.period),
    issueDate: printDate(invoice.issueDate ?? new Date()),
    dueDate: printDate(invoice.dueDate),
    student: invoice.student,
    feeRows: feeRows(invoice.lines),
    arrearsLabel: months.length
      ? `Arrears (${[...new Set(months)].join(', ')})`
      : 'Arrears / previous balance',
    arrearsMinor,
    concessionMinor: invoice.concessionMinor,
    siblingDiscountMinor: invoice.siblingDiscountMinor,
    lateFeeMinor: invoice.lateFeeMinor,
    paidMinor: invoice.paidMinor,
    payableMinor,
    afterDue: afterDue(invoice, payableMinor),
    amountInWords: amountInWords(payableMinor, invoice.currency),
    reference: `ESCHOOL:CHALLAN:${invoice.invoiceNo}:${payableMinor}`,
  };
}
