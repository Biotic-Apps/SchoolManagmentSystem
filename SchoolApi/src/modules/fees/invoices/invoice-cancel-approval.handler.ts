import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import { InvoiceLedgerService } from '../../finance-core/invoice-ledger.service';

const decider = async (
  request: ApprovalRequest,
  tx: Prisma.TransactionClient,
) =>
  (
    await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    })
  )?.decidedById ?? null;

/** INVOICE_CANCEL: approval posts the CANCELLATION entry; rejection clears the request. */
@Injectable()
export class InvoiceCancelApprovalHandler
  implements ApprovalHandler, OnModuleInit
{
  readonly type = 'INVOICE_CANCEL' as const;
  readonly entityType = 'Invoice';

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly invoices: InvoiceLedgerService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: request.entityId },
    });
    const reason = invoice.cancelReason ?? request.reason ?? 'Cancelled';
    const actorId = await decider(request, tx);
    // Refuses (409) when money arrived meanwhile; the approval stays pending.
    await this.invoices.cancel(tx, invoice.id, reason, actorId);
    this.audit.stage({
      action: 'invoice.cancel',
      entityType: 'Invoice',
      entityId: invoice.id,
      schoolId: invoice.schoolId,
      branchId: invoice.branchId,
      actorId: actorId ?? undefined,
      before: { status: invoice.status },
      after: { status: 'CANCELLED', reason, approvalId: request.id },
    });
  }

  async onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const invoice = await tx.invoice.update({
      where: { id: request.entityId },
      data: { cancelApprovalId: null, cancelReason: null },
    });
    this.audit.stage({
      action: 'invoice.cancel_rejected',
      entityType: 'Invoice',
      entityId: invoice.id,
      schoolId: invoice.schoolId,
      branchId: invoice.branchId,
      actorId: (await decider(request, tx)) ?? undefined,
      after: { approvalId: request.id, reason: request.reason },
    });
  }

  onReturned(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.onRejected(request, tx);
  }
}
