import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import type { ApprovalHandler } from '../../../core/approvals/approval-handler';
import { ApprovalHandlerRegistry } from '../../../core/approvals/approval-handler.registry';
import { AuditService } from '../../../core/audit/audit.service';
import {
  mergeProfile,
  toHealthProfile,
  toProfileColumns,
} from '../profile/health-profile.mapper';
import {
  HEALTH_ENTITY,
  type HealthChangePayload,
} from './health-change.service';

/** CONTACT_CHANGE of HEALTH: merges the parent's changes into the profile. */
@Injectable()
export class HealthChangeHandler implements ApprovalHandler, OnModuleInit {
  readonly type = 'CONTACT_CHANGE' as const;
  readonly entityType = HEALTH_ENTITY;

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
    const payload = request.payload as unknown as HealthChangePayload;
    const studentId = payload.studentId;
    const row = await tx.studentHealthProfile.findUnique({
      where: { studentId },
    });
    const before = toHealthProfile(row);
    const after = mergeProfile(before, payload.changes);
    const columns = toProfileColumns(after, request.requestedById);
    await tx.studentHealthProfile.upsert({
      where: { studentId },
      create: { studentId, ...columns },
      update: columns,
    });
    this.audit.stage({
      action: 'health.change_apply',
      entityType: 'Student',
      entityId: studentId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      before,
      after,
    });
  }

  async onRejected(): Promise<void> {}
}
