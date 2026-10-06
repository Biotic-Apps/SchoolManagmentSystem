import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { conflict } from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { ExpenseDto } from '../../expenses/dto/expense.dto';
import { ExpenseReader } from '../../expenses/expense-reader';
import { ExpenseSubmission } from '../../expenses/expense-submission';
import { receivedTotal } from './po-math';
import { PurchasingViews } from './purchasing-views';

const BILL_CATEGORY = 'SUPPLIES';

/** Turns a received purchase order into a vendor bill (Expense, SUBMITTED). */
@Injectable()
export class PoBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly views: PurchasingViews,
    private readonly expenses: ExpenseReader,
    private readonly submission: ExpenseSubmission,
    private readonly audit: AuditService,
  ) {}

  async bill(user: AuthUser, scope: Scope, id: string): Promise<ExpenseDto> {
    await this.views.findOrder(scope, id);
    const expenseId = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM purchase_orders WHERE id = ${id}::uuid FOR UPDATE`;
      const order = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id },
        include: { lines: true },
      });
      const existing = await tx.expense.findUnique({
        where: { purchaseOrderId: id },
        select: { id: true },
      });
      if (order.status === 'BILLED' || existing) {
        throw conflict('Purchase order is already billed', {
          expenseId: existing?.id ?? null,
        });
      }
      const amount = receivedTotal(order.lines);
      if (amount <= 0n) throw conflict('Nothing has been received yet');
      const category = await this.category(tx, order.schoolId);
      const expense = await tx.expense.create({
        data: {
          schoolId: order.schoolId,
          branchId: order.branchId,
          categoryId: category.id,
          vendorId: order.vendorId,
          title: `PO ${order.poNo}`,
          amountMinor: amount,
          billDate: parseDate(schoolDate()),
          purchaseOrderId: order.id,
          createdById: user.id,
        },
      });
      await this.submission.submit(tx, user, expense);
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'BILLED' },
      });
      this.audit.stage({
        action: 'purchase_order.bill',
        entityType: 'PurchaseOrder',
        entityId: id,
        schoolId: order.schoolId,
        branchId: order.branchId,
        before: { status: order.status },
        after: {
          status: 'BILLED',
          expenseId: expense.id,
          amountMinor: Number(amount),
        },
      });
      return expense.id;
    });
    return this.expenses.viewById(expenseId);
  }

  private async category(tx: Prisma.TransactionClient, schoolId: string) {
    const category =
      (await tx.expenseCategory.findFirst({
        where: { schoolId, code: BILL_CATEGORY, status: 'ACTIVE' },
      })) ??
      (await tx.expenseCategory.findFirst({
        where: { schoolId, status: 'ACTIVE' },
        orderBy: { code: 'asc' },
      }));
    if (!category) throw conflict('No expense category configured');
    return category;
  }
}
