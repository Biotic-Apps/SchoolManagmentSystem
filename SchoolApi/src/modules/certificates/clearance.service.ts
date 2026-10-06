import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { PrismaService } from '../../core/prisma/prisma.service';
import { OPEN_STATUSES, balanceOf } from '../finance-core/invoice-state';
import { LedgerService } from '../finance-core/ledger.service';
import { checkClearance, type ClearanceResult } from './clearance';

/** Loads what a student owes and holds, then applies `checkClearance`. */
@Injectable()
export class ClearanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
  ) {}

  async check(
    studentId: string,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<ClearanceResult> {
    const [ledgerBalanceMinor, invoices, grouped] = await Promise.all([
      this.ledger.balance(studentId, db),
      db.invoice.findMany({
        where: { studentId, status: { in: OPEN_STATUSES } },
        select: { totalMinor: true, paidMinor: true },
      }),
      db.stockMovement.groupBy({
        by: ['itemId'],
        where: { studentId },
        _sum: { quantity: true },
      }),
    ]);
    const items = await db.inventoryItem.findMany({
      where: { id: { in: grouped.map((g) => g.itemId) } },
      select: { id: true, name: true, saleable: true },
    });
    const byId = new Map(items.map((i) => [i.id, i]));
    return checkClearance({
      ledgerBalanceMinor,
      openInvoiceBalances: invoices.map(balanceOf),
      movements: grouped.flatMap((g) => {
        const item = byId.get(g.itemId);
        return item
          ? [
              {
                itemId: item.id,
                name: item.name,
                saleable: item.saleable,
                quantity: g._sum.quantity ?? 0,
              },
            ]
          : [];
      }),
    });
  }

  /** 409 CLEARANCE_REQUIRED with what is outstanding. */
  async assertCleared(
    studentId: string,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    const result = await this.check(studentId, db);
    if (result.cleared) return;
    throw new AppError(
      ErrorCode.CLEARANCE_REQUIRED,
      'Clear outstanding dues and return issued items first',
      {
        outstandingMinor: Number(result.outstandingMinor),
        items: result.items,
      },
    );
  }
}
