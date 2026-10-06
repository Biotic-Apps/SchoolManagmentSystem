import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, forbidden } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayrollAccess } from '../payroll-access.service';
import { APPROVED_STATUSES } from '../runs/run-status';
import {
  ADJUSTMENT_INCLUDE,
  toAdjustmentDto,
  type CancellerNames,
} from './adjustment.mapper';
import type {
  AdjustmentDto,
  AdjustmentQueryDto,
  CreateAdjustmentDto,
} from './dto/adjustment.dto';

/** One-off bonuses, recoveries, advances and arrears applied with a run. */
@Injectable()
export class AdjustmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: AdjustmentQueryDto,
  ): Promise<PageResult<AdjustmentDto>> {
    if (query.branchId) await this.access.branch(scope, query.branchId);
    const where: Prisma.PayrollAdjustmentWhereInput = {
      ...scope.managedBranchFilter(),
      ...(query.staffId ? { staffId: query.staffId } : {}),
      ...(query.month ? { month: query.month } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.payrollAdjustment.findMany({
        where,
        include: ADJUSTMENT_INCLUDE,
        orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.payrollAdjustment.count({ where }),
    ]);
    const cancellers = await this.cancellers(rows);
    return toPageResult(
      rows.map((row) => toAdjustmentDto(row, cancellers)),
      total,
      query,
    );
  }

  async cancellers(
    rows: { cancelledById: string | null }[],
  ): Promise<CancellerNames> {
    const ids = [
      ...new Set(
        rows.flatMap((r) => (r.cancelledById ? [r.cancelledById] : [])),
      ),
    ];
    if (ids.length === 0) return new Map();
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    return new Map(users.map((u) => [u.id, u]));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateAdjustmentDto,
  ): Promise<AdjustmentDto> {
    const staff = await this.access.staff(scope, dto.staffId);
    if (staff.userId === user.id) {
      throw forbidden('You cannot adjust your own salary');
    }
    const run = await this.prisma.payrollRun.findUnique({
      where: { branchId_month: { branchId: staff.branchId, month: dto.month } },
      select: { status: true },
    });
    if (run && APPROVED_STATUSES.includes(run.status)) {
      throw conflict(`Payroll for ${dto.month} is already approved`, {
        reason: 'RUN_APPROVED',
      });
    }
    const row = await this.prisma.payrollAdjustment.create({
      data: {
        schoolId: staff.schoolId,
        branchId: staff.branchId,
        staffId: staff.id,
        month: dto.month,
        kind: dto.kind,
        amountMinor: BigInt(dto.amountMinor),
        reason: dto.reason.trim(),
        createdById: user.id,
      },
      include: ADJUSTMENT_INCLUDE,
    });
    this.audit.stage({
      action: 'payroll.adjustment_add',
      entityType: 'PayrollAdjustment',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: {
        staffId: row.staffId,
        month: row.month,
        kind: row.kind,
        amountMinor: dto.amountMinor,
        reason: row.reason,
      },
    });
    return toAdjustmentDto(row);
  }
}
