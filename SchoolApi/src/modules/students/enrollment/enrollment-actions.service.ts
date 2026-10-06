import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  ChangeSectionDto,
  WithdrawStudentDto,
} from '../dto/enrollment-actions.dto';
import type { EnrollmentDto } from '../dto/student.dto';
import { StudentAccessService } from '../student-access.service';
import { toEnrollmentDto } from '../student.mapper';
import type { StudentRow } from '../students.repository';
import { ENROLLMENT_INCLUDE } from '../students.repository';
import { EnrollmentWriter } from './enrollment-writer';

@Injectable()
export class EnrollmentActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StudentAccessService,
    private readonly writer: EnrollmentWriter,
    private readonly audit: AuditService,
  ) {}

  async withdraw(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    dto: WithdrawStudentDto,
  ): Promise<EnrollmentDto> {
    const student = await this.access.manage(scope, studentId);
    const current = this.active(student);
    const effective = parseDate(dto.effectiveDate);
    if (effective < current.startDate)
      throw invalid('effectiveDate is before the enrollment start');
    const open = await this.prisma.transfer.count({
      where: { studentId, status: 'REQUESTED' },
    });
    if (open > 0) throw conflict('Cancel the open transfer first');

    const row = await this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { status: 'WITHDRAWN', updatedById: user.id },
      });
      return tx.enrollment.update({
        where: { id: current.id },
        data: {
          status: 'WITHDRAWN',
          endDate: effective,
          reason: dto.reason,
          updatedById: user.id,
        },
        include: ENROLLMENT_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'student.withdraw',
      entityType: 'Student',
      entityId: studentId,
      schoolId: student.schoolId,
      branchId: current.branchId,
      before: { enrollmentStatus: 'ACTIVE' },
      after: { enrollmentStatus: 'WITHDRAWN', ...dto },
    });
    return toEnrollmentDto(row);
  }

  /** Same session and branch; the enrollment row moves (history in audit). */
  async changeSection(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    dto: ChangeSectionDto,
  ): Promise<EnrollmentDto> {
    const student = await this.access.manage(scope, studentId);
    const current = this.active(student);
    const target = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
    });
    if (
      !target ||
      target.sessionId !== current.sessionId ||
      target.branchId !== current.branchId
    ) {
      throw invalid('Target section must be in the same session and branch');
    }
    if (target.id === current.sectionId && dto.rollNo === undefined)
      throw invalid('Student is already in this section');

    const row = await this.prisma.$transaction(async (tx) => {
      const seat = await this.writer.reserveSeat(tx, target.id, {
        rollNo: dto.rollNo,
        excludeEnrollmentId: current.id,
      });
      return tx.enrollment.update({
        where: { id: current.id },
        data: {
          sectionId: target.id,
          rollNo: seat.rollNo,
          reason: dto.reason,
          updatedById: user.id,
        },
        include: ENROLLMENT_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'student.change_section',
      entityType: 'Student',
      entityId: studentId,
      schoolId: student.schoolId,
      branchId: current.branchId,
      before: { sectionId: current.sectionId, rollNo: current.rollNo },
      after: {
        sectionId: row.sectionId,
        rollNo: row.rollNo,
        effectiveDate: dto.effectiveDate,
        reason: dto.reason,
      },
    });
    return toEnrollmentDto(row);
  }

  private active(student: StudentRow) {
    const current = student.enrollments.find((e) => e.status === 'ACTIVE');
    if (!current) throw conflict('Student has no active enrollment');
    return current;
  }
}
