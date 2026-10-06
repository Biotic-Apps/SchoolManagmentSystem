import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { parseDate } from '../../../core/common/dates';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FinanceAccess } from '../shared/finance-access';
import type { PaymentDto } from './dto/payment.dto';
import type { PaymentQueryDto } from './dto/payment-query.dto';
import { PAYMENT_INCLUDE } from './payment.mapper';
import { PaymentReader } from './payment-reader';

/** Payment lists: staff by managed branch, parents for their own children. */
@Injectable()
export class PaymentQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly reader: PaymentReader,
  ) {}

  async list(
    scope: Scope,
    query: PaymentQueryDto,
  ): Promise<PageResult<PaymentDto>> {
    const where = await this.where(scope, query);
    const [rows, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: PAYMENT_INCLUDE,
        orderBy: [{ receivedOn: 'desc' }, { createdAt: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.payment.count({ where }),
    ]);
    return toPageResult(await this.reader.dtos(rows), total, query);
  }

  async get(scope: Scope, id: string): Promise<PaymentDto> {
    const row = await this.reader.row(id);
    this.access.assertRecord(scope, row, 'Payment');
    return (await this.reader.dtos([row]))[0];
  }

  private async where(
    scope: Scope,
    query: PaymentQueryDto,
  ): Promise<Prisma.PaymentWhereInput> {
    const and: Prisma.PaymentWhereInput[] = [];
    if (scope.guardian) {
      if (query.studentId && !scope.canAccessStudent(query.studentId))
        throw notFound('Student');
      and.push({ studentId: { in: [...scope.studentIds] } });
    } else {
      and.push(scope.managedBranchFilter());
    }
    if (query.branchId) {
      if (!scope.guardian)
        await this.access.managedBranch(scope, query.branchId);
      and.push({ branchId: query.branchId });
    }
    if (query.studentId) and.push({ studentId: query.studentId });
    if (query.method) and.push({ method: query.method });
    if (query.cashierId) and.push({ receivedById: query.cashierId });
    if (query.from && query.to && query.from > query.to)
      throw invalid('from must be on or before to');
    if (query.from || query.to) {
      and.push({
        receivedOn: {
          ...(query.from ? { gte: parseDate(query.from) } : {}),
          ...(query.to ? { lte: parseDate(query.to) } : {}),
        },
      });
    }
    return { AND: and };
  }
}
