import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../../core/jobs/queues';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { GeneratedDocumentService } from '../../../generated-docs/generated-document.service';
import { isApproved } from '../../runs/run-status';

export const PAYROLL_PAYSLIPS_JOB = 'payroll.payslips';

export interface PayrollPayslipsInput {
  runId: string;
  requestedById: string;
}

const WAIT_ATTEMPTS = 10;
const WAIT_MS = 500;

/**
 * After approval: requests the PAYSLIP PDF of every line whose staff has a
 * login and tells them their payslip is ready. Dispatched from inside the
 * approval transaction, so it first waits for the approval to be visible.
 */
@Injectable()
export class PayrollPayslipsProcessor
  implements JobProcessor<PayrollPayslipsInput>, OnModuleInit
{
  readonly queue = QUEUES.PAYROLL;
  readonly name = PAYROLL_PAYSLIPS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly documents: GeneratedDocumentService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: PayrollPayslipsInput): Promise<void> {
    const run = await this.approvedRun(input.runId);
    const lines = await this.prisma.payrollLine.findMany({
      where: { runId: run.id, staff: { userId: { not: null } } },
      select: { id: true, staff: { select: { userId: true } } },
    });
    for (const line of lines) {
      await this.documents.request(
        { id: input.requestedById },
        {
          kind: 'PAYSLIP',
          entityId: line.id,
          schoolId: run.schoolId,
          ownerUserId: line.staff.userId!,
        },
      );
    }
    await this.notifications.notify({
      userIds: lines.map((l) => l.staff.userId!),
      category: 'PAYROLL',
      title: `Payslip ${run.month} ready`,
      body: 'Your salary for the month was approved. Open My salary to view the payslip.',
      data: { month: run.month },
    });
  }

  private async approvedRun(runId: string) {
    for (let attempt = 0; attempt < WAIT_ATTEMPTS; attempt++) {
      const run = await this.prisma.payrollRun.findUnique({
        where: { id: runId },
      });
      if (run && isApproved(run.status)) return run;
      await sleep(WAIT_MS);
    }
    throw new Error(`Payroll run ${runId} is not approved`);
  }
}
