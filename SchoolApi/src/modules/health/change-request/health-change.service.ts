import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  invalid,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import type {
  HealthChangeResultDto,
  HealthChangesDto,
  HealthProfileDto,
} from '../dto/health-profile.dto';
import { HealthProfileService } from '../profile/health-profile.service';
import {
  pickChanges,
  type HealthProfileData,
} from '../profile/health-profile.mapper';

export const HEALTH_ENTITY = 'HEALTH';

export interface HealthChangePayload {
  studentId: string;
  before: HealthProfileDto;
  changes: Partial<HealthProfileData>;
}

/** Parents propose health changes; the office applies them on approval. */
@Injectable()
export class HealthChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly profiles: HealthProfileService,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    input: HealthChangesDto,
  ): Promise<HealthChangeResultDto> {
    if (!scope.guardian) throw forbidden('Only parents propose health changes');
    const placement = await this.placements.read(scope, studentId);
    const changes = pickChanges(input);
    if (Object.keys(changes).length === 0)
      throw invalid('Give at least one change');
    const open = await this.prisma.approvalRequest.count({
      where: {
        type: 'CONTACT_CHANGE',
        entityType: HEALTH_ENTITY,
        entityId: studentId,
        status: 'PENDING',
      },
    });
    if (open > 0) throw conflict('A health change is already pending');

    const payload: HealthChangePayload = {
      studentId,
      before: await this.profiles.current(studentId),
      changes,
    };
    const approval = await this.approvals.create({
      type: 'CONTACT_CHANGE',
      entityType: HEALTH_ENTITY,
      entityId: studentId,
      schoolId: placement.schoolId,
      branchId: placement.branchId,
      requestedById: user.id,
      title: `Health profile change: ${placement.name}`,
      payload,
      steps: [{ approverRole: RoleKey.PRINCIPAL }],
    });
    this.audit.stage({
      action: 'health.change_request',
      entityType: 'Student',
      entityId: studentId,
      schoolId: placement.schoolId,
      branchId: placement.branchId,
      after: { approvalId: approval.id, ...changes },
    });
    return { approvalId: approval.id, status: approval.status };
  }
}
