import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  StockMovement,
  StockMovementType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { applyMovement } from './stock-rules';

export interface NewMovement {
  id?: string;
  schoolId: string;
  branchId: string;
  itemId: string;
  type: StockMovementType;
  /** Signed quantity (see signedQuantity). */
  quantity: number;
  issuedTo?: string | null;
  studentId?: string | null;
  reason?: string | null;
  refType?: string | null;
  refId?: string | null;
  createdById: string;
}

export interface PostedMovement {
  movement: StockMovement;
  balance: number;
}

/**
 * Append-only stock movements. Removals take a per branch+item advisory lock,
 * re-sum the stock and refuse to go below zero (409 NEGATIVE_STOCK).
 */
@Injectable()
export class StockLedger {
  constructor(private readonly prisma: PrismaService) {}

  async quantity(
    tx: Prisma.TransactionClient,
    branchId: string,
    itemId: string,
  ): Promise<number> {
    const sum = await tx.stockMovement.aggregate({
      where: { branchId, itemId },
      _sum: { quantity: true },
    });
    return sum._sum.quantity ?? 0;
  }

  /** Stock per item in a branch (items without movements are absent). */
  async quantities(
    branchId: string,
    itemIds?: string[],
  ): Promise<Map<string, number>> {
    const rows = await this.prisma.stockMovement.groupBy({
      by: ['itemId'],
      where: { branchId, itemId: itemIds ? { in: itemIds } : undefined },
      _sum: { quantity: true },
    });
    return new Map(rows.map((r) => [r.itemId, r._sum.quantity ?? 0]));
  }

  async post(
    tx: Prisma.TransactionClient,
    input: NewMovement,
  ): Promise<PostedMovement> {
    if (input.quantity < 0) {
      const key = `stock:${input.branchId}:${input.itemId}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
    }
    const current = await this.quantity(tx, input.branchId, input.itemId);
    const balance = applyMovement(current, input.quantity);
    const movement = await tx.stockMovement.create({
      data: {
        id: input.id,
        schoolId: input.schoolId,
        branchId: input.branchId,
        itemId: input.itemId,
        type: input.type,
        quantity: input.quantity,
        issuedTo: input.issuedTo ?? null,
        studentId: input.studentId ?? null,
        reason: input.reason ?? null,
        refType: input.refType ?? null,
        refId: input.refId ?? null,
        createdById: input.createdById,
      },
    });
    return { movement, balance };
  }
}
