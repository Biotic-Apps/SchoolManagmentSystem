import { Injectable } from '@nestjs/common';
import type { PayrollRun, Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, notFound } from '../../../core/common/errors/errors';
import { toJson } from '../../../core/common/prisma-json';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { sumMinor } from '../../finance-core/money';
import { parseComponents, structureFor } from '../structures/current-structure';
import { CALCULABLE_STATUSES } from '../runs/run-status';
import type { LineDetail } from './line-detail';
import { calculateLine } from './payroll-calc';
import {
  PayrollInputsService,
  type MonthInputs,
} from './payroll-inputs.service';
import { unpaidHalfDays } from './unpaid-days';

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
    private readonly audit: AuditService,
  ) {}

  async calculate(runId: string, userId: string): Promise<number> {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id: runId },
    });
    if (!run) throw notFound('Payroll run');
    assertCalculable(run);
    const staff = await this.prisma.staff.findMany({
      where: { branchId: run.branchId, status: 'ACTIVE' },
      include: { salaryStructures: true },
      orderBy: { name: 'asc' },
    });
    const paid = staff.flatMap((s) => {
      const structure = structureFor(s.salaryStructures, run.month);
      return structure ? [{ staff: s, structure }] : [];
    });
    const inputs = await this.inputs.load(
      run.branchId,
      run.month,
      paid.map((p) => p.staff.id),
    );
    const lines = paid.map(({ staff: s, structure }) =>
      this.line(run.id, s.id, s.designation, structure, inputs),
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

  private line(
    runId: string,
    staffId: string,
    designation: string,
    structure: {
      id: string;
      basicMinor: bigint;
      allowances: unknown;
      deductions: unknown;
    },
    inputs: MonthInputs,
  ): Prisma.PayrollLineCreateManyInput {
    const own = inputs.of(staffId);
    const halfDays = unpaidHalfDays(
      inputs.workingDays,
      own.leaves,
      own.attendance,
    );
    const allowances = parseComponents(structure.allowances);
    const deductions = parseComponents(structure.deductions);
    const adjustments = own.adjustments.map((a) => ({
      id: a.id,
      kind: a.kind,
      amountMinor: a.amountMinor,
      reason: a.reason,
    }));
    const result = calculateLine({
      basicMinor: structure.basicMinor,
      allowances,
      deductions,
      workingDays: inputs.workingDays.length,
      unpaidHalfDays: halfDays,
      adjustments,
    });
    const detail: LineDetail = {
      allowances,
      deductions,
      adjustments: adjustments.map((a) => ({
        ...a,
        amountMinor: Number(a.amountMinor),
      })),
      unpaidHalfDays: halfDays,
      grossMinor: Number(result.grossMinor),
      ...(result.uncappedNetMinor < 0n
        ? { uncappedNetMinor: Number(result.uncappedNetMinor) }
        : {}),
    };
    return {
      runId,
      staffId,
      designation,
      structureId: structure.id,
      basicMinor: result.basicMinor,
      allowancesMinor: result.allowancesMinor,
      deductionsMinor: result.deductionsMinor,
      workingDays: inputs.workingDays.length,
      unpaidLeaveDays: (halfDays / 2).toFixed(1),
      leaveDeductionMinor: result.leaveDeductionMinor,
      adjustmentsMinor: result.adjustmentsMinor,
      netMinor: result.netMinor,
      detail: toJson(detail),
    };
  }
}
