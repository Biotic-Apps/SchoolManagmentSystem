import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayrollAccess } from '../payroll-access.service';
import type { CreateRunDto, PayrollRunDto, RunQueryDto } from './dto/run.dto';
import { RunViewService } from './run-view.service';

/** Payroll runs: one per branch and month. */
@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly view: RunViewService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateRunDto,
  ): Promise<PayrollRunDto> {
    const branch = await this.access.branch(scope, dto.branchId);
    const existing = await this.prisma.payrollRun.findUnique({
      where: { branchId_month: { branchId: branch.id, month: dto.month } },
      select: { id: true },
    });
    if (existing) {
      throw conflict(`Payroll for ${dto.month} already exists`, {
        runId: existing.id,
      });
    }
    const run = await this.prisma.payrollRun
      .create({
        data: {
          schoolId: branch.schoolId,
          branchId: branch.id,
          month: dto.month,
          createdById: user.id,
        },
      })
      .catch((error: unknown) => {
        if ((error as { code?: string }).code === 'P2002')
          throw conflict(`Payroll for ${dto.month} already exists`);
        throw error;
      });
    this.audit.stage({
      action: 'payroll.run_create',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      after: { month: run.month, status: run.status },
    });
    return this.view.one(run.id);
  }

  async list(
    scope: Scope,
    query: RunQueryDto,
  ): Promise<PageResult<PayrollRunDto>> {
    if (query.branchId) await this.access.branch(scope, query.branchId);
    const where: Prisma.PayrollRunWhereInput = {
      ...scope.managedBranchFilter(),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.month ? { month: query.month } : {}),
    };
    const [runs, total] = await Promise.all([
      this.prisma.payrollRun.findMany({
        where,
        orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.payrollRun.count({ where }),
    ]);
    return toPageResult(await this.view.many(runs), total, query);
  }

  async get(scope: Scope, runId: string): Promise<PayrollRunDto> {
    const run = await this.access.run(scope, runId);
    return this.view.one(run.id);
  }
}
