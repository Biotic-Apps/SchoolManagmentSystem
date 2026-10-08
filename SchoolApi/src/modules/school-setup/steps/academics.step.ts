import { Injectable } from '@nestjs/common';
import { parseDate } from '../../../core/common/dates';
import { toSessionDto } from '../../academic-sessions/session.mapper';
import { SessionsRepository } from '../../academic-sessions/sessions.repository';
import { toClassDto, toSubjectDto } from '../../academics/academics.mapper';
import { ClassesRepository } from '../../academics/classes/classes.repository';
import { toSectionDto } from '../../academics/sections/section.mapper';
import { SectionsRepository } from '../../academics/sections/sections.repository';
import { SubjectsRepository } from '../../academics/subjects/subjects.repository';
import {
  generateBellSchedule,
  type BellPlan,
} from '../../timetable/periods/bell-generator';
import type { SessionDates } from '../session-defaults';
import type { CurriculumPlan, PlannedClass } from './curriculum-plan';
import type { PlacedBranch, SetupContext } from './setup-context';

export interface AcademicsPlan {
  session: SessionDates;
  curriculum: CurriculumPlan;
  bellSchedule: BellPlan;
  workingDays: number[];
}

/** ACTIVE session, classes with their sections and curriculum, subjects, bell schedule. */
@Injectable()
export class AcademicsStep {
  constructor(
    private readonly sessions: SessionsRepository,
    private readonly classes: ClassesRepository,
    private readonly sections: SectionsRepository,
    private readonly subjects: SubjectsRepository,
  ) {}

  async run(ctx: SetupContext, branch: PlacedBranch, plan: AcademicsPlan) {
    const session = await this.sessions.create(
      {
        schoolId: branch.schoolId,
        branchId: branch.id,
        name: plan.session.name,
        startDate: parseDate(plan.session.startDate),
        endDate: parseDate(plan.session.endDate),
        status: 'ACTIVE',
        createdById: ctx.actorId,
      },
      ctx.tx,
    );
    this.record(ctx, branch, 'session.create', 'AcademicSession', session.id, {
      after: toSessionDto(session),
    });

    const subjectIds = new Map<string, string>();
    for (const preset of plan.curriculum.subjects) {
      const subject = await this.subjects.create(
        { schoolId: branch.schoolId, ...preset, createdById: ctx.actorId },
        ctx.tx,
      );
      subjectIds.set(preset.code, subject.id);
      this.record(ctx, branch, 'subject.create', 'Subject', subject.id, {
        after: toSubjectDto(subject),
      });
    }

    let sections = 0;
    let classSubjects = 0;
    for (const planned of plan.curriculum.classes) {
      sections += await this.createClass(
        ctx,
        branch,
        session.id,
        planned,
        subjectIds,
      );
      classSubjects += planned.subjects.length;
    }
    const periods = await this.createBellSchedule(ctx, branch, plan);

    return {
      session,
      counts: {
        classes: plan.curriculum.classes.length,
        sections,
        subjects: plan.curriculum.subjects.length,
        classSubjects,
        periods,
      },
    };
  }

  private async createClass(
    ctx: SetupContext,
    branch: PlacedBranch,
    sessionId: string,
    planned: PlannedClass,
    subjectIds: Map<string, string>,
  ): Promise<number> {
    const schoolClass = await this.classes.create(
      {
        schoolId: branch.schoolId,
        name: planned.name,
        levelOrder: planned.levelOrder,
        createdById: ctx.actorId,
      },
      ctx.tx,
    );
    this.record(ctx, branch, 'class.create', 'SchoolClass', schoolClass.id, {
      after: toClassDto(schoolClass),
    });
    for (const s of planned.sections) {
      const section = await this.sections.create(
        {
          schoolId: branch.schoolId,
          branchId: branch.id,
          sessionId,
          classId: schoolClass.id,
          name: s.name,
          group: s.group,
          createdById: ctx.actorId,
        },
        ctx.tx,
      );
      this.record(ctx, branch, 'section.create', 'Section', section.id, {
        after: toSectionDto(section),
      });
    }
    if (planned.subjects.length > 0) {
      await ctx.tx.classSubject.createMany({
        data: planned.subjects.map((s, sortOrder) => ({
          schoolId: branch.schoolId,
          classId: schoolClass.id,
          subjectId: subjectIds.get(s.code)!,
          periodsPerWeek: s.periodsPerWeek,
          isOptional: s.isOptional,
          group: s.group,
          sortOrder,
        })),
      });
      this.record(
        ctx,
        branch,
        'class.subjects.update',
        'SchoolClass',
        schoolClass.id,
        {
          after: planned.subjects.map((s) => ({
            subject: s.name,
            periodsPerWeek: s.periodsPerWeek,
            group: s.group,
            isOptional: s.isOptional,
          })),
        },
      );
    }
    return planned.sections.length;
  }

  private async createBellSchedule(
    ctx: SetupContext,
    branch: PlacedBranch,
    plan: AcademicsPlan,
  ): Promise<number> {
    const schedule = generateBellSchedule(
      plan.bellSchedule,
      plan.workingDays,
      'academics.bellSchedule',
    );
    const days: [number, typeof schedule.default][] = [
      [0, schedule.default],
      ...Object.entries(schedule.days).map(
        ([day, rows]) => [Number(day), rows] as [number, typeof rows],
      ),
    ];
    const data = days.flatMap(([day, rows]) =>
      rows.map((r) => ({
        schoolId: branch.schoolId,
        branchId: branch.id,
        day,
        index: r.index,
        startTime: r.startTime,
        endTime: r.endTime,
        isBreak: r.isBreak,
        label: r.isBreak ? (r.label ?? 'Break') : null,
      })),
    );
    await ctx.tx.branchPeriod.createMany({ data });
    this.record(ctx, branch, 'bell-schedule.update', 'Branch', branch.id, {
      after: Object.fromEntries(days),
    });
    return data.length;
  }

  private record(
    ctx: SetupContext,
    branch: PlacedBranch,
    action: string,
    entityType: string,
    entityId: string,
    change: { after: unknown },
  ): void {
    ctx.audit.push({
      action,
      entityType,
      entityId,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: change.after,
    });
  }
}
