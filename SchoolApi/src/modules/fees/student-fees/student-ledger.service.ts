import { Injectable } from '@nestjs/common';
import type { LedgerEntryType } from '../../../generated/prisma/client';
import { schoolDate } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FeeAccessService } from '../shared/fee-access.service';
import type { StudentLedgerDto } from './dto/student-fees.dto';

const LABEL: Record<LedgerEntryType, string> = {
  CHARGE: 'Invoice charge',
  LATE_FEE: 'Late fee',
  CONCESSION: 'Concession',
  PAYMENT: 'Payment',
  REVERSAL: 'Payment reversal',
  REFUND: 'Refund',
  CANCELLATION: 'Invoice cancelled',
};

/** The student's immutable ledger with a running balance (oldest first). */
@Injectable()
export class StudentLedgerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
  ) {}

  async ledger(scope: Scope, studentId: string): Promise<StudentLedgerDto> {
    await this.access.readStudent(scope, studentId);
    const rows = await this.prisma.ledgerEntry.findMany({
      where: { studentId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    const invoiceIds = rows
      .map((r) => r.invoiceId)
      .filter((id): id is string => !!id);
    const paymentIds = rows
      .map((r) => r.paymentId)
      .filter((id): id is string => !!id);
    const [invoices, payments] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { id: { in: [...new Set(invoiceIds)] } },
        select: { id: true, invoiceNo: true },
      }),
      this.prisma.payment.findMany({
        where: { id: { in: [...new Set(paymentIds)] } },
        select: { id: true, receiptNo: true },
      }),
    ]);
    const invoiceNo = new Map(invoices.map((i) => [i.id, i.invoiceNo]));
    const receiptNo = new Map(payments.map((p) => [p.id, p.receiptNo]));
    let balance = 0n;
    const entries = rows.map((row) => {
      balance += row.amountMinor;
      const inv = row.invoiceId ? (invoiceNo.get(row.invoiceId) ?? null) : null;
      const rct = row.paymentId ? (receiptNo.get(row.paymentId) ?? null) : null;
      const ref = rct ?? inv;
      return {
        id: row.id,
        date: schoolDate(row.createdAt),
        createdAt: row.createdAt.toISOString(),
        type: row.type,
        description: ref ? `${LABEL[row.type]} · ${ref}` : LABEL[row.type],
        refType: row.refType,
        refId: row.refId,
        amountMinor: Number(row.amountMinor),
        balanceMinor: Number(balance),
        invoiceId: row.invoiceId,
        invoiceNo: inv,
        paymentId: row.paymentId,
        receiptNo: rct,
        reason: row.reason,
      };
    });
    return {
      studentId,
      entries,
      balanceMinor: Number(balance),
      currency: rows[0]?.currency ?? 'PKR',
    };
  }
}
