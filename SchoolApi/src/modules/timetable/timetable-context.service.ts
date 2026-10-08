import { Injectable } from '@nestjs/common';
import type { Section, Timetable } from '../../generated/prisma/client';
import { forbiddenScope } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { Scope } from '../../core/rbac/scope/scope';
import { assertSessionOpen } from '../academic-sessions/session-lock';
import { appliesTo } from '../academics/curriculum/curriculum';
import { SectionAccessService } from '../students/section-access.service';
import type { BellRow } from './periods/bell-schedule';
import { PeriodsService } from './periods/periods.service';
import { TimetablesRepository } from './timetables.repository';

export type CurriculumRow = Awaited<
  ReturnType<TimetablesRepository['classSubjects']>
>[number];

/** Everything about one section that timetable reads and checks need. */
export interface SectionContext {
  section: Section;
  className: string;
  timetable: Timetable | null;
  bell: BellRow[];
  workingDays: number[];
  /** Class subjects that apply to this section's group, in curriculum order. */
  curriculum: CurriculumRow[];
  /** Caller may edit the draft (see `canEditDraft`). */
  editor: boolean;
  /** Caller manages the branch (allocation, publish/discard with timetable.publish). */
  manager: boolean;
}

@Injectable()
export class TimetableContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionAccessService,
    private readonly periods: PeriodsService,
    private readonly repository: TimetablesRepository,
  ) {}

  async read(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<SectionContext> {
    const section = await this.sections.read(scope, sectionId);
    return this.load(section, await this.rights(user, scope, section));
  }

  /** Draft editors only; the session must be open (403 FORBIDDEN_SCOPE otherwise). */
  async editable(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<SectionContext> {
    const ctx = await this.read(user, scope, sectionId);
    if (!ctx.editor)
      throw forbiddenScope(
        'Only the class teacher, coordinators and the principal edit this timetable',
      );
    const session = await this.prisma.academicSession.findUniqueOrThrow({
      where: { id: ctx.section.sessionId },
    });
    assertSessionOpen(session);
    return ctx;
  }

  /** Branch managers only (publish / discard). */
  async managed(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
  ): Promise<SectionContext> {
    const ctx = await this.editable(user, scope, sectionId);
    if (!ctx.manager) throw forbiddenScope();
    return ctx;
  }

  /**
   * User decision 2026-10-08: timetable.edit plus either managing the branch
   * (coordinator, head teacher, principal, super admin) or being the
   * section's class teacher.
   */
  private async rights(user: AuthUser, scope: Scope, section: Section) {
    const manager = scope.canManageBranch({
      id: section.branchId,
      schoolId: section.schoolId,
    });
    if (!user.permissions.has('timetable.edit'))
      return { editor: false, manager };
    if (manager) return { editor: true, manager };
    return { editor: await this.isClassTeacher(user, section), manager };
  }

  private async isClassTeacher(
    user: AuthUser,
    section: Section,
  ): Promise<boolean> {
    const count = await this.prisma.staffAssignment.count({
      where: {
        sectionId: section.id,
        kind: 'CLASS_TEACHER',
        endedAt: null,
        OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        staff: { userId: user.id },
      },
    });
    return count > 0;
  }

  private async load(
    section: Section,
    rights: { editor: boolean; manager: boolean },
  ): Promise<SectionContext> {
    const [schoolClass, timetable, bell, branch, subjects] = await Promise.all([
      this.prisma.schoolClass.findUniqueOrThrow({
        where: { id: section.classId },
        select: { name: true },
      }),
      this.repository.find(section.id, section.sessionId),
      this.periods.rows(section.branchId),
      this.prisma.branch.findUniqueOrThrow({
        where: { id: section.branchId },
        select: { workingDays: true },
      }),
      this.repository.classSubjects(section.classId),
    ]);
    return {
      section,
      className: schoolClass.name,
      timetable,
      bell,
      workingDays: branch.workingDays,
      curriculum: subjects.filter((cs) => appliesTo(cs.group, section.group)),
      ...rights,
    };
  }
}
