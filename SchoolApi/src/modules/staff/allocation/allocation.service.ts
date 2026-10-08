import { Injectable } from '@nestjs/common';
import type { StaffAssignmentKind } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { workingSlotWhere } from '../../academics/curriculum/working-slots';
import { AssignmentEnder } from '../assignments/assignment-ender';
import { writeAssignment } from '../assignments/assignment-writer';
import { AllocationTarget } from './allocation-target';
import type {
  AllocationRowDto,
  ClassTeacherRowDto,
} from './dto/allocation.dto';

type Section = Awaited<ReturnType<AllocationTarget['section']>>;

interface Change {
  section: Section;
  kind: StaffAssignmentKind;
  subjectId: string | null;
  staffId: string | null;
}

/** Class-centric teacher allocation: replace semantics over StaffAssignment (contract §5.3). */
@Injectable()
export class AllocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly target: AllocationTarget,
    private readonly ender: AssignmentEnder,
    private readonly audit: AuditService,
  ) {}

  async setSubjectTeacher(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    subjectId: string,
    staffId: string | null,
  ): Promise<AllocationRowDto> {
    const section = await this.target.section(scope, sectionId);
    await this.target.assertSubject(section, subjectId);
    await this.replace(user, {
      section,
      kind: 'SUBJECT_TEACHER',
      subjectId,
      staffId,
    });
    return this.subjectRow(sectionId, subjectId);
  }

  async setClassTeacher(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    staffId: string | null,
  ): Promise<ClassTeacherRowDto> {
    const section = await this.target.section(scope, sectionId);
    await this.replace(user, {
      section,
      kind: 'CLASS_TEACHER',
      subjectId: null,
      staffId,
    });
    const current = await this.current(sectionId, 'CLASS_TEACHER', null);
    return {
      sectionId,
      staff: current && { id: current.staff.id, name: current.staff.name },
      assignmentId: current?.id ?? null,
    };
  }

  /** Timetable `allocate: true`: only when nobody teaches the subject in the section yet. */
  async allocateIfFree(
    user: AuthUser,
    scope: Scope,
    sectionId: string,
    subjectId: string,
    staffId: string,
  ): Promise<boolean> {
    if (await this.current(sectionId, 'SUBJECT_TEACHER', subjectId))
      return false;
    await this.setSubjectTeacher(user, scope, sectionId, subjectId, staffId);
    return true;
  }

  async subjectRow(
    sectionId: string,
    subjectId: string,
  ): Promise<AllocationRowDto> {
    const [current, placed] = await Promise.all([
      this.current(sectionId, 'SUBJECT_TEACHER', subjectId),
      this.prisma.timetableSlot.count({
        where: {
          subjectId,
          timetable: { sectionId },
          AND: [workingSlotWhere()],
        },
      }),
    ]);
    return {
      sectionId,
      subjectId,
      staff: current && { id: current.staff.id, name: current.staff.name },
      assignmentId: current?.id ?? null,
      placed,
    };
  }

  private async replace(user: AuthUser, change: Change): Promise<void> {
    const { section, kind, subjectId, staffId } = change;
    const current = await this.current(section.id, kind, subjectId);
    if (current?.staffId === staffId) return;
    const staff = staffId
      ? await this.target.staff(section.schoolId, staffId)
      : null;
    this.target.assertNotOwn(user, staff?.userId, current?.staff.userId);

    await this.prisma.$transaction(async (tx) => {
      if (current) await this.ender.end(tx, [current]);
      if (staff)
        await writeAssignment(tx, {
          staff,
          kind,
          branchId: section.branchId,
          sessionId: section.sessionId,
          sectionId: section.id,
          subjectId,
          actorId: user.id,
        });
    });
    await this.ender.refresh([
      staff?.userId ?? null,
      current?.staff.userId ?? null,
    ]);
    this.audit.stage({
      action:
        kind === 'CLASS_TEACHER'
          ? 'section.class-teacher.update'
          : 'section.subject-teacher.update',
      entityType: 'Section',
      entityId: section.id,
      schoolId: section.schoolId,
      branchId: section.branchId,
      before: current && {
        subjectId,
        staff: { id: current.staff.id, name: current.staff.name },
      },
      after: { subjectId, staff: staff && { id: staff.id, name: staff.name } },
    });
  }

  private current(
    sectionId: string,
    kind: StaffAssignmentKind,
    subjectId: string | null,
  ) {
    return this.prisma.staffAssignment.findFirst({
      where: {
        sectionId,
        kind,
        subjectId: kind === 'SUBJECT_TEACHER' ? subjectId : undefined,
        isSubstitute: false,
        endedAt: null,
      },
      include: { staff: { select: { id: true, name: true, userId: true } } },
    });
  }
}
