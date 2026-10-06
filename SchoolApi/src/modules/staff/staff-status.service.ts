import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { SessionsService } from '../../core/auth/sessions/sessions.service';
import { parseDate } from '../../core/common/dates';
import { forbidden, invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrincipal, isSuperAdmin } from '../../core/rbac/actor';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { activeAssignmentWhere } from '../users/active-assignment-where';
import { AssignmentEnder } from './assignments/assignment-ender';
import type { ProbationDto, StaffStatusDto } from './dto/staff-input.dto';
import type { StaffDetailDto } from './dto/staff.dto';
import { StaffAccessService } from './staff-access.service';
import { StaffService } from './staff.service';

const LEFT = new Set(['RESIGNED', 'TERMINATED']);
const REVIEWER_ROLES = [
  RoleKey.COORDINATOR,
  RoleKey.HEAD_TEACHER,
  RoleKey.PRINCIPAL,
];

@Injectable()
export class StaffStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StaffAccessService,
    private readonly staff: StaffService,
    private readonly ender: AssignmentEnder,
    private readonly sessions: SessionsService,
    private readonly audit: AuditService,
  ) {}

  /** RESIGNED/TERMINATED disables the login and ends all assignments. */
  async setStatus(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: StaffStatusDto,
  ): Promise<StaffDetailDto> {
    const before = await this.access.manage(scope, id);
    if (before.userId === user.id)
      throw forbidden('You cannot change your own status');
    const leaving = LEFT.has(dto.status);
    await this.prisma.$transaction(async (tx) => {
      await tx.staff.update({
        where: { id },
        data: {
          status: dto.status,
          statusReason: dto.reason,
          statusEffectiveDate: parseDate(dto.effectiveDate),
          updatedById: user.id,
        },
      });
      if (!leaving) return;
      const open = await tx.staffAssignment.findMany({
        where: { staffId: id, endedAt: null },
      });
      await this.ender.end(tx, open);
      if (before.userId) {
        await tx.user.update({
          where: { id: before.userId },
          data: { status: 'DISABLED' },
        });
      }
    });
    if (leaving && before.userId) {
      await this.sessions.revokeAllForUser(before.userId, {
        bumpTokenVersion: true,
      });
    }
    await this.ender.refresh([before.userId]);
    this.audit.stage({
      action: 'staff.status',
      entityType: 'Staff',
      entityId: id,
      schoolId: before.schoolId,
      branchId: before.branchId,
      before: { status: before.status },
      after: { ...dto, accountDisabled: leaving && !!before.userId },
    });
    return this.staff.get(user, scope, id);
  }

  /** Principal (or Super Admin) sets probation and the reviewer. */
  async setProbation(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ProbationDto,
  ): Promise<StaffDetailDto> {
    if (!isPrincipal(user) && !isSuperAdmin(user))
      throw forbidden('Only the principal can change probation');
    const before = await this.access.manage(scope, id);
    let reviewerUserId: string | null = null;
    if (dto.requiresReview) {
      reviewerUserId =
        dto.reviewerUserId ?? (await this.branchPrincipal(before.branchId));
      if (!reviewerUserId)
        throw invalid('reviewerUserId is required (branch has no principal)');
      if (reviewerUserId === before.userId)
        throw invalid('A teacher cannot review themselves');
      const eligible = await this.prisma.roleAssignment.count({
        where: {
          ...activeAssignmentWhere(),
          userId: reviewerUserId,
          branchId: before.branchId,
          role: { key: { in: REVIEWER_ROLES } },
        },
      });
      if (eligible === 0)
        throw invalid(
          'Reviewer must be a coordinator, head teacher or principal of the branch',
        );
    }
    await this.prisma.staff.update({
      where: { id },
      data: {
        requiresReview: dto.requiresReview,
        reviewerUserId,
        updatedById: user.id,
      },
    });
    this.audit.stage({
      action: 'staff.probation',
      entityType: 'Staff',
      entityId: id,
      schoolId: before.schoolId,
      branchId: before.branchId,
      before: {
        requiresReview: before.requiresReview,
        reviewerUserId: before.reviewerUserId,
      },
      after: { requiresReview: dto.requiresReview, reviewerUserId },
    });
    return this.staff.get(user, scope, id);
  }

  private async branchPrincipal(branchId: string): Promise<string | null> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    return branch?.principalUserId ?? null;
  }
}
