import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import { LedgerService } from '../../finance-core/ledger.service';

/**
 * REFUND: on approval the advance credit of the payment shrinks and a REFUND
 * ledger entry (+amount) records the money paid back. Rejection keeps the credit.
 */
@Injectable()
export class RefundApprovalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'REFUND' as const;
  readonly entityType = 'Refund';

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const refund = await tx.refund.findUniqueOrThrow({
      where: { id: request.entityId },
    });
    await this.ledger.lockStudent(tx, refund.studentId);
    if (refund.status !== 'PENDING')
      throw conflict(`The refund is ${refund.status.toLowerCase()}`);
    const payment = await tx.payment.findUniqueOrThrow({
      where: { id: refund.paymentId },
    });
    if (payment.status !== 'RECORDED')
      throw conflict(`The payment is ${payment.status.toLowerCase()}`);
    if (payment.unallocatedMinor < refund.amountMinor) {
      throw conflict(
        'The advance credit was already used on invoices; reject this refund',
        { unallocatedMinor: Number(payment.unallocatedMinor) },
      );
    }
    await tx.payment.update({
      where: { id: payment.id },
      data: { unallocatedMinor: payment.unallocatedMinor - refund.amountMinor },
    });
    const actorId = await this.decider(request, tx);
    await this.ledger.post(tx, [
      {
        schoolId: refund.schoolId,
        branchId: refund.branchId,
        studentId: refund.studentId,
        type: 'REFUND',
        amountMinor: refund.amountMinor,
        refType: 'Refund',
        refId: refund.id,
        paymentId: payment.id,
        reason: refund.reason,
        createdById: actorId,
      },
    ]);
    await this.decide(refund.id, 'APPROVED', tx);
    this.audit.stage({
      action: 'refund.approved',
      entityType: 'Refund',
      entityId: refund.id,
      schoolId: refund.schoolId,
      branchId: refund.branchId,
      actorId: actorId ?? undefined,
      before: { unallocatedMinor: Number(payment.unallocatedMinor) },
      after: {
        status: 'APPROVED',
        amountMinor: Number(refund.amountMinor),
        unallocatedMinor: Number(payment.unallocatedMinor - refund.amountMinor),
      },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const refund = await this.decide(request.entityId, 'REJECTED', tx);
    this.audit.stage({
      action: 'refund.rejected',
      entityType: 'Refund',
      entityId: refund.id,
      schoolId: refund.schoolId,
      branchId: refund.branchId,
      after: { status: 'REJECTED', approvalStatus: request.status },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }

  private decide(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    tx: Prisma.TransactionClient,
  ) {
    return tx.refund.update({
      where: { id },
      data: { status, decidedAt: new Date() },
    });
  }

  private async decider(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<string | null> {
    const step = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    return step?.decidedById ?? null;
  }
}
