import { Injectable } from '@nestjs/common';
import type { ApprovalRequest, Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { JobDispatcher } from '../../../core/jobs/job-dispatcher';
import { QUEUES } from '../../../core/jobs/queues';
import { parseLineDetail } from '../calculation/line-detail';
import {
  PAYROLL_PAYSLIPS_JOB,
  type PayrollPayslipsInput,
} from './jobs/payroll-payslips.processor';

type Tx = Prisma.TransactionClient;

/**
 * Runs inside approval decide transactions: approves the run once every
 * line's approval is APPROVED, or returns it to REVIEWED on a rejection.
 */
@Injectable()
export class PayrollFinalizer {
  constructor(
    private readonly audit: AuditService,
    private readonly jobs: JobDispatcher,
  ) {}

  async tryApprove(tx: Tx, runId: string): Promise<boolean> {
    const run = await tx.payrollRun.findUnique({ where: { id: runId } });
    if (!run || run.status !== 'REVIEWED') return false;
    const lines = await tx.payrollLine.findMany({
      where: { runId },
      select: { approvalId: true, detail: true },
    });
    const approvalIds = [...new Set(lines.map((l) => l.approvalId))];
    if (lines.length === 0 || approvalIds.includes(null)) return false;
    const approved = await tx.approvalRequest.count({
      where: { id: { in: approvalIds as string[] }, status: 'APPROVED' },
    });
    if (approved !== approvalIds.length) return false;

    const step = await tx.approvalStep.findFirst({
      where: { requestId: run.approvalId ?? '', decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    // Nothing to pay on zero-net lines (e.g. fully recovered advance).
    await tx.payrollLine.updateMany({
      where: { runId, netMinor: 0n },
      data: { status: 'PAID' },
    });
    const unpaid = await tx.payrollLine.count({
      where: { runId, status: { not: 'PAID' } },
    });
    await tx.payrollRun.update({
      where: { id: run.id },
      data: {
        status: unpaid === 0 ? 'PAID' : 'APPROVED',
        approvedAt: new Date(),
        approvedById: step?.decidedById ?? null,
        pendingApprovalIds: [],
        version: { increment: 1 },
      },
    });
    const adjustmentIds = lines.flatMap((l) =>
      parseLineDetail(l.detail).adjustments.map((a) => a.id),
    );
    await tx.payrollAdjustment.updateMany({
      where: { id: { in: adjustmentIds }, status: 'PENDING' },
      data: { status: 'APPLIED', runId: run.id },
    });
    // Paid overtime is tied to the run so it is never paid twice.
    await tx.payrollOvertime.updateMany({
      where: {
        id: {
          in: lines.flatMap(
            (l) => parseLineDetail(l.detail).overtime?.entryIds ?? [],
          ),
        },
      },
      data: { runId: run.id },
    });
    this.audit.stage({
      action: 'payroll.run_approved',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      actorId: step?.decidedById ?? undefined,
      before: { status: run.status },
      after: { status: 'APPROVED', adjustmentsApplied: adjustmentIds.length },
    });
    // The processor waits until this transaction is visible.
    await this.jobs.dispatch<PayrollPayslipsInput>(
      QUEUES.PAYROLL,
      PAYROLL_PAYSLIPS_JOB,
      { runId: run.id, requestedById: step?.decidedById ?? run.createdById },
    );
    return true;
  }

  /** A rejected/returned approval sends the whole run back to REVIEWED. */
  async reset(tx: Tx, request: ApprovalRequest): Promise<void> {
    const run = await tx.payrollRun.findUnique({
      where: { id: request.entityId },
    });
    if (!run || run.status !== 'REVIEWED') return;
    const others = [run.approvalId, ...run.pendingApprovalIds].filter(
      (id): id is string => !!id && id !== request.id,
    );
    await tx.approvalRequest.updateMany({
      where: { id: { in: others }, status: 'PENDING' },
      data: { status: 'CANCELLED', decidedAt: new Date() },
    });
    await tx.payrollLine.updateMany({
      where: { runId: run.id },
      data: { route: 'BRANCH', approvalId: null },
    });
    await tx.payrollRun.update({
      where: { id: run.id },
      data: {
        approvalId: null,
        pendingApprovalIds: [],
        version: { increment: 1 },
      },
    });
    const step = await tx.approvalStep.findFirst({
      where: { requestId: request.id, decidedById: { not: null } },
      orderBy: { order: 'desc' },
    });
    this.audit.stage({
      action: 'payroll.run_approval_rejected',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      actorId: step?.decidedById ?? undefined,
      after: {
        status: 'REVIEWED',
        approvalId: request.id,
        outcome: request.status,
        note: step?.comment ?? null,
        cancelledApprovalIds: others,
      },
    });
  }
}
