import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { domainError, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { PeriodDto } from '../dto/timetable.dto';
import {
  assertBellSchedule,
  groupSchedule,
  numberPeriods,
  periodsForDay,
  type BellRow,
  type BellRowInput,
} from './bell-schedule';
import { PeriodsInUse } from './periods-in-use';
import { PeriodsRepository } from './periods.repository';

export interface ScheduleWrite {
  days: Map<number, BellRowInput[]>;
  /** true: days missing from `days` are removed (full schedule PUT). */
  replaceAll: boolean;
  dropLessons: boolean;
}

/** Bell schedule reads and the guarded write shared by both endpoints. */
@Injectable()
export class PeriodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: PeriodsRepository,
    private readonly inUse: PeriodsInUse,
    private readonly audit: AuditService,
  ) {}

  /** GET /branches/:id/periods (default rows; parents allowed). */
  async list(scope: Scope, branchId: string): Promise<PeriodDto[]> {
    const branch = await this.branch(branchId);
    if (!scope.guardian) scope.assertReadBranch(branch);
    return this.forBranch(branchId);
  }

  rows(branchId: string): Promise<BellRow[]> {
    return this.repository.rows(branchId);
  }

  /** Default (day 0) rows, numbered. */
  async forBranch(branchId: string): Promise<PeriodDto[]> {
    return numberPeriods(
      (await this.repository.rows(branchId)).filter((r) => r.day === 0),
    );
  }

  /** The schedule a weekday actually uses. */
  async forDay(branchId: string, day: number): Promise<PeriodDto[]> {
    return periodsForDay(await this.repository.rows(branchId), day);
  }

  async schedule(branchId: string) {
    return groupSchedule(await this.repository.rows(branchId));
  }

  /** PUT /branches/:id/periods: writes day 0 only. */
  async replace(
    scope: Scope,
    branchId: string,
    periods: BellRowInput[],
    dropLessons = false,
  ): Promise<PeriodDto[]> {
    await this.write(scope, branchId, {
      days: new Map([[0, periods]]),
      replaceAll: false,
      dropLessons,
    });
    return this.forBranch(branchId);
  }

  async write(
    scope: Scope,
    branchId: string,
    input: ScheduleWrite,
  ): Promise<void> {
    const branch = await this.branch(branchId);
    scope.assertManageBranch(branch);
    for (const [day, rows] of input.days)
      assertBellSchedule(rows, day === 0 ? '' : `days.${day}: `);
    const before = await this.repository.rows(branchId);
    const next = this.merge(before, input);

    const dropped = await this.prisma.$transaction(async (tx) => {
      const affected = await this.inUse.find(branchId, before, next, tx);
      if (affected.slotIds.length > 0 && !input.dropLessons)
        throw domainError(
          ErrorCode.PERIODS_IN_USE,
          `${affected.details.length} lesson(s) are on periods that would be removed or become breaks`,
          affected.details,
        );
      if (affected.slotIds.length > 0)
        await tx.timetableSlot.deleteMany({
          where: { id: { in: affected.slotIds } },
        });
      await this.repository.write(tx, branch, input.days, input.replaceAll);
      return affected.details;
    });

    this.audit.stage({
      action: 'bell-schedule.update',
      entityType: 'Branch',
      entityId: branchId,
      schoolId: branch.schoolId,
      branchId,
      before: groupSchedule(before),
      after: {
        ...groupSchedule(await this.repository.rows(branchId)),
        ...(dropped.length > 0 && { droppedLessons: dropped }),
      },
    });
  }

  async branch(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw notFound('Branch');
    return branch;
  }

  private merge(before: BellRow[], input: ScheduleWrite): BellRow[] {
    const kept = input.replaceAll
      ? []
      : before.filter((r) => !input.days.has(r.day));
    const written = [...input.days.entries()].flatMap(([day, rows]) =>
      rows.map((r) => ({ ...r, day, label: r.label ?? null })),
    );
    return [...kept, ...written];
  }
}
