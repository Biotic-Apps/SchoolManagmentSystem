import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import type { PaymentDto } from './dto/payment.dto';

export const PAYMENT_INCLUDE = {
  student: { select: { firstName: true, lastName: true, admissionNo: true } },
  allocations: {
    include: { invoice: { select: { invoiceNo: true } } },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.PaymentInclude;

export type PaymentRow = Prisma.PaymentGetPayload<{
  include: typeof PAYMENT_INCLUDE;
}>;

export function toPaymentDto(
  row: PaymentRow,
  names: ReadonlyMap<string, string>,
): PaymentDto {
  return {
    id: row.id,
    receiptNo: row.receiptNo,
    student: {
      id: row.studentId,
      name: `${row.student.firstName} ${row.student.lastName}`,
      admissionNo: row.student.admissionNo,
    },
    amountMinor: Number(row.amountMinor),
    unallocatedMinor: Number(row.unallocatedMinor),
    method: row.method,
    reference: row.reference,
    receivedOn: formatDate(row.receivedOn),
    receivedBy: {
      id: row.receivedById,
      name: names.get(row.receivedById) ?? '',
    },
    status: row.status,
    reversalReason: row.reversalReason,
    reversedAt: row.reversedAt?.toISOString() ?? null,
    gateway: row.gateway,
    proofId: row.proofId,
    allocations: row.allocations.map((a) => ({
      invoiceId: a.invoiceId,
      invoiceNo: a.invoice.invoiceNo,
      amountMinor: Number(a.amountMinor),
      reversed: a.reversed,
    })),
    currency: row.currency,
    createdAt: row.createdAt.toISOString(),
  };
}
