import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { principalOrAbove } from '../../finance-core/approval-routing';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type {
  ConfirmPromotionsDto,
  ConfirmPromotionsResultDto,
} from './dto/promotion.dto';
import { PROMOTION_ENTITY } from './promotion-approval.handler';
import { PromotionScope } from './promotion-scope';

/** POST /promotions/confirm: one PROMOTION approval for the suggested rows. */
@Injectable()
export class PromotionConfirmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopes: PromotionScope,
    private readonly approvals: ApprovalService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async confirm(
    user: AuthUser,
    scope: Scope,
    dto: ConfirmPromotionsDto,
  ): Promise<ConfirmPromotionsResultDto> {
    const branch = await this.scopes.managedBranch(scope, dto.branchId);
    const where = {
      branchId: branch.id,
      fromSessionId: dto.fromSessionId,
      fromClassId: dto.classId,
      status: 'SUGGESTED' as const,
    };
    const waiting = await this.prisma.promotionDecision.count({
      where: { ...where, approvalId: { not: null } },
    });
    if (waiting > 0)
      throw conflict('Some decisions are already awaiting approval');
    const rows = await this.prisma.promotionDecision.findMany({
      where: { ...where, approvalId: null },
      select: { id: true },
    });
    if (rows.length === 0) throw conflict('No suggested decisions to confirm');

    const steps = principalOrAbove(user.activeRole);
    const approval = await this.prisma.$transaction(async (tx) => {
      const created = await this.approvals.create(
        {
          type: 'PROMOTION',
          entityType: PROMOTION_ENTITY,
          entityId: dto.fromSessionId,
          schoolId: branch.schoolId,
          branchId: branch.id,
          requestedById: user.id,
          title: `Promotion decisions (${rows.length} students)`,
          payload: { ...dto, decisionIds: rows.map((r) => r.id) },
          steps,
        },
        tx,
      );
      await tx.promotionDecision.updateMany({
        where: { id: { in: rows.map((r) => r.id) } },
        data: { approvalId: created.id },
      });
      return created;
    });
    this.audit.stage({
      action: 'promotion.confirm_request',
      entityType: 'AcademicSession',
      entityId: dto.fromSessionId,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: {
        approvalId: approval.id,
        count: rows.length,
        classId: dto.classId,
      },
    });
    const deciders =
      steps[0].approverRole === String(RoleKey.SUPER_ADMIN)
        ? await this.people.superAdmins()
        : [await this.people.principalOf(branch.id)];
    await this.notifications.notify({
      userIds: deciders.filter((u): u is string => !!u && u !== user.id),
      category: 'APPROVAL',
      title: 'Promotions awaiting approval',
      body: `${rows.length} promotion decisions need your approval.`,
      data: { approvalId: approval.id },
    });
    return { approvalId: approval.id, count: rows.length };
  }
}
