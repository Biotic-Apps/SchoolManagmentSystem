import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { balanceOf } from '../../finance-core/invoice-state';
import { fullName } from '../../students/student.mapper';
import type { InvoiceDto } from './dto/invoice.dto';

export const INVOICE_INCLUDE = {
  student: {
    select: { id: true, firstName: true, lastName: true, admissionNo: true },
  },
  lines: {
    include: { feeHead: { select: { id: true, name: true } } },
    orderBy: { id: 'asc' },
  },
  allocations: {
    where: { reversed: false },
    include: {
      payment: { select: { id: true, receiptNo: true, receivedOn: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.InvoiceInclude;

export type InvoiceRow = Prisma.InvoiceGetPayload<{
  include: typeof INVOICE_INCLUDE;
}>;

export interface SectionNames {
  className: string;
  sectionName: string;
}

export function toInvoiceDto(
  row: InvoiceRow,
  sections: Map<string, SectionNames>,
): InvoiceDto {
  const section = row.sectionId ? sections.get(row.sectionId) : undefined;
  return {
    id: row.id,
    invoiceNo: row.invoiceNo,
    student: {
      id: row.student.id,
      name: fullName(row.student),
      admissionNo: row.student.admissionNo,
      className: section?.className ?? null,
      sectionName: section?.sectionName ?? null,
    },
    period: row.period,
    issueDate: row.issueDate ? formatDate(row.issueDate) : null,
    dueDate: formatDate(row.dueDate),
    status: row.status,
    lines: row.lines.map((line) => ({
      id: line.id,
      feeHead: line.feeHead,
      description: line.description,
      amountMinor: Number(line.amountMinor),
    })),
    concessionMinor: Number(row.concessionMinor),
    lateFeeMinor: Number(row.lateFeeMinor),
    totalMinor: Number(row.totalMinor),
    paidMinor: Number(row.paidMinor),
    balanceMinor: Number(balanceOf(row)),
    payments: row.allocations.map((a) => ({
      paymentId: a.payment.id,
      receiptNo: a.payment.receiptNo,
      amountMinor: Number(a.amountMinor),
      paidOn: formatDate(a.payment.receivedOn),
    })),
    currency: row.currency,
    branchId: row.branchId,
    source: row.source,
    subtotalMinor: Number(row.subtotalMinor),
    cancelApprovalId: row.cancelApprovalId,
    cancelReason: row.cancelReason,
  };
}
