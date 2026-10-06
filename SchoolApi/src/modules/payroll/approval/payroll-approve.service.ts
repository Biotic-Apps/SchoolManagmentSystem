import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, forbidden } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { sumMinor } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { PayrollAccess } from '../payroll-access.service';
import type { PayrollRunDto } from '../runs/dto/run.dto';
import { RunViewService } from '../runs/run-view.service';
import { routeLines } from './approval-routing';
import { LINES_ENTITY, RUN_ENTITY } from './payroll-approval.handler';

/**
 * Approves a REVIEWED run. Lines of the approver's own salary (and the
 * principal's, unless a super admin approves) go to SUPER_ADMIN; the run is
 * APPROVED once every line's approval is approved.
 */
@Injectable()
export class PayrollApproveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly approvals: ApprovalService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly view: RunViewService,
    private readonly audit: AuditService,
  ) {}

  async approve(
    user: AuthUser,
    scope: Scope,
    runId: string,
  ): Promise<PayrollRunDto> {
    const run = await this.access.run(scope, runId);
    if (run.status !== 'REVIEWED' || !run.reviewedById) {
      throw conflict('Only a REVIEWED payroll run can be approved');
    }
    if (run.pendingApprovalIds.length > 0) {
      throw conflict('Payroll run is awaiting super admin approval');
    }
    if (user.id === run.reviewedById || user.id === run.calculatedById) {
      throw forbidden('You cannot approve a payroll run you prepared');
    }
    const [lines, principalUserId] = await Promise.all([
      this.prisma.payrollLine.findMany({
        where: { runId: run.id },
        select: {
          id: true,
          netMinor: true,
          staff: { select: { name: true, userId: true } },
        },
      }),
      this.people.principalOf(run.branchId),
    ]);
    if (lines.length === 0) throw conflict('Payroll run has no lines');
    const routing = routeLines(
      lines.map((l) => ({ id: l.id, staffUserId: l.staff.userId })),
      {
        callerId: user.id,
        callerIsSuperAdmin: user.activeRole === String(RoleKey.SUPER_ADMIN),
        principalUserId,
      },
    );
    const pick = (ids: string[]) => lines.filter((l) => ids.includes(l.id));
    const direct = pick(routing.branch);
    const routed = pick(routing.superAdmin);
    const title = `Payroll ${run.month}`;

    const created = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.payrollRun.updateMany({
        where: {
          id: run.id,
          version: run.version,
          status: 'REVIEWED',
          pendingApprovalIds: { isEmpty: true },
        },
        data: { version: { increment: 1 } },
      });
      if (claimed.count === 0) throw conflict('Payroll run changed, reload');
      const base = {
        type: 'PAYROLL' as const,
        entityId: run.id,
        schoolId: run.schoolId,
      };
      const branchApproval = direct.length
        ? await this.approvals.create(
            {
              ...base,
              entityType: RUN_ENTITY,
              branchId: run.branchId,
              requestedById: run.reviewedById!,
              title,
              payload: { runId: run.id, lineIds: routing.branch },
              amountMinor: sumMinor(direct.map((l) => l.netMinor)),
              steps: [{ approverUserId: user.id }],
            },
            tx,
          )
        : null;
      const routedApproval = routed.length
        ? await this.approvals.create(
            {
              ...base,
              entityType: LINES_ENTITY,
              branchId: null,
              requestedById: user.id,
              title: `${title}: ${routed.map((l) => l.staff.name).join(', ')}`,
              payload: { runId: run.id, lineIds: routing.superAdmin },
              reason: 'Salary of the approver or the branch principal',
              amountMinor: sumMinor(routed.map((l) => l.netMinor)),
              steps: [{ approverRole: RoleKey.SUPER_ADMIN }],
            },
            tx,
          )
        : null;
      if (branchApproval) {
        await tx.payrollLine.updateMany({
          where: { id: { in: routing.branch } },
          data: { route: 'BRANCH', approvalId: branchApproval.id },
        });
      }
      if (routedApproval) {
        await tx.payrollLine.updateMany({
          where: { id: { in: routing.superAdmin } },
          data: { route: 'SUPER_ADMIN', approvalId: routedApproval.id },
        });
      }
      await tx.payrollRun.update({
        where: { id: run.id },
        data: {
          approvalId: branchApproval?.id ?? routedApproval?.id ?? null,
          pendingApprovalIds: routedApproval ? [routedApproval.id] : [],
        },
      });
      return { branchApproval, routedApproval };
    });

    this.audit.stage({
      action: 'payroll.run_approve',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      after: {
        approvedLines: routing.branch.length,
        routedToSuperAdmin: routing.superAdmin,
        approvalIds: [created.branchApproval?.id, created.routedApproval?.id],
      },
    });
    if (created.branchApproval) {
      await this.approvals.decideAuthorized(
        user.id,
        created.branchApproval.id,
        { decision: 'APPROVED' },
      );
    }
    if (created.routedApproval) {
      await this.notifications.notify({
        userIds: (await this.people.superAdmins()).filter(
          (id) => id !== user.id,
        ),
        category: 'PAYROLL',
        title: `${title}: salary approval needed`,
        body: 'A payroll line needs super admin approval (approver or principal salary).',
        data: { runId: run.id, approvalId: created.routedApproval.id },
      });
    }
    return this.view.one(run.id);
  }
}
