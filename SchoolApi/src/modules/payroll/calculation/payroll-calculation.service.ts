import { Injectable } from '@nestjs/common';
import type { PayrollRun } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { sumMinor } from '../../finance-core/money';
import { OvertimeSyncService } from '../overtime/overtime-sync.service';
import { structureFor } from '../structures/current-structure';
import { CALCULABLE_STATUSES } from '../runs/run-status';
import { buildLine } from './line-builder';
import { PayrollInputsService } from './payroll-inputs.service';

export const assertCalculable = (run: PayrollRun): void => {
  if (!CALCULABLE_STATUSES.includes(run.status)) {
    throw conflict(`A ${run.status} payroll run cannot be recalculated`);
  }
  if (run.pendingApprovalIds.length > 0) {
    throw conflict('Payroll run has a pending approval');
  }
};

/** Builds the lines of a run; previous (unapproved) lines are replaced. */
@Injectable()
export class PayrollCalculationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inputs: PayrollInputsService,
    private readonly overtime: OvertimeSyncService,
    private readonly audit: AuditService,
  ) {}

  async calculate(runId: string, userId: string): Promise<number> {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id: runId },
    });
    if (!run) throw notFound('Payroll run');
    assertCalculable(run);
    const staff = await this.prisma.staff.findMany({
      // Every staff type with a salary structure; staff on leave are still paid.
      where: { branchId: run.branchId, status: { in: ['ACTIVE', 'ON_LEAVE'] } },
      include: { salaryStructures: true },
      orderBy: { name: 'asc' },
    });
    const paid = staff.flatMap((s) => {
      const structure = structureFor(s.salaryStructures, run.month);
      return structure ? [{ staff: s, structure }] : [];
    });
    // Late check-outs become pending overtime first, so approvers see them.
    await this.overtime.sync(run.branchId, run.month);
    const inputs = await this.inputs.load(
      run.branchId,
      run.month,
      paid.map((p) => p.staff.id),
    );
    const lines = paid.map(({ staff: s, structure }) =>
      buildLine(run.id, s, structure, inputs),
    );

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payrollRun.updateMany({
        where: {
          id: run.id,
          version: run.version,
          status: { in: CALCULABLE_STATUSES },
          pendingApprovalIds: { isEmpty: true },
        },
        data: {
          status: 'CALCULATED',
          calculatedAt: new Date(),
          calculatedById: userId,
          reviewedById: null,
          reviewedAt: null,
          approvalId: null,
          version: { increment: 1 },
        },
      });
      if (updated.count === 0) throw conflict('Payroll run changed, reload');
      await tx.payrollLine.deleteMany({ where: { runId: run.id } });
      await tx.payrollLine.createMany({ data: lines });
    });
    this.audit.stage({
      action: 'payroll.run_calculate',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      actorId: userId,
      before: { status: run.status },
      after: {
        status: 'CALCULATED',
        lines: lines.length,
        netMinor: Number(sumMinor(lines.map((l) => BigInt(l.netMinor)))),
      },
    });
    return lines.length;
  }
}
