import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import type { IncomeDto } from './dto/income.dto';

export const INCOME_INCLUDE = {
  category: { select: { id: true, code: true, name: true } },
} satisfies Prisma.IncomeInclude;

export type IncomeRow = Prisma.IncomeGetPayload<{
  include: typeof INCOME_INCLUDE;
}>;

export function toIncomeDto(row: IncomeRow, receiptUrl: string | null): IncomeDto {
  return {
    id: row.id,
    branchId: row.branchId,
    category: row.category,
    title: row.title,
    description: row.description,
    amountMinor: Number(row.amountMinor),
    currency: row.currency,
    receivedOn: formatDate(row.receivedOn),
    receiptFileId: row.receiptFileId,
    receiptUrl,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}
