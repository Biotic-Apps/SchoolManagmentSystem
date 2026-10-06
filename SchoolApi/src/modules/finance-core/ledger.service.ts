import { Injectable } from '@nestjs/common';
import type { LedgerEntryType, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface LedgerPosting {
  schoolId: string;
  branchId: string;
  studentId: string;
  type: LedgerEntryType;
  /** Signed: positive = owed, negative = credit. Never zero. */
  amountMinor: bigint;
  refType: string;
  refId: string;
  invoiceId?: string | null;
  paymentId?: string | null;
  reversesId?: string | null;
  reason?: string | null;
  createdById?: string | null;
}

const SIGN: Record<LedgerEntryType, 1 | -1> = {
  CHARGE: 1,
  LATE_FEE: 1,
  REVERSAL: 1,
  REFUND: 1,
  CONCESSION: -1,
  PAYMENT: -1,
  CANCELLATION: -1,
};

/**
 * Immutable student ledger (databaseManagement.md §2.8): rows are only ever
 * inserted (a DB trigger blocks UPDATE/DELETE); corrections are new entries.
 * Balance = SUM(amount_minor); negative = advance credit.
 */
@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Serialises money work per student for the rest of the transaction
   * (allocation, issue, reversal, refund all take this lock first).
   */
  async lockStudent(
    tx: Prisma.TransactionClient,
    studentId: string,
  ): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${'ledger:' + studentId}, 0))`;
  }

  async post(
    tx: Prisma.TransactionClient,
    postings: LedgerPosting[],
  ): Promise<void> {
    const rows = postings.filter((p) => p.amountMinor !== 0n);
    for (const row of rows) {
      const sign = row.amountMinor > 0n ? 1 : -1;
      if (sign !== SIGN[row.type]) {
        throw new Error(
          `Ledger ${row.type} must be ${SIGN[row.type] > 0 ? 'positive' : 'negative'}`,
        );
      }
    }
    if (rows.length === 0) return;
    await tx.ledgerEntry.createMany({
      data: rows.map((row) => ({
        schoolId: row.schoolId,
        branchId: row.branchId,
        studentId: row.studentId,
        type: row.type,
        amountMinor: row.amountMinor,
        refType: row.refType,
        refId: row.refId,
        invoiceId: row.invoiceId ?? null,
        paymentId: row.paymentId ?? null,
        reversesId: row.reversesId ?? null,
        reason: row.reason ?? null,
        createdById: row.createdById ?? null,
      })),
    });
  }

  async balance(
    studentId: string,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<bigint> {
    const result = await db.ledgerEntry.aggregate({
      where: { studentId },
      _sum: { amountMinor: true },
    });
    return result._sum.amountMinor ?? 0n;
  }

  async balances(
    studentIds: string[],
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Map<string, bigint>> {
    if (studentIds.length === 0) return new Map();
    const rows = await db.ledgerEntry.groupBy({
      by: ['studentId'],
      where: { studentId: { in: studentIds } },
      _sum: { amountMinor: true },
    });
    return new Map(rows.map((r) => [r.studentId, r._sum.amountMinor ?? 0n]));
  }
}
