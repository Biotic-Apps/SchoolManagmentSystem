import { Injectable } from '@nestjs/common';
import type {
  PayrollAdjustment,
  PayrollRun,
  Prisma,
} from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { parseLineDetail } from '../calculation/line-detail';
import { PayrollAccess } from '../payroll-access.service';
import { APPROVED_STATUSES } from '../runs/run-status';
import { ADJUSTMENT_INCLUDE, toAdjustmentDto } from './adjustment.mapper';
import { AdjustmentsService } from './adjustments.service';
import type { AdjustmentDto } from './dto/adjustment.dto';

type Tx = Prisma.TransactionClient;

/**
 * POST /payroll/adjustments/:id/cancel. Only PENDING adjustments of a month
 * whose run is not approved yet. When the adjustment is already part of a
 * calculated/reviewed run, that run goes back to DRAFT in the same
 * transaction, so it must be recalculated (which ignores CANCELLED rows)
 * before it can be reviewed and approved again.
 */
@Injectable()
export class AdjustmentCancelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly adjustments: AdjustmentsService,
    private readonly audit: AuditService,
  ) {}

  async cancel(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string,
  ): Promise<AdjustmentDto> {
    const before = await this.prisma.payrollAdjustment.findUnique({
      where: { id },
    });
    if (!before) throw notFound('Adjustment');
    // Same reach as creating: payroll staff managing the staff's branch.
    const staff = await this.access.staff(scope, before.staffId);
    if (staff.userId === user.id) {
      throw forbidden('You cannot adjust your own salary');
    }
    if (before.status !== 'PENDING') {
      throw conflict(`A ${before.status} adjustment cannot be cancelled`);
    }
    const run = await this.prisma.payrollRun.findUnique({
      where: {
        branchId_month: { branchId: before.branchId, month: before.month },
      },
    });
    await this.assertRunOpen(run);
    const cancelReason = reason.trim();

    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payrollAdjustment.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledById: user.id,
          cancelReason,
        },
      });
      if (updated.count === 0) throw conflict('Adjustment changed, reload');
      const calculated =
        run !== null && ['CALCULATED', 'REVIEWED'].includes(run.status);
      if (calculated && (await this.includedIn(tx, run.id, before))) {
        await this.invalidateRun(tx, run, cancelReason);
      }
      return tx.payrollAdjustment.findUniqueOrThrow({
        where: { id },
        include: ADJUSTMENT_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'payroll.adjustment_cancel',
      entityType: 'PayrollAdjustment',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: before.status },
      after: { status: row.status, reason: cancelReason },
    });
    return toAdjustmentDto(row, await this.adjustments.cancellers([row]));
  }

  private async assertRunOpen(run: PayrollRun | null): Promise<void> {
    if (!run) return;
    if (APPROVED_STATUSES.includes(run.status)) {
      throw conflict(`Payroll for ${run.month} is already approved`, {
        reason: 'RUN_APPROVED',
      });
    }
    const pending =
      run.pendingApprovalIds.length > 0 ||
      (run.approvalId !== null &&
        (await this.prisma.approvalRequest.count({
          where: { id: run.approvalId, status: 'PENDING' },
        })) > 0);
    if (pending) {
      throw conflict(`Payroll for ${run.month} is awaiting approval`, {
        reason: 'RUN_IN_APPROVAL',
      });
    }
  }

  private async includedIn(
    tx: Tx,
    runId: string,
    adjustment: PayrollAdjustment,
  ): Promise<boolean> {
    const lines = await tx.payrollLine.findMany({
      where: { runId, staffId: adjustment.staffId },
      select: { detail: true },
    });
    return lines.some((line) =>
      parseLineDetail(line.detail).adjustments.some(
        (a) => a.id === adjustment.id,
      ),
    );
  }

  private async invalidateRun(
    tx: Tx,
    run: PayrollRun,
    reason: string,
  ): Promise<void> {
    const reset = await tx.payrollRun.updateMany({
      where: {
        id: run.id,
        version: run.version,
        status: { in: ['CALCULATED', 'REVIEWED'] },
        pendingApprovalIds: { isEmpty: true },
      },
      data: {
        status: 'DRAFT',
        reviewedById: null,
        reviewedAt: null,
        approvalId: null,
        version: { increment: 1 },
      },
    });
    if (reset.count === 0) throw conflict('Payroll run changed, reload');
    this.audit.stage({
      action: 'payroll.run_invalidated',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      before: { status: run.status },
      after: { status: 'DRAFT', reason: `Adjustment cancelled: ${reason}` },
    });
  }
}
