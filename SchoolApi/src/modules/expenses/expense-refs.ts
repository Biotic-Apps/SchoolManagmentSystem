import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../core/common/errors/errors';
import { FileRefService } from '../../core/files/file-ref.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { periodOf } from '../finance-core/period';

export interface ExpenseRefsInput {
  categoryId?: string;
  vendorId?: string | null;
  billFileId?: string | null;
}

/** Validates the category, vendor and bill file an expense points at. */
@Injectable()
export class ExpenseRefs {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FileRefService,
  ) {}

  async check(
    schoolId: string,
    userId: string,
    refs: ExpenseRefsInput,
  ): Promise<void> {
    if (refs.categoryId) {
      const category = await this.prisma.expenseCategory.findFirst({
        where: { id: refs.categoryId, schoolId, status: 'ACTIVE' },
      });
      if (!category) throw notFound('Expense category');
    }
    if (refs.vendorId) {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: refs.vendorId, schoolId, status: 'ACTIVE' },
      });
      if (!vendor) throw notFound('Vendor');
    }
    if (refs.billFileId) {
      await this.files.assertUsable(refs.billFileId, {
        schoolId,
        userId,
        purposes: ['DOCUMENT', 'ATTACHMENT'],
      });
    }
  }
}

/** dueDate ≥ billDate; the recurring end month is not before the bill month. */
export function assertExpenseDates(
  billDate: Date,
  dueDate: Date | null,
  untilMonth: string | null,
): void {
  if (dueDate && dueDate < billDate) {
    throw invalid('dueDate must not be before billDate');
  }
  if (untilMonth && untilMonth < periodOf(billDate)) {
    throw invalid('recurring.untilMonth must not be before the bill month');
  }
}
