import { Injectable } from '@nestjs/common';
import type { PayrollRun } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { PayrollRunDto } from './dto/run.dto';
import {
  currentApprovalId,
  LINE_INCLUDE,
  toRunDto,
  type RunWithLines,
} from './run.mapper';

/** Loads lines, names, branch and approval state to build run DTOs. */
@Injectable()
export class RunViewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
  ) {}

  async one(runId: string): Promise<PayrollRunDto> {
    const run = await this.prisma.payrollRun.findUniqueOrThrow({
      where: { id: runId },
    });
    const [dto] = await this.many([run]);
    return dto;
  }

  async many(runs: PayrollRun[]): Promise<PayrollRunDto[]> {
    if (runs.length === 0) return [];
    const runIds = runs.map((r) => r.id);
    const approvalIds = runs.flatMap((r) => currentApprovalId(r) ?? []);
    const [lines, branches, approvals, pendingOvertime] = await Promise.all([
      this.prisma.payrollLine.findMany({
        where: { runId: { in: runIds } },
        include: LINE_INCLUDE,
        orderBy: { staff: { name: 'asc' } },
      }),
      this.prisma.branch.findMany({
        where: { id: { in: runs.map((r) => r.branchId) } },
        select: { id: true, name: true },
      }),
      this.prisma.approvalRequest.findMany({
        where: { id: { in: approvalIds } },
        select: { id: true, status: true },
      }),
      this.prisma.payrollOvertime.groupBy({
        by: ['branchId', 'month'],
        where: {
          status: 'PENDING',
          OR: runs.map((r) => ({ branchId: r.branchId, month: r.month })),
        },
        _count: { _all: true },
      }),
    ]);
    const names = await this.people.names(
      runs.flatMap((r) =>
        [r.calculatedById, r.reviewedById, r.approvedById].filter(
          (id): id is string => !!id,
        ),
      ),
    );
    const branchName = new Map(branches.map((b) => [b.id, b.name]));
    const approval = new Map(approvals.map((a) => [a.id, a]));
    return runs.map((run) => {
      const withLines: RunWithLines = {
        ...run,
        lines: lines.filter((l) => l.runId === run.id),
      };
      const approvalId = currentApprovalId(run);
      return toRunDto(withLines, {
        branchName: branchName.get(run.branchId) ?? '',
        names,
        approval: (approvalId && approval.get(approvalId)) || null,
        pendingOvertimeCount:
          pendingOvertime.find(
            (p) => p.branchId === run.branchId && p.month === run.month,
          )?._count._all ?? 0,
      });
    });
  }
}
