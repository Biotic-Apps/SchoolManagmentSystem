import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AccessCache } from '../../../core/rbac/access/access-cache';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { GuardianLinkDto } from '../../students/dto/student.dto';
import { toGuardianLinkDto } from '../../students/guardian.mapper';
import type { ParentLoginDto } from '../../students/dto/parent-login.dto';
import { GuardianWriter } from '../../students/registration/guardian-writer';
import { ParentLoginWriter } from '../../students/registration/parent-login.writer';
import { auditedLogins } from '../../students/registration/parent-login-audit';
import { StudentAccessService } from '../../students/student-access.service';
import { currentEnrollment } from '../../students/student-scope';
import { GUARDIAN_LINK_INCLUDE } from '../../students/students.repository';
import type { AddGuardianLinkDto } from '../dto/guardian-input.dto';
import type { AddedGuardianLinkDto } from '../dto/guardian.dto';

@Injectable()
export class StudentGuardiansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentAccessService,
    private readonly writer: GuardianWriter,
    private readonly logins: ParentLoginWriter,
    private readonly accessCache: AccessCache,
    private readonly audit: AuditService,
  ) {}

  /** Staff-created links are VERIFIED immediately; the guardian gets a parent login. */
  async add(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    dto: AddGuardianLinkDto,
  ): Promise<AddedGuardianLinkDto> {
    const student = await this.students.manage(scope, studentId);
    if (!dto.guardianId === !dto.guardian)
      throw invalid('Give either guardianId or guardian');
    let parentLogin: ParentLoginDto | null = null;
    const link = await this.prisma.$transaction(async (tx) => {
      const guardian = dto.guardianId
        ? await tx.guardian.findFirst({
            where: { id: dto.guardianId, schoolId: student.schoolId },
          })
        : await this.writer.findOrCreate(
            tx,
            student.schoolId,
            dto.guardian!,
            user.id,
          );
      if (!guardian) throw notFound('Guardian');
      const open = await tx.studentGuardian.findFirst({
        where: {
          studentId,
          guardianId: guardian.id,
          status: { in: ['VERIFIED', 'REQUESTED'] },
        },
      });
      if (open?.status === 'VERIFIED')
        throw conflict('Guardian is already linked');
      if (open) {
        await tx.studentGuardian.update({
          where: { id: open.id },
          data: { status: 'REJECTED' },
        });
      }
      parentLogin = await this.logins.ensure(tx, guardian, user.id);
      if (dto.isPrimary) {
        await tx.studentGuardian.updateMany({
          where: { studentId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.studentGuardian.create({
        data: {
          schoolId: student.schoolId,
          studentId,
          guardianId: guardian.id,
          relation: dto.relation,
          isPrimary: dto.isPrimary,
          status: 'VERIFIED',
          verifiedById: user.id,
          verifiedAt: new Date(),
          createdById: user.id,
        },
        include: GUARDIAN_LINK_INCLUDE,
      });
    });
    if (link.guardian.userId)
      await this.accessCache.invalidateUser(link.guardian.userId);
    this.audit.stage({
      action: 'student.guardian_link',
      entityType: 'Student',
      entityId: studentId,
      schoolId: student.schoolId,
      branchId: currentEnrollment(student.enrollments)?.branchId,
      after: {
        linkId: link.id,
        guardianId: link.guardianId,
        isPrimary: link.isPrimary,
        parentLogin: parentLogin && auditedLogins([parentLogin])[0],
      },
    });
    return {
      ...toGuardianLinkDto(link, user.permissions.has('people.sensitive.view')),
      parentLogin,
    };
  }

  /** Custody change: takes effect immediately. */
  async revoke(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    linkId: string,
    reason: string,
  ): Promise<GuardianLinkDto> {
    const student = await this.students.manage(scope, studentId);
    const link = await this.prisma.studentGuardian.findFirst({
      where: {
        id: linkId,
        studentId,
        status: { in: ['VERIFIED', 'REQUESTED'] },
      },
    });
    if (!link) throw notFound('Guardian link');
    const row = await this.prisma.studentGuardian.update({
      where: { id: linkId },
      data: {
        status: 'REVOKED',
        isPrimary: false,
        revokedAt: new Date(),
        revokedById: user.id,
        revokeReason: reason,
      },
      include: GUARDIAN_LINK_INCLUDE,
    });
    if (row.guardian.userId)
      await this.accessCache.invalidateUser(row.guardian.userId);
    this.audit.stage({
      action: 'student.guardian_revoke',
      entityType: 'Student',
      entityId: studentId,
      schoolId: student.schoolId,
      branchId: currentEnrollment(student.enrollments)?.branchId,
      before: { linkId, status: link.status, isPrimary: link.isPrimary },
      after: { status: 'REVOKED', reason },
    });
    return toGuardianLinkDto(
      row,
      user.permissions.has('people.sensitive.view'),
    );
  }
}
