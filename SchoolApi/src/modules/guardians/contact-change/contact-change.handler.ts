import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import type { ContactChangePayload } from './contact-change.service';

/** Applies the new contact; the old value stays in the audit history. */
@Injectable()
export class ContactChangeHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'CONTACT_CHANGE' as const;

  constructor(
    private readonly registry: ApprovalHandlerRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const payload = request.payload as unknown as ContactChangePayload;
    await tx.guardian.update({
      where: { id: payload.guardianId },
      data: payload.after,
    });
    this.audit.stage({
      action: 'guardian.contact_change',
      entityType: 'Guardian',
      entityId: payload.guardianId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      before: payload.before,
      after: payload.after,
    });
  }

  async onRejected(): Promise<void> {}
}
