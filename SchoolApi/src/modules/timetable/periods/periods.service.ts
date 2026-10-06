import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { PeriodInputDto } from '../dto/timetable-input.dto';
import type { PeriodDto } from '../dto/timetable.dto';

export const toPeriodDto = (row: PeriodDto): PeriodDto => ({
  index: row.index,
  startTime: row.startTime,
  endTime: row.endTime,
  isBreak: row.isBreak,
  label: row.label,
});

/** Ordered, non-overlapping, start before end. */
export function assertBellSchedule(periods: PeriodInputDto[]): void {
  const sorted = [...periods].sort((a, b) => a.index - b.index);
  sorted.forEach((p, i) => {
    if (p.startTime >= p.endTime)
      throw invalid(`Period ${p.index}: start must be before end`);
    const prev = sorted[i - 1];
    if (prev && prev.index === p.index)
      throw invalid(`Period ${p.index} is repeated`);
    if (prev && prev.endTime > p.startTime)
      throw invalid(`Period ${p.index} overlaps period ${prev.index}`);
  });
}

@Injectable()
export class PeriodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, branchId: string): Promise<PeriodDto[]> {
    const branch = await this.branch(branchId);
    if (!scope.guardian) scope.assertReadBranch(branch);
    return this.forBranch(branchId);
  }

  async forBranch(branchId: string): Promise<PeriodDto[]> {
    const rows = await this.prisma.branchPeriod.findMany({
      where: { branchId },
      orderBy: { index: 'asc' },
    });
    return rows.map(toPeriodDto);
  }

  async replace(
    user: AuthUser,
    scope: Scope,
    branchId: string,
    periods: PeriodInputDto[],
  ) {
    const branch = await this.branch(branchId);
    scope.assertManageBranch(branch);
    assertBellSchedule(periods);
    const before = await this.forBranch(branchId);
    await this.prisma.$transaction([
      this.prisma.branchPeriod.deleteMany({ where: { branchId } }),
      this.prisma.branchPeriod.createMany({
        data: periods.map((p) => ({
          schoolId: branch.schoolId,
          branchId,
          index: p.index,
          startTime: p.startTime,
          endTime: p.endTime,
          isBreak: p.isBreak,
          label: p.label,
        })),
      }),
    ]);
    const after = await this.forBranch(branchId);
    this.audit.stage({
      action: 'timetable.periods',
      entityType: 'Branch',
      entityId: branchId,
      schoolId: branch.schoolId,
      branchId,
      before,
      after,
    });
    return after;
  }

  private async branch(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw notFound('Branch');
    return branch;
  }
}
