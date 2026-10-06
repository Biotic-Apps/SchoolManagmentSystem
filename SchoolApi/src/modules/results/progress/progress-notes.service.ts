import { Injectable } from '@nestjs/common';
import type { ProgressNote } from '../../../generated/prisma/client';
import {
  conflict,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ProbationGate } from '../../../core/probation/probation-gate';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { LookupService } from '../shared/lookup.service';
import {
  StudentAccessService,
  type StudentReach,
} from '../shared/student-access.service';
import type {
  CreateProgressNoteDto,
  ProgressNoteDto,
  ProgressNoteResultDto,
} from './dto/progress.dto';
import {
  PROGRESS_NOTE_ACTION,
  ProgressNoteAction,
  type ProgressNotePayload,
} from './progress-note.action';

/** Teacher feedback per student; parents see only notes shared with them. */
@Injectable()
export class ProgressNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentAccessService,
    private readonly people: SchoolPeopleService,
    private readonly lookup: LookupService,
    private readonly action: ProgressNoteAction,
    private readonly gate: ProbationGate,
  ) {}

  async list(scope: Scope, studentId: string): Promise<ProgressNoteDto[]> {
    await this.students.read(scope, studentId);
    const rows = await this.prisma.progressNote.findMany({
      where: {
        studentId,
        ...(scope.guardian ? { visibleToParent: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return this.toDtos(rows);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    dto: CreateProgressNoteDto,
  ): Promise<ProgressNoteResultDto> {
    if (scope.guardian) throw notFound('Student');
    const student = await this.students.read(scope, studentId);
    if (!student.active)
      throw conflict('The student is not currently enrolled');
    const onBehalfOfStaffId = await this.authorFor(user, scope, student);
    const payload: ProgressNotePayload = {
      studentId,
      sectionId: student.sectionId,
      schoolId: student.schoolId,
      branchId: student.branchId,
      category: dto.category,
      note: dto.note.trim(),
      visibleToParent: dto.visibleToParent,
      authorId: user.id,
      onBehalfOfStaffId,
    };
    const outcome = await this.gate.run(
      { userId: user.id, onBehalfOfStaffId },
      {
        key: PROGRESS_NOTE_ACTION,
        entityType: 'Student',
        entityId: studentId,
        schoolId: student.schoolId,
        branchId: student.branchId,
        title: `Progress note: ${student.name}`,
        payload,
      },
      () => this.prisma.$transaction((tx) => this.action.create(payload, tx)),
    );
    if (outcome.status === 'PENDING_REVIEW')
      return {
        status: outcome.status,
        approvalId: outcome.approvalId,
        note: null,
      };
    return {
      status: 'APPLIED',
      approvalId: null,
      note: (await this.toDtos([outcome.result]))[0],
    };
  }

  /** Class/subject teacher of the section, else a branch manager (proxy → class teacher). */
  private async authorFor(
    user: AuthUser,
    scope: Scope,
    student: StudentReach,
  ): Promise<string | null> {
    const prefix = `${student.sectionId}:`;
    const teaches =
      scope.classSectionIds.has(student.sectionId) ||
      [...scope.subjectSectionKeys].some((k) => k.startsWith(prefix));
    if (teaches) return null;
    if (
      !scope.canManageBranch({
        id: student.branchId,
        schoolId: student.schoolId,
      })
    )
      throw forbiddenScope('You do not teach this student');
    if (!user.permissions.has('teacherwork.proxy')) return null;
    return (await this.people.classTeacher(student.sectionId))?.staffId ?? null;
  }

  private async toDtos(rows: ProgressNote[]): Promise<ProgressNoteDto[]> {
    const users = await this.lookup.users(rows.map((r) => r.authorId));
    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      sectionId: r.sectionId,
      category: r.category,
      note: r.note,
      visibleToParent: r.visibleToParent,
      author: { id: r.authorId, name: users.get(r.authorId) ?? '' },
      onBehalfOfStaffId: r.onBehalfOfStaffId,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
