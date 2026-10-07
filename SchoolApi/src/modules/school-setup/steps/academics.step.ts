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
  CLASS_PRESETS,
  SUBJECT_PRESETS,
  sectionNames,
  type ClassesPreset,
  type SubjectsPreset,
} from '../presets';
import type { SessionDates } from '../session-defaults';
import type { PlacedBranch, SetupContext } from './setup-context';

export interface AcademicsPlan {
  session: SessionDates;
  classesPreset: ClassesPreset;
  sectionsPerClass: number;
  subjectsPreset: SubjectsPreset;
}

/** ACTIVE session, preset classes with their sections, preset subjects (contract §1 item 4). */
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
    this.record(
      ctx,
      branch,
      'session.create',
      'AcademicSession',
      session.id,
      toSessionDto(session),
    );

    let sectionCount = 0;
    const names = CLASS_PRESETS[plan.classesPreset];
    for (const [index, name] of names.entries()) {
      const schoolClass = await this.classes.create(
        {
          schoolId: branch.schoolId,
          name,
          levelOrder: index + 1,
          createdById: ctx.actorId,
        },
        ctx.tx,
      );
      this.record(
        ctx,
        branch,
        'class.create',
        'SchoolClass',
        schoolClass.id,
        toClassDto(schoolClass),
      );
      for (const sectionName of sectionNames(plan.sectionsPerClass)) {
        const section = await this.sections.create(
          {
            schoolId: branch.schoolId,
            branchId: branch.id,
            sessionId: session.id,
            classId: schoolClass.id,
            name: sectionName,
            createdById: ctx.actorId,
          },
          ctx.tx,
        );
        this.record(
          ctx,
          branch,
          'section.create',
          'Section',
          section.id,
          toSectionDto(section),
        );
        sectionCount++;
      }
    }

    const presets = SUBJECT_PRESETS[plan.subjectsPreset];
    for (const preset of presets) {
      const subject = await this.subjects.create(
        { schoolId: branch.schoolId, ...preset, createdById: ctx.actorId },
        ctx.tx,
      );
      this.record(
        ctx,
        branch,
        'subject.create',
        'Subject',
        subject.id,
        toSubjectDto(subject),
      );
    }

    return {
      session,
      counts: {
        classes: names.length,
        sections: sectionCount,
        subjects: presets.length,
      },
    };
  }

  private record(
    ctx: SetupContext,
    branch: PlacedBranch,
    action: string,
    entityType: string,
    entityId: string,
    after: unknown,
  ): void {
    ctx.audit.push({
      action,
      entityType,
      entityId,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after,
    });
  }
}
