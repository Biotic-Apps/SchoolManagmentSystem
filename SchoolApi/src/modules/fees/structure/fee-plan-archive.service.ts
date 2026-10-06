import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, forbidden } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FeeAccessService } from '../shared/fee-access.service';
import type { FeePlanDto } from './dto/fee-plan.dto';
import { FeePlanReader } from './fee-plan-reader.service';

/**
 * POST /fee-plans/:id/archive: DRAFT or APPROVED → ARCHIVED (final).
 * Archived plans are never billed (generation skips them), hidden from the
 * default list and cannot be edited or approved (409). Archiving a plan
 * that bills (approved snapshot) needs `fees.approve`.
 */
@Injectable()
export class FeePlanArchiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reader: FeePlanReader,
    private readonly access: FeeAccessService,
    private readonly audit: AuditService,
  ) {}

  async archive(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string | undefined,
  ): Promise<FeePlanDto> {
    const plan = await this.reader.find(id);
    await this.access.manageBranch(scope, plan.branchId);
    if (plan.status === 'ARCHIVED') throw conflict('Plan is already archived');
    if (plan.approvedAt !== null && !user.permissions.has('fees.approve')) {
      throw forbidden('Archiving an approved plan needs fees.approve');
    }
    const updated = await this.prisma.feePlan.updateMany({
      where: { id, status: plan.status, revision: plan.revision },
      data: { status: 'ARCHIVED', updatedById: user.id },
    });
    if (updated.count === 0) throw conflict('The plan changed; reload it');
    this.audit.stage({
      action: 'fee_plan.archive',
      entityType: 'FeePlan',
      entityId: id,
      schoolId: plan.schoolId,
      branchId: plan.branchId,
      before: { status: plan.status, revision: plan.revision },
      after: { status: 'ARCHIVED', reason: reason?.trim() || null },
    });
    return (await this.reader.toDtos([await this.reader.find(id)]))[0];
  }
}
