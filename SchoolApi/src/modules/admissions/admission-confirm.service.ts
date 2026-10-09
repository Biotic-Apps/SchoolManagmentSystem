import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, invalid } from '../../core/common/errors/errors';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import { OutboxService } from '../../core/outbox/outbox.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AccessCache } from '../../core/rbac/access/access-cache';
import type { Scope } from '../../core/rbac/scope/scope';
import type { MedicalInputDto } from '../students/dto/medical-input.dto';
import { auditedLogins } from '../students/registration/parent-login-audit';
import { StudentRegistrationService } from '../students/registration/student-registration.service';
import { ApplicationAccessService } from './application-access.service';
import { childOf, guardiansOf } from './application.mapper';
import { APPLICATION_INCLUDE } from './applications.repository';
import type { ConfirmApplicationDto } from './dto/application-input.dto';
import type { ConfirmedApplicationDto } from './dto/application.dto';

/**
 * OFFERED → CONFIRMED → ENROLLED in one transaction: student, guardians,
 * VERIFIED links, enrollment, admission number; ID card job after commit.
 */
@Injectable()
export class AdmissionConfirmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ApplicationAccessService,
    private readonly registration: StudentRegistrationService,
    private readonly outbox: OutboxService,
    private readonly accessCache: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async confirm(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ConfirmApplicationDto,
  ): Promise<ConfirmedApplicationDto> {
    const application = await this.access.loadIn(scope, id, ['OFFERED']);
    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
      include: { school: { select: { code: true } } },
    });
    if (
      !section ||
      section.branchId !== application.branchId ||
      section.sessionId !== application.sessionId ||
      section.classId !== application.classId
    ) {
      throw invalid(
        'Section must match the application branch, session and class',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.admissionApplication.updateMany({
        where: { id, status: 'OFFERED' },
        data: {
          status: 'CONFIRMED',
          admissionFee: toJson(dto.admissionFee),
          updatedById: user.id,
        },
      });
      if (claimed.count === 0)
        throw conflict('Application is no longer OFFERED');
      const registered = await this.registration.register(tx, {
        schoolId: application.schoolId,
        schoolCode: section.school.code,
        sectionId: section.id,
        admissionDate: dto.admissionDate,
        child: childOf(application),
        guardians: guardiansOf(application),
        medical: application.medical as unknown as MedicalInputDto | null,
        actorId: user.id,
      });
      const row = await tx.admissionApplication.update({
        where: { id },
        data: {
          status: 'ENROLLED',
          studentId: registered.studentId,
          sectionId: section.id,
        },
        include: APPLICATION_INCLUDE,
      });
      return { registered, row };
    });

    await this.outbox.publish(result.registered.outboxIds);
    await Promise.all(
      result.registered.guardianUserIds.map((uid) =>
        this.accessCache.invalidateUser(uid),
      ),
    );
    this.audit.stage({
      action: 'application.confirm',
      entityType: 'AdmissionApplication',
      entityId: id,
      schoolId: application.schoolId,
      branchId: application.branchId,
      before: { status: application.status },
      after: {
        status: 'ENROLLED',
        studentId: result.registered.studentId,
        admissionNo: result.registered.admissionNo,
        admissionFee: dto.admissionFee,
        parentLogins: auditedLogins(result.registered.parentLogins),
      },
    });
    return {
      application: await this.access.toDto(result.row),
      studentId: result.registered.studentId,
      admissionNo: result.registered.admissionNo,
      parentLogins: result.registered.parentLogins,
    };
  }
}
