import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';

/** RESULT_PUBLISH approved → RESULTS_APPROVED; rejected/returned stays MARKS_CLOSED. */
@Injectable()
export class ResultPublishHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'RESULT_PUBLISH' as const;
  readonly entityType = 'Exam';

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
    const updated = await tx.exam.updateMany({
      where: {
        id: request.entityId,
        approvalId: request.id,
        status: 'MARKS_CLOSED',
      },
      data: { status: 'RESULTS_APPROVED', version: { increment: 1 } },
    });
    this.stage(request, updated.count > 0 ? 'RESULTS_APPROVED' : 'UNCHANGED');
  }

  onRejected(request: ApprovalRequest): Promise<void> {
    this.stage(request, 'REJECTED');
    return Promise.resolve();
  }

  onReturned(request: ApprovalRequest): Promise<void> {
    this.stage(request, 'RETURNED');
    return Promise.resolve();
  }

  private stage(request: ApprovalRequest, outcome: string) {
    this.audit.stage({
      action: 'exam.results_decision',
      entityType: 'Exam',
      entityId: request.entityId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      after: { approvalId: request.id, outcome },
    });
  }
}
