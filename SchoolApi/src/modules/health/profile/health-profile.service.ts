import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { forbiddenScope, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import type {
  HealthProfileDto,
  HealthProfileInputDto,
} from '../dto/health-profile.dto';
import {
  toHealthProfile,
  toHelperView,
  toProfileColumns,
  toProfileData,
} from './health-profile.mapper';

/** Contract §10: structured health profile; every read is audited. */
@Injectable()
export class HealthProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly audit: AuditService,
  ) {}

  async current(studentId: string): Promise<HealthProfileDto> {
    const row = await this.prisma.studentHealthProfile.findUnique({
      where: { studentId },
    });
    return toHealthProfile(row);
  }

  async read(
    user: AuthUser,
    scope: Scope,
    studentId: string,
  ): Promise<HealthProfileDto> {
    const placement = await this.placements.read(scope, studentId);
    const profile = await this.current(studentId);
    await this.audit.recordNow({
      action: 'health.read',
      entityType: 'Student',
      entityId: studentId,
      schoolId: placement.schoolId,
      branchId: placement.branchId,
    });
    return user.activeRole === String(RoleKey.HELPER)
      ? toHelperView(profile)
      : profile;
  }

  async replace(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    body: HealthProfileInputDto,
  ): Promise<HealthProfileDto> {
    const placement = await this.placements.find(studentId);
    if (!placement) throw notFound('Student');
    if (
      !scope.canManageBranch({
        id: placement.branchId,
        schoolId: placement.schoolId,
      })
    )
      throw forbiddenScope();
    const before = await this.current(studentId);
    const data = toProfileData(body);
    const columns = toProfileColumns(data, user.id);
    const row = await this.prisma.studentHealthProfile.upsert({
      where: { studentId },
      create: { studentId, ...columns },
      update: columns,
    });
    this.audit.stage({
      action: 'health.update',
      entityType: 'Student',
      entityId: studentId,
      schoolId: placement.schoolId,
      branchId: placement.branchId,
      before,
      after: data,
    });
    return toHealthProfile(row);
  }
}
