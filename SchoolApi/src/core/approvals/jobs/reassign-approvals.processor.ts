import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import type { JobProcessor } from '../../jobs/job-processor';
import { JobProcessorRegistry } from '../../jobs/job-processor.registry';
import { QUEUES } from '../../jobs/queues';
import { ApprovalsRepository } from '../approvals.repository';

export const REASSIGN_APPROVALS_JOB = 'approvals.reassign';

export interface ReassignApprovalsInput {
  branchId: string;
  fromUserId: string;
  toUserId: string;
}

/** Moves pending approvals of a replaced approver (e.g. principal change). */
@Injectable()
export class ReassignApprovalsProcessor
  implements JobProcessor<ReassignApprovalsInput>, OnModuleInit
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = REASSIGN_APPROVALS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly repository: ApprovalsRepository,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: ReassignApprovalsInput): Promise<void> {
    const result = await this.repository.reassignPending(
      input.branchId,
      input.fromUserId,
      input.toUserId,
    );
    if (result.count === 0) return;
    await this.audit.write(
      [
        {
          action: 'approval.reassign',
          entityType: 'Branch',
          entityId: input.branchId,
          branchId: input.branchId,
          after: { ...input, steps: result.count },
        },
      ],
      {},
    );
  }
}
