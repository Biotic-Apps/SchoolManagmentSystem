import type { Prisma } from '../../../generated/prisma/client';
import type { RefundDto } from './dto/refund.dto';

export const REFUND_INCLUDE = {
  payment: {
    select: {
      receiptNo: true,
      currency: true,
      student: {
        select: { firstName: true, lastName: true, admissionNo: true },
      },
    },
  },
} satisfies Prisma.RefundInclude;

export type RefundRow = Prisma.RefundGetPayload<{
  include: typeof REFUND_INCLUDE;
}>;

export function toRefundDto(
  row: RefundRow,
  names: ReadonlyMap<string, string>,
): RefundDto {
  const student = row.payment.student;
  return {
    id: row.id,
    paymentId: row.paymentId,
    receiptNo: row.payment.receiptNo,
    student: {
      id: row.studentId,
      name: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
    },
    amountMinor: Number(row.amountMinor),
    method: row.method,
    reason: row.reason,
    status: row.status,
    approvalId: row.approvalId,
    requestedBy: {
      id: row.requestedById,
      name: names.get(row.requestedById) ?? '',
    },
    decidedAt: row.decidedAt?.toISOString() ?? null,
    currency: row.payment.currency,
    createdAt: row.createdAt.toISOString(),
  };
}
