import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  notFound,
} from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ApprovalRouting } from '../../finance-core/approval-routing';
import { LedgerService } from '../../finance-core/ledger.service';
import { formatMinor } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { FinanceAccess } from '../shared/finance-access';
import type {
  CreateRefundDto,
  RefundDto,
  RefundQueryDto,
} from './dto/refund.dto';
import { REFUND_INCLUDE, toRefundDto, type RefundRow } from './refund.mapper';
import { canRefund, refundableMinor } from './refundable';

/** Refunds of advance credit → REFUND approval (contract B4). */
@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly ledger: LedgerService,
    private readonly routing: ApprovalRouting,
    private readonly approvals: ApprovalService,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateRefundDto,
  ): Promise<RefundDto> {
    if (scope.guardian) throw forbidden();
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
    });
    if (!payment) throw notFound('Payment');
    this.access.assertRecord(scope, payment, 'Payment');
    const amount = BigInt(dto.amountMinor);
    const steps = await this.routing.steps(
      payment.branchId,
      'REFUND',
      user.activeRole,
    );

    const refund = await this.prisma.$transaction(async (tx) => {
      await this.ledger.lockStudent(tx, payment.studentId);
      const current = await tx.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });
      if (current.status !== 'RECORDED')
        throw conflict(`The payment is ${current.status.toLowerCase()}`);
      const pending = await tx.refund.aggregate({
        where: { paymentId: payment.id, status: 'PENDING' },
        _sum: { amountMinor: true },
      });
      const pendingMinor = pending._sum.amountMinor ?? 0n;
      if (!canRefund(amount, current.unallocatedMinor, pendingMinor)) {
        throw conflict(
          'Only unallocated (advance) money can be refunded; reverse the payment to refund allocated money',
          {
            refundableMinor: Number(
              refundableMinor(current.unallocatedMinor, pendingMinor),
            ),
          },
        );
      }
      const created = await tx.refund.create({
        data: {
          schoolId: payment.schoolId,
          branchId: payment.branchId,
          studentId: payment.studentId,
          paymentId: payment.id,
          amountMinor: amount,
          method: dto.method,
          reason: dto.reason,
          requestedById: user.id,
        },
      });
      const approval = await this.approvals.create(
        {
          type: 'REFUND',
          entityType: 'Refund',
          entityId: created.id,
          schoolId: payment.schoolId,
          branchId: payment.branchId,
          requestedById: user.id,
          title: `Refund ${formatMinor(amount, payment.currency)} of ${payment.receiptNo}`,
          payload: {
            refundId: created.id,
            paymentId: payment.id,
            amountMinor: dto.amountMinor,
          },
          reason: dto.reason,
          amountMinor: amount,
          steps,
        },
        tx,
      );
      return tx.refund.update({
        where: { id: created.id },
        data: { approvalId: approval.id },
        include: REFUND_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'refund.request',
      entityType: 'Refund',
      entityId: refund.id,
      schoolId: refund.schoolId,
      branchId: refund.branchId,
      after: {
        paymentId: refund.paymentId,
        amountMinor: dto.amountMinor,
        method: dto.method,
        reason: dto.reason,
      },
    });
    return (await this.dtos([refund]))[0];
  }

  async list(
    scope: Scope,
    query: RefundQueryDto,
  ): Promise<PageResult<RefundDto>> {
    if (scope.guardian) throw forbidden();
    const and: Prisma.RefundWhereInput[] = [scope.managedBranchFilter()];
    if (query.branchId) {
      await this.access.managedBranch(scope, query.branchId);
      and.push({ branchId: query.branchId });
    }
    if (query.studentId) and.push({ studentId: query.studentId });
    if (query.status) and.push({ status: query.status });
    const where = { AND: and };
    const [rows, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: REFUND_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.refund.count({ where }),
    ]);
    return toPageResult(await this.dtos(rows), total, query);
  }

  private async dtos(rows: RefundRow[]): Promise<RefundDto[]> {
    const names = await this.people.names(rows.map((r) => r.requestedById));
    return rows.map((row) => toRefundDto(row, names));
  }
}
