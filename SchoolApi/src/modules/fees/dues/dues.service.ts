import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { parseDate } from '../../../core/common/dates';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import { schoolDate } from '../../../core/common/school-time';
import { containsInsensitive } from '../../../core/common/search';
import { forbidden } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { sumMinor } from '../../finance-core/money';
import { FeeAccessService } from '../shared/fee-access.service';
import { agingBuckets, oldestOverdueDays, type AgingInput } from './aging';
import { DuesDetails } from './dues-details.service';
import type { DuesQueryDto, DuesRowDto } from './dto/dues.dto';

interface StudentDues {
  studentId: string;
  branchId: string;
  sectionId: string | null;
  currency: string;
  invoices: AgingInput[];
}

/** Students with open balances, aged by invoice due date (staff only). */
@Injectable()
export class DuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
    private readonly details: DuesDetails,
  ) {}

  async list(
    scope: Scope,
    query: DuesQueryDto,
  ): Promise<PageResult<DuesRowDto>> {
    if (scope.guardian) throw forbidden('Not available to parents');
    if (query.branchId) await this.access.readBranch(scope, query.branchId);
    const search = containsInsensitive(query.search);
    const where: Prisma.InvoiceWhereInput = {
      AND: [
        scope.branchFilter(),
        {
          status: { in: OPEN_STATUSES },
          branchId: query.branchId,
          classId: query.classId,
        },
        search
          ? {
              student: {
                OR: [
                  { firstName: search },
                  { lastName: search },
                  { admissionNo: search },
                ],
              },
            }
          : {},
      ],
    };
    const invoices = await this.prisma.invoice.findMany({
      where,
      select: {
        studentId: true,
        branchId: true,
        sectionId: true,
        dueDate: true,
        totalMinor: true,
        paidMinor: true,
        currency: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    const byStudent = new Map<string, StudentDues>();
    for (const invoice of invoices) {
      const balance = balanceOf(invoice);
      if (balance <= 0n) continue;
      const entry = byStudent.get(invoice.studentId) ?? {
        studentId: invoice.studentId,
        branchId: invoice.branchId,
        sectionId: invoice.sectionId,
        currency: invoice.currency,
        invoices: [],
      };
      // The latest invoice carries the current section.
      entry.sectionId = invoice.sectionId ?? entry.sectionId;
      entry.invoices.push({ dueDate: invoice.dueDate, balanceMinor: balance });
      byStudent.set(invoice.studentId, entry);
    }
    const today = parseDate(schoolDate());
    const rows = [...byStudent.values()]
      .map((s) => ({
        ...s,
        days: oldestOverdueDays(s.invoices, today),
        balance: sumMinor(s.invoices.map((i) => i.balanceMinor)),
      }))
      .filter((s) => s.days >= (query.minDays ?? 0))
      .sort(
        (a, b) =>
          b.days - a.days ||
          (b.balance > a.balance ? 1 : b.balance < a.balance ? -1 : 0),
      );
    const page = rows.slice(
      (query.page - 1) * query.pageSize,
      query.page * query.pageSize,
    );
    const info = await this.details.load(page);
    const items: DuesRowDto[] = page.map((s) => {
      const aging = agingBuckets(s.invoices, today);
      return {
        student: info.student(s.studentId, s.sectionId),
        branchId: s.branchId,
        balanceMinor: Number(s.balance),
        overdueMinor: Number(
          sumMinor(
            s.invoices
              .filter((i) => i.dueDate < today)
              .map((i) => i.balanceMinor),
          ),
        ),
        oldestOverdueDays: s.days,
        openInvoices: s.invoices.length,
        aging: {
          d0_30: Number(aging.d0_30),
          d31_60: Number(aging.d31_60),
          d61_90: Number(aging.d61_90),
          d90plus: Number(aging.d90plus),
        },
        guardian: info.guardian(s.studentId),
        currency: s.currency,
      };
    });
    return toPageResult(items, rows.length, query);
  }
}
