import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import type { ExpenseDto } from './dto/expense.dto';

export const EXPENSE_INCLUDE = {
  category: { select: { id: true, code: true, name: true } },
  vendor: { select: { id: true, name: true } },
  payments: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.ExpenseInclude;

export type ExpenseRow = Prisma.ExpenseGetPayload<{
  include: typeof EXPENSE_INCLUDE;
}>;

export function toExpenseDto(
  row: ExpenseRow,
  billUrl: string | null,
): ExpenseDto {
  return {
    id: row.id,
    branchId: row.branchId,
    category: row.category,
    vendor: row.vendor,
    title: row.title,
    amountMinor: Number(row.amountMinor),
    paidMinor: Number(row.paidMinor),
    balanceMinor: Number(row.amountMinor - row.paidMinor),
    currency: row.currency,
    billDate: formatDate(row.billDate),
    dueDate: row.dueDate ? formatDate(row.dueDate) : null,
    billFileId: row.billFileId,
    billUrl,
    recurring: row.recurringMonthly
      ? { monthly: true, untilMonth: row.recurringUntil }
      : null,
    recurringPeriod: row.recurringPeriod,
    recurringParentId: row.recurringParentId,
    purchaseOrderId: row.purchaseOrderId,
    notes: row.notes,
    status: row.status,
    approvalId: row.approvalId,
    payments: row.payments.map((p) => ({
      id: p.id,
      amountMinor: Number(p.amountMinor),
      method: p.method,
      reference: p.reference,
      paidOn: formatDate(p.paidOn),
      paidById: p.paidById,
      createdAt: p.createdAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
  };
}
