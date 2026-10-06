import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import { InvoiceSettlementService } from '../../finance-core/invoice-settlement.service';
import { LedgerService } from '../../finance-core/ledger.service';
import { planReversal, ReversalPlanError } from './reversal-plan';

/**
 * PAYMENT_REVERSAL: on approval the payment's allocations are released
 * (invoices reopen) and a REVERSAL ledger entry offsets the original PAYMENT
 * entry, which is never modified. Reject/return puts the payment back.
 */
@Injectable()
export class PaymentReversalHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'PAYMENT_REVERSAL' as const;
  readonly entityType = 'Payment';

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly ledger: LedgerService,
    private readonly settlement: InvoiceSettlementService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const found = await tx.payment.findUniqueOrThrow({
      where: { id: request.entityId },
    });
    await this.ledger.lockStudent(tx, found.studentId);
    const payment = await tx.payment.findUniqueOrThrow({
      where: { id: found.id },
      include: { allocations: true },
    });
    if (payment.status !== 'REVERSAL_PENDING')
      throw conflict(`The payment is ${payment.status.toLowerCase()}`);
    const entry = await tx.ledgerEntry.findFirst({
      where: { paymentId: payment.id, type: 'PAYMENT', refType: 'Payment' },
      orderBy: { createdAt: 'asc' },
    });
    if (!entry) throw conflict('The payment has no ledger entry');

    let plan;
    try {
      plan = planReversal(payment, payment.allocations, {
        entryId: entry.id,
        reason: payment.reversalReason ?? request.reason ?? 'Reversed',
        actorId: await this.decider(request, tx),
      });
    } catch (error) {
      if (error instanceof ReversalPlanError) throw conflict(error.message);
      throw error;
    }
    const reopened = await this.settlement.releasePayment(tx, payment.id);
    await this.ledger.post(tx, plan.postings);
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REVERSED',
        reversedAt: new Date(),
        unallocatedMinor: plan.unallocatedAfter,
      },
    });
    // Other advance credit of the student may settle the reopened invoices.
    await this.settlement.applyAdvance(tx, payment.studentId);
    this.audit.stage({
      action: 'payment.reverse',
      entityType: 'Payment',
      entityId: payment.id,
      schoolId: payment.schoolId,
      branchId: payment.branchId,
      before: {
        status: payment.status,
        unallocatedMinor: Number(payment.unallocatedMinor),
      },
      after: {
        status: 'REVERSED',
        reason: plan.postings[0].reason,
        reversesEntryId: entry.id,
        reopenedInvoiceIds: [...new Set(reopened)],
      },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const payment = await tx.payment.findUniqueOrThrow({
      where: { id: request.entityId },
    });
    await tx.payment.updateMany({
      where: { id: payment.id, status: 'REVERSAL_PENDING' },
      data: { status: 'RECORDED', reversalReason: null },
    });
    this.audit.stage({
      action: 'payment.reversal.declined',
      entityType: 'Payment',
      entityId: payment.id,
      schoolId: payment.schoolId,
      branchId: payment.branchId,
      before: { status: payment.status, reason: payment.reversalReason },
      after: { status: 'RECORDED', approvalStatus: request.status },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
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
