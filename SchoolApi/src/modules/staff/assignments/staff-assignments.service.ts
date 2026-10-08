import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { assertSessionOpen } from '../../academic-sessions/session-lock';
import type { AssignmentInput2Dto } from '../dto/staff-input.dto';
import type { StaffAssignmentDto } from '../dto/staff.dto';
import { StaffAccessService } from '../staff-access.service';
import { toAssignmentDto } from '../staff.mapper';
import { ASSIGNMENT_INCLUDE, StaffRepository } from '../staff.repository';
import { AssignmentEnder } from './assignment-ender';
import { writeAssignment } from './assignment-writer';

export const OWN_ASSIGNMENT_MESSAGE =
  'Ask the principal to change your own assignments';

const NEEDS_SECTION = new Set(['CLASS_TEACHER', 'SUBJECT_TEACHER', 'HELPER']);

@Injectable()
export class StaffAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StaffAccessService,
    private readonly repository: StaffRepository,
    private readonly ender: AssignmentEnder,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    staffId: string,
    sessionId?: string,
  ): Promise<StaffAssignmentDto[]> {
    await this.access.read(scope, staffId);
    return (await this.repository.assignments(staffId, sessionId)).map(
      toAssignmentDto,
    );
  }

  async add(
    user: AuthUser,
    scope: Scope,
    staffId: string,
    dto: AssignmentInput2Dto,
  ): Promise<StaffAssignmentDto> {
    const staff = await this.access.manage(scope, staffId);
    if (staff.userId === user.id) throw forbidden(OWN_ASSIGNMENT_MESSAGE);
    if (staff.status === 'RESIGNED' || staff.status === 'TERMINATED')
      throw conflict('Staff member has left');
    await this.validate(staff.schoolId, dto);
    const validUntil = dto.validUntil ? new Date(dto.validUntil) : null;
    if (validUntil && validUntil <= new Date())
      throw invalid('validUntil must be in the future');

    const row = await this.prisma.$transaction((tx) =>
      writeAssignment(tx, {
        staff,
        kind: dto.kind,
        branchId: dto.branchId,
        sessionId: dto.sessionId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        responsibleStaffId: dto.responsibleStaffId,
        isSubstitute: dto.isSubstitute,
        validUntil,
        actorId: user.id,
      }),
    );
    await this.ender.refresh([staff.userId]);
    const dtoOut = toAssignmentDto(row);
    this.audit.stage({
      action: 'staff.assignment_add',
      entityType: 'Staff',
      entityId: staffId,
      schoolId: staff.schoolId,
      branchId: dto.branchId,
      after: dtoOut,
    });
    return dtoOut;
  }

  async end(
    user: AuthUser,
    scope: Scope,
    staffId: string,
    assignmentId: string,
  ): Promise<StaffAssignmentDto> {
    const staff = await this.access.manage(scope, staffId);
    if (staff.userId === user.id) throw forbidden(OWN_ASSIGNMENT_MESSAGE);
    const row = await this.prisma.staffAssignment.findFirst({
      where: { id: assignmentId, staffId, endedAt: null },
      include: ASSIGNMENT_INCLUDE,
    });
    if (!row) throw notFound('Assignment');
    await this.prisma.$transaction((tx) => this.ender.end(tx, [row]));
    await this.ender.refresh([staff.userId]);
    const dtoOut = toAssignmentDto(row);
    this.audit.stage({
      action: 'staff.assignment_end',
      entityType: 'Staff',
      entityId: staffId,
      schoolId: staff.schoolId,
      branchId: row.branchId,
      before: dtoOut,
    });
    return dtoOut;
  }

  private async validate(
    schoolId: string,
    dto: AssignmentInput2Dto,
  ): Promise<void> {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== dto.branchId)
      throw invalid('Session does not belong to the branch');
    assertSessionOpen(session);
    if (NEEDS_SECTION.has(dto.kind) && !dto.sectionId)
      throw invalid(`sectionId is required for ${dto.kind}`);
    if (dto.kind === 'SUBJECT_TEACHER' && !dto.subjectId)
      throw invalid('subjectId is required for SUBJECT_TEACHER');
    if (dto.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: dto.sectionId },
      });
      if (
        !section ||
        section.sessionId !== dto.sessionId ||
        section.status !== 'ACTIVE'
      )
        throw invalid('Section does not belong to the session');
      if (dto.kind === 'SUBJECT_TEACHER') {
        const taught = await this.prisma.classSubject.count({
          where: { classId: section.classId, subjectId: dto.subjectId },
        });
        if (taught === 0) throw invalid('Subject is not taught in this class');
      }
    }
    if (dto.responsibleStaffId) {
      const responsible = await this.prisma.staff.findUnique({
        where: { id: dto.responsibleStaffId },
      });
      if (!responsible || responsible.schoolId !== schoolId)
        throw invalid('Responsible staff not found');
    }
  }
}
