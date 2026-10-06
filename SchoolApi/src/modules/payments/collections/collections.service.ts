import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { isDuplicateKey } from '../../../core/idempotency/client-request.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { PAYMENT_INCLUDE } from '../payments/payment.mapper';
import { PaymentReader } from '../payments/payment-reader';
import { FinanceAccess } from '../shared/finance-access';
import { lockCollectionDay } from './collection-lock';
import {
  cashDifference,
  closingNoteRequired,
  dailyTotals,
  type DailyTotals,
} from './daily-totals';
import type { CloseDayDto, DailyCollectionDto } from './dto/collection.dto';

/** Day collection per branch and cash closing (contract B5). */
@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly reader: PaymentReader,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async daily(
    scope: Scope,
    branchId: string,
    date = schoolDate(),
  ): Promise<DailyCollectionDto> {
    await this.access.managedBranch(scope, branchId);
    return this.view(branchId, parseDate(date));
  }

  async close(
    user: AuthUser,
    scope: Scope,
    dto: CloseDayDto,
  ): Promise<DailyCollectionDto> {
    const branch = await this.access.managedBranch(scope, dto.branchId);
    const date = parseDate(dto.date);
    if (date > parseDate(schoolDate()))
      throw invalid('A future day cannot be closed');
    const counted = BigInt(dto.cashCountedMinor);
    const note = dto.note?.trim() || null;

    const closing = await this.prisma
      .$transaction(async (tx) => {
        await lockCollectionDay(tx, branch.id, date);
        const existing = await tx.dailyCollection.findUnique({
          where: { branchId_date: { branchId: branch.id, date } },
        });
        if (existing) throw conflict('This day is already closed');
        const payments = await tx.payment.findMany({
          where: { branchId: branch.id, receivedOn: date },
          select: {
            method: true,
            amountMinor: true,
            receivedById: true,
            status: true,
          },
        });
        const totals = dailyTotals(payments);
        const difference = cashDifference(counted, totals.cashMinor);
        if (closingNoteRequired(difference) && !note) {
          throw invalid('A note is required when the cash does not match', {
            differenceMinor: Number(difference),
          });
        }
        return tx.dailyCollection.create({
          data: {
            schoolId: branch.schoolId,
            branchId: branch.id,
            date,
            totals: totalsJson(totals),
            cashExpectedMinor: totals.cashMinor,
            cashCountedMinor: counted,
            differenceMinor: difference,
            note,
            closedById: user.id,
          },
        });
      })
      .catch((error: unknown) => {
        if (isDuplicateKey(error)) throw conflict('This day is already closed');
        throw error;
      });
    this.audit.stage({
      action: 'collection.close',
      entityType: 'DailyCollection',
      entityId: closing.id,
      schoolId: closing.schoolId,
      branchId: closing.branchId,
      after: {
        date: dto.date,
        cashExpectedMinor: Number(closing.cashExpectedMinor),
        cashCountedMinor: dto.cashCountedMinor,
        differenceMinor: Number(closing.differenceMinor),
        note,
      },
    });
    return this.view(branch.id, date);
  }

  private async view(
    branchId: string,
    date: Date,
  ): Promise<DailyCollectionDto> {
    const [rows, closing] = await Promise.all([
      this.prisma.payment.findMany({
        where: { branchId, receivedOn: date },
        include: PAYMENT_INCLUDE,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.dailyCollection.findUnique({
        where: { branchId_date: { branchId, date } },
      }),
    ]);
    const totals = dailyTotals(rows);
    const payments = await this.reader.dtos(rows);
    const names = await this.people.names([
      ...totals.byCashier.keys(),
      ...(closing ? [closing.closedById] : []),
    ]);
    const person = (id: string) => ({ id, name: names.get(id) ?? '' });
    return {
      branchId,
      date: formatDate(date),
      count: totals.count,
      totalMinor: Number(totals.totalMinor),
      cashMinor: Number(totals.cashMinor),
      byMethod: [...totals.byMethod].map(([method, b]) => ({
        method,
        count: b.count,
        amountMinor: Number(b.amountMinor),
      })),
      byCashier: [...totals.byCashier].map(([id, b]) => ({
        cashier: person(id),
        count: b.count,
        amountMinor: Number(b.amountMinor),
      })),
      payments: payments.filter((p) => p.status !== 'REVERSED'),
      reversedCount: totals.reversed.count,
      reversedMinor: Number(totals.reversed.amountMinor),
      reversedPayments: payments.filter((p) => p.status === 'REVERSED'),
      closed: closing && {
        closedBy: person(closing.closedById),
        closedAt: closing.closedAt.toISOString(),
        cashExpectedMinor: Number(closing.cashExpectedMinor),
        cashCountedMinor: Number(closing.cashCountedMinor),
        differenceMinor: Number(closing.differenceMinor),
        note: closing.note,
      },
      currency: rows[0]?.currency ?? 'PKR',
    };
  }
}

function totalsJson(totals: DailyTotals) {
  return {
    count: totals.count,
    totalMinor: Number(totals.totalMinor),
    cashMinor: Number(totals.cashMinor),
    byMethod: [...totals.byMethod].map(([method, b]) => ({
      method,
      count: b.count,
      amountMinor: Number(b.amountMinor),
    })),
    byCashier: [...totals.byCashier].map(([cashierId, b]) => ({
      cashierId,
      count: b.count,
      amountMinor: Number(b.amountMinor),
    })),
    reversed: {
      count: totals.reversed.count,
      amountMinor: Number(totals.reversed.amountMinor),
    },
  };
}
