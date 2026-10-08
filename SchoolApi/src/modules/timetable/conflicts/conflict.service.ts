import { Injectable } from '@nestjs/common';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { layoutOf } from '../periods/bell-schedule';
import type { SectionContext } from '../timetable-context.service';
import { TimetablesRepository } from '../timetables.repository';
import { findConflicts, teachingKey } from './conflict-checker';
import type { Conflict, PlannedSlot } from './conflict-types';

export const MAX_PERIODS_SETTING = 'timetable.maxPeriodsPerDay';

/** Loads the other sections, allocations and limits, then runs the pure checker. */
@Injectable()
export class ConflictService {
  constructor(
    private readonly repository: TimetablesRepository,
    private readonly settings: BranchSettingsReader,
  ) {}

  async check(ctx: SectionContext, slots: PlannedSlot[]): Promise<Conflict[]> {
    const { section } = ctx;
    const [others, teaching, maxPeriodsPerDay] = await Promise.all([
      this.repository.others(section.sessionId, section.id),
      this.repository.teachingAssignments(section.id),
      this.maxPeriodsPerDay(section.branchId),
    ]);
    return findConflicts({
      slots,
      workingDays: new Set(ctx.workingDays),
      periodsOn: (day) => layoutOf(ctx.bell, day),
      others: others.published,
      otherDrafts: others.drafts,
      teaching: new Set(
        teaching.map((t) =>
          teachingKey(
            t.staffId,
            t.kind === 'CLASS_TEACHER' ? '*' : (t.subjectId ?? ''),
          ),
        ),
      ),
      curriculum: new Map(
        ctx.curriculum.map((cs) => [
          cs.subjectId,
          { name: cs.subject.name, periodsPerWeek: cs.periodsPerWeek },
        ]),
      ),
      maxPeriodsPerDay,
    });
  }

  maxPeriodsPerDay(branchId: string): Promise<number> {
    return this.settings.get<number>(branchId, MAX_PERIODS_SETTING);
  }
}
